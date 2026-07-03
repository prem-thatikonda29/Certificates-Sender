# CertDrop Plan 4 — Nice-to-Haves

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add delivery analytics, duplicate event detection, certificate preview sharing, `certdrop init` wizard, and PyPI packaging.

**Architecture:** Analytics and duplicate detection extend `core/validator.py` and `core/progress.py`. Preview sharing adds a token-based endpoint to `api/server.py`. The init wizard extends `run.py`. PyPI packaging adds `pyproject.toml`.

**Prerequisite:** Plans 1, 2, and 3 must be complete.

**Tech Stack:** Python 3.12, FastAPI, click, build, twine

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `core/analytics.py` | Create | Delivery analytics report generation |
| `core/validator.py` | Modify | Cross-tier duplicate detection |
| `api/server.py` | Modify | Preview sharing endpoint |
| `run.py` | Modify | Expanded `init` wizard |
| `pyproject.toml` | Create | PyPI packaging config |
| `README.md` | Create | Project README |
| `.env.example` | Create | Documented env vars |
| `tests/test_analytics.py` | Create | Analytics unit tests |

---

## Task 1: Delivery analytics

**Files:**
- Create: `core/analytics.py`
- Create: `tests/test_analytics.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_analytics.py`:

```python
import io
from core.analytics import build_report

SENT_LOG = """tier,name,email,sent_at,status
participants,Priya Sharma,priya@gmail.com,2026-04-25T12:00:00,sent
participants,Rahul Verma,rahul@isu.ac.in,2026-04-25T12:00:30,sent
participants,Amit Kumar,amit@gmail.com,2026-04-25T12:01:00,sent
"""

RETRY_LOG = """tier,name,email,failed_at
participants,Sneha Patil,sneha@gamil.com,2026-04-25T12:01:30
"""


def test_total_sent():
    report = build_report(io.StringIO(SENT_LOG), io.StringIO(RETRY_LOG))
    assert report["total_sent"] == 3


def test_total_failed():
    report = build_report(io.StringIO(SENT_LOG), io.StringIO(RETRY_LOG))
    assert report["total_failed"] == 1


def test_domain_breakdown():
    report = build_report(io.StringIO(SENT_LOG), io.StringIO(RETRY_LOG))
    assert report["by_domain"]["gmail.com"] == 2
    assert report["by_domain"]["isu.ac.in"] == 1


def test_sent_rate():
    report = build_report(io.StringIO(SENT_LOG), io.StringIO(RETRY_LOG))
    assert 0 < report["delivery_rate"] <= 1.0
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_analytics.py -v
```

Expected: `ModuleNotFoundError: No module named 'core.analytics'`

- [ ] **Step 3: Implement build_report**

Create `core/analytics.py`:

```python
import csv
from collections import defaultdict
from typing import IO


def build_report(sent_log_fh: IO[str], retry_fh: IO[str]) -> dict:
    sent_rows = list(csv.DictReader(sent_log_fh))
    failed_rows = list(csv.DictReader(retry_fh))

    total_sent = sum(1 for r in sent_rows if r.get("status") == "sent")
    total_failed = len(failed_rows)

    by_domain: dict[str, int] = defaultdict(int)
    for r in sent_rows:
        if r.get("status") == "sent" and "@" in r.get("email", ""):
            domain = r["email"].rsplit("@", 1)[1].lower()
            by_domain[domain] += 1

    total = total_sent + total_failed
    delivery_rate = total_sent / total if total > 0 else 0.0

    return {
        "total_sent": total_sent,
        "total_failed": total_failed,
        "delivery_rate": round(delivery_rate, 4),
        "by_domain": dict(by_domain),
    }


def report_to_csv(report: dict) -> str:
    lines = ["domain,sent"]
    for domain, count in sorted(report["by_domain"].items(), key=lambda x: -x[1]):
        lines.append(f"{domain},{count}")
    return "\n".join(lines)
```

