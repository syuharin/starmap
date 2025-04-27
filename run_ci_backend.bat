@echo off
setlocal enabledelayedexpansion

echo --- Running Backend CI Steps ---

REM Navigate to the backend directory
cd src\backend
if errorlevel 1 (
    echo ERROR: Failed to navigate to src\backend
    exit /b 1
)

REM Install dependencies
echo --- Installing Python dependencies ---
python -m pip install --upgrade pip
pip install -r requirements.txt
REM Install testing/linting/formatting tools if not already in requirements.txt
pip install pytest pytest-cov flake8 black || echo Testing/linting/formatting tools might already be installed via requirements.txt

REM Run Black formatter
echo --- Running Black Formatter ---
black .
if errorlevel 1 (
    echo WARNING: Black formatter failed or made changes. Re-running Flake8 after formatting.
)

REM Run Flake8
echo --- Running Flake8 ---
flake8 . --count --max-complexity=10 --max-line-length=127 --statistics
if errorlevel 1 (
    echo ERROR: Flake8 failed
    cd ..\..
    exit /b 1
)

REM Run pytest
echo --- Running pytest ---
pytest --cov=. --cov-report=term-missing
if errorlevel 1 (
    echo ERROR: pytest failed
    cd ..\..
    exit /b 1
)

echo --- Backend CI Steps Completed ---

REM Navigate back to the root directory
cd ..\..

endlocal
exit /b 0
