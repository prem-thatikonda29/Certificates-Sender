"use client";

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
    <section id="configuration" className="py-[120px]">
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
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
            <pre className="p-4 pl-5 overflow-x-auto">
              <code className="text-sm font-mono text-text leading-relaxed">
                {`TIERS = {\n    "winner": {\n        "csv": "data/winner.csv",\n        "template": "templates/winner_template.jpg",\n        "output": "output/winner/",\n        "subject": "Congratulations! You Won!",\n        "body": "Dear {name},\\n\\n..."\n    },\n    # ... more tiers\n}`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
