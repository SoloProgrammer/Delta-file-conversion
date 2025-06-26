import fs from 'fs'
import path from 'path'

/**
 * Reads a JSON array from a file and saves each object into its own file.
 * @param {string} inputFilePath - Path to the input JSON file.
 * @param {string} key - Property to use as filename.
 * @param {string} outputDir - Directory where output files will go.
 */
async function processJsonArray(inputFilePath: string, key: string, outputDir: string) {
  try {
    const fileContent = fs.readFileSync(inputFilePath, 'utf-8');
    const dataArray = JSON.parse(fileContent);

    if (!Array.isArray(dataArray)) {
      console.error("The input JSON is not an array.");
      return;
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    dataArray.forEach((item, index) => {
      const fileName = item[key] ? `${item[key]}_${index + 1}` : `object_${index}`;
      const safeFileName = fileName.replace(/[\/\\?%*:|"<>]/g, '_');
      const filePath = path.join(outputDir, `${safeFileName}.json`);

      fs.writeFileSync(filePath, JSON.stringify(item, null, 2), 'utf-8');
      process.env.NODE_ENV !== "production" && console.log(`Saved: ${filePath}`);
    });

  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

export { processJsonArray }
// Usage
