"use client";

import { useState, useEffect } from "react";

const sections = [
  { id: "hero", label: "Home" },
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How It Works" },
  { id: "quickstart", label: "Quickstart" },
  { id: "configuration", label: "Configuration" },
];

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <nav
      className="fixed left-0 top-0 h-screen w-[240px] bg-bg border-r border-border 
                 flex-col justify-center px-6 z-40 max-md:hidden"
      style={{ display: "flex" }}
      aria-label="Table of contents"
    >
      <div className="mb-12">
        <span className="text-lg font-semibold text-text tracking-tight">
          cert-sender
        </span>
      </div>
      <ul className="space-y-1">
        {sections.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block py-2 px-3 text-sm rounded-md transition-colors duration-200 ${
                activeSection === id
                  ? "text-text bg-surface border-l-2 border-accent -ml-[2px]"
                  : "text-text-muted hover:text-text"
              }`}
              aria-current={activeSection === id ? "true" : undefined}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
