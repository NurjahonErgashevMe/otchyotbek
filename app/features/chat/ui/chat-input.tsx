"use client";

import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Mic, Send, Square } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  onStop?: () => void;
}

export function ChatInput({ onSubmit, isLoading, onStop }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    onSubmit(message);
    setMessage("");
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        onSubmit(message);
        setMessage("");
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-4">
      <form onSubmit={handleSubmit} className="relative flex gap-2">
        <div className="relative flex-1">
          <Textarea
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            rows={3}
            autoFocus
            className="pr-10 py-3 text-[15px] bg-zinc-900/50 border-[1px] border-white/20 text-white placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-white/20 rounded-lg"
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
            disabled={isLoading}
          >
            <Mic size={16} />
          </button>
        </div>
        {isLoading ? (
          <Button
            type="button"
            variant="outline"
            onClick={onStop}
            size="icon"
            className="h-[42px] w-[42px] border-white/20 bg-transparent hover:bg-white/10 text-white rounded-lg shrink-0"
          >
            <Square size={16} />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!message.trim()}
            loading={isLoading}
            size="icon"
            className="h-[42px] w-[42px] bg-white hover:bg-white/90 rounded-lg shrink-0"
          >
            <Send size={16} className="text-black" />
          </Button>
        )}
      </form>
      <div className="mt-2 text-center text-xs text-white/50">
        AI may produce inaccurate information
      </div>
    </div>
  );
}
