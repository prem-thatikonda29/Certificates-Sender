import { ArrowRight, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <>
      <section className="py-[120px] text-center">
        <h2 className="text-3xl font-bold text-text mb-6">
          Ready to send certificates?
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            <ExternalLink className="w-4 h-4" /> Star on GitHub
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
