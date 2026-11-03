#!/usr/bin/env python3
"""
HireFlow Candidate Importer CLI Utility
Validates, cleans, and submits candidate leads to HireFlow's company talent pool.
"""

import argparse
import csv
import json
import os
import re
import sys
from typing import Dict, List, Tuple, Any

try:
    import urllib.request
    import urllib.error
except ImportError:
    pass

EMAIL_REGEX = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
PHONE_REGEX = re.compile(r"^\+?[0-9\s\-\(\)\.]{7,25}$")


def validate_email(email: str) -> bool:
    if not email:
        return False
    return bool(EMAIL_REGEX.match(email.strip()))


def validate_phone(phone: str) -> bool:
    if not phone or not phone.strip():
        return True  # Phone is optional
    return bool(PHONE_REGEX.match(phone.strip()))


def validate_experience(exp_str: str) -> Tuple[bool, float]:
    if not exp_str or not exp_str.strip():
        return True, 0.0
    try:
        val = float(exp_str.strip())
        if 0.0 <= val <= 60.0:
            return True, val
        return False, val
    except ValueError:
        return False, 0.0


def process_csv_file(file_path: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[str]]:
    """
    Parses and validates CSV candidate records.
    Returns (valid_records, invalid_records_with_errors, errors_summary).
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Input file not found: {file_path}")

    valid_records: List[Dict[str, Any]] = []
    invalid_records: List[Dict[str, Any]] = []
    summary_errors: List[str] = []

    seen_emails = set()

    with open(file_path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            summary_errors.append("CSV file is empty or missing headers")
            return valid_records, invalid_records, summary_errors

        headers = [h.strip().lower() for h in reader.fieldnames]
        if "full_name" not in headers or "email" not in headers:
            summary_errors.append("CSV is missing required columns. Must include 'full_name' and 'email'.")
            return valid_records, invalid_records, summary_errors

        for row_num, raw_row in enumerate(reader, start=2):
            row = {k.strip().lower(): (v.strip() if v else "") for k, v in raw_row.items() if k}
            row_errors = []

            # 1. Full name validation
            full_name = row.get("full_name", "")
            if not full_name:
                row_errors.append("Missing full_name")

            # 2. Email validation
            email = row.get("email", "").lower().strip()
            if not email:
                row_errors.append("Missing email")
            elif not validate_email(email):
                row_errors.append(f"Invalid email format: '{email}'")
            elif email in seen_emails:
                row_errors.append(f"Duplicate email in CSV: '{email}'")

            # 3. Phone validation
            phone = row.get("phone", "")
            if phone and not validate_phone(phone):
                row_errors.append(f"Invalid phone format: '{phone}'")

            # 4. Years of experience validation
            exp_str = row.get("years_of_experience", "")
            valid_exp, exp_val = validate_experience(exp_str)
            if not valid_exp:
                row_errors.append(f"Invalid years_of_experience: '{exp_str}' (must be a number between 0 and 60)")

            if row_errors:
                invalid_entry = dict(raw_row)
                invalid_entry["__errors__"] = "; ".join(row_errors)
                invalid_entry["__row__"] = row_num
                invalid_records.append(invalid_entry)
            else:
                seen_emails.add(email)
                valid_records.append({
                    "fullName": full_name,
                    "email": email,
                    "phone": phone if phone else None,
                    "currentCompany": row.get("current_company", None),
                    "currentDesignation": row.get("current_designation", None),
                    "yearsOfExperience": exp_val,
                    "location": row.get("location", None),
                    "skills": row.get("skills", None),
                    "source": row.get("source", "CSV Import")
                })

    return valid_records, invalid_records, summary_errors


def export_invalid_records(invalid_records: List[Dict[str, Any]], output_path: str):
    if not invalid_records:
        return
    fieldnames = list(invalid_records[0].keys())
    with open(output_path, mode="w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(invalid_records)


def submit_to_backend(api_url: str, token: str, records: List[Dict[str, Any]]) -> Dict[str, Any]:
    url = f"{api_url.rstrip('/')}/recruiter/talent-pool/import"
    payload = {
        "leads": records,
        "confirmedAuthorization": True
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8")
            return json.loads(resp_body)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
            return {"success": False, "error": parsed.get("message", err_body), "code": e.code}
        except Exception:
            return {"success": False, "error": err_body, "code": e.code}
    except Exception as e:
        return {"success": False, "error": str(e)}


def main():
    parser = argparse.ArgumentParser(description="HireFlow Candidate Talent Pool CSV Importer")
    parser.add_argument("--file", "-f", required=True, help="Path to input candidate CSV file")
    parser.add_argument("--api-url", default="http://localhost:8080/api/v1", help="HireFlow backend API URL")
    parser.add_argument("--token", "-t", default=None, help="Recruiter JWT bearer token (or set HIREFLOW_AUTH_TOKEN)")
    parser.add_argument("--dry-run", action="store_true", help="Validate and report without submitting to backend")
    parser.add_argument("--export-invalid", default="invalid_candidates.csv", help="Filename to export invalid records")

    args = parser.parse_args()

    token = args.token or os.environ.get("HIREFLOW_AUTH_TOKEN")

    print(f"==================================================")
    print(f"  HIREFLOW TALENT POOL IMPORTER")
    print(f"==================================================")
    print(f"Input file : {args.file}")
    print(f"Mode       : {'DRY RUN (No data submitted)' if args.dry_run else 'LIVE SUBMISSION'}")
    print(f"API Target : {args.api_url}\n")

    try:
        valid_records, invalid_records, summary_errors = process_csv_file(args.file)
    except Exception as e:
        print(f"ERROR: Could not process CSV file: {e}")
        sys.exit(1)

    if summary_errors:
        for err in summary_errors:
            print(f"FATAL ERROR: {err}")
        sys.exit(1)

    total_rows = len(valid_records) + len(invalid_records)
    print(f"Validation Report:")
    print(f"  Total rows parsed   : {total_rows}")
    print(f"  Valid records       : {len(valid_records)}")
    print(f"  Invalid / rejected  : {len(invalid_records)}")

    if invalid_records:
        export_invalid_records(invalid_records, args.export_invalid)
        print(f"  Exported invalid records to: {args.export_invalid}")

    if args.dry_run:
        print("\n[DRY RUN COMPLETE] No records were sent to the server.")
        return

    if not valid_records:
        print("\nNo valid records to submit. Exiting.")
        return

    if not token:
        print("\nERROR: Authentication token is required for live submission.")
        print("Please provide --token <jwt> or set the HIREFLOW_AUTH_TOKEN environment variable.")
        sys.exit(1)

    print(f"\nSubmitting {len(valid_records)} records to {args.api_url}...")
    result = submit_to_backend(args.api_url, token, valid_records)

    if result.get("success"):
        data = result.get("data", {})
        print("\n[SUCCESS] Talent leads imported successfully!")
        print(f"  Processed : {data.get('totalProcessed', len(valid_records))}")
        print(f"  Imported  : {data.get('importedCount', 0)}")
        print(f"  Duplicates: {data.get('skippedDuplicateCount', 0)} (skipped)")
        print(f"  Failed    : {data.get('failedCount', 0)}")
    else:
        print(f"\n[FAILED] Server rejected submission: {result.get('error')}")
        sys.exit(1)


if __name__ == "__main__":
    main()
