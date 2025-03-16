export interface ChatHistory {
  role: "user" | "assistant";
  content: string;
}

export interface StudentGrade {
  name: string;
  grades: number[];
}

export interface FormattedGrades {
  students: StudentGrade[];
  isFormatted: boolean;
}
