# Hackathon Certificate Sender — Design Spec
_Date: 2026-04-23_

## Overview

A two-step Python pipeline that generates personalized PDF certificates from a Figma-exported PNG template and emails them to hackathon participants via Gmail SMTP.

---

## Project Structure

```
cert-sender/
├── template.png              # exported from Figma (1x, full resolution)
├── participants.csv          # columns: name, email
├── find_position.py          # helper: click on template to get (x, y) coordinates
├── generate_certs.py         # step 1: produces one PDF per participant in output/
├── send_certs.py             # step 2: emails each participant their certificate
├── config.py                 # all tunable values (position, font, email copy)
├── .env                      # Gmail credentials (gitignored)
├── fonts/                    # bundled font files (e.g. Roboto-Bold.ttf)
├── output/                   # generated PDFs (gitignored)
└── sent_log.csv              # written by send_certs.py; tracks delivery status
```

---

## Input Format

`participants.csv`:
```
name,email
Priya Sharma,priya@example.com
Rahul Verma,rahul@example.com
```

---

## Configuration (`config.py`)

All tunable values live here — nothing is hardcoded in the pipeline scripts.

```python
# Certificate generation
TEMPLATE_PATH = "template.png"
OUTPUT_DIR = "output"
TEXT_POSITION = (960, 540)       # pixel (x, y) — set using find_position.py
FONT_PATH = "fonts/Roboto-Bold.ttf"
FONT_SIZE = 48                   # default; auto-shrinks for long names
FONT_COLOR = (255, 255, 255)     # RGB
MAX_TEXT_WIDTH = 800             # max pixel width before font shrinks

# Email
EMAIL_SUBJECT = "Your Certificate — <Hackathon Name>"
EMAIL_BODY = """Hi {name},

<Add your copy here.>

Best,
<Your name>
"""
```

---

## Step 1 — Position Finder (`find_position.py`)

A lightweight helper that opens `template.png` in a GUI window. The user clicks the point where the name should be centered. The script prints the `(x, y)` pixel coordinates to the terminal. These are then pasted into `config.py`.

No external dependencies beyond Pillow and tkinter (stdlib).

---

## Step 2 — Certificate Generation (`generate_certs.py`)

For each row in `participants.csv`:

1. Open `template.png` with Pillow
2. Select font at `FONT_SIZE`; measure text width using `font.getbbox()`
3. If text width exceeds `MAX_TEXT_WIDTH`, reduce font size in steps of 2 until it fits — preserving horizontal margins, always on one line
4. Draw the name horizontally centered on `TEXT_POSITION` — i.e., `TEXT_POSITION` is the center-x, baseline-y of the text, not the top-left corner
5. Save as a temporary PNG, convert to PDF using `img2pdf`
6. Write to `output/<sanitized_name>.pdf` (sanitized = lowercased, spaces → underscores, non-alphanumeric chars stripped)

Skips rows with missing name or email (logs a warning).

**Dependencies:** `Pillow`, `img2pdf`

---

## Step 3 — Email Sending (`send_certs.py`)

For each row in `participants.csv`:

1. Check `sent_log.csv` — skip if `status == sent` (safe to re-run after failure)
2. Locate `output/<sanitized_name>.pdf` (same sanitization as generation step) — skip with warning if missing
3. Compose email: plain text body from `EMAIL_BODY.format(name=name)`, PDF attached
4. Send via Gmail SMTP (host: `smtp.gmail.com`, port: 587, STARTTLS)
5. Append row to `sent_log.csv`: `name, email, sent_at, status`

Credentials loaded from `.env` via `python-dotenv`:
```
GMAIL_USER=you@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

`sent_log.csv` format:
```
name,email,sent_at,status
Priya Sharma,priya@example.com,2026-04-23T10:30:00,sent
Rahul Verma,rahul@example.com,2026-04-23T10:30:05,failed
```

**Dependencies:** `python-dotenv`

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Row missing name or email | Skip, print warning |
| PDF not found for a participant | Skip, print warning |
| Gmail auth failure | Raise immediately — stops the run |
| SMTP send failure for one participant | Log `failed` in sent_log, continue to next |
| Script interrupted mid-run | Re-run safely; already-sent rows are skipped |

---

## Usage

```bash
# 1. Install dependencies
pip install Pillow img2pdf python-dotenv

# 2. Export Figma template as PNG → template.png

# 3. Find text position
python find_position.py

# 4. Update config.py with TEXT_POSITION (and other values)

# 5. Generate all certificates
python generate_certs.py

# 6. Visually verify a few PDFs in output/

# 7. Send emails
python send_certs.py
```

---

## Out of Scope

- HTML email templates
- Figma API integration
- Bulk email service (SendGrid / SES)
- Web UI or scheduling
