import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const csvRowSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Content is required"),

  channel: z
    .string()
    .trim()
    .min(1, "Channel is required"),

  customer_label: z
    .string()
    .trim()
    .optional()
    .default(""),

  created_at: z
    .string()
    .trim()
    .optional()
    .default(""),
});

type CsvRow = z.infer<typeof csvRowSchema>;

type ImportFailure = {
  row: number;
  errors: string[];
};

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
}

function parseCreatedAt(value: string): Date {
  if (!value.trim()) {
    return new Date();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

function normalizeExcelValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function normalizeRows(rows: unknown[]): unknown[] {
  return rows.map((row) => {
    if (
      typeof row !== "object" ||
      row === null ||
      Array.isArray(row)
    ) {
      return row;
    }

    const normalized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
      normalized[normalizeHeader(key)] =
        normalizeExcelValue(value);
    }

    return normalized;
  });
}

export async function POST(request: Request) {
  const result = await requireRole(["ADMIN", "ANALYST"]);

  if ("error" in result) {
    return result.error;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "CSV or Excel file is required",
        },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();

    const isCsv = fileName.endsWith(".csv");
    const isExcel = fileName.endsWith(".xlsx");

    if (!isCsv && !isExcel) {
      return NextResponse.json(
        {
          error: "Only CSV and XLSX files are supported",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File must be smaller than 5 MB",
        },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();

    if (fileBuffer.byteLength === 0) {
      return NextResponse.json(
        {
          error: "File is empty",
        },
        { status: 400 }
      );
    }

    let rows: unknown[];

    try {
      if (isCsv) {
        const csvText = new TextDecoder().decode(fileBuffer);

        rows = parse(csvText, {
          columns: (headers: string[]) =>
            headers.map(normalizeHeader),
          skip_empty_lines: true,
          trim: true,
          bom: true,
        }) as unknown[];
      } else {
        const workbook = XLSX.read(fileBuffer, {
          type: "array",
          cellDates: true,
        });

        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
          return NextResponse.json(
            {
              error: "Excel file contains no worksheets",
            },
            { status: 400 }
          );
        }

        const worksheet =
          workbook.Sheets[firstSheetName];

        const excelRows = XLSX.utils.sheet_to_json(
          worksheet,
          {
            defval: "",
            raw: false,
          }
        ) as unknown[];

        rows = normalizeRows(excelRows);
      }
    } catch (error) {
      console.error("File parsing error:", error);

      return NextResponse.json(
        {
          error:
            "Unable to parse the uploaded file",
        },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: "File contains no data rows",
        },
        { status: 400 }
      );
    }

    const firstRow = rows[0];

    if (
      typeof firstRow !== "object" ||
      firstRow === null ||
      !("content" in firstRow) ||
      !("channel" in firstRow)
    ) {
      return NextResponse.json(
        {
          error:
            "File must contain the required columns: content and channel",
        },
        { status: 400 }
      );
    }

    let imported = 0;
    let failed = 0;

    const failures: ImportFailure[] = [];

    for (const [index, row] of rows.entries()) {
      const validated = csvRowSchema.safeParse(row);

      if (!validated.success) {
        failed += 1;

        failures.push({
          row: index + 2,
          errors: validated.error.issues.map(
            (issue) => issue.message
          ),
        });

        continue;
      }

      const data: CsvRow = validated.data;

      try {
        await db.feedback.create({
          data: {
            content: data.content,
            channel: data.channel,
            customerLabel:
              data.customer_label || null,
            createdAt: parseCreatedAt(
              data.created_at
            ),
            workspaceId: result.user.workspaceId,
          },
        });

        imported += 1;
      } catch (error) {
        console.error(
          `Failed to save row ${index + 2}:`,
          error
        );

        failed += 1;

        failures.push({
          row: index + 2,
          errors: ["Unable to save row"],
        });
      }
    }
        await createAuditLog({
      workspaceId: result.user.workspaceId,
      userId: result.user.id,
      action: "IMPORT_FEEDBACK",
      entityType: "FEEDBACK_IMPORT",
      metadata: {
        fileType: isCsv ? "csv" : "xlsx",
        imported,
        failed,
      },
    });

    return NextResponse.json({
      message: "File import completed",
      imported,
      failed,
      failures,
    });
    return NextResponse.json({
      message: "File import completed",
      imported,
      failed,
      failures,
    });
  } catch (error) {
    console.error("File import error:", error);

    return NextResponse.json(
      {
        error: "Unable to import file",
      },
      { status: 500 }
    );
  }
}