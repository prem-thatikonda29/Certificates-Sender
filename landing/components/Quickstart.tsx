import CodeBlock from "./CodeBlock";

export default function Quickstart() {
  return (
    <section id="quickstart" className="py-[120px]">
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
            Create a{" "}
            <code className="font-mono text-accent">.env</code> file with your
            Gmail credentials:
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
