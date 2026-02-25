
import pandas as pd
import numpy as np

# Define columns as per model requirements
columns = [
    'Claim_Amount', 'Patient_Age', 'Patient_Gender', 'Provider_Type', 
    'Diagnosis_Code', 'Procedure_Code', 'Number_of_Procedures', 
    'Admission_Type', 'Discharge_Type', 'Length_of_Stay_Days', 
    'Service_Type', 'Deductible_Amount', 'CoPay_Amount', 
    'Number_of_Previous_Claims_Patient', 'Number_of_Previous_Claims_Provider', 
    'Provider_Patient_Distance_Miles', 'Claim_Submitted_Late'
]

# Generate dummy data
n_rows = 10
data = {
    'Claim_Amount': np.random.uniform(100, 10000, n_rows),
    'Patient_Age': np.random.randint(0, 100, n_rows),
    'Patient_Gender': np.random.choice(['Male', 'Female', 'Other'], n_rows),
    'Provider_Type': np.random.choice(['Clinic', 'Hospital', 'Laboratory', 'Pharmacy'], n_rows),
    'Diagnosis_Code': np.random.choice(['A09', 'I10', 'Z00.00'], n_rows),
    'Procedure_Code': np.random.choice([99213, 99214, 71045], n_rows),
    'Number_of_Procedures': np.random.randint(1, 5, n_rows),
    'Admission_Type': np.random.choice(['Emergency', 'Elective', 'Urgent'], n_rows),
    'Discharge_Type': np.random.choice(['Home', 'Transfer to another facility'], n_rows),
    'Length_of_Stay_Days': np.random.randint(1, 30, n_rows),
    'Service_Type': np.random.choice(['Inpatient', 'Outpatient'], n_rows),
    'Deductible_Amount': np.random.uniform(0, 1000, n_rows),
    'CoPay_Amount': np.random.uniform(0, 500, n_rows),
    'Number_of_Previous_Claims_Patient': np.random.randint(0, 20, n_rows),
    'Number_of_Previous_Claims_Provider': np.random.randint(0, 100, n_rows),
    'Provider_Patient_Distance_Miles': np.random.uniform(0, 50, n_rows),
    'Claim_Submitted_Late': np.random.choice([True, False], n_rows)
}

df = pd.DataFrame(data)
df.to_csv('backend/dummy_data.csv', index=False)
print("Dummy data created at backend/dummy_data.csv")
