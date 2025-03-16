import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'

interface ChatMessageProps {
  message: string;
  isBot?: boolean;
}

export function ChatMessage({ message, isBot }: ChatMessageProps) {
  return (
    <div className={cn(
      "py-6",
      isBot ? "bg-zinc-900/30" : "bg-transparent"
    )}>
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex gap-4 items-start">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0",
            isBot ? "bg-white text-black" : "bg-zinc-700 text-white/80"
          )}>
            {isBot ? "AI" : "U"}
          </div>
          <div className="">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
