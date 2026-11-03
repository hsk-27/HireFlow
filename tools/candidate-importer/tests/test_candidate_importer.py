import os
import sys
import tempfile
import pytest

# Add parent directory to sys.path so we can import import_candidates
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from import_candidates import (
    process_csv_file,
    validate_email,
    validate_phone,
    validate_experience
)


def create_temp_csv(content: str) -> str:
    fd, path = tempfile.mkstemp(suffix=".csv", text=True)
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(content)
    return path


def test_validate_email():
    assert validate_email("test@example.com") is True
    assert validate_email("john.doe+tag@domain.co.uk") is True
    assert validate_email("invalid-email") is False
    assert validate_email("@no-user.com") is False
    assert validate_email("") is False


def test_validate_phone():
    assert validate_phone("+1 555-0123") is True
    assert validate_phone("5550123") is True
    assert validate_phone("") is True  # Optional
    assert validate_phone("abc-invalid-phone") is False


def test_validate_experience():
    valid, val = validate_experience("5.5")
    assert valid is True and val == 5.5

    valid, val = validate_experience("0")
    assert valid is True and val == 0.0

    valid, val = validate_experience("not-a-number")
    assert valid is False

    valid, val = validate_experience("-2")
    assert valid is False

    valid, val = validate_experience("100")  # Over 60 years
    assert valid is False


def test_valid_csv():
    content = (
        "full_name,email,phone,current_company,current_designation,years_of_experience,location,skills,source\n"
        "Alice Smith,alice@example.com,+15551234,Acme Corp,Software Engineer,4.5,Remote,Java;SQL,Referral\n"
        "Bob Jones,bob@example.com,,Beta Inc,Frontend Dev,2.0,NYC,React;TypeScript,Inbound\n"
    )
    path = create_temp_csv(content)
    try:
        valid, invalid, errors = process_csv_file(path)
        assert len(errors) == 0
        assert len(valid) == 2
        assert len(invalid) == 0
        assert valid[0]["fullName"] == "Alice Smith"
        assert valid[0]["email"] == "alice@example.com"
        assert valid[0]["yearsOfExperience"] == 4.5
    finally:
        os.remove(path)


def test_missing_required_columns():
    content = "name,email_address,phone\nAlice,alice@example.com,555\n"
    path = create_temp_csv(content)
    try:
        valid, invalid, errors = process_csv_file(path)
        assert len(errors) > 0
        assert "missing required columns" in errors[0].lower()
    finally:
        os.remove(path)


def test_invalid_email_and_experience():
    content = (
        "full_name,email,years_of_experience\n"
        "Bad Email,not-an-email,3.0\n"
        "Bad Exp,good@example.com,invalid_exp\n"
    )
    path = create_temp_csv(content)
    try:
        valid, invalid, errors = process_csv_file(path)
        assert len(valid) == 0
        assert len(invalid) == 2
        assert "Invalid email format" in invalid[0]["__errors__"]
        assert "Invalid years_of_experience" in invalid[1]["__errors__"]
    finally:
        os.remove(path)


def test_duplicate_records_in_csv():
    content = (
        "full_name,email\n"
        "Alice One,duplicate@example.com\n"
        "Alice Two,duplicate@example.com\n"
    )
    path = create_temp_csv(content)
    try:
        valid, invalid, errors = process_csv_file(path)
        assert len(valid) == 1
        assert len(invalid) == 1
        assert "Duplicate email in CSV" in invalid[0]["__errors__"]
    finally:
        os.remove(path)


def test_empty_file():
    path = create_temp_csv("")
    try:
        valid, invalid, errors = process_csv_file(path)
        assert len(errors) > 0
        assert "empty" in errors[0].lower()
    finally:
        os.remove(path)


def test_unicode_names():
    content = (
        "full_name,email,location\n"
        "José Silva,jose@example.com,São Paulo\n"
        "Åsa Lindgren,asa@example.se,Stockholm\n"
        "李伟,li.wei@example.cn,Beijing\n"
    )
    path = create_temp_csv(content)
    try:
        valid, invalid, errors = process_csv_file(path)
        assert len(valid) == 3
        assert len(invalid) == 0
        assert valid[0]["fullName"] == "José Silva"
        assert valid[1]["fullName"] == "Åsa Lindgren"
        assert valid[2]["fullName"] == "李伟"
    finally:
        os.remove(path)
