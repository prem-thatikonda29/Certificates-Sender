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
    <section id="how-it-works" className="py-[120px]">
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
              <div className="hidden md:block absolute top-8 left-[calc(100%+8px)] w-4 border-t-2 border-dashed border-accent/30" />
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
                {"\n"}✓ Done! Sent 573 certificates in 4m 32s
              </span>
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
