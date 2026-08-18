"use client";

import { ArrowRight, Terminal } from "@phosphor-icons/react";

export default function Footer() {
  return (
    <>
      <section className="py-[120px] text-center">
        <h2 className="text-3xl font-bold text-text tracking-tight">
          Ready to send certificates?
        </h2>
        <p className="mt-3 text-text-muted max-w-[55ch] mx-auto leading-relaxed">
          Get started in under a minute. No account required.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#quickstart"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-medium rounded-lg 
                       hover:bg-accent/90 active:scale-[0.98] transition-all duration-200"
          >
            Get Started <ArrowRight className="w-4 h-4" weight="bold" />
          </a>
          <a
            href="https://github.com/your-username/cert-sender"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-text font-medium rounded-lg 
                       hover:border-border-hover hover:bg-surface active:scale-[0.98] transition-all duration-200"
          >
            <Terminal className="w-4 h-4" weight="regular" /> Star on GitHub
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
