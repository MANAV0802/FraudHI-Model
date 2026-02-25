# Fraud Health Insurance (HI) Detection Model

An enterprise-grade, end-to-end full-stack application designed to predict and detect fraudulent health insurance claims using Machine Learning.

## 🚀 Overview

The **Fraud HI Model** project provides a comprehensive dashboard for investigating health insurance claims. By allowing users to upload claim data (CSV or Excel), the system instantly processes the information through a pre-trained Machine Learning model (`fraud_detection_model.pkl`) and returns detailed insights, predictions, and anomaly probabilities.

## 🏗️ Technical Stack

### Backend
- **Framework:** FastAPI (Python)
- **Machine Learning:** Scikit-learn, Joblib, Pandas
- **Server:** Uvicorn

### Frontend
- **Framework:** React 19 (via Vite)
- **Styling & UI:** Tailwind CSS, Lucide React
- **Data Visualization:** Chart.js, React-ChartJS-2
- **Networking:** Axios

## 📂 Project Structure

```text
Fraud HI Model/
├── backend/                  # FastAPI backend server
│   ├── app.py                # Main API application logic
│   ├── requirements.txt      # Python dependencies
│   └── test_api.py           # API testing scripts
├── frontend/                 # Vite + React frontend application
│   ├── src/                  # React components and assets
│   ├── package.json          # Node.js dependencies
│   └── vite.config.js        # Vite configuration
├── fraud_detection_model.pkl # Pre-trained ML model
└── start.bat                 # Unified startup script for Windows
```

## ⚙️ Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### Installation & Setup

1. **Clone the repository (if applicable) and navigate to the project directory:**
   ```bash
   cd "Fraud HI Model"
   ```

2. **Backend Setup:**
   Install the required Python packages:
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

3. **Frontend Setup:**
   Install the necessary Node modules:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### 🏃‍♂️ Running the Application

For Windows users, simply run the included batch script from the root directory to start both the backend and frontend simultaneously:

```bat
start.bat
```

Alternatively, you can run them manually in separate terminal windows:

**Terminal 1 (Backend):**
```bash
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

- **Frontend Application:** http://localhost:5173
- **Backend API Docs (Swagger UI):** http://localhost:8000/docs

## 📊 Features

- **Bulk File Upload:** Upload multiple claims via `.csv`, `.xls`, or `.xlsx`.
- **Real-Time Inference:** Fast prediction generation via the FastAPI backend using a locally-stored Joblib model.
- **Interactive Dashboard:** Beautiful React dashboard with Chart.js to visualize fraud trends versus legitimate claims.
- **Detailed Claim Review:** Extracted rows are paired with their individual fraud probabilities and exact patient/provider information.

## 📝 API Endpoints

- `POST /predict`
  - Accepts a `multipart/form-data` file.
  - Required columns include: `Claim_Amount`, `Patient_Age`, `Patient_Gender`, `Provider_Type`, `Diagnosis_Code`, `Procedure_Code`, `Number_of_Procedures`, etc.
  - Returns a JSON payload containing an overall summary and a breakdown of predictions per claim.