- [ ] **Step 4: Run tests**

```bash
pytest tests/test_analytics.py -v
```

Expected: all 4 PASS.

- [ ] **Step 5: Commit**

```bash
git add core/analytics.py tests/test_analytics.py
git commit -m "feat: delivery analytics report"
```

---

## Task 2: Duplicate event detection

**Files:**
- Modify: `core/validator.py`
- Modify: `tests/test_validator.py`

- [ ] **Step 1: Write failing test**

Append to `tests/test_validator.py`:

```python
import io
from core.validator import find_cross_tier_duplicates

def test_finds_cross_tier_duplicate():
    tiers = {
        "winner": [{"name": "Priya", "email": "priya@gmail.com"}],
        "participants": [{"name": "Priya Sharma", "email": "priya@gmail.com"}],
    }
    dupes = find_cross_tier_duplicates(tiers)
    assert len(dupes) == 1
    assert dupes[0]["email"] == "priya@gmail.com"
    assert set(dupes[0]["tiers"]) == {"winner", "participants"}


def test_no_duplicates_across_tiers():
    tiers = {
        "winner": [{"name": "Priya", "email": "priya@gmail.com"}],
        "participants": [{"name": "Rahul", "email": "rahul@gmail.com"}],
    }
    assert find_cross_tier_duplicates(tiers) == []
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_validator.py -k "cross_tier" -v
```

Expected: `ImportError: cannot import name 'find_cross_tier_duplicates'`

- [ ] **Step 3: Implement find_cross_tier_duplicates**

Append to `core/validator.py`:

```python
def find_cross_tier_duplicates(tiers: dict[str, list[dict]]) -> list[dict]:
    email_to_tiers: dict[str, list[str]] = {}
    for tier_name, rows in tiers.items():
        for row in rows:
            email = row.get("email", "").strip().lower()
            if not email:
                continue
            email_to_tiers.setdefault(email, []).append(tier_name)

    return [
        {"email": email, "tiers": tier_list}
        for email, tier_list in email_to_tiers.items()
        if len(tier_list) > 1
    ]
```

- [ ] **Step 4: Run tests**

```bash
pytest tests/test_validator.py -v
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add core/validator.py tests/test_validator.py
git commit -m "feat: cross-tier duplicate email detection"
```

---

## Task 3: Certificate preview sharing

**Files:**
- Modify: `api/server.py`
- Modify: `tests/test_api.py`

- [ ] **Step 1: Write failing test**

Append to `tests/test_api.py`:

```python
def test_create_and_fetch_preview():
    img_bytes = _make_test_image()
    t = client.post("/api/template", files={"file": ("t.jpg", img_bytes, "image/jpeg")}).json()

    res = client.post("/api/preview-share", json={
        "template_id": t["template_id"],
        "name": "Priya Sharma",
        "text_x": 50,
        "text_y": 50,
        "font_size": 12,
    })
    assert res.status_code == 200
    token = res.json()["token"]
    assert len(token) > 0

    fetch = client.get(f"/preview/{token}")
    assert fetch.status_code == 200
    assert fetch.headers["content-type"] == "image/png"
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_api.py::test_create_and_fetch_preview -v
```

Expected: 404 error.

- [ ] **Step 3: Implement preview sharing endpoints**

Add to `api/server.py`:

