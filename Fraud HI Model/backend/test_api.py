
import requests
import json

url = "http://127.0.0.1:8000/predict"
file_path = "backend/dummy_data.csv"

try:
    with open(file_path, 'rb') as f:
        files = {'file': ('dummy_data.csv', f, 'text/csv')}
        response = requests.post(url, files=files)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response JSON snippet:")
        print(json.dumps(response.json(), indent=2)[:500] + "...")
    else:
        print("Error Response:")
        print(response.text)

except Exception as e:
    print(f"Test failed: {e}")
