import { ArrowRight, ExternalLink } from "lucide-react";

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
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-lg 
                     hover:bg-accent/90 transition-colors duration-200"
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </a>
        <a
          href="https://github.com/your-username/cert-sender"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text font-medium rounded-lg 
                     hover:border-border-hover hover:bg-surface transition-colors duration-200"
        >
          <ExternalLink className="w-4 h-4" /> View on GitHub
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
              <span className="text-accent">$</span> python run.py winner --dry-run
              {"\n"}
              <span className="text-text-muted">
                {"\n"}[winner] Generating certificate for Alice Johnson...
                {"\n"}[winner] Generating certificate for Bob Smith...
                {"\n"}[winner] Generating certificate for Carol Williams...
                {"\n"}
              </span>
              {"\n"}
              <span className="text-green-400">
                {"\n"}✓ Generated 3 certificates in output/winner/
              </span>
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
