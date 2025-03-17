"use client";

import { useState, useEffect } from "react";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";
import { ThinkLoading } from "./think-loading";
import { sendMessage } from "../api/chat-service";
import { useJsonToExcel } from "../../../../hooks/useJsonToExcel";
import { extractJsonFromMarkdown } from "../../../../lib/utils";
import { Button } from "@/components/ui/button";


interface Message {
  text: string;
  isBot: boolean;
}

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [jsonData, setJsonData] = useState<any>(null);
  const { downloadExcel } = useJsonToExcel();


  const handleSubmit = async (message: string) => {
    try {
      // Add user message immediately
      setMessages((prev) => [...prev, { text: message, isBot: false }]);
      setIsLoading(true);

      // Normal message flow
      const response = await sendMessage(message);

      // Check if response contains JSON
      const extractedJson = extractJsonFromMarkdown(response);

      console.log(extractedJson, "extractedJson");
      if (extractedJson) {
        setJsonData(extractedJson);
      }

      setMessages((prev) => [...prev, { text: response, isBot: true }]);

      // // Check if this is a confirmation for JSON generation
      // const isConfirmation = message.toLowerCase().includes("да") ||
      //                       message.toLowerCase().includes("верно") ||
      //                       message.toLowerCase().includes("правильно");

      // if (isConfirmation && lastTable) {
      //   // Generate JSON from the last table
      //   const jsonData = await generateGradesJSON(lastTable);
      //   const jsonResponse = "Вот ваши данные в формате JSON:\n\n```json\n" +
      //                       JSON.stringify(jsonData?.json, null, 2) +
      //                       "\n```";
      //   setMessages((prev) => [...prev, { text: jsonResponse, isBot: true }]);
      //   setLastTable(null); // Reset the table after generating JSON
      // } else {
      //   // Normal message flow
      //   const response = await sendMessage(message);

      //   // Check if the response contains a markdown table
      //   if (response.includes("| №") && response.includes("|---")) {
      //     if (response) {
      //       setLastTable(response);
      //     }
      //   } else {
      //     setLastTable(null);
      //   }

      //   setMessages((prev) => [...prev, { text: response, isBot: true }]);
      // }
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.",
          isBot: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    setIsLoading(false);
  };

  const handleDownload = async () => {
    if (!jsonData) return;

    setIsDownloading(true);
    try {
      const result = await downloadExcel(jsonData);
      if (result.success) {
        console.log("File downloaded successfully");
      } else {
        console.error("Download failed:", result.error);
      }
    } catch (error) {
      console.error("Error during download:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-zinc-900 to-black">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-white/60">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <span className="text-black text-sm">AI</span>
              </div>
              <div className="text-2xl font-semibold text-white">
                OTCHYOTBEK
              </div>
            </div>
            <div className="text-lg">
              Отправьте список оценок учеников, чтобы начать...
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message.text}
            isBot={message.isBot}
          />
        ))}
        {isLoading && (
          <div className="py-6">
            <div className="max-w-2xl mx-auto px-4">
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 bg-white text-black">
                  {"AI"}
                </div>
                <div className="flex-1 text-white/90 text-[15px] leading-relaxed">
                  <ThinkLoading />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-white/10 bg-gradient-to-b from-black to-zinc-900">
        {jsonData && (
          <div className="flex justify-center mx-auto max-w-2xl w-full px-4 mt-2">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full h-[50px] rounded-[10px] flex items-center justify-center gap-2 text-[22px]"
            >
              {isDownloading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Скачивание...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Скачать Excel
                </>
              )}
            </Button>
          </div>
        )}
        <ChatInput
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onStop={handleStop}
        />
      </div>
    </div>
  );
}
