# Start AgriInsight AI Backend and Frontend simultaneously in separate windows
Write-Host "Starting AgriInsight AI FastAPI Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; .\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000"

Write-Host "Starting AgriInsight AI Next.js Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "AgriInsight AI is starting!" -ForegroundColor Yellow
Write-Host "Backend API:  http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "Frontend App: http://localhost:3000" -ForegroundColor Cyan
