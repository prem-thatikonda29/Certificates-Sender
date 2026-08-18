# Cert-Sender Landing Page Design Spec

**Date:** 2026-08-19
**Status:** Approved
**Stack:** Next.js (App Router) + Tailwind CSS
**Deploy:** Vercel
**Style:** Modern minimal dark theme

---

## Overview

A single-page landing site for cert-sender — a Python CLI tool that generates and emails personalized PDF certificates for hackathon participants. Combines marketing content with embedded quickstart documentation. Features a sticky sidebar table of contents for section navigation.

---

## Tech Choices

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | Next.js 14+ (App Router) | User preference, Vercel-native |
| Styling | Tailwind CSS | Fast to build, dark theme utility classes |
| Typography | Inter (body), JetBrains Mono (code) | Clean sans-serif + monospace pairing |
| Deployment | Vercel | Free tier, preview deploys, GitHub integration |
| Language | TypeScript | Type safety for components |

---

## Layout

### Sidebar (Left, Sticky)

- **Position:** Fixed, left side, full viewport height
- **Width:** 240px on desktop, collapses to hamburger menu on mobile (<768px)
- **Content:**
  - Logo / project name at top
  - Vertical TOC links: Hero, Features, How It Works, Quickstart, Configuration
  - Current section highlighted with left border accent (2px, `--accent`)
- **Behavior:** Smooth-scrolls to section on click, updates active state on scroll (IntersectionObserver)

### Main Content

- **Max-width:** 720px, centered in remaining space after sidebar
- **Padding:** Generous vertical spacing between sections (~120px)
- **Responsive:** Sidebar becomes top nav with hamburger toggle on mobile

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#0a0a0a` | Page background |
| `--surface` | `#111111` | Cards, code blocks, sidebar |
| `--border` | `#1e1e1e` | Subtle dividers, card borders |
| `--text` | `#e5e5e5` | Body text, headings |
| `--text-muted` | `#737373` | Secondary text, descriptions |
| `--accent` | `#3b82f6` | Links, active states, highlights, step numbers |

---

## Sections

### 1. Hero

**Purpose:** Communicate what cert-sender does in 2 seconds.

- **Layout:** Full viewport height (100vh), centered vertically and horizontally
- **Heading:** "Send hackathon certificates in minutes" (~3.5rem, `--text`)
- **Subtitle:** "A Python CLI tool that generates personalized PDF certificates and emails them to participants — with built-in resume tracking and batch control." (`--text-muted`)
- **CTA 1:** "Get Started" (primary button, links to Quickstart section, accent background)
- **CTA 2:** "View on GitHub" (secondary/outline button, links to repo)
- **Visual:** Terminal-style mockup block showing `$ python run.py winner --dry-run` with sample output, dark surface background, rounded corners, monospace font

### 2. Features

**Purpose:** Showcase key capabilities in a scannable grid.

- **Layout:** 2x3 grid on desktop, single column on mobile
- **Card design:**
  - Dark surface (`#111111`) background
  - 1px border (`#1e1e1e`)
  - Hover: border lightens to `#333`, subtle scale (1.02), transition 200ms
  - Padding: 24px
  - Border radius: 12px

**Cards:**

| Icon | Title | Description |
|------|-------|-------------|
| ⚡ | Batch Generation | Generate hundreds of certificates from a CSV in seconds |
| 📧 | Email Delivery | Send personalized certificates directly via Gmail SMTP |
| 🔄 | Resume Support | Interrupt and restart anytime — progress is tracked automatically |
| 🎨 | Custom Templates | Multiple tiers with unique templates for winners, runners-up, participants |
| 📊 | Dry Run Mode | Preview all generated PDFs without sending a single email |
| 🛡️ | Rate Control | Configurable batch sizes to respect SMTP rate limits |

### 3. How It Works

**Purpose:** Show the CLI workflow in a simple 3-step visual flow.

- **Layout:** Three columns on desktop, stacked on mobile
- **Each step:** Large number (`01`, `02`, `03`) in accent color, title, description
- **Connector:** Subtle horizontal dashed line (accent color) between steps
- **Below steps:** Terminal code block showing example command output

