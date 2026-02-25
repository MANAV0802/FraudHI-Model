 
@echo off
echo Starting Backend...
start cmd /k "python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000"
 
echo Starting Frontend...
cd frontend
start cmd /k "npm run dev"
echo Website startup initiated. Access at http://localhost:5173
 
 