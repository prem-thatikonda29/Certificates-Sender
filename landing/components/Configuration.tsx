"use client";

import { useReveal } from "./useReveal";

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
  const ref = useReveal();

  return (
    <section id="configuration" className="py-24 md:py-32">
      <div ref={ref} className="reveal">
        <h2 className="font-serif text-3xl md:text-4xl font-normal text-text tracking-[-0.02em]">
          Configuration
        </h2>
        <p className="mt-3 text-text-muted max-w-[50ch] leading-relaxed">
          Customize tiers, templates, and email settings in{" "}
          <code className="font-mono text-accent-terra-text bg-accent-terra px-1.5 py-0.5 text-[12px]">config.py</code>.
        </p>
        <div className="mt-10 overflow-x-auto border border-border">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 px-4 text-[11px] font-mono uppercase tracking-[0.1em] text-text-faint">
                  Tier
                </th>
                <th className="py-2 px-4 text-[11px] font-mono uppercase tracking-[0.1em] text-text-faint">
                  CSV File
                </th>
                <th className="py-2 px-4 text-[11px] font-mono uppercase tracking-[0.1em] text-text-faint">
                  Template
                </th>
                <th className="py-2 px-4 text-[11px] font-mono uppercase tracking-[0.1em] text-text-faint">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr
                  key={tier.tier}
                  className="border-b border-border last:border-b-0 transition-colors duration-150 hover:bg-surface-raised"
                >
                  <td className="py-2 px-4 text-[13px] font-mono text-accent-terra-text">
                    {tier.tier}
                  </td>
                  <td className="py-2 px-4 text-[13px] font-mono text-text-muted">
                    {tier.csv}
                  </td>
                  <td className="py-2 px-4 text-[13px] font-mono text-text-muted">
                    {tier.template}
                  </td>
                  <td className="py-2 px-4 text-[13px] text-text-muted">
                    {tier.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-text mb-3">
            Example Tier Config
          </h3>
          <div className="bg-surface border border-border overflow-hidden transition-colors duration-150 hover:border-border-hover">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
              <span className="text-[11px] text-text-faint font-mono">
                config.py
              </span>
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className="text-[13px] font-mono text-text leading-relaxed">
                {`TIERS = {\n    "winner": {\n        "csv": "data/winner.csv",\n        "template": "templates/winner_template.jpg",\n        "output": "output/winner/",\n        "subject": "Congratulations! You Won!",\n        "body": "Dear {name},\\n\\n..."\n    },\n    # ... more tiers\n}`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