**Steps:**

1. **Prepare** — "Add participant CSVs and certificate templates to the `data/` and `templates/` directories"
2. **Generate** — "Run `python run.py` to overlay names on templates and create PDFs"
3. **Send** — "The same command emails each certificate via Gmail with progress tracking"

### 4. Quickstart / Docs

**Purpose:** Practical setup and usage reference.

- **Layout:** Sequential code blocks with descriptive headers
- **Code blocks:** Dark surface background, monospace font, left accent border (4px), copy button in top-right
- **Section anchors:** Inline anchor links for sidebar TOC targeting

**Content blocks:**

**Installation:**
```bash
git clone https://github.com/your-username/cert-sender.git
cd cert-sender
pip install -r requirements.txt
```

**Configuration (.env):**
```
EMAIL=your-email@gmail.com
PASSWORD=your-app-password
```

**Usage:**
```bash
# Generate + send certificates for winners
python run.py winner

# Dry run (generate PDFs only, no email)
python run.py winner --dry-run

# Send in batches of 10
python run.py participants --batch=10
```

### 5. Configuration

**Purpose:** Reference for customizing tiers and settings.

- **Tiers table:** Dark surface background, alternating row shading, monospace for file paths
- **Config snippet:** Condensed example from `config.py`

**Tiers table:**

| Tier | CSV File | Template | Description |
|------|----------|----------|-------------|
| `winner` | `data/winner.csv` | `winner_template.jpg` | Hackathon winners |
| `runner_up` | `data/runner_up.csv` | `runner_up_template.jpg` | Runner-up awards |
| `participants` | `data/participants.csv` | `participant_template.jpg` | All participants |

### 6. Footer / Final CTA

**CTA block:**
- Centered: "Ready to send certificates?"
- Two buttons: "Get Started" (primary, scrolls to Quickstart) + "Star on GitHub" (secondary)

**Footer:**
- Minimal: project name left, GitHub link + MIT license right
- Subtle top border (`--border`)

---

## Project Structure

```
landing/
├── app/
│   ├── layout.tsx          # Root layout with sidebar
│   ├── page.tsx            # Main landing page
│   └── globals.css         # Tailwind imports + custom properties
├── components/
│   ├── Sidebar.tsx         # Sticky TOC sidebar
│   ├── Hero.tsx            # Hero section
│   ├── Features.tsx        # Feature cards grid
│   ├── HowItWorks.tsx      # 3-step flow
│   ├── Quickstart.tsx      # Code blocks + docs
│   ├── Configuration.tsx   # Tiers table + config
│   ├── Footer.tsx          # CTA + footer
│   ├── CodeBlock.tsx       # Reusable code block with copy button
│   └── TerminalMockup.tsx  # Hero terminal preview
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── next.config.js
```

---

## Responsive Breakpoints

| Breakpoint | Sidebar | Grid | Steps |
|------------|---------|------|-------|
| >= 768px | Visible, 240px | 2 columns | 3 columns |
| < 768px | Hamburger menu | 1 column | Stacked |

---

## Accessibility

- All interactive elements keyboard-focusable
- Sidebar links have `aria-current` for active section
- Sufficient color contrast (WCAG AA minimum for all text)
- Code blocks have `aria-label` for screen readers
- Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`

---

## Performance

- Next.js static generation (no server-side rendering needed)
- No client-side state management
- IntersectionObserver for scroll tracking (no scroll event listener)
- Tailwind CSS purges unused styles
- Images optimized via Next.js `<Image>` if any are added later

---

## Scope Boundaries

### In scope:
- Single-page landing site with all 6 sections
- Responsive sidebar TOC with scroll tracking
- Dark theme with accent color system
- Code blocks with copy functionality
- Deployed on Vercel

### Out of scope:
- Backend/API integration (this is a static marketing page)
- Blog or changelog
- Multi-language support
- Analytics integration
- Interactive playground/demo
