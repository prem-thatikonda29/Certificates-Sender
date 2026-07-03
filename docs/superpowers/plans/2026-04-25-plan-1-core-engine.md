# CertDrop Plan 1 — Core Engine

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the existing cert-sender scripts into a clean, tested `core/` package with parallel in-memory generation, multi-account SMTP rotation, smart retry queue, and pre-send validation.

**Architecture:** All business logic lives in `core/` as pure Python functions with no CLI or HTTP concerns. The existing `run.py`, `generate_certs.py`, and `send_certs.py` are left untouched until Plan 2 — this plan only builds the new core alongside them.

**Tech Stack:** Python 3.12, Pillow, img2pdf, python-dotenv, pytest

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `core/__init__.py` | Create | Package marker |
| `core/generator.py` | Create | In-memory parallel cert generation |
| `core/sender.py` | Create | Multi-account SMTP rotation |
| `core/validator.py` | Create | CSV validation, email typo detection, name cleaning |
| `core/progress.py` | Create | Cursor tracking, sent_log, retry queue |
| `tests/__init__.py` | Create | Package marker |
| `tests/test_validator.py` | Create | Validator unit tests |
| `tests/test_generator.py` | Create | Generator unit tests |
| `tests/test_sender.py` | Create | Sender unit tests |
| `tests/test_progress.py` | Create | Progress unit tests |
| `requirements.txt` | Modify | Add fastapi, pytest, httpx |

---

## Task 1: Project scaffold

**Files:**
- Create: `core/__init__.py`
- Create: `tests/__init__.py`
- Modify: `requirements.txt`

- [ ] **Step 1: Create core package**

```bash
mkdir -p core tests
touch core/__init__.py tests/__init__.py
```

- [ ] **Step 2: Update requirements.txt**

```
Pillow
img2pdf
python-dotenv
fastapi
uvicorn[standard]
pytest
pytest-cov
```

- [ ] **Step 3: Install dependencies**

```bash
pip install -r requirements.txt
```

Expected: all packages install cleanly.

- [ ] **Step 4: Commit**

```bash
git add core/__init__.py tests/__init__.py requirements.txt
git commit -m "chore: scaffold core package and test suite"
```

---

## Task 2: Validator — name cleaning

**Files:**
- Create: `core/validator.py`
- Create: `tests/test_validator.py`

- [ ] **Step 1: Write failing tests for name cleaning**

Create `tests/test_validator.py`:

```python
from core.validator import clean_name

def test_strips_parentheticals():
    assert clean_name("Kishan Ojha (Btech Cse 2024-28)") == "Kishan Ojha"

def test_title_cases():
    assert clean_name("priya sharma") == "Priya Sharma"

def test_trims_whitespace():
    assert clean_name("  Rahul Verma  ") == "Rahul Verma"

def test_multiple_parentheticals():
    assert clean_name("Nabhya Bawankar (Bba 2025-28)") == "Nabhya Bawankar"

def test_no_change_needed():
    assert clean_name("Priya Sharma") == "Priya Sharma"
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_validator.py -v
```

Expected: `ModuleNotFoundError: No module named 'core.validator'`

- [ ] **Step 3: Implement clean_name**

Create `core/validator.py`:

```python
import re


def clean_name(name: str) -> str:
    name = re.sub(r'\s*\(.*?\)', '', name).strip()
    return name.title()
```

- [ ] **Step 4: Run tests**

```bash
pytest tests/test_validator.py::test_strips_parentheticals tests/test_validator.py::test_title_cases tests/test_validator.py::test_trims_whitespace tests/test_validator.py::test_multiple_parentheticals tests/test_validator.py::test_no_change_needed -v
```

Expected: all 5 PASS.

- [ ] **Step 5: Commit**

```bash
git add core/validator.py tests/test_validator.py
git commit -m "feat: add clean_name to validator"
```

---

## Task 3: Validator — email typo detection

**Files:**
- Modify: `core/validator.py`
- Modify: `tests/test_validator.py`

- [ ] **Step 1: Write failing tests**

Append to `tests/test_validator.py`:

```python
from core.validator import is_suspicious_email

def test_detects_gamil():
    assert is_suspicious_email("user@gamil.com") is True

def test_detects_gmail_con():
    assert is_suspicious_email("user@gmail.con") is True

def test_detects_gmail_om():
    assert is_suspicious_email("user@gmail.om") is True

def test_detects_gmail_cpm():
    assert is_suspicious_email("user@gmail.cpm") is True

def test_valid_gmail_passes():
    assert is_suspicious_email("user@gmail.com") is False

def test_valid_isu_passes():
    assert is_suspicious_email("2025.user@isu.ac.in") is False

def test_missing_at_sign():
    assert is_suspicious_email("notanemail") is True

def test_empty_string():
    assert is_suspicious_email("") is True
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_validator.py -k "suspicious" -v
```

