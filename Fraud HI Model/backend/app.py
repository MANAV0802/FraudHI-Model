from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager # Import this for the fix
import pandas as pd
import joblib
import io
import uvicorn
import os
 
# --- 1. SETUP PATHS & VARS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "fraud_detection_model.pkl")
 
REQUIRED_COLUMNS = [
    'Claim_Amount', 'Patient_Age', 'Patient_Gender', 'Provider_Type',
    'Diagnosis_Code', 'Procedure_Code', 'Number_of_Procedures',
    'Admission_Type', 'Discharge_Type', 'Length_of_Stay_Days',
    'Service_Type', 'Deductible_Amount', 'CoPay_Amount',
    'Number_of_Previous_Claims_Patient', 'Number_of_Previous_Claims_Provider',
    'Provider_Patient_Distance_Miles', 'Claim_Submitted_Late'
]
 
model = None
 
# --- 2. LIFESPAN (THE FIX FOR DEPRECATION) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    global model
    try:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, "rb") as f:
                model = joblib.load(f)
            print("Model loaded successfully.")
        else:
            print(f"Warning: Model file not found at {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading model: {e}")
   
    yield # The application runs while looking at this yield
   
    # Shutdown logic (optional cleanup goes here)
    print("Shutting down...")
 
# --- 3. INIT APP WITH LIFESPAN ---
app = FastAPI(title="Fraud Detection API", lifespan=lifespan)
 
# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=500, detail="Model is not loaded.")
   
    # Accept CSV and Excel files
    if not (file.filename.endswith('.csv') or file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        raise HTTPException(status_code=400, detail="Only .csv, .xlsx, and .xls files are supported.")
 
    try:
        contents = await file.read()
        
        # Read file based on extension
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            # Excel file (.xlsx or .xls)
            df = pd.read_excel(io.BytesIO(contents))
       
        # Validation
        missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing_cols:
            raise HTTPException(status_code=400, detail=f"Missing columns: {missing_cols}")
       
        # Ensure correct order
        X = df[REQUIRED_COLUMNS]
       
        # Predict
        predictions = model.predict(X)
        probabilities = model.predict_proba(X)
       
        # Create response
        results = []
        for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
            # Assuming binary classification: [prob_0, prob_1]
            fraud_prob = prob[1] if len(prob) > 1 else 0.0
            
            # Extract additional fields for the frontend
            row_data = df.iloc[i]
            
            results.append({
                "row_id": i,
                "prediction": int(pred),
                "fraud_probability": float(fraud_prob),
                "is_fraud": bool(pred == 1),
                "claim_amount": float(row_data['Claim_Amount']),
                "patient_age": int(row_data['Patient_Age']),
                "provider_type": str(row_data['Provider_Type'])
            })
           
        summary = {
            "total_claims": len(results),
            "fraud_cases": sum(1 for r in results if r['is_fraud']),
            "legitimate_cases": sum(1 for r in results if not r['is_fraud'])
        }
           
        return {"summary": summary, "results": results}
 
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
 
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)