"use client";

import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

interface CodeBlockProps {
  language?: string;
  code: string;
  label?: string;
}

export default function CodeBlock({ code, label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {label && (
        <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-b-0 border-border rounded-t-xl">
          <span className="text-xs text-text-muted font-mono">{label}</span>
        </div>
      )}
      <div
        className={`relative bg-surface border border-border ${
          label ? "rounded-b-xl" : "rounded-xl"
        } overflow-hidden`}
      >
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-1.5 text-text-muted bg-bg border border-border 
                     rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                     hover:text-text hover:border-border-hover"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-4 h-4" weight="bold" /> : <Copy className="w-4 h-4" weight="regular" />}
        </button>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
        <pre className="p-4 pl-5 overflow-x-auto">
          <code className="text-sm font-mono text-text leading-relaxed">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
