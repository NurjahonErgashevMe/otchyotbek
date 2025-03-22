import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Интерфейс для объекта, представляющего строку таблицы
 */
interface TableRow {
  [key: string]: string;
}

/**
 * Утилита для извлечения таблицы из Markdown
 * @param markdown Входной текст в формате Markdown
 * @returns Массив объектов с данными таблицы или null, если таблицы нет
 */
const extractTableFromMarkdown = (markdown: string): TableRow[] | null => {
  // Удаляем лишние пробелы и разбиваем на строки
  const lines: string[] = markdown
    .trim()
    .split("\n")
    .map((line) => line.trim());

  // Ищем начало таблицы: строка с заголовками и следующая строка с разделителями
  let tableStart: number = -1;
  for (let i = 0; i < lines.length - 1; i++) {
    if (
      lines[i].startsWith("|") &&
      lines[i].endsWith("|") &&
      lines[i + 1].match(/^\|[-:\s|]+\|$/)
    ) {
      tableStart = i;
      break;
    }
  }

  // Если таблица не найдена, возвращаем null
  if (tableStart === -1) {
    return null;
  }

  // Извлекаем строки таблицы
  const tableLines: string[] = [];
  for (let i = tableStart; i < lines.length; i++) {
    if (!lines[i].startsWith("|") || !lines[i].endsWith("|")) {
      break; // Конец таблицы
    }
    tableLines.push(lines[i]);
  }

  // Парсим заголовки (первая строка)
  const headers: string[] = tableLines[0]
    .split("|")
    .map((h) => h.trim())
    .filter(Boolean);

  // Пропускаем строку с разделителями (вторая строка)
  const dataLines: string[] = tableLines.slice(2);

  // Преобразуем строки данных в массив объектов
  const tableData: TableRow[] = dataLines.map((line) => {
    const values: string[] = line
      .split("|")
      .map((v) => v.trim())
      .filter(Boolean);
    return headers.reduce((obj: TableRow, header: string, index: number) => {
      obj[header] = values[index] || ""; // Пустая строка, если значение отсутствует
      return obj;
    }, {});
  });

  return tableData;
};

/**
 * Утилита для получения JSON из Markdown таблицы
 * @param markdown Входной текст в формате Markdown
 * @returns JSON-строка или сообщение об ошибке
 */
const markdownTableToJson = (markdown: string): string => {
  const tableData: TableRow[] | null = extractTableFromMarkdown(markdown);
  if (!tableData) {
    return "Таблица в Markdown не найдена";
  }
  return JSON.stringify(tableData, null, 2);
};

interface Score {
  [key: string]: number;
}

interface Student {
  id: number;
  name: string;
  scores: Score
}

interface JsonData {
  date: string;
  teacher: string;
  maxScores: Score;
  students: Student[];
  averageScores: Score;
}

function extractJsonFromMarkdown(text: string): object | null {
  try {
    // 1. Пробуем найти JSON в Markdown блоке с ```json
    const markdownJsonRegex = /```json\s*([\s\S]*?)\s*```/;
    let jsonString: string | null = null;

    const markdownMatch = text.match(markdownJsonRegex);
    if (markdownMatch && markdownMatch[1]) {
      jsonString = markdownMatch[1].trim();
    } else {
      // 2. Пробуем найти JSON в Markdown блоке с просто ```
      const simpleMarkdownRegex = /```\s*([\s\S]*?)\s*```/;
      const simpleMatch = text.match(simpleMarkdownRegex);
      if (simpleMatch && simpleMatch[1]) {
        jsonString = simpleMatch[1].trim();
      } else {
        // 3. Предполагаем, что весь текст - это чистый JSON
        jsonString = text.trim();
      }
    }

    // Парсим найденную строку как JSON
    const jsonObject: JsonData = JSON.parse(jsonString);
    return jsonObject;
  } catch (error) {
    console.error("Error parsing JSON from text:", error);
    return null;
  }
}

export {
  markdownTableToJson,
  extractTableFromMarkdown,
  extractJsonFromMarkdown,
};
