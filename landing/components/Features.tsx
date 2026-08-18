import {
  Zap,
  Mail,
  RotateCcw,
  Palette,
  BarChart3,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Batch Generation",
    description: "Generate hundreds of certificates from a CSV in seconds",
  },
  {
    icon: Mail,
    title: "Email Delivery",
    description: "Send personalized certificates directly via Gmail SMTP",
  },
  {
    icon: RotateCcw,
    title: "Resume Support",
    description:
      "Interrupt and restart anytime — progress is tracked automatically",
  },
  {
    icon: Palette,
    title: "Custom Templates",
    description:
      "Multiple tiers with unique templates for winners, runners-up, participants",
  },
  {
    icon: BarChart3,
    title: "Dry Run Mode",
    description: "Preview all generated PDFs without sending a single email",
  },
  {
    icon: Shield,
    title: "Rate Control",
    description: "Configurable batch sizes to respect SMTP rate limits",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-[120px]">
      <h2 className="text-3xl font-bold text-text mb-4">Features</h2>
      <p className="text-text-muted mb-12 max-w-xl">
        Everything you need to generate and deliver hackathon certificates at
        scale.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-surface border border-border rounded-xl p-6 
                       hover:border-border-hover hover:scale-[1.02] 
                       transition-all duration-200"
          >
            <feature.icon className="w-6 h-6 text-accent" />
            <h3 className="mt-3 text-lg font-semibold text-text">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
