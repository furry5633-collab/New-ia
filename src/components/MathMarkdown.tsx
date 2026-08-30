import React from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MathMarkdownProps {
  content: string;
  className?: string;
}

export const MathMarkdown: React.FC<MathMarkdownProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-stone max-w-none text-stone-800 leading-relaxed ${className}`}>
      <Markdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => {
            return <p className="mb-3 text-[15px] sm:text-[16px] leading-relaxed text-stone-800">{children}</p>;
          },
          strong: ({ children }) => <strong className="font-semibold text-stone-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-stone-700">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-outside pl-5 mb-3 space-y-1.5 text-stone-800">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside pl-5 mb-3 space-y-1.5 text-stone-800">{children}</ol>,
          li: ({ children }) => <li className="text-[15px] sm:text-[16px] leading-relaxed">{children}</li>,
          blockquote: ({ children }) => {
            return (
              <blockquote className="border-l-4 border-amber-500/70 bg-amber-50/60 rounded-r-lg px-4 py-2 my-3 italic text-stone-700 text-[15px]">
                {children}
              </blockquote>
            );
          },
          h1: ({ children }) => <h1 className="text-xl font-bold text-stone-900 mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold text-stone-900 mt-3 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-stone-900 mt-2 mb-1">{children}</h3>,
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code className="bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded font-mono text-sm border border-stone-200" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-stone-900 text-stone-100 p-3 rounded-lg overflow-x-auto my-2 text-xs sm:text-sm font-mono">
                <code>{children}</code>
              </pre>
            );
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};

