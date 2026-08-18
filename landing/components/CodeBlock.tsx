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
        <div className="flex items-center gap-2 px-4 py-1.5 bg-surface border border-b-0 border-border">
          <span className="text-[11px] text-text-faint font-mono">{label}</span>
        </div>
      )}
      <div className="relative bg-surface border border-border overflow-hidden">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1 text-text-faint bg-canvas border border-border 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer
                     hover:text-text-muted hover:border-border-hover"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5" weight="bold" /> : <Copy className="w-3.5 h-3.5" weight="regular" />}
        </button>
        <pre className="p-4 overflow-x-auto">
          <code className="text-[13px] font-mono text-text leading-relaxed">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
