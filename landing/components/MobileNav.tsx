"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

const sections = [
  { id: "hero", label: "Home" },
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How It Works" },
  { id: "quickstart", label: "Quickstart" },
  { id: "configuration", label: "Configuration" },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-bg border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold text-text">cert-sender</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-text-muted hover:text-text"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {isOpen && (
        <nav className="px-4 pb-4 border-t border-border" aria-label="Mobile navigation">
          <ul className="space-y-1 pt-2">
            {sections.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 px-3 text-sm text-text-muted hover:text-text 
                             hover:bg-surface rounded-md transition-colors duration-200"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
