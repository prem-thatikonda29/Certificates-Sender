# CertDrop — Open Source Design Spec
_Date: 2026-04-25_

## Overview

CertDrop is an open-source tool for generating personalized PDF certificates from a template image + CSV and emailing them in bulk. It targets hackathon organizers, colleges, corporates, NGOs — anyone who needs to send personalized certificates at scale without paying for a SaaS tool.

The core is Python. A local web UI (FastAPI + vanilla JS) runs on `localhost` for non-technical users. The CLI remains fully functional for power users and automation. Everything runs locally — no hosting costs, no data leaves the machine.

**Phased approach:** Phase 1 is a well-packaged open source tool. If demand warrants it, Phase 2 is a hosted version — but the architecture is designed to make that transition easy.

---

## Architecture

```
certdrop/
├── core/
│   ├── generator.py      # certificate generation (Pillow, img2pdf, in-memory)
│   ├── sender.py         # SMTP sending with multi-account rotation
│   ├── validator.py      # CSV validation, email typo detection, name cleaning
│   └── progress.py       # cursor tracking, sent_log, retry queue
├── api/
│   └── server.py         # FastAPI app — all endpoints, serves UI
├── ui/
│   ├── index.html        # single-page UI (vanilla JS, no framework)
│   ├── builder.js        # visual template builder logic
│   └── dashboard.js      # live send dashboard
├── config.py             # tier configs, font/pill settings
├── run.py                # CLI entrypoint
└── requirements.txt
```

**CLI entrypoint:**
```bash
certdrop run [tier] [--dry-run] [--batch=N]   # send certificates
certdrop ui                                     # start local UI at localhost:5000
certdrop init                                   # interactive setup wizard
certdrop status                                 # show progress summary
certdrop retry                                  # retry all failed sends
```

The CLI and UI share the same `core/` functions — no duplication.

---

## Feature Set

### Wow Features

**1. Visual Template Builder**
Upload any PNG/JPG template. Click on it to place the name position — coordinates are set visually, not hardcoded. Drag the position to adjust. See a live preview with a real name rendered in the exact font, size, color, and pill style as you configure. Save to config when satisfied. No pixel-hunting, no trial-and-error.

**2. Zero-to-Sent Wizard**
A linear 5-step wizard in the UI:
1. Upload template
2. Set text position (visual builder)
3. Upload CSV
4. Preview (see 3 sample certificates)
5. Send

Total time from zero to first email out: under 60 seconds for a single-tier event.

**3. Live Send Dashboard**
Real-time progress during a send: sent / failed / remaining counts, names ticking by live, estimated time remaining, per-row status indicators. Failed rows light up red immediately. No more staring at a terminal.

**4. Pre-Send Validation Report**
Before any email is sent, run a full scan:
- Typo domain detection: `gamil.com`, `gmail.con`, `gmail.om`, `.con`, `.om`, `.cpm`
- Missing name or email
- Duplicate emails within and across tiers
- Names with parentheticals like `(Btech Cse 2024-28)`

Shows a clean report with exact rows. User can fix inline before sending.

**5. One-Click Resend**
From the send dashboard or delivery analytics view, any failed/bounced row has a "Resend" button. Correct the email inline, regenerate the cert, send — no terminal, no manual file edits.

---

### Power Features

**1. Multi-Account SMTP Rotation**
Configure multiple SMTP accounts (Gmail or any provider). The tool auto-rotates when one account hits its daily limit — seamlessly, mid-send. Configurable per-account limit (default: 450/day for Gmail).

```
SMTP_ACCOUNTS=user1@gmail.com:apppass1,user2@gmail.com:apppass2
```

**2. Parallel Certificate Generation**
All PDFs generated concurrently using `ThreadPoolExecutor`. 500 certs in ~10 seconds instead of ~5 minutes. Configurable thread count.

**3. In-Memory PDF Pipeline**
Certificates are never written to disk. Generated in memory as bytes, attached directly to the email, discarded. No output folder, no cleanup step, no disk space issues.

**4. Smart Retry Queue**
Failed sends are stored in a retry queue (separate from `sent_log`). `certdrop retry` or one click in UI retries only failed rows — no manual log editing needed.

**5. Multi-Tier Support**
Multiple certificate designs for the same event (winner, runner-up, participants, etc.). Each tier has its own: template image, recipient CSV, email subject/body, font config, text position. Managed visually in the UI with a tab per tier.

**6. Send Scheduling**
Schedule a send for a future datetime: `certdrop run participants --at "2026-04-26 10:00"`. Runs via a background process, no need to keep terminal open. UI shows scheduled jobs with cancel option.

**7. CSV Validation & Name Cleaning**
Automatic on CSV upload:
- Strip parentheticals: `Kishan Ojha (Btech Cse 2024-28)` → `Kishan Ojha`
- Title-case names
- Trim whitespace
- Flag empty rows

Applied before generation starts, shown as a diff for user confirmation.

**8. HTML Email Templates**
Email body supports HTML — organizers can use styled templates with event branding, buttons, and formatted copy. Plain text fallback included for email clients that don't render HTML.

---

### Nice-to-Have Features

**1. Delivery Analytics**
After a send completes, generate a report:
- Total sent / failed / bounced
- Delivery rate by domain (gmail.com vs isu.ac.in vs edu domains)
- Time taken, average send rate
- Exportable as CSV

**2. Duplicate Event Detection**
Cross-tier duplicate check: if the same email appears in both `winner.csv` and `participants.csv`, flag it before sending. Prevents the wrong certificate going to the right person.

**3. Certificate Preview Sharing**
Generate a shareable PNG preview served locally via a short token URL (e.g. `localhost:5000/preview/abc123`). Organizer can open it on another device or share the screenshot for sign-off before sending to 500 people.

**4. `certdrop init` Wizard**
Interactive CLI wizard for setting up a new event:
```
$ certdrop init
Event name: Summer Hacks 2026
Number of tiers: 3
Tier 1 name: winner
  Template image: [file picker]
  CSV: [file picker]
  ...
Config saved to config.py. Run `certdrop ui` to preview.
```

**5. GitHub-Ready Packaging**
- `pip install certdrop` via PyPI
- Clean README with demo GIF showing the full flow
- `.env.example` with all supported variables documented
- One-command setup: `pip install certdrop && certdrop init`
- MIT license

---

## Data Flow

```
CSV + Template Image
        ↓
   validator.py        ← pre-send report, name cleaning
        ↓
   generator.py        ← parallel, in-memory PDF generation
        ↓
   sender.py           ← multi-account SMTP rotation
        ↓
   progress.py         ← cursor + sent_log + retry queue
        ↓
   analytics report
```

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Typo email domain | Flagged in pre-send report, skipped unless user overrides |
| Duplicate email across tiers | Flagged before send, user confirms or removes |
| SMTP account hits daily limit | Auto-rotate to next account |
| All accounts exhausted | Stop, log remaining as pending, resume next run |
| Single send failure | Log to retry queue, continue |
| Script interrupted mid-run | Cursor resumes from exact last position |
| Template image not found | Hard stop with clear error message |

---

## Out of Scope (Phase 1)

- Cloud hosting or SaaS version (Phase 2 if demand warrants)
- Figma API integration
- Mobile app
