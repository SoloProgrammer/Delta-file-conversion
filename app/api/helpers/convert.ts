// const xlsx = require("xlsx");
// const fs = require("fs");

import fs from "fs";
import xlsx from "xlsx";

async function ConvertExcelToJson(file: File, inputFilePath = "") {
  // Convert file to buffer
  process.env.NODE_ENV !== "production" && console.log("🔄 Converting file to buffer...");
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  process.env.NODE_ENV !== "production" && console.log("✅ File converted to buffer, size:", buffer.length, "bytes");

  // Read the Excel file
  process.env.NODE_ENV !== "production" && console.log("📖 Reading Excel file with XLSX...");
  const workbook = xlsx.read(buffer, { type: "buffer" });
  // Step 1: Read the Excel file
  // Step 2: Get the first worksheet name
  const sheetName = workbook.SheetNames[1];

  // Step 3: Get the worksheet
  const worksheet = workbook.Sheets[sheetName];

  // Step 4: Convert worksheet to JSON
  const jsonData = xlsx.utils.sheet_to_json(worksheet, {
    raw: false,
    dateNF: "yyyy-mm-dd",
  });

  fs.writeFileSync(inputFilePath, JSON.stringify(jsonData, null, 2));
}

export { ConvertExcelToJson };

process.env.NODE_ENV !== "production" && console.log("Saved JSON to agentAgenciesDeltaData1.json");
