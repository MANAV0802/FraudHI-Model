
import pickle
import sklearn
import pandas as pd
import sys
import joblib


try:
    with open('fraud_detection_model.pkl', 'rb') as f:
        model = joblib.load(f)
    print(f"Model Type: {type(model)}")
    print(f"Sklearn Version: {sklearn.__version__}")
    
    if hasattr(model, 'feature_names_in_'):
        print("Feature names found:")
        print(list(model.feature_names_in_))
    else:
        print("No feature_names_in_ found.")
        
    if hasattr(model, 'n_features_in_'):
        print(f"Number of features: {model.n_features_in_}")
    
    # Try to see if it's a pipeline and inspect steps
    if hasattr(model, 'steps'):
        print("Pipeline steps:")
        for name, step in model.steps:
            print(f"  - {name}: {type(step)}")
            
except Exception as e:
    print(f"Error loading model: {e}")