Expected: `ImportError: cannot import name 'is_suspicious_email'`

- [ ] **Step 3: Implement is_suspicious_email**

Append to `core/validator.py`:

```python
TYPO_DOMAINS = {"gamil.com", "gmail.con", "gmail.om", "gmail.cpm", "gmai.com", "gmial.com"}
TYPO_TLDS = {".con", ".om", ".cpm", ".ocm"}


def is_suspicious_email(email: str) -> bool:
    if not email or "@" not in email:
        return True
    _, domain = email.rsplit("@", 1)
    if domain.lower() in TYPO_DOMAINS:
        return True
    if any(domain.lower().endswith(tld) for tld in TYPO_TLDS):
        return True
    return False
```

- [ ] **Step 4: Run tests**

```bash
pytest tests/test_validator.py -v
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add core/validator.py tests/test_validator.py
git commit -m "feat: add email typo detection to validator"
```

---

## Task 4: Validator — CSV validation report

**Files:**
- Modify: `core/validator.py`
- Modify: `tests/test_validator.py`

- [ ] **Step 1: Write failing tests**

Append to `tests/test_validator.py`:

```python
import io
from core.validator import validate_csv

def test_valid_csv():
    data = "name,email\nPriya Sharma,priya@gmail.com\nRahul Verma,rahul@gmail.com"
    issues = validate_csv(io.StringIO(data))
    assert issues == []

def test_missing_email():
    data = "name,email\nPriya Sharma,"
    issues = validate_csv(io.StringIO(data))
    assert any(i["row"] == 2 and "email" in i["issue"].lower() for i in issues)

def test_suspicious_email_flagged():
    data = "name,email\nPriya Sharma,priya@gamil.com"
    issues = validate_csv(io.StringIO(data))
    assert any(i["row"] == 2 and "typo" in i["issue"].lower() for i in issues)

def test_duplicate_email_flagged():
    data = "name,email\nPriya Sharma,priya@gmail.com\nPriya Again,priya@gmail.com"
    issues = validate_csv(io.StringIO(data))
    assert any("duplicate" in i["issue"].lower() for i in issues)

def test_name_with_parenthetical_flagged():
    data = "name,email\nKishan Ojha (Btech Cse 2024-28),kishan@gmail.com"
    issues = validate_csv(io.StringIO(data))
    assert any("parenthetical" in i["issue"].lower() for i in issues)
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_validator.py -k "validate_csv" -v
```

Expected: `ImportError: cannot import name 'validate_csv'`

- [ ] **Step 3: Implement validate_csv**

Append to `core/validator.py`:

```python
import csv
from typing import IO


def validate_csv(fh: IO[str]) -> list[dict]:
    issues = []
    seen_emails = {}
    reader = csv.DictReader(fh)
    for i, row in enumerate(reader, 2):
        name = row.get("name", "").strip()
        email = row.get("email", "").strip()

        if not name or not email:
            issues.append({"row": i, "name": name, "email": email, "issue": "Missing name or email"})
            continue

        if is_suspicious_email(email):
            issues.append({"row": i, "name": name, "email": email, "issue": "Typo domain detected"})

        if email.lower() in seen_emails:
            issues.append({"row": i, "name": name, "email": email, "issue": f"Duplicate email (first seen row {seen_emails[email.lower()]})"})
        else:
            seen_emails[email.lower()] = i

        if re.search(r'\(.*?\)', name):
            issues.append({"row": i, "name": name, "email": email, "issue": "Name has parenthetical — will be cleaned automatically"})

    return issues
```

- [ ] **Step 4: Run tests**

```bash
pytest tests/test_validator.py -v
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add core/validator.py tests/test_validator.py
git commit -m "feat: add CSV validation report to validator"
```

---

## Task 5: Progress — cursor and sent_log

**Files:**
- Create: `core/progress.py`
- Create: `tests/test_progress.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_progress.py`:

