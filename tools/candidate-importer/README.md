# HireFlow Candidate Importer CLI

A dedicated Python CLI utility for recruiters to validate, inspect, clean, and batch-import candidate leads into their company's HireFlow talent pool.

## Features
- **Strict Validation**: Validates full names, normalized emails, phone numbers, and experience values.
- **Duplicate Prevention**: Detects in-file duplicates before submission.
- **Dry-Run Mode**: Inspect CSV files, identify errors, and generate summary reports without contacting the API.
- **Error Export**: Invalid records are automatically exported to a separate CSV with clear error descriptions.
- **Company Data Isolation**: Communicates directly with the authenticated company's `/api/v1/recruiter/talent-pool/import` endpoint.

## Requirements
- Python 3.10+
- pytest (for automated tests)

## Usage

### 1. Dry Run (Validate without submitting)
```bash
python import_candidates.py --file sample_candidates.csv --dry-run
```

### 2. Live Submission with Token
```bash
# Option A: Command line token argument
python import_candidates.py \
    --file sample_candidates.csv \
    --api-url http://localhost:8080/api/v1 \
    --token <YOUR_JWT_ACCESS_TOKEN>

# Option B: Environment variable
export HIREFLOW_AUTH_TOKEN="<YOUR_JWT_ACCESS_TOKEN>"
python import_candidates.py --file sample_candidates.csv
```

## Running Automated Tests
```bash
pytest tests/
```
