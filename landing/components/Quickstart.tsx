"use client";

import CodeBlock from "./CodeBlock";
import { useReveal } from "./useReveal";

export default function Quickstart() {
  const ref = useReveal();

  return (
    <section id="quickstart" className="py-24 md:py-32">
      <div ref={ref} className="reveal">
        <h2 className="font-serif text-3xl md:text-4xl font-normal text-text tracking-[-0.02em]">
          Quickstart
        </h2>
        <p className="mt-3 text-text-muted max-w-[50ch] leading-relaxed">
          Get up and running in under a minute.
        </p>
        <div className="mt-10 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-text mb-3">Installation</h3>
            <CodeBlock
              code={`git clone https://github.com/prem-thatikonda29/Certificates-Sender.git\ncd cert-sender\npip install -r requirements.txt`}
              label="terminal"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text mb-3">
              Configuration
            </h3>
            <p className="text-[13px] text-text-muted mb-3">
              Create a{" "}
              <code className="font-mono text-accent-terra-text bg-accent-terra px-1.5 py-0.5 text-[12px]">.env</code> file with your
              Gmail credentials:
            </p>
            <CodeBlock
              code={`EMAIL=your-email@gmail.com\nPASSWORD=your-app-password`}
              label=".env"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text mb-3">Usage</h3>
            <CodeBlock
              code={`# Generate + send certificates for winners\npython run.py winner\n\n# Dry run (generate PDFs only, no email)\npython run.py winner --dry-run\n\n# Send in batches of 10\npython run.py participants --batch=10`}
              label="terminal"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