```python
import os
import tempfile
import pytest
from core.progress import ProgressTracker


@pytest.fixture
def tracker(tmp_path):
    return ProgressTracker(
        progress_file=str(tmp_path / "progress.json"),
        sent_log=str(tmp_path / "sent_log.csv"),
        retry_queue=str(tmp_path / "retry.csv"),
    )


def test_cursor_starts_at_zero(tracker):
    assert tracker.get_cursor("participants") == 0


def test_cursor_advances(tracker):
    tracker.save_cursor("participants", 51)
    assert tracker.get_cursor("participants") == 51


def test_is_sent_false_initially(tracker):
    assert tracker.is_sent("user@gmail.com") is False


def test_mark_sent(tracker):
    tracker.mark_sent("participants", "Priya Sharma", "priya@gmail.com")
    assert tracker.is_sent("priya@gmail.com") is True


def test_mark_failed_adds_to_retry(tracker):
    tracker.mark_failed("participants", "Rahul Verma", "rahul@gmail.com")
    queue = tracker.get_retry_queue()
    assert any(r["email"] == "rahul@gmail.com" for r in queue)


def test_retry_queue_empty_initially(tracker):
    assert tracker.get_retry_queue() == []
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_progress.py -v
```

Expected: `ModuleNotFoundError: No module named 'core.progress'`

- [ ] **Step 3: Implement ProgressTracker**

Create `core/progress.py`:

```python
import csv
import json
import os
from datetime import datetime


class ProgressTracker:
    def __init__(self, progress_file="progress.json", sent_log="sent_log.csv", retry_queue="retry.csv"):
        self.progress_file = progress_file
        self.sent_log = sent_log
        self.retry_queue = retry_queue
        self._sent: set[str] = self._load_sent()

    def get_cursor(self, tier: str) -> int:
        if not os.path.exists(self.progress_file):
            return 0
        with open(self.progress_file, encoding="utf-8") as fh:
            return json.load(fh).get(tier, 0)

    def save_cursor(self, tier: str, idx: int) -> None:
        data = {}
        if os.path.exists(self.progress_file):
            with open(self.progress_file, encoding="utf-8") as fh:
                data = json.load(fh)
        data[tier] = idx
        with open(self.progress_file, "w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2)

    def is_sent(self, email: str) -> bool:
        return email.lower() in self._sent

    def mark_sent(self, tier: str, name: str, email: str) -> None:
        write_header = not os.path.exists(self.sent_log)
        with open(self.sent_log, "a", newline="", encoding="utf-8") as fh:
            writer = csv.writer(fh)
            if write_header:
                writer.writerow(["tier", "name", "email", "sent_at", "status"])
            writer.writerow([tier, name, email, datetime.now().isoformat(timespec="seconds"), "sent"])
        self._sent.add(email.lower())

    def mark_failed(self, tier: str, name: str, email: str) -> None:
        write_header = not os.path.exists(self.retry_queue)
        with open(self.retry_queue, "a", newline="", encoding="utf-8") as fh:
            writer = csv.writer(fh)
            if write_header:
                writer.writerow(["tier", "name", "email", "failed_at"])
            writer.writerow([tier, name, email, datetime.now().isoformat(timespec="seconds")])

    def get_retry_queue(self) -> list[dict]:
        if not os.path.exists(self.retry_queue):
            return []
        with open(self.retry_queue, newline="", encoding="utf-8") as fh:
            return list(csv.DictReader(fh))

    def clear_retry_entry(self, email: str) -> None:
        if not os.path.exists(self.retry_queue):
            return
        with open(self.retry_queue, newline="", encoding="utf-8") as fh:
            rows = [r for r in csv.DictReader(fh) if r["email"].lower() != email.lower()]
        with open(self.retry_queue, "w", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=["tier", "name", "email", "failed_at"])
            writer.writeheader()
            writer.writerows(rows)

    def _load_sent(self) -> set[str]:
        if not os.path.exists(self.sent_log):
            return set()
        with open(self.sent_log, newline="", encoding="utf-8") as fh:
            return {r["email"].lower() for r in csv.DictReader(fh) if r.get("status") == "sent"}
```

- [ ] **Step 4: Run tests**

```bash
pytest tests/test_progress.py -v
```

Expected: all 6 PASS.

- [ ] **Step 5: Commit**

```bash
git add core/progress.py tests/test_progress.py
git commit -m "feat: add ProgressTracker with cursor, sent_log, retry queue"
```

---

## Task 6: Generator — in-memory certificate generation

**Files:**
- Create: `core/generator.py`
- Create: `tests/test_generator.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_generator.py`:

