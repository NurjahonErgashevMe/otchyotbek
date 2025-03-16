import { useCallback } from "react";
import ExcelJS from "exceljs";

// Определяем тип для входных данных JSON
interface Student {
  id: number;
  name: string;
  scores: Record<string, number>;
  disqualified: boolean;
}

interface JsonData {
  date: string;
  teacher: string;
  maxScores: Record<string, number>;
  students: Student[];
}

export const useJsonToExcel = () => {
  const excelColumnName = useCallback((colNumber: number): string => {
    let columnName = "";
    let num = colNumber;
    while (num > 0) {
      const remainder = (num - 1) % 26;
      columnName = String.fromCharCode(65 + remainder) + columnName;
      num = Math.floor((num - 1) / 26);
    }
    return columnName;
  }, []);

  const convertToExcel = useCallback(
    async (jsonData: JsonData): Promise<ArrayBuffer> => {
      if (
        !jsonData.date ||
        !jsonData.teacher ||
        !jsonData.maxScores ||
        !jsonData.students
      ) {
        throw new Error(
          "Invalid JSON format! Expected fields: date, teacher, maxScores, students"
        );
      }

      const tasks = Object.keys(jsonData.maxScores).sort();
      const numTasks = tasks.length;
      const totalColumns = 2 + numTasks + 3;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");

      worksheet.columns = [
        { width: 10 },
        { width: 28.5 },
        ...Array(numTasks).fill({ width: 10 }),
        { width: 10 },
        { width: 10 },
        { width: 10 },
      ];

      const headerText =
        "300-sonli Davlat Ixtisoslashtirilgan umumta'lim maktabi BSB mezoni va tahlili\n\n11-B sinf o'quvchilarining Informatika va AT fanidan 2024-2025-o'quv yili 3- BSB topshiriq ishlarining mezon asosida tekshirilgan HISOBOT NATIJALARI";
      const topHeaderRow = worksheet.addRow([headerText]);
      topHeaderRow.height = 40;
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const topHeaderCell = worksheet.getCell("A1");
      Object.assign(topHeaderCell, {
        alignment: { horizontal: "center", vertical: "middle", wrapText: true },
        font: { size: 20, bold: true },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF87CEEB" },
        },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      });

      const totalStudents = jsonData.students.length;
      const disqualifiedStudents = jsonData.students.filter(
        (s) => s.disqualified
      ).length;
      const participants = totalStudents - disqualifiedStudents;

      const qatnashdiRow = worksheet.addRow(["Qatnashdi", participants]);
      qatnashdiRow.height = 20;
      worksheet.mergeCells(2, 1, 2, totalColumns - 1);
      Object.assign(worksheet.getCell("A2"), {
        alignment: { horizontal: "left", vertical: "middle" },
        font: { size: 12, bold: true },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      });
      Object.assign(worksheet.getCell(2, totalColumns), {
        value: participants,
        alignment: { horizontal: "center", vertical: "middle" },
        font: { size: 12, bold: true },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      });

      const qatnashmadiRow = worksheet.addRow([
        "Qatnashmadi",
        disqualifiedStudents,
      ]);
      qatnashmadiRow.height = 20;
      worksheet.mergeCells(3, 1, 3, totalColumns - 1);
      Object.assign(worksheet.getCell("A3"), {
        alignment: { horizontal: "left", vertical: "middle" },
        font: { size: 12, bold: true },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      });
      Object.assign(worksheet.getCell(3, totalColumns), {
        value: disqualifiedStudents,
        alignment: { horizontal: "center", vertical: "middle" },
        font: { size: 12, bold: true },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      });

      const infoRow = worksheet.addRow([
        `Sana: ${jsonData.date}    II-guruh    Fan o'qituvchisi: ${jsonData.teacher}`,
      ]);
      infoRow.height = 20;
      worksheet.mergeCells(4, 1, 4, totalColumns);
      Object.assign(worksheet.getCell("A4"), {
        alignment: { horizontal: "center", vertical: "middle", wrapText: true },
        font: { size: 12, bold: true },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      });

      worksheet.addRow(Array(totalColumns).fill(""));

      const headerRow = ["№", "O’quvchining familyasi,ismi"];
      tasks.forEach((taskKey, index) => {
        headerRow.push(
          `${index + 1}-topshiriq ${jsonData.maxScores[taskKey]} ball`
        );
      });
      headerRow.push("Jami ball", "Jami", "Foizda");
      const headerRowObj = worksheet.addRow(headerRow);
      headerRowObj.height = 60;
      headerRowObj.eachCell((cell: any) => {
        Object.assign(cell, {
          border: {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          },
          alignment: {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          },
        });
      });

      const maxTotalScore = tasks.reduce(
        (sum, key) => sum + jsonData.maxScores[key],
        0
      );

      jsonData.students.forEach((student, index) => {
        const rowData = [student.id, student.name];
        tasks.forEach((taskKey) => rowData.push(student.scores[taskKey] || 0));
        rowData.push("", "", "");
        const row = worksheet.addRow(rowData);
        row.height = 20;

        row.eachCell((cell: any) => {
          Object.assign(cell, {
            border: {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            },
            alignment: {
              horizontal: "center",
              vertical: "middle",
              wrapText: true,
            },
          });
        });

        if (student.disqualified) {
          worksheet.mergeCells(row.number, 3, row.number, totalColumns);
          Object.assign(worksheet.getCell(row.number, 3), {
            value: "DQ",
            fill: {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFFF00" },
            },
            font: { color: { argb: "FF000000" } },
            alignment: { horizontal: "center", vertical: "middle" },
          });
        } else {
          const jamiBallCol = numTasks + 3;
          row.getCell(jamiBallCol).value = {
            formula: `SUM(C${row.number}:${excelColumnName(jamiBallCol - 1)}${
              row.number
            })`,
          };
          row.getCell(jamiBallCol + 1).value = maxTotalScore;
          row.getCell(jamiBallCol + 2).value = {
            formula: `${excelColumnName(jamiBallCol)}${
              row.number
            }/${excelColumnName(jamiBallCol + 1)}${row.number}`,
          };
          row.getCell(jamiBallCol + 2).numFmt = "0%";
        }
      });

      const avgRowData: any = ["", "O'rtacha"];
      tasks.forEach((taskKey, index) => {
        const taskCol = 3 + index;
        const maxScore = jsonData.maxScores[taskKey];
        avgRowData.push({
          formula: `AVERAGEIF(B7:B${
            jsonData.students.length + 6
          }, "<>DQ", ${excelColumnName(taskCol)}7:${excelColumnName(taskCol)}${
            jsonData.students.length + 6
          })/${maxScore}`,
        });
      });
      avgRowData.push("", "", "");
      const avgRow: any = worksheet.addRow(avgRowData);
      avgRow.height = 20;
      avgRow.eachCell((cell: any, colNumber: number) => {
        Object.assign(cell, {
          border: {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          },
          alignment: {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          },
        });
        if (colNumber >= 3 && colNumber < 3 + numTasks) cell.numFmt = "0%";
      });

      worksheet.addRow(Array(totalColumns).fill(""));

      return workbook.xlsx.writeBuffer();
    },
    [excelColumnName]
  );

  const downloadExcel = useCallback(
    async (
      jsonData: JsonData
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const buffer = await convertToExcel(jsonData);
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "student_scores.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
    [convertToExcel]
  );

  return { convertToExcel, downloadExcel };
};
