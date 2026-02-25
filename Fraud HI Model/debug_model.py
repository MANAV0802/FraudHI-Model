
import joblib
import pandas as pd
import traceback
import sys

try:
    print("Loading model...")
    with open('fraud_detection_model.pkl', 'rb') as f:
        model = joblib.load(f)
    print("Model loaded.")

    print("Loading data...")

    df = pd.read_csv('backend/dummy_data.csv')
    print("Data loaded.")
    
    # Select columns
    columns = [
        'Claim_Amount', 'Patient_Age', 'Patient_Gender', 'Provider_Type', 
        'Diagnosis_Code', 'Procedure_Code', 'Number_of_Procedures', 
        'Admission_Type', 'Discharge_Type', 'Length_of_Stay_Days', 
        'Service_Type', 'Deductible_Amount', 'CoPay_Amount', 
        'Number_of_Previous_Claims_Patient', 'Number_of_Previous_Claims_Provider', 
        'Provider_Patient_Distance_Miles', 'Claim_Submitted_Late'
    ]
    X = df[columns]
    


    # Inspect preprocessor
    if 'preprocessor' in model.named_steps:
        pre = model.named_steps['preprocessor']
        print("Preprocessor Transformers:")
        for name, trans, cols in pre.transformers_:
            print(f"  - Name: {name}")
            print(f"    Transformer: {trans}")
            print(f"    Columns: {cols}")
            if name == 'cat':
                try:
                    # Access OneHotEncoder
                    ohe = trans.steps[0][1]
                    print("    Categories:")
                    for col, cats in zip(cols, ohe.categories_):
                        print(f"      {col}: {cats}")
                except Exception as e:
                    print(f"      Could not print categories: {e}")

            
    preds = model.predict(X)

    print("Prediction success!")
    print(preds[:5])
    
except Exception:
    traceback.print_exc()