```python
import pytest
from PIL import Image
from core.generator import generate_certificate_bytes

TIER = {
    "template": "templates/participant_template.jpg",
    "font_size": 66,
    "max_text_width": 1740,
    "text_position": (1263, 675),
}


def test_returns_bytes():
    result = generate_certificate_bytes("Priya Sharma", TIER)
    assert isinstance(result, bytes)
    assert len(result) > 0


def test_pdf_magic_bytes():
    result = generate_certificate_bytes("Priya Sharma", TIER)
    assert result[:4] == b"%PDF"


def test_long_name_does_not_crash():
    result = generate_certificate_bytes("Ustad Mohammed Sufyan Allauddin", TIER)
    assert isinstance(result, bytes)
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_generator.py -v
```

Expected: `ModuleNotFoundError: No module named 'core.generator'`

- [ ] **Step 3: Implement generate_certificate_bytes**

Create `core/generator.py`:

```python
import io
from concurrent.futures import ThreadPoolExecutor, as_completed

import img2pdf
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from config import FONT_COLOR, FONT_PATH, PILL_COLOR, PILL_PADDING_X, PILL_PADDING_Y


def _fit_font(text: str, font_size: int, max_width: int) -> ImageFont.FreeTypeFont:
    size = font_size
    while size >= 10:
        font = ImageFont.truetype(FONT_PATH, size)
        if (font.getbbox(text)[2] - font.getbbox(text)[0]) <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(FONT_PATH, 10)


def generate_certificate_bytes(name: str, tier: dict) -> bytes:
    img = Image.open(tier["template"]).convert("RGBA")
    font = _fit_font(name, tier["font_size"], tier["max_text_width"])
    bbox = font.getbbox(name)
    text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]

    cx, cy = tier["text_position"]
    text_x = cx - text_w // 2
    text_y = cy - text_h // 2

    px0 = text_x - PILL_PADDING_X
    py0 = text_y - PILL_PADDING_Y
    px1 = text_x + text_w + PILL_PADDING_X
    py1 = text_y + text_h + PILL_PADDING_Y
    radius = (py1 - py0) // 2

    pill_mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(pill_mask).rounded_rectangle([px0, py0, px1, py1], radius=radius, fill=255)

    blurred = img.filter(ImageFilter.GaussianBlur(radius=28))
    img.paste(blurred, mask=pill_mask)

    dark_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(dark_layer).rounded_rectangle([px0, py0, px1, py1], radius=radius, fill=PILL_COLOR)
    img = Image.alpha_composite(img, dark_layer)

    border_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(border_layer).rounded_rectangle([px0, py0, px1, py1], radius=radius, outline=(255, 255, 255, 55), width=2)
    img = Image.alpha_composite(img, border_layer)

    highlight_h = max(6, (py1 - py0) // 6)
    highlight_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(highlight_layer).rounded_rectangle([px0, py0, px1, py0 + highlight_h * 2], radius=radius, fill=(255, 255, 255, 35))
    img = Image.alpha_composite(img, Image.composite(highlight_layer, Image.new("RGBA", img.size, (0, 0, 0, 0)), pill_mask))

    ImageDraw.Draw(img).text((text_x, text_y), name, font=font, fill=FONT_COLOR)

    png_buf = io.BytesIO()
    img.convert("RGB").save(png_buf, "PNG")
    png_buf.seek(0)
    return img2pdf.convert(png_buf)


def generate_batch(names_and_tiers: list[tuple[str, dict]], max_workers: int = 4) -> list[tuple[str, bytes]]:
    results = [None] * len(names_and_tiers)
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {pool.submit(generate_certificate_bytes, name, tier): i for i, (name, tier) in enumerate(names_and_tiers)}
        for future in as_completed(futures):
            results[futures[future]] = (names_and_tiers[futures[future]][0], future.result())
    return results
```

- [ ] **Step 4: Run tests**

```bash
pytest tests/test_generator.py -v
```

Expected: all 3 PASS.

- [ ] **Step 5: Commit**

```bash
git add core/generator.py tests/test_generator.py
git commit -m "feat: in-memory parallel certificate generation"
```

---

## Task 7: Sender — multi-account SMTP rotation

**Files:**
- Create: `core/sender.py`
- Create: `tests/test_sender.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_sender.py`:

