import { Message } from "../types";

interface SendMessageResponse {
  text: string;
  history: Message[];
}

export async function sendMessage(
  message: string,
  history: Message[]
): Promise<SendMessageResponse> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export async function generateGradesJSON(markdownTable: string) {
  try {
    const response = await fetch("/api/grades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ markdownTable }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate grades JSON");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating grades JSON:", error);
    throw error;
  }
}
