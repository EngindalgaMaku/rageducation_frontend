"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  content: string;
  isLoading?: boolean;
  error?: string | null;
}

export default function MarkdownViewer({
  content,
  isLoading = false,
  error = null,
}: MarkdownViewerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative mx-auto w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 animate-pulse">
            Markdown içeriği yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-red-800 font-medium">Hata</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!content || content.trim() === "") {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-sm">İçerik bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="max-w-none">
      <div className="markdown-content prose prose-slate max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom heading styles
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8 pb-1 border-b border-gray-100">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-lg font-medium text-gray-900 mb-2 mt-4">
                {children}
              </h4>
            ),
            h5: ({ children }) => (
              <h5 className="text-base font-medium text-gray-900 mb-2 mt-3">
                {children}
              </h5>
            ),
            h6: ({ children }) => (
              <h6 className="text-sm font-medium text-gray-900 mb-2 mt-3">
                {children}
              </h6>
            ),

            // Paragraph styling
            p: ({ children }) => (
              <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
            ),

            // List styling
            ul: ({ children }) => (
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="text-gray-700">{children}</li>,

            // Code styling
            code: ({ children, ...props }) => {
              const inline = !props.className?.includes("language-");
              return inline ? (
                <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                  {children}
                </code>
              ) : (
                <code className="block bg-gray-50 text-gray-800 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap overflow-x-auto border">
                  {children}
                </code>
              );
            },

            // Pre-formatted text
            pre: ({ children }) => (
              <div className="mb-4">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                  {children}
                </pre>
              </div>
            ),

            // Blockquote styling
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-400 pl-4 py-2 mb-4 bg-blue-50 text-gray-700 italic">
                {children}
              </blockquote>
            ),

            // Table styling
            table: ({ children }) => (
              <div className="mb-4 overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50">{children}</thead>
            ),
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => (
              <tr className="border-b border-gray-200">{children}</tr>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2 text-left font-medium text-gray-900 border-r border-gray-200 last:border-r-0">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 text-gray-700 border-r border-gray-200 last:border-r-0">
                {children}
              </td>
            ),

            // Links
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),

            // Strong and emphasis
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-700">{children}</em>
            ),

            // Horizontal rule
            hr: () => <hr className="my-8 border-gray-200" />,

            // Images
            img: ({ src, alt }) => (
              <div className="mb-4">
                <img
                  src={src}
                  alt={alt}
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                />
                {alt && (
                  <p className="text-sm text-gray-500 mt-2 text-center italic">
                    {alt}
                  </p>
                )}
              </div>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
