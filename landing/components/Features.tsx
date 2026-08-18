"use client";

import {
  Lightning,
  EnvelopeSimple,
  ArrowClockwise,
  PaintBrush,
  ChartBarHorizontal,
  ShieldCheck,
} from "@phosphor-icons/react";

const features = [
  {
    icon: Lightning,
    title: "Batch Generation",
    description: "Generate hundreds of certificates from a CSV in seconds",
    accent: true,
  },
  {
    icon: EnvelopeSimple,
    title: "Email Delivery",
    description: "Send personalized certificates directly via Gmail SMTP",
  },
  {
    icon: ArrowClockwise,
    title: "Resume Support",
    description: "Interrupt and restart anytime. Progress is tracked automatically",
  },
  {
    icon: PaintBrush,
    title: "Custom Templates",
    description: "Multiple tiers with unique templates for winners, runners-up, and participants",
  },
  {
    icon: ChartBarHorizontal,
    title: "Dry Run Mode",
    description: "Preview all generated PDFs without sending a single email",
  },
  {
    icon: ShieldCheck,
    title: "Rate Control",
    description: "Configurable batch sizes to respect SMTP rate limits",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-[120px]">
      <h2 className="text-3xl font-bold text-text tracking-tight">Features</h2>
      <p className="mt-3 text-text-muted max-w-[55ch] leading-relaxed">
        Everything you need to generate and deliver hackathon certificates at scale.
      </p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className={`rounded-xl p-6 transition-all duration-200 ${
              i === 0
                ? "bg-accent/10 border border-accent/20 md:col-span-2"
                : "bg-surface border border-border hover:border-border-hover"
            }`}
          >
            <feature.icon
              className={`w-5 h-5 ${i === 0 ? "text-accent" : "text-text-muted"}`}
              weight="regular"
            />
            <h3 className="mt-3 text-base font-semibold text-text">
              {feature.title}
            </h3>
            <p className="mt-1.5 text-sm text-text-muted leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
