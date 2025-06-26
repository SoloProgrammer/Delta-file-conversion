import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { ConvertExcelToJson } from "../helpers/convert";
import { transformJsonFromFile } from "../helpers/convertjson";
import { processJsonArray } from "../helpers/GenerateIndividualFilesFromJsonArr";
import path from "path";
import AdmZip from "adm-zip";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const folderPath = path.join(process.cwd(), "data");

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
      fs.mkdirSync(folderPath); // recreate empty folder if needed
      process.env.NODE_ENV !== "production" && console.log("✅ Folder contents cleared.");
    }
    process.env.NODE_ENV !== "production" && console.log("🚀 Starting file conversion process...");

    const formData = await request.formData();
    process.env.NODE_ENV !== "production" && console.log("📋 FormData received successfully");

    const file = formData.get("file") as File;
    process.env.NODE_ENV !== "production" && console.log("📁 File extracted from FormData:", file ? file.name : "No file found");

    if (!file) {
      process.env.NODE_ENV !== "production" && console.log("❌ No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    process.env.NODE_ENV !== "production" && console.log("📊 File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];

    if (!allowedTypes.includes(file.type)) {
      process.env.NODE_ENV !== "production" && console.log("❌ Invalid file type:", file.type);
      return NextResponse.json({ error: "Invalid file type. Please upload an Excel file (.xlsx, .xls) or CSV file." }, { status: 400 });
    }
    process.env.NODE_ENV !== "production" && console.log("✅ File type validation passed");

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      process.env.NODE_ENV !== "production" && console.log("❌ File size too large:", file.size, "bytes");
      return NextResponse.json({ error: "File size too large. Maximum size is 10MB." }, { status: 400 });
    }
    process.env.NODE_ENV !== "production" && console.log("✅ File size validation passed");

    // List of output file paths with associated entity and type information
    const date = new Date();
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    const formattedDate = new Intl.DateTimeFormat("en-US", options as any).format(date).replace(/\//g, "-");
    // process.env.NODE_ENV !== "production" && console.log(formattedDate);
    const entityOutputConfigurations = [
      {
        path: "data/AgentTransformed.json",
        entity: "Individual",
        type: "Agent",
        outputFodlerPath: `data/outputAgents_${formattedDate}`,
        outputFodlerPathZip: `data/outputAgents_${formattedDate}.zip`,
      },
      {
        path: "data/AgencyTransformed.json",
        entity: "Firm",
        type: "Agency",
        outputFodlerPath: `data/outputAgencies_${formattedDate}`,
        outputFodlerPathZip: `data/outputAgencies_${formattedDate}.zip`,
      },
    ];

    // File paths for the Excel file and the intermediate JSON file
    const excelToJsonFilePath = "data/agentAgenciesDeltaData.json";

    // Convert the Excel file to a JSON file
    await ConvertExcelToJson(file, excelToJsonFilePath);

    // Iterate over each output file path configuration
    for (let i = 0; i < entityOutputConfigurations.length; i++) {
      const outputData = entityOutputConfigurations[i];
      // Transform the entire JSON file converted from Excel into a new JSON file based on the specified entity type
      const updated_output_path = (await transformJsonFromFile(excelToJsonFilePath, "", outputData.path, outputData.entity)) as string;
      // Process each JSON object in the transformed file, converting each to a separate file and storing it in the output folder for its entity type
      await processJsonArray(`${updated_output_path}`, "Name", outputData.outputFodlerPath);
    }

    for (let i = 0; i < entityOutputConfigurations.length; i++) {
      const zip = new AdmZip();
      const element = entityOutputConfigurations[i];
      zip.addLocalFolder(element.outputFodlerPath);
      zip.writeZip(element.outputFodlerPathZip);
    }

    const response = {
      success: true,
      data: [
        entityOutputConfigurations[0].outputFodlerPathZip.replace("data/", ""),
        entityOutputConfigurations[1].outputFodlerPathZip.replace("data/", ""),
      ],
      fileName: file.name,
      folderName: "data",
    };

    process.env.NODE_ENV !== "production" && console.log("🎉 Conversion completed successfully!");
    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 Error converting file:", error);
    console.error("📍 Error stack:", error instanceof Error ? error.stack : "No stack trace");

    return NextResponse.json({ error: "Failed to convert file. Please ensure it's a valid Excel file.", success: false }, { status: 500 });
  }
}
