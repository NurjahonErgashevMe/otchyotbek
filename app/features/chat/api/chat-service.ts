export async function sendMessage(message: string): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const data = await response.json();
    return data.text;
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
