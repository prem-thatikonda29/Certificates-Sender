# cert-sender

Generate and email personalized PDF certificates for hackathon participants via Gmail SMTP.

## Features

- Generates PDF certificates by overlaying names onto image templates
- Frosted-glass "pill" effect with blur, tint, border, and highlight
- Auto-shrinks font to fit long names on a single line
- Emails certificates with tier-specific subject lines and body copy
- Resumable — tracks progress in `progress.json`, skips already-sent emails
- Batch mode for sending in controlled chunks
- Dry-run mode to generate without sending
- Configurable SMTP provider (Gmail by default)

## Project Structure

```
cert-sender/
├── config.py                 # All tunable values (tiers, fonts, SMTP, email copy)
├── run.py                    # Combined generate + send (main entry point)
├── generate_certs.py         # Generate only
├── send_certs.py             # Send only
├── find_position.py          # GUI helper to find text position on template
├── data/                     # CSV files (one per tier, columns: name, email)
├── templates/                # Certificate template images
├── fonts/                    # Font files
├── tests/                    # Test suite
├── output/                   # Generated PDFs (gitignored)
├── sent_log.csv              # Delivery tracking (gitignored)
├── progress.json             # Resume cursor (gitignored)
└── .env                      # Credentials (gitignored)
```

## Requirements

- Python 3.10+
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833)

## Setup

```bash
# Clone the repo
git clone https://github.com/prem-thatikonda29/Certificates-Sender.git
cd Certificates-Sender

# Install dependencies
pip install -r requirements.txt

# Create your .env
cp .env.example .env
# Edit .env with your Gmail credentials (see below)
```

### .env

```
GMAIL_USER=you@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

See `.env.example` for step-by-step instructions on generating an App Password.

## Usage

```bash
# Generate + send all tiers
python run.py

# Single tier
python run.py winner

# Generate only (no email)
python run.py --dry-run

# Send in batches of 10
python run.py --batch=10

# Generate certificates only (no email logic)
python generate_certs.py

# Send only (PDFs must already exist)
python send_certs.py
```

### CLI Arguments

| Argument | Description |
|----------|-------------|
| `<tier>` | Run a single tier (e.g. `winner`, `participants`) |
| `--dry-run` | Generate PDFs only, skip sending |
| `--batch=N` | Send N emails per tier, then stop (re-run to continue) |

## Configuration

All tunable values live in `config.py`:

```python
# SMTP settings (Gmail default, change for other providers)
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587

# Font settings
FONT_PATH = "fonts/PressStart2P-Regular.ttf"
FONT_COLOR = (255, 255, 255)  # RGB white

# Frosted-glass pill effect
PILL_COLOR = (15, 15, 15, 140)  # RGBA dark tint
PILL_PADDING_X = 84
PILL_PADDING_Y = 42

# Email addresses copied on every certificate email
CC_ADDRESSES = ["organizer@example.com"]
```

### Tiers

Each tier maps a CSV + template to an output directory and email. See `config.py` for the full structure with inline docs.

```python
TIERS = {
    "winner": {
        "csv": "data/winner.csv",
        "template": "templates/winner_template.jpg",
        "output_dir": "output/winner",
        "cert_suffix": "winner_certificate",
        "text_position": (1263, 675),  # (x, y) center of name placement
        "font_size": 66,
        "max_text_width": 1740,
        "email_subject": "Congratulations — You won!",
        "email_body": "Hi {name},\n\n...",
    },
    # Add more tiers here...
}
```

### Finding Text Coordinates

Use `find_position.py` to find the pixel coordinates for name placement on your template:

```bash
python find_position.py templates/winner_template.jpg
```

A GUI window opens. Click where the name should be centered — coordinates print to the terminal. Update `text_position` in `config.py` with the result.

## How It Works

1. Load the tier's CSV and template image
2. For each participant, fit the name into the template using an auto-shrinking font
3. Draw a frosted-glass pill behind the name (blur + dark tint + border + highlight)
4. Convert to PDF via `img2pdf`
5. Send via SMTP with the PDF attached
6. Log result to `sent_log.csv`, update cursor in `progress.json`

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Missing name or email in CSV | Skip row, print warning |
| PDF not found (send mode) | Skip, print warning |
| SMTP auth failure | Exit immediately |
| SMTP failure for one email | Log `failed`, continue to next |
| Script interrupted | Re-run safely; already-sent rows are skipped |

## Testing

```bash
# Run all tests
pytest

# Verbose output
pytest -v
```

## License

MIT
