import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      // Clean up common issues if wrapped in dollar signs
      let cleaned = math.trim();
      if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
        cleaned = cleaned.slice(2, -2).trim();
      } else if (cleaned.startsWith('$') && cleaned.endsWith('$')) {
        cleaned = cleaned.slice(1, -1).trim();
      }
      return katex.renderToString(cleaned, {
        displayMode: block,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch (err) {
      console.warn('KaTeX rendering error:', err);
      return `<span class="font-mono text-amber-800">${math}</span>`;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-math-container ${block ? 'block my-3 overflow-x-auto text-center py-2 px-3 bg-stone-100/70 dark:bg-stone-800/40 rounded-lg' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
