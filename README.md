# cert-sender

Generate and email personalized PDF certificates for hackathon participants via Gmail SMTP.

Built for **Summer Hacks 2026** (ITM School of Future Tech × Notion).

## Features

- Generates PDF certificates by overlaying names onto image templates
- Frosted-glass "pill" effect with blur, tint, border, and highlight
- Auto-shrinks font to fit long names on a single line
- Emails certificates via Gmail with tier-specific subject lines and body copy
- Resumable — tracks progress in `progress.json`, skips already-sent emails
- Batch mode for sending in controlled chunks
- Dry-run mode to generate without sending

## Adapting for Other Events

The template images, text coordinates (`text_position` in `config.py`), tiers, and email copy are all specific to **Summer Hacks 2026**. To use this for your own event, you'll need to replace the templates, find new coordinates with `find_position.py`, and update `config.py`. See [Adapting for Your Own Event](#adapting-for-your-own-event) below.

## Project Structure

```
cert-sender/
├── config.py                 # All tunable values (tiers, fonts, email copy)
├── run.py                    # Combined generate + send (main entry point)
├── generate_certs.py         # Generate only
├── send_certs.py             # Send only
├── find_position.py          # GUI helper to find text position on template
├── data/
│   ├── winner.csv
│   ├── runner_up.csv
│   ├── second_runner_up.csv
│   ├── top10.csv
│   └── participants.csv
├── templates/
│   ├── winner_template.jpg
│   ├── runner_up_template.jpg
│   ├── 2nd_runner_up_template.jpg
│   ├── top_10_template.jpg
│   └── participant_template.jpg
├── fonts/
│   └── PressStart2P-Regular.ttf
├── output/                   # Generated PDFs (gitignored)
├── sent_log.csv              # Delivery tracking (gitignored)
├── progress.json             # Resume cursor (gitignored)
└── .env                      # Gmail credentials (gitignored)
```

## Requirements

- Python 3.10+
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833)

## Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd cert-sender

# Install dependencies
pip install -r requirements.txt

# Create your .env
cp .env.example .env
# Edit .env with your Gmail credentials
```

### .env

```
GMAIL_USER=you@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

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
| `<tier>` | Run a single tier: `winner`, `runner_up`, `second_runner_up`, `top10`, `participants` |
| `--dry-run` | Generate PDFs only, skip sending |
| `--batch=N` | Send N emails per tier, then stop (re-run to continue) |

## Tiers

| Tier | CSV | Template | Certificate |
|------|-----|----------|-------------|
| Winner | `data/winner.csv` | `templates/winner_template.jpg` | `*_summerhacks_winner_certificate.pdf` |
| Runner Up | `data/runner_up.csv` | `templates/runner_up_template.jpg` | `*_summerhacks_runner_up_certificate.pdf` |
| 2nd Runner Up | `data/second_runner_up.csv` | `templates/2nd_runner_up_template.jpg` | `*_summerhacks_2nd_runner_up_certificate.pdf` |
| Top 10 | `data/top10.csv` | `templates/top_10_template.jpg` | `*_summerhacks_finalist_certificate.pdf` |
| Participants | `data/participants.csv` | `templates/participant_template.jpg` | `*_summerhacks_certificate.pdf` |

## CSV Format

```csv
name,email
Priya Sharma,priya@example.com
Rahul Verma,rahul@example.com
```

## Adapting for Your Own Event

This project is configured specifically for **Summer Hacks 2026**. The `text_position` coordinates, template images, tier definitions, email copy, and CC addresses are all tuned for that event's certificate design. To reuse this for a different hackathon:

1. **Replace the template images** — swap the `.jpg` files in `templates/` with your own certificate designs
2. **Find the text coordinates** — run `python find_position.py` to open a template in a GUI window and click where the name should be centered. It prints the `(x, y)` pixel coordinates.
3. **Update `config.py`** with your new positions, tiers, font preferences, email subject/body, and CC addresses
4. **Prepare your CSVs** — one per tier, with `name,email` columns, in `data/`

The frosted-glass pill effect and font auto-sizing will work on any template — you just need to tell it where to place the name.

## Configuration

All tunable values live in `config.py`. The current values are specific to Summer Hacks 2026:

- **Font** — path, color, size, max width
- **Pill effect** — color, padding
- **Per-tier** — template path, text position (`text_position` is the center-x, center-y pixel coordinate where the name is drawn), font size, email subject/body, output directory
- **CC addresses** — list of addresses copied on every email

## How It Works

1. Load the tier's CSV and template image
2. For each participant, fit the name into the template using an auto-shrinking font
3. Draw a frosted-glass pill behind the name (blur + dark tint + border + highlight)
4. Convert to PDF via `img2pdf`
5. Send via Gmail SMTP with the PDF attached
6. Log result to `sent_log.csv`, update cursor in `progress.json`

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Missing name or email in CSV | Skip row, print warning |
| PDF not found (send mode) | Skip, print warning |
| Gmail auth failure | Exit immediately |
| SMTP failure for one email | Log `failed`, continue to next |
| Script interrupted | Re-run safely; already-sent rows are skipped |

## License

MIT