```python
PREVIEW_STORE: dict[str, bytes] = {}


@app.post("/api/preview-share")
async def create_preview_share(body: dict):
    template_id = body["template_id"]
    name = body["name"]
    text_x = body["text_x"]
    text_y = body["text_y"]
    font_size = body.get("font_size", 66)

    if template_id not in TEMPLATE_STORE:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Template not found")

    tier = {
        "template_bytes": TEMPLATE_STORE[template_id],
        "font_size": font_size,
        "max_text_width": 1740,
        "text_position": (text_x, text_y),
    }
    pdf_bytes = generate_certificate_bytes(name, tier)

    from PIL import Image
    img = Image.open(io.BytesIO(TEMPLATE_STORE[template_id])).convert("RGB")
    png_buf = io.BytesIO()
    img.save(png_buf, "PNG")
    png_bytes = png_buf.getvalue()

    token = str(uuid.uuid4())[:8]
    PREVIEW_STORE[token] = png_bytes
    return {"token": token, "url": f"http://localhost:5000/preview/{token}"}


@app.get("/preview/{token}")
def get_preview(token: str):
    if token not in PREVIEW_STORE:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Preview not found or expired")
    return Response(content=PREVIEW_STORE[token], media_type="image/png")
```

- [ ] **Step 4: Run tests**

```bash
pytest tests/test_api.py -v
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add api/server.py tests/test_api.py
git commit -m "feat: certificate preview sharing via token URL"
```

---

## Task 4: Analytics API endpoint

**Files:**
- Modify: `api/server.py`

- [ ] **Step 1: Add analytics endpoint**

Add to `api/server.py`:

```python
from core.analytics import build_report, report_to_csv
from fastapi.responses import PlainTextResponse


@app.get("/api/analytics")
def get_analytics(export: str = "json"):
    import os
    sent_path = "sent_log.csv"
    retry_path = "retry.csv"

    if not os.path.exists(sent_path):
        return {"total_sent": 0, "total_failed": 0, "delivery_rate": 0, "by_domain": {}}

    with open(sent_path, encoding="utf-8") as sf:
        with open(retry_path, encoding="utf-8") if os.path.exists(retry_path) else io.StringIO("tier,name,email,failed_at\n") as rf:
            report = build_report(sf, rf)

    if export == "csv":
        return PlainTextResponse(report_to_csv(report), media_type="text/csv")
    return report
```

- [ ] **Step 2: Smoke test**

```bash
python run.py ui
```

Open `http://localhost:5000/api/analytics` — should return JSON with sent/failed/domain breakdown.

- [ ] **Step 3: Commit**

```bash
git add api/server.py
git commit -m "feat: analytics API endpoint with CSV export"
```

---

## Task 5: PyPI packaging

**Files:**
- Create: `pyproject.toml`
- Create: `README.md`
- Create: `.env.example`

- [ ] **Step 1: Create pyproject.toml**

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "certdrop"
version = "0.1.0"
description = "Bulk personalized certificate generator and sender"
readme = "README.md"
license = { text = "MIT" }
requires-python = ">=3.12"
dependencies = [
    "Pillow",
    "img2pdf",
    "python-dotenv",
    "fastapi",
    "uvicorn[standard]",
    "click",
]

[project.scripts]
certdrop = "run:cli"

[tool.hatch.build.targets.wheel]
packages = ["core", "api", "ui"]
```

- [ ] **Step 2: Create .env.example**

```
# Single Gmail account
GMAIL_USER=you@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# OR multiple accounts for rotation (overrides above)
# SMTP_ACCOUNTS=user1@gmail.com:apppass1,user2@gmail.com:apppass2

# Per-account daily send limit (default: 450 for Gmail)
# SMTP_PER_ACCOUNT_LIMIT=450
```

- [ ] **Step 3: Verify install works locally**

```bash
pip install -e .
certdrop --help
```

Expected: shows help with run/status/retry/ui/init commands.

- [ ] **Step 4: Commit**

```bash
git add pyproject.toml README.md .env.example
git commit -m "feat: PyPI packaging and one-command install"
```

---

## Task 6: Final test suite pass

- [ ] **Step 1: Run full test suite**

```bash
pytest tests/ -v --cov=core --cov=api --cov-report=term-missing
```

Expected: all PASS, no skipped.

- [ ] **Step 2: Tag release**

```bash
git tag v0.1.0
git push origin main --tags
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: v0.1.0 — CertDrop open source release"
```
