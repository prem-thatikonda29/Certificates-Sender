"use client";

import { ArrowRight, Terminal } from "@phosphor-icons/react";

export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-[100dvh] flex items-center"
    >
      <div className="w-full max-w-[720px] mx-auto px-6 pt-24 pb-16">
        <p className="text-sm font-mono text-accent tracking-wide uppercase mb-4">
          CLI Tool
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text leading-[1.1] tracking-tight">
          Send hackathon certificates in minutes
        </h1>
        <p className="mt-6 text-lg text-text-muted leading-relaxed max-w-[55ch]">
          Generate personalized PDF certificates and email them to participants.
          Built-in resume tracking and batch control.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
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
            <Terminal className="w-4 h-4" weight="regular" /> View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