```python
import pytest
from unittest.mock import MagicMock, patch
from core.sender import AccountPool, build_message


def test_account_pool_rotates_on_limit():
    pool = AccountPool([("a@gmail.com", "pass1"), ("b@gmail.com", "pass2")], per_account_limit=2)
    assert pool.current_user == "a@gmail.com"
    pool.record_send()
    pool.record_send()
    pool.rotate()
    assert pool.current_user == "b@gmail.com"


def test_account_pool_exhausted_raises():
    pool = AccountPool([("a@gmail.com", "pass1")], per_account_limit=1)
    pool.record_send()
    with pytest.raises(RuntimeError, match="All SMTP accounts exhausted"):
        pool.rotate()


def test_build_message_contains_name():
    msg = build_message(
        from_addr="sender@gmail.com",
        to_addr="user@gmail.com",
        cc_addrs=[],
        subject="Test",
        html_body="<p>Hi Priya</p>",
        plain_body="Hi Priya",
        pdf_bytes=b"%PDF-test",
        filename="cert.pdf",
    )
    assert "Priya" in msg.as_string()


def test_build_message_has_pdf_attachment():
    msg = build_message(
        from_addr="sender@gmail.com",
        to_addr="user@gmail.com",
        cc_addrs=[],
        subject="Test",
        html_body="<p>Hi</p>",
        plain_body="Hi",
        pdf_bytes=b"%PDF-test",
        filename="cert.pdf",
    )
    content_types = [p.get_content_type() for p in msg.walk()]
    assert "application/pdf" in content_types
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_sender.py -v
```

Expected: `ModuleNotFoundError: No module named 'core.sender'`

- [ ] **Step 3: Implement AccountPool and build_message**

Create `core/sender.py`:

```python
import smtplib
import time
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


class AccountPool:
    def __init__(self, accounts: list[tuple[str, str]], per_account_limit: int = 450):
        if not accounts:
            raise ValueError("At least one SMTP account required")
        self._accounts = accounts
        self._idx = 0
        self._sends = 0
        self.per_account_limit = per_account_limit

    @property
    def current_user(self) -> str:
        return self._accounts[self._idx][0]

    @property
    def current_password(self) -> str:
        return self._accounts[self._idx][1]

    def record_send(self) -> None:
        self._sends += 1

    def needs_rotation(self) -> bool:
        return self._sends >= self.per_account_limit

    def rotate(self) -> None:
        if self._idx + 1 >= len(self._accounts):
            raise RuntimeError("All SMTP accounts exhausted for today. Re-run tomorrow or add more accounts.")
        self._idx += 1
        self._sends = 0

    def connect(self) -> smtplib.SMTP:
        smtp = smtplib.SMTP("smtp.gmail.com", 587)
        smtp.ehlo()
        smtp.starttls()
        smtp.login(self.current_user, self.current_password)
        return smtp


def build_message(
    from_addr: str,
    to_addr: str,
    cc_addrs: list[str],
    subject: str,
    html_body: str,
    plain_body: str,
    pdf_bytes: bytes,
    filename: str,
) -> MIMEMultipart:
    msg = MIMEMultipart("mixed")
    msg["From"] = from_addr
    msg["To"] = to_addr
    msg["Cc"] = ", ".join(cc_addrs)
    msg["Subject"] = subject

    alt = MIMEMultipart("alternative")
    alt.attach(MIMEText(plain_body, "plain"))
    alt.attach(MIMEText(html_body, "html"))
    msg.attach(alt)

    att = MIMEApplication(pdf_bytes, _subtype="pdf")
    att.add_header("Content-Disposition", "attachment", filename=filename)
    msg.attach(att)
    return msg


def send_one(
    smtp: smtplib.SMTP,
    pool: AccountPool,
    from_addr: str,
    to_addr: str,
    cc_addrs: list[str],
    subject: str,
    html_body: str,
    plain_body: str,
    pdf_bytes: bytes,
    filename: str,
    rate_limit_sleep: float = 0.5,
) -> smtplib.SMTP:
    if pool.needs_rotation():
        smtp.quit()
        pool.rotate()
        smtp = pool.connect()

    try:
        smtp.noop()
    except Exception:
        smtp = pool.connect()

    msg = build_message(from_addr, to_addr, cc_addrs, subject, html_body, plain_body, pdf_bytes, filename)
    smtp.sendmail(from_addr, [to_addr] + cc_addrs, msg.as_string())
    pool.record_send()
    time.sleep(rate_limit_sleep)
    return smtp
```

- [ ] **Step 4: Run tests**

```bash
pytest tests/test_sender.py -v
```

Expected: all 4 PASS.

- [ ] **Step 5: Commit**

```bash
git add core/sender.py tests/test_sender.py
git commit -m "feat: multi-account SMTP rotation and HTML email builder"
```

---

## Task 8: Full test suite pass

- [ ] **Step 1: Run all tests with coverage**

```bash
pytest tests/ -v --cov=core --cov-report=term-missing
```

Expected: all tests PASS, coverage >80% on all core modules.

- [ ] **Step 2: Fix any failures**

If any tests fail, fix the implementation (not the tests) before proceeding.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: core engine complete — validator, generator, sender, progress"
```
