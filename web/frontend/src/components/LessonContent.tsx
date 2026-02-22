import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark.css";

interface LessonContentProps {
  markdown: string;
}

export function LessonContent({ markdown }: LessonContentProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none p-6 overflow-auto h-full">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
