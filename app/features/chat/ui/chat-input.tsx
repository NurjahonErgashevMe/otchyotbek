"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Mic, Send, Square, StopCircle } from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  onStop?: () => void;
}

export function ChatInput({ onSubmit, isLoading, onStop }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    interimTranscript,
    finalTranscript,
  } = useSpeechRecognition({
    clearTranscriptOnListen: true,
    // transcribing,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    onSubmit(message);
    setMessage("");
    resetTranscript(); // Очищаем transcript после отправки
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    // Обновляем transcript только если микрофон не активен
    if (!listening) {
      // SpeechRecognition.getRecognition().transcript = newValue;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        onSubmit(message);
        setMessage("");
        resetTranscript();
      }
    }
  };

  const toggleListening = () => {
    if (listening) {
      setTranscribing(false);
      SpeechRecognition.stopListening();
    } else {
      try {
        setTranscribing(true);
        // resetTranscript();
        SpeechRecognition.startListening({
          language: "ru-RU",
          continuous: true,
        });
      } catch {
        alert("Captioning error");
      }
    }
  };

  useEffect(() => {
    if (finalTranscript.trim()) {
      setMessage((prev) => prev + finalTranscript);
      resetTranscript();
    }
  }, [finalTranscript]);

  // console.log(message);
  console.log(transcript, "transcript");
  console.log(finalTranscript, "finalTranscript");

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
            className={cn(
              `absolute p-2 w-12 rounded-lg right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer`,
              listening
                ? "text-red-500 hover:text-red-400"
                : "text-white/50 hover:text-white/80",
              listening ? "bg-red-500" : "bg-white"
            )}
            disabled={isLoading}
            onClick={toggleListening}
          >
            {listening ? <StopCircle size={30} color="white"/> : <Mic size={30} color="black" />}
          </button>
        </div>
        {isLoading ? (
          <Button
            type="button"
            variant="outline"
            onClick={onStop}
            size="icon"
            className="h-[42px] w-[42px] border-white/20 bg-transparent hover:bg-white/10 text-white rounded-lg shrink-0 cursor-pointer"
          >
            <Square size={16} color="red" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!message.trim()}
            size="icon"
            className="h-[42px] w-[42px] bg-white hover:bg-white/90 rounded-lg shrink-0 cursor-pointer"
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
