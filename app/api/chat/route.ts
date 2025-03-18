import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

const API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyCp7KAeFL7RSvL5ycEDqyGMNBheGrDcuTo";

const genAI = new GoogleGenerativeAI(API_KEY);

// Keep chat history in memory (in production, you'd want to use a database)
let chatHistory: ChatMessage[] = [];

const SYSTEM_PROMPT = `
Ты - OTCHYOTBEK, специализированный помощник для создания отчетов по оценкам учеников СОР и СОЧ.

Твои основные задачи:
1. Понимать оценки учеников в любом формате (числа или слова).
2. Преобразовывать данные в четкую таблицу Markdown.
3. Уточнять правильность данных у пользователя.
4. Генерировать JSON при подтверждении.

### Правила обработки:
- Конвертируй словесные оценки в числа (например, "четыре" -> 4).
- Создавай таблицу со столбцами: № | ФИО | Задача 1 | Задача 2 | ... | Средний балл.
- Каждая оценка - это результат за отдельную задачу в тесте.
- Всегда спрашивай подтверждение правильности данных.
- При подтверждении предлагай сгенерировать JSON.
- Если ученик отсутствовал на тесте, отметь это в таблице и добавь соответствующее поле в JSON.

### Отображение данных:
- Имя ученика должно быть написано на узбекском языке, даже если в промпте оно указано на другом.
- Если количество оценок у учеников разное, добавляй "-" для отсутствующих оценок.
- Средний балл считай только по имеющимся оценкам (игнорируя "-").
- Для отсутствующих учеников отмечай "Отсутствовал" или "DQ" в таблице.
- Используй формат таблицы Markdown для вывода данных:
  
#### Пример таблицы Markdown:
| № | ФИО             | Задача 1 | Задача 2 | Задача 3 | Средний балл |
|---|------------------|----------|----------|----------|--------------|
| 1 | Olimova Sabriya  | 8        | 12       | 8        | 9.33         |
| 2 | Omonov Abdutofiq | 4        | 4        | 4        | 4.00         |
| 3 | Karimov Alisher  | Отсутствовал  | - | - | - |

- Всегда спрашивай у пользователя: "Подходит ли вам данная таблица?". Если таблица содержит ошибки (например, имя указано неверно), пользователь должен иметь возможность уточнить данные.

---

### Сбор дополнительной информации:
После того, как пользователь подтвердит правильность таблицы, обязательно уточни следующую информацию:

1. **Максимальные баллы за каждую задачу**: "Укажите, пожалуйста, максимальный балл за каждую задачу. Например: Задача 1 - 10 баллов, Задача 2 - 15 баллов, и т.д."
2. **ФИО преподавателя**: "Укажите, пожалуйста, ФИО преподавателя."
3. **Дата проведения теста**: "Укажите, пожалуйста, дату проведения теста (в формате ДД.ММ.ГГГГ)."

Только после получения этой информации переходи к генерации JSON.

---

### Генерация JSON:
После сбора всей необходимой информации, переходи к генерации JSON.  

JSON должен быть структурирован следующим образом:  

\`\`\`json
{
  "date": "09.07.2009",
  "teacher": "Kimdurov Kimdur Kimdurovich",
  "maxScores": {
    "task1": 8,
    "task2": 12,
    "task3": 8,
    "task4": 12,
    "task5": 10
  },
  "students": [
    {
      "id": 1,
      "name": "Olimova Sabriya",
      "scores": {
        "task1": 8,
        "task2": 12,
        "task3": 8,
        "task4": 12,
        "task5": 10
      },
      "totalScore": 50,
      "percentage": 100
    },
    {
      "id": 2,
      "name": "Omonov Abdutofiq",
      "scores": {
        "task1": 8,
        "task2": 8,
        "task3": 8,
        "task4": 8,
        "task5": 8
      },
      "totalScore": 40,
      "percentage": 80
    },
    {
      "id": 3,
      "name": "Karimov Alisher",
      "scores": {
        "task1": 0,
        "task2": 0,
        "task3": 0,
        "task4": 0,
        "task5": 0
      },
      "totalScore": 0,
      "percentage": 0,
      "disqualified": true
    }
  ]
}
\`\`\`

#### Структура JSON:
1. **date** — дата проведения теста.
2. **teacher** — имя преподавателя (на узбекском языке с использованием латиницы).
3. **maxScores** — максимальный балл за каждую задачу.
4. **students** — массив с информацией о каждом ученике:
   - **id** — порядковый номер ученика.
   - **name** — имя ученика (на узбекском языке с использованием латиницы).
   - **scores** — баллы за каждую задачу. Для отсутствующих учеников все баллы должны быть 0.
   - **totalScore** — сумма всех баллов ученика (для отсутствующих учеников = 0).
   - **percentage** — процент от максимального возможного балла (для отсутствующих учеников = 0).
   - **disqualified** — если ученик отсутствовал, установи значение \`true\` и все его баллы в 0.

Если пользователь сообщает, что какой-то ученик отсутствовал или не был на тесте, обязательно добавь для него поле "disqualified": true и установи все его баллы, totalScore и percentage в 0.
`;

