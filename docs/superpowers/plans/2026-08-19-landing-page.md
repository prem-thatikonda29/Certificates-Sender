# Cert-Sender Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Next.js landing site for cert-sender with a sticky sidebar TOC, dark theme, and 6 content sections.

**Architecture:** Next.js 14 App Router with Tailwind CSS. Each section is a separate component. Sidebar uses IntersectionObserver for scroll-based active state tracking. Static generation for Vercel deployment.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Inter + JetBrains Mono fonts

## Global Constraints

- Next.js 14+ with App Router (`app/` directory)
- TypeScript strict mode
- Tailwind CSS v3.4+
- Dark theme: bg `#0a0a0a`, surface `#111111`, border `#1e1e1e`, text `#e5e5e5`, muted `#737373`, accent `#3b82f6`
- Fonts: Inter (body), JetBrains Mono (code)
- Responsive breakpoint: 768px (sidebar collapses to hamburger)
- All code lives under `landing/` directory in project root
- Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`
- WCAG AA color contrast minimum

---

## File Structure

```
landing/
├── app/
│   ├── layout.tsx          # Root layout: fonts, metadata, sidebar + main wrapper
│   ├── page.tsx            # Main page: imports all section components
│   └── globals.css         # Tailwind directives + CSS custom properties
├── components/
│   ├── Sidebar.tsx         # Sticky TOC with IntersectionObserver scroll tracking
│   ├── MobileNav.tsx       # Hamburger menu for mobile
│   ├── Hero.tsx            # Hero section with terminal mockup
│   ├── Features.tsx        # 2x3 feature cards grid
│   ├── HowItWorks.tsx      # 3-step flow with connectors
│   ├── Quickstart.tsx      # Code blocks with copy buttons
│   ├── Configuration.tsx   # Tiers table + config snippet
│   ├── Footer.tsx          # Final CTA + footer
│   └── CodeBlock.tsx       # Reusable code block with copy button
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── next.config.js
└── postcss.config.js
```

---

### Task 1: Scaffold Next.js project and install dependencies

**Files:**
- Create: `landing/package.json`
- Create: `landing/tsconfig.json`
- Create: `landing/next.config.js`
- Create: `landing/postcss.config.js`
- Create: `landing/tailwind.config.ts`
- Create: `landing/app/globals.css`
- Create: `landing/app/layout.tsx`
- Create: `landing/app/page.tsx`

**Interfaces:**
- Produces: Bootable Next.js app with Tailwind configured and dark theme colors

- [ ] **Step 1: Initialize the Next.js project**

```bash
cd /Users/premthatikonda/cert-sender
npx create-next-app@latest landing --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-turbopack --use-npm
```

Select defaults: TypeScript, Yes, ESLint, Yes, Tailwind, Yes, `src/` directory, No, `@/*`, npm.

- [ ] **Step 2: Verify the project boots**

```bash
cd /Users/premthatikonda/cert-sender/landing
npm run dev
```

Expected: Server starts on `http://localhost:3000` with default Next.js page. Stop with Ctrl+C.

- [ ] **Step 3: Install Google Fonts packages**

```bash
cd /Users/premthatikonda/cert-sender/landing
npm install @next/font
```

Note: `next/font` is built into Next.js 13+, but `@next/font` ensures compatibility. If using Next.js 14+, `next/font/google` works without extra install.

- [ ] **Step 4: Configure Tailwind with custom theme colors**

Replace `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        surface: "#111111",
        border: "#1e1e1e",
        "border-hover": "#333333",
        text: "#e5e5e5",
        "text-muted": "#737373",
        accent: "#3b82f6",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      maxWidth: {
        content: "720px",
      },
      spacing: {
        sidebar: "240px",
        section: "120px",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 5: Set up globals.css with Tailwind directives**

Replace `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  background-color: #0a0a0a;
  color: #e5e5e5;
}

::selection {
  background-color: #3b82f6;
  color: white;
}
```

- [ ] **Step 6: Set up root layout with fonts**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "cert-sender — Hackathon Certificates in Minutes",
  description:
    "A Python CLI tool that generates personalized PDF certificates and emails them to participants.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Set up minimal page.tsx**

Replace `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen">
      <p className="text-text p-8">cert-sender landing page — coming soon</p>
    </main>
  );
}
```

- [ ] **Step 8: Verify build succeeds**

```bash
cd /Users/premthatikonda/cert-sender/landing
npm run build
```

Expected: Build completes without errors.

- [ ] **Step 9: Commit**

```bash
cd /Users/premthatikonda/cert-sender
git add landing/
git commit -m "feat: scaffold Next.js landing page with Tailwind dark theme"
```

---

### Task 2: Build CodeBlock reusable component

**Files:**
- Create: `landing/components/CodeBlock.tsx`

**Interfaces:**
- Consumes: Nothing (standalone)
- Produces: `<CodeBlock language="bash" code="..." />` used by Quickstart, HowItWorks, Hero

- [ ] **Step 1: Create CodeBlock component**

```tsx
// landing/components/CodeBlock.tsx
"use client";

import { useState } from "react";

interface CodeBlockProps {
  language?: string;
  code: string;
  label?: string;
}

export default function CodeBlock({ language = "bash", code, label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {label && (
        <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-b-0 border-border rounded-t-xl">
          <span className="text-xs text-text-muted font-mono">{label}</span>
        </div>
      )}
      <div
        className={`relative bg-surface border border-border ${
          label ? "rounded-b-xl" : "rounded-xl"
        } overflow-hidden`}
      >
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 px-2 py-1 text-xs font-mono text-text-muted 
                     bg-bg border border-border rounded-md opacity-0 group-hover:opacity-100 
                     transition-opacity duration-200 hover:text-text hover:border-border-hover"
          aria-label="Copy code"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
        <pre className="p-4 pl-5 overflow-x-auto">
          <code className="text-sm font-mono text-text leading-relaxed">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/premthatikonda/cert-sender/landing
npm run build
```

Expected: Build passes, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/premthatikonda/cert-sender
git add landing/components/CodeBlock.tsx
git commit -m "feat: add reusable CodeBlock component with copy button"
```

---

### Task 3: Build Sidebar component with scroll tracking

**Files:**
- Create: `landing/components/Sidebar.tsx`
- Create: `landing/components/MobileNav.tsx`

**Interfaces:**
- Consumes: Section IDs defined in page.tsx (hero, features, how-it-works, quickstart, configuration)
- Produces: `<Sidebar />` and `<MobileNav />` used in layout.tsx

- [ ] **Step 1: Create Sidebar component**

```tsx
// landing/components/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";

const sections = [
  { id: "hero", label: "Home" },
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How It Works" },
  { id: "quickstart", label: "Quickstart" },
  { id: "configuration", label: "Configuration" },
];

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <nav
      className="fixed left-0 top-0 h-screen w-sidebar bg-bg border-r border-border 
                    flex flex-col justify-center px-6 z-40 max-md:hidden"
      aria-label="Table of contents"
    >
      <div className="mb-12">
        <span className="text-lg font-semibold text-text tracking-tight">
          cert-sender
        </span>
      </div>
      <ul className="space-y-1">
        {sections.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block py-2 px-3 text-sm rounded-md transition-colors duration-200 ${
                activeSection === id
                  ? "text-text bg-surface border-l-2 border-accent -ml-[2px]"
                  : "text-text-muted hover:text-text"
              }`}
              aria-current={activeSection === id ? "true" : undefined}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Create MobileNav component**

```tsx
// landing/components/MobileNav.tsx
"use client";

import { useState } from "react";

const sections = [
  { id: "hero", label: "Home" },
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How It Works" },
  { id: "quickstart", label: "Quickstart" },
  { id: "configuration", label: "Configuration" },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-bg border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold text-text">cert-sender</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-text-muted hover:text-text"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>
      {isOpen && (
        <nav className="px-4 pb-4 border-t border-border" aria-label="Mobile navigation">
          <ul className="space-y-1 pt-2">
            {sections.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 px-3 text-sm text-text-muted hover:text-text 
                             hover:bg-surface rounded-md transition-colors duration-200"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/premthatikonda/cert-sender/landing
npm run build
```

Expected: Build passes.

- [ ] **Step 4: Commit**

```bash
cd /Users/premthatikonda/cert-sender
git add landing/components/Sidebar.tsx landing/components/MobileNav.tsx
git commit -m "feat: add Sidebar with scroll tracking and MobileNav"
```

---

### Task 4: Build Hero section with terminal mockup

**Files:**
- Create: `landing/components/Hero.tsx`

**Interfaces:**
- Consumes: CodeBlock component (inline terminal mockup)
- Produces: `<Hero />` used in page.tsx

- [ ] **Step 1: Create Hero component**

```tsx
// landing/components/Hero.tsx
export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
    >
      <h1 className="text-5xl md:text-6xl font-bold text-text leading-tight max-w-3xl">
        Send hackathon certificates{" "}
        <span className="text-accent">in minutes</span>
      </h1>
      <p className="mt-6 text-lg text-text-muted max-w-2xl leading-relaxed">
        A Python CLI tool that generates personalized PDF certificates and
        emails them to participants — with built-in resume tracking and batch
        control.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <a
          href="#quickstart"
          className="px-6 py-3 bg-accent text-white font-medium rounded-lg 
                     hover:bg-accent/90 transition-colors duration-200"
        >
          Get Started
        </a>
        <a
          href="https://github.com/your-username/cert-sender"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 border border-border text-text font-medium rounded-lg 
                     hover:border-border-hover hover:bg-surface transition-colors duration-200"
        >
          View on GitHub
        </a>
      </div>
      <div className="mt-16 w-full max-w-xl">
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <pre className="p-4 pl-5 text-left overflow-x-auto">
            <code className="text-sm font-mono text-text leading-relaxed">
              <span className="text-accent">$</span>{" "}
              python run.py winner --dry-run
              {"\n"}
              <span className="text-text-muted">
                {"\n"}[winner] Generating certificate for Alice Johnson...
                {"\n"}[winner] Generating certificate for Bob Smith...
                {"\n"}[winner] Generating certificate for Carol Williams...
                {"\n"}
                {"\n"}
              </span>
              <span className="text-green-400">
                ✓ Generated 3 certificates in output/winner/
              </span>
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/premthatikonda/cert-sender/landing
npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
cd /Users/premthatikonda/cert-sender
git add landing/components/Hero.tsx
git commit -m "feat: add Hero section with terminal mockup"
```

---

### Task 5: Build Features section

**Files:**
- Create: `landing/components/Features.tsx`

**Interfaces:**
- Consumes: Nothing (self-contained)
- Produces: `<Features />` used in page.tsx

- [ ] **Step 1: Create Features component**

```tsx
// landing/components/Features.tsx
const features = [
  {
    icon: "⚡",
    title: "Batch Generation",
    description: "Generate hundreds of certificates from a CSV in seconds",
  },
  {
    icon: "📧",
    title: "Email Delivery",
    description: "Send personalized certificates directly via Gmail SMTP",
  },
  {
    icon: "🔄",
    title: "Resume Support",
    description:
      "Interrupt and restart anytime — progress is tracked automatically",
  },
  {
    icon: "🎨",
    title: "Custom Templates",
    description:
      "Multiple tiers with unique templates for winners, runners-up, participants",
  },
  {
    icon: "📊",
    title: "Dry Run Mode",
    description: "Preview all generated PDFs without sending a single email",
  },
  {
    icon: "🛡️",
    title: "Rate Control",
    description: "Configurable batch sizes to respect SMTP rate limits",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-section">
      <h2 className="text-3xl font-bold text-text mb-4">Features</h2>
      <p className="text-text-muted mb-12 max-w-xl">
        Everything you need to generate and deliver hackathon certificates at
        scale.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-surface border border-border rounded-xl p-6 
                       hover:border-border-hover hover:scale-[1.02] 
                       transition-all duration-200"
          >
            <span className="text-2xl">{feature.icon}</span>
            <h3 className="mt-3 text-lg font-semibold text-text">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/premthatikonda/cert-sender/landing
npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
cd /Users/premthatikonda/cert-sender
git add landing/components/Features.tsx
git commit -m "feat: add Features section with 2x3 card grid"
```

---

### Task 6: Build HowItWorks section

**Files:**
- Create: `landing/components/HowItWorks.tsx`

**Interfaces:**
- Consumes: Nothing (self-contained)
- Produces: `<HowItWorks />` used in page.tsx

- [ ] **Step 1: Create HowItWorks component**

```tsx
// landing/components/HowItWorks.tsx
const steps = [
  {
    number: "01",
    title: "Prepare",
    description:
      "Add participant CSVs and certificate templates to the data/ and templates/ directories",
  },
  {
    number: "02",
    title: "Generate",
    description:
      "Run python run.py to overlay names on templates and create PDFs",
  },
  {
    number: "03",
    title: "Send",
    description:
      "The same command emails each certificate via Gmail with progress tracking",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-section">
      <h2 className="text-3xl font-bold text-text mb-4">How It Works</h2>
      <p className="text-text-muted mb-12 max-w-xl">
        Three steps from CSV to delivered certificates.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            <div className="text-5xl font-bold text-accent/20 font-mono">
              {step.number}
            </div>
            <h3 className="mt-3 text-xl font-semibold text-text">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              {step.description}
            </p>
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-full w-4 border-t-2 border-dashed border-accent/30" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-12">
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <pre className="p-4 pl-5 overflow-x-auto">
            <code className="text-sm font-mono text-text leading-relaxed">
              <span className="text-accent">$</span> python run.py winner
              {"\n"}
              <span className="text-text-muted">
                {"\n"}[winner] Processing batch 1/6 (100 certificates)
                {"\n"}[winner] ✓ Sent 100/573 emails
                {"\n"}[winner] Processing batch 2/6 (100 certificates)
                {"\n"}[winner] ✓ Sent 200/573 emails
                {"\n"}...
              </span>
              {"\n"}
              <span className="text-green-400">
                ✓ Done! Sent 573 certificates in 4m 32s
              </span>
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/premthatikonda/cert-sender/landing
npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
cd /Users/premthatikonda/cert-sender
git add landing/components/HowItWorks.tsx
git commit -m "feat: add How It Works section with 3-step flow"
```

---

### Task 7: Build Quickstart section

**Files:**
- Create: `landing/components/Quickstart.tsx`

**Interfaces:**
- Consumes: CodeBlock component
- Produces: `<Quickstart />` used in page.tsx

- [ ] **Step 1: Create Quickstart component**

```tsx
// landing/components/Quickstart.tsx
import CodeBlock from "./CodeBlock";

export default function Quickstart() {
  return (
    <section id="quickstart" className="py-section">
      <h2 className="text-3xl font-bold text-text mb-4">Quickstart</h2>
      <p className="text-text-muted mb-12 max-w-xl">
        Get up and running in under a minute.
      </p>
      <div className="space-y-10">
        <div>
          <h3 className="text-lg font-semibold text-text mb-3">Installation</h3>
          <CodeBlock
            code={`git clone https://github.com/your-username/cert-sender.git\ncd cert-sender\npip install -r requirements.txt`}
            label="terminal"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text mb-3">
            Configuration
          </h3>
          <p className="text-sm text-text-muted mb-3">
            Create a <code className="font-mono text-accent">.env</code> file
            with your Gmail credentials:
          </p>
          <CodeBlock
            code={`EMAIL=your-email@gmail.com\nPASSWORD=your-app-password`}
            label=".env"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text mb-3">Usage</h3>
          <CodeBlock
            code={`# Generate + send certificates for winners\npython run.py winner\n\n# Dry run (generate PDFs only, no email)\npython run.py winner --dry-run\n\n# Send in batches of 10\npython run.py participants --batch=10`}
            label="terminal"
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/premthatikonda/cert-sender/landing
npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
cd /Users/premthatikonda/cert-sender
git add landing/components/Quickstart.tsx
git commit -m "feat: add Quickstart section with installation and usage docs"
```

---

### Task 8: Build Configuration section

**Files:**
- Create: `landing/components/Configuration.tsx`

**Interfaces:**
- Consumes: Nothing (self-contained)
- Produces: `<Configuration />` used in page.tsx

- [ ] **Step 1: Create Configuration component**

```tsx
// landing/components/Configuration.tsx
const tiers = [
  {
    tier: "winner",
    csv: "data/winner.csv",
    template: "winner_template.jpg",
    description: "Hackathon winners",
  },
  {
    tier: "runner_up",
    csv: "data/runner_up.csv",
    template: "runner_up_template.jpg",
    description: "Runner-up awards",
  },
  {
    tier: "participants",
    csv: "data/participants.csv",
    template: "participant_template.jpg",
    description: "All participants",
  },
];

export default function Configuration() {
  return (
    <section id="configuration" className="py-section">
      <h2 className="text-3xl font-bold text-text mb-4">Configuration</h2>
      <p className="text-text-muted mb-12 max-w-xl">
        Customize tiers, templates, and email settings in{" "}
        <code className="font-mono text-accent">config.py</code>.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 px-4 text-sm font-semibold text-text">
                Tier
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-text">
                CSV File
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-text">
                Template
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-text">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, index) => (
              <tr
                key={tier.tier}
                className={`border-b border-border ${
                  index % 2 === 0 ? "bg-surface/50" : ""
                }`}
              >
                <td className="py-3 px-4 text-sm font-mono text-accent">
                  {tier.tier}
                </td>
                <td className="py-3 px-4 text-sm font-mono text-text-muted">
                  {tier.csv}
                </td>
                <td className="py-3 px-4 text-sm font-mono text-text-muted">
                  {tier.template}
                </td>
                <td className="py-3 px-4 text-sm text-text-muted">
                  {tier.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-text mb-3">
          Example Tier Config
        </h3>
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <span className="text-xs text-text-muted font-mono">
              config.py
            </span>
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
          <pre className="p-4 pl-5 overflow-x-auto">
            <code className="text-sm font-mono text-text leading-relaxed">
              {`TIERS = {\n    "winner": {\n        "csv": "data/winner.csv",\n        "template": "templates/winner_template.jpg",\n        "output": "output/winner/",\n        "subject": "Congratulations! You Won!",\n        "body": "Dear {name},\\n\\n..."\n    },\n    # ... more tiers\n}`}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/premthatikonda/cert-sender/landing
npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
cd /Users/premthatikonda/cert-sender
git add landing/components/Configuration.tsx
git commit -m "feat: add Configuration section with tiers table"
```

---

### Task 9: Build Footer section

**Files:**
- Create: `landing/components/Footer.tsx`

**Interfaces:**
- Consumes: Nothing (self-contained)
- Produces: `<Footer />` used in page.tsx

- [ ] **Step 1: Create Footer component**

```tsx
// landing/components/Footer.tsx
export default function Footer() {
  return (
    <>
      <section className="py-section text-center">
        <h2 className="text-3xl font-bold text-text mb-6">
          Ready to send certificates?
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#quickstart"
            className="px-6 py-3 bg-accent text-white font-medium rounded-lg 
                       hover:bg-accent/90 transition-colors duration-200"
          >
            Get Started
          </a>
          <a
            href="https://github.com/your-username/cert-sender"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-border text-text font-medium rounded-lg 
                       hover:border-border-hover hover:bg-surface transition-colors duration-200"
          >
            Star on GitHub
          </a>
        </div>
      </section>
      <footer className="border-t border-border py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <span className="font-semibold text-text">cert-sender</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/your-username/cert-sender"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text transition-colors duration-200"
            >
              GitHub
            </a>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/premthatikonda/cert-sender/landing
npm run build
```

Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
cd /Users/premthatikonda/cert-sender
git add landing/components/Footer.tsx
git commit -m "feat: add Footer with CTA and links"
```

---

### Task 10: Assemble full page and layout

**Files:**
- Modify: `landing/app/page.tsx`
- Modify: `landing/app/layout.tsx`

**Interfaces:**
- Consumes: All section components (Hero, Features, HowItWorks, Quickstart, Configuration, Footer, Sidebar, MobileNav)
- Produces: Complete landing page

- [ ] **Step 1: Update page.tsx to compose all sections**

```tsx
// landing/app/page.tsx
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Quickstart from "@/components/Quickstart";
import Configuration from "@/components/Configuration";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="pl-0 md:pl-sidebar">
      <Hero />
      <div className="max-w-content mx-auto px-6">
        <Features />
        <HowItWorks />
        <Quickstart />
        <Configuration />
      </div>
      <div className="max-w-content mx-auto px-6">
        <Footer />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Update layout.tsx to include Sidebar and MobileNav**

```tsx
// landing/app/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "cert-sender — Hackathon Certificates in Minutes",
  description:
    "A Python CLI tool that generates personalized PDF certificates and emails them to participants.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased bg-bg text-text">
        <MobileNav />
        <Sidebar />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify full build**

```bash
cd /Users/premthatikonda/cert-sender/landing
npm run build
```

Expected: Build passes with all sections rendered.

- [ ] **Step 4: Test in dev server**

```bash
cd /Users/premthatikonda/cert-sender/landing
npm run dev
```

Expected: Visit `http://localhost:3000` — full landing page visible with sidebar, all sections, responsive behavior.

- [ ] **Step 5: Commit**

```bash
cd /Users/premthatikonda/cert-sender
git add landing/app/page.tsx landing/app/layout.tsx
git commit -m "feat: assemble full landing page with all sections"
```

---

### Task 11: Responsive polish and final verification

**Files:**
- Modify: `landing/app/globals.css` (if needed)
- Modify: `landing/components/Sidebar.tsx` (if needed)
- Modify: `landing/app/page.tsx` (if needed)

**Interfaces:**
- Consumes: All previously built components
- Produces: Production-ready landing page

- [ ] **Step 1: Test mobile viewport (375px)**

Open Chrome DevTools, set viewport to 375px. Verify:
- Sidebar is hidden, hamburger menu visible
- Hamburger opens nav overlay
- Feature cards stack to single column
- How It Works steps stack vertically
- All text readable, no horizontal overflow
- Terminal mockups scroll horizontally if needed

- [ ] **Step 2: Test tablet viewport (768px)**

Set viewport to 768px. Verify:
- Sidebar visible at 240px width
- Feature cards still 2-column
- Content properly offset by sidebar

- [ ] **Step 3: Test desktop viewport (1280px)**

Set viewport to 1280px. Verify:
- Sidebar fixed on left
- Content centered with max-width 720px
- All sections have ~120px vertical spacing
- Sidebar highlights correct section on scroll

- [ ] **Step 4: Test sidebar scroll tracking**

Scroll through the page slowly. Verify:
- Sidebar link highlights update as sections enter viewport
- Clicking a sidebar link smooth-scrolls to that section
- Active state uses left border accent

- [ ] **Step 5: Test code block copy buttons**

Hover over a code block, click "Copy". Verify:
- Text copied to clipboard
- Button shows "Copied!" for 2 seconds
- Button reverts to "Copy"

- [ ] **Step 6: Run production build and verify no errors**

```bash
cd /Users/premthatikonda/cert-sender/landing
npm run build
npm run start
```

Expected: Production server starts, page renders correctly at `http://localhost:3000`.

- [ ] **Step 7: Commit final state**

```bash
cd /Users/premthatikonda/cert-sender
git add landing/
git commit -m "feat: complete landing page with responsive design"
```
