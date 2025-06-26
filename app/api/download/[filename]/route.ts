import fs from "fs";
import path from "path";
import mime from "mime-types";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic"; // ✅ Disable Next.js route-level caching

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  // Optional: security against directory traversal
  if (!/^[a-zA-Z0-9_\-\.]+\.zip$/.test(filename)) {
    return new Response("Invalid filename", { status: 400 });
  }

  const filePath = path.join(process.cwd(), "data", filename);

  if (!fs.existsSync(filePath)) {
    return new Response("File not found", { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(filePath); // ✅ Fresh read per request
    const mimeType = mime.lookup(filePath) || "application/octet-stream";

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store", // ✅ No browser/proxy cache
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error("Error reading file:", err);
    return new Response("Server error", { status: 500 });
  }
}
