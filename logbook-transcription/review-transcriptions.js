import { GoogleGenAI } from "@google/genai";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FILES_DIR, OUTPUT_DIR, getFilesToProcess } from "./transcribe.js";

/**
 * Logbook Transcription Review Script
 * 
 * Usage:
 * npm run review-transcription [args]
 * (Same args as transcribe: empty for all, number for single, range for multiple)
 */

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Reviews a single logbook transcription using Gemini API.
 * @param {string} fileName - The name of the image file (e.g., "063.jpg")
 */
async function reviewTranscription(fileName) {
  try {
    const imagePath = path.join(FILES_DIR, fileName);
    const txtFileName = fileName.replace(/\.[^/.]+$/, ".txt");
    const txtPath = path.join(OUTPUT_DIR, txtFileName);

    // Check if files exist
    try {
      await fs.access(imagePath);
      await fs.access(txtPath);
    } catch (e) {
      console.log(`Skipping ${fileName}: Image or transcription not found.`);
      return;
    }

    const fileBuffer = await fs.readFile(imagePath);
    const base64Image = fileBuffer.toString("base64");
    const currentTranscription = await fs.readFile(txtPath, "utf-8");

    const promptText = `Review this flight logbook transcription against the provided image.
The goal is to identify SUBSTANTIVE inaccuracies or transcription errors (e.g. wrong dates, wrong flight times, wrong pilot names, missing entries, wrong duty descriptions).

Ignore minor formatting issues or spacing unless they affect meaning.
Ignore "illegible" markers if the text is genuinely illegible.

Output your findings as a list of bullet points.
Each bullet point MUST start with "TO REVIEWER: ".
If the transcription looks completely accurate and no substantive errors are found, output "TO REVIEWER: AI review found no substantive errors."

Current Transcription:
${currentTranscription}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: "image/jpeg", // Assuming mostly jpegs based on file structure
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

    const reviewComments = response.text;
    
    // Process the comments to ensure they are what we want
    // We expect lines starting with "TO REVIEWER:" or just a list. 
    // The prompt enforces "TO REVIEWER:", but let's be safe.
    
    const linesToAdd = reviewComments
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // specific cleanup if needed, but the prompt should handle it
        if (line.startsWith("- ")) return line.replace("- ", "- "); 
        if (!line.startsWith("- ") && !line.startsWith("TO REVIEWER:")) return `- TO REVIEWER: ${line}`;
        if (line.startsWith("TO REVIEWER:")) return `- ${line}`;
        return line;
      });

    if (linesToAdd.length === 0) return;

    // Update the file
    let newContent = currentTranscription;
    const humanCommentsHeader = "# HUMAN COMMENTS";
    
    if (newContent.includes(humanCommentsHeader)) {
      // Insert after the header and existing comments, but before the separator if it exists
      const parts = newContent.split(humanCommentsHeader);
      const preHeader = parts[0];
      const postHeader = parts[1];
      
      // We want to append to the end of the section.
      // The section might end with "--------------------------------" or EOF.
      
      let insertionPoint = postHeader.indexOf("--------------------------------");
      if (insertionPoint === -1) {
        insertionPoint = postHeader.length;
      }
      
      // Check if we already have these comments to avoid duplicates (basic check)
      const commentsString = linesToAdd.join('\n');
      if (!postHeader.includes(commentsString.substring(0, 20))) {
         const newPostHeader = postHeader.slice(0, insertionPoint) + 
                              "\n" + commentsString + "\n" + 
                              postHeader.slice(insertionPoint);
         newContent = preHeader + humanCommentsHeader + newPostHeader;
      } else {
        console.log(`Comments likely already present for ${fileName}, skipping append.`);
        return;
      }
      
    } else {
      // Append if section missing (unlikely given the template)
      newContent += `\n\n${humanCommentsHeader}\n${linesToAdd.join('\n')}\n--------------------------------\n`;
    }

    await fs.writeFile(txtPath, newContent);
    console.log(`Updated ${txtFileName} with review comments.`);

  } catch (error) {
    console.error(`Error reviewing ${fileName}:`, error);
  }
}

async function run() {
  const args = process.argv.slice(2);
  
  try {
    const allFiles = (await fs.readdir(FILES_DIR))
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .sort();

    const filesToProcess = getFilesToProcess(allFiles, args);

    if (filesToProcess.length === 0) {
      if (args.length > 0) {
        console.log(`No files matched argument: ${args[0]}`);
      } else {
        console.log("No image files found in files directory.");
      }
      return;
    }

    console.log(`Reviewing ${filesToProcess.length} files:`, filesToProcess);

    for (const fileName of filesToProcess) {
      console.log(`Reviewing ${fileName}...`);
      await reviewTranscription(fileName);
    }

  } catch (error) {
    console.error("Failed to run review:", error);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}

