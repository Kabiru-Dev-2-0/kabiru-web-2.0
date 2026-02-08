'use client';
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

interface MermaidRendererProps {
  chart: string;
}

// Helper to escape special characters in Mermaid node labels
const sanitizeChart = (code: string) => {
  if (!code) return "";

  let clean = code;

  // Function to safely quote content
  const safeQuote = (content: string) => {
    let inner = content.trim();

    // Strip surrounding quotes if present
    if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
      if (inner.length >= 2) {
        inner = inner.substring(1, inner.length - 1);
      }
    }

    // Escape characters that break Mermaid labels even inside quotes
    // 1. Double quotes -> #quot;
    inner = inner.replace(/"/g, '#quot;');

    // 2. Parentheses -> #40; #41; (Crucial for nodes like id(...))
    inner = inner.replace(/\(/g, '#40;').replace(/\)/g, '#41;');

    // 3. Square brackets -> #91; #93; (Crucial for nodes like id[...])
    inner = inner.replace(/\[/g, '#91;').replace(/\]/g, '#93;');

    // 4. Curly braces -> #123; #125; (Crucial for nodes like id{...})
    inner = inner.replace(/\{/g, '#123;').replace(/\}/g, '#125;');

    return `"${inner}"`;
  };

  // Process specific Mermaid node syntax patterns
  // Priority: Long delimiters first (e.g. {{ }} before { })

  const patterns = [
    { regex: /(\[\[)(.*?)(\]\])/g, start: '[[', end: ']]' }, // [[...]]
    { regex: /(\[\()(.*?)(\)\])/g, start: '[(', end: ')]' }, // [(...)] database
    { regex: /(\(\()(.*?)(\)\))/g, start: '((', end: '))' }, // ((...)) circle
    { regex: /(\{\{)(.*?)(\}\})/g, start: '{{', end: '}}' }, // {{...}} hex
    { regex: /(\[\/)(.*?)(\/\])/g, start: '[/', end: '/]' }, // [/.../]
    { regex: /(\[\\)(.*?)(\\\])/g, start: '[\\', end: '\\]' }, // [\...\]

    // Standard single char delimiters
    // Note: These regexes must be non-greedy and careful not to catch nested pairs if possible.
    { regex: /(\[)([^\[\]\n]+?)(\])/g, start: '[', end: ']' }, // [...]
    { regex: /(\()([^()\n]+?)(\))/g, start: '(', end: ')' },   // (...)
    { regex: /(\{)([^\{\}\n]+?)(\})/g, start: '{', end: '}' },   // {...}
  ];

  patterns.forEach(({ regex }) => {
    clean = clean.replace(regex, (match, open, content, close) => {
      // If content contains dangerous chars or isn't quoted, safeQuote it.
      // Dangerous chars for mermaid: () [] {} " '
      // Or just ALWAYS safeQuote everything inside brackets to be safe? 
      // Agents often produce `Id[Label with spaces]` -> Valid.
      // `Id[Label with "quote"]` -> Invalid.
      // `Id[Label with (paren)]` -> Invalid in (...) node.
      // Always quoting is the safest bet for stability.
      return `${open}${safeQuote(content)}${close}`;
    });
  });

  return clean;
};

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chart && chart.length > 5) {
      const sanitized = sanitizeChart(chart);

      // Validate first to avoid ugly error SVG
      mermaid.parse(sanitized)
        .then(async (valid) => {
          if (!valid) throw new Error("Invalid chart");

          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, sanitized);
          setSvgContent(svg);
          setError(null);
        })
        .catch((err) => {
          // Suppress error and hide component
          console.error('Mermaid error:', err);
          setError('Invalid diagram');
        });
    }
  }, [chart]);

  if (error) return null; // Hide if error
  if (!svgContent) return <div className="animate-pulse h-32 bg-gray-100 rounded-md w-full"></div>;

  return (
    <div
      className="mermaid-container w-full overflow-x-auto py-2 flex justify-center bg-white/50 rounded-lg"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

export default MermaidRenderer;