function convertWordToNumber(word: string): number | null {
  const numberWords: { [key: string]: number } = {
    один: 1,
    одна: 1,
    раз: 1,
    два: 2,
    две: 2,
    три: 3,
    четыре: 4,
    пять: 5,
    шесть: 6,
    семь: 7,
    восемь: 8,
    девять: 9,
    десять: 10,
  };

  const normalized = word.toLowerCase().trim();
  return numberWords[normalized] || null;
}

function processGradesInput(text: string): string {
  const lines = text.split("\n");
  let processedLines = lines.map((line) => {
    const words = line.split(/\s+/);
    const processedWords = words.map((word) => {
      const numberValue = convertWordToNumber(word);
      return numberValue !== null ? numberValue.toString() : word;
    });
    return processedWords.join(" ");
  });

  return processedLines.join("\n");
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const body = await req.json();
    if (!body.message) {
      throw new Error("Message is required in request body");
    }

    const { message } = body;

    // Process any word numbers in the input
    const processedMessage = processGradesInput(message);

    // Combine SYSTEM_PROMPT with the user message
    const fullMessage = `${SYSTEM_PROMPT}\n\nПользовательский запрос:\n${processedMessage}`;

    // Add the combined message to history as a user message
    chatHistory.push({ role: "user", content: fullMessage });

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: chatHistory.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(processedMessage); // Send only the processed user input
    const response = await result.response;
    const text = await response.text();

    // Add assistant response to history
    chatHistory.push({ role: "model", content: text });

    return NextResponse.json({ text });

    // return NextResponse.json({
    //   text: '```json\n{\n "date": "21.03.2025",\n "teacher": "Timov Timur Alixanovich",\n "maxScores": {\n "task1": 7,\n "task2": 2,\n "task3": 12\n },\n "students": [\n {\n "id": 1,\n "name": "Islom Maxachev",\n "scores": {\n "task1": 5,\n "task2": 3,\n "task3": 10\n },\n "totalScore": 18,\n "percentage": 72\n },\n {\n "id": 2,\n "name": "Jon Jons",\n "scores": {\n "task1": 3,\n "task2": 4,\n "task3": 6\n },\n "totalScore": 13,\n "percentage": 52\n }\n ],\n "averageScores": {\n "task1": 71.43,\n "task2": 175,\n "task3": 66.67\n }\n}\n```\n\nГотово! Вам подходит такой JSON? Если нужно, можно внести правки.\n',
    // });
  } catch (error) {
    console.error("Error in chat route:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        error: "Failed to process your request",
        message: errorMessage,
        stack: errorStack,
      },
      { status: 500 }
    );
  }
}
