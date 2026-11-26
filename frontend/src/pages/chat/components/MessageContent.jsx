
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components = {
  h1: ({ node, ...props }) => (
    <h1 className="mb-3 mt-5 text-[22px] font-semibold" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="mb-2 mt-4 text-[20px] font-semibold" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="mb-2 mt-3 text-[17px] font-semibold" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-3 last:mb-0" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5" {...props} />
  ),
  pre: ({ node, ...props }) => (
    <pre
      className="my-4 overflow-x-auto rounded-lg border border-[var(--nito-line)] bg-[var(--nito-panel)] p-4 text-[13px]"
      {...props}
    />
  ),
  code: ({ node, ...props }) => (
    <code className="break-words font-mono text-[0.9em]" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="my-3 border-l-2 border-[var(--nito-muted)] pl-4"
      {...props}
    />
  ),
  table: ({ node, ...props }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-left" {...props} />
    </div>
  ),
  th: ({ node, ...props }) => (
    <th
      className="border border-[var(--nito-line)] bg-[var(--nito-panel)] p-2 font-semibold"
      {...props}
    />
  ),
  td: ({ node, ...props }) => (
    <td className="border border-[var(--nito-line)] p-2" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a
      className="text-[#3979ef] underline"
      {...props}
      target="_blank"
      rel="noopener noreferrer"
    />
  ),
};

export default function MessageContent({ text }) {
  return (
    <div className="break-words text-[var(--nito-text)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
