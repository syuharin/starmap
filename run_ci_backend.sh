#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "--- Running Backend CI Steps ---"

# Navigate to the backend directory
cd src/backend

# Install dependencies
echo "--- Installing Python dependencies ---"
python -m pip install --upgrade pip
pip install -r requirements.txt
# Install testing/linting/formatting tools if not already in requirements.txt
pip install pytest pytest-cov flake8 black || echo "Testing/linting/formatting tools might already be installed via requirements.txt"

# Run Black formatter
echo "--- Running Black Formatter ---"
black .

# Run Flake8
echo "--- Running Flake8 ---"
flake8 . --count --max-complexity=10 --max-line-length=127 --statistics

# Run pytest
echo "--- Running pytest ---"
pytest --cov=. --cov-report=term-missing

echo "--- Backend CI Steps Completed ---"

# Navigate back to the root directory
cd ../..
