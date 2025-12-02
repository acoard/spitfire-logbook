import { GoogleGenAI } from "@google/genai";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Logbook Transcription Script
 * 
 * Usage:
 * 
 * 1. Process all files in logbook-transcription/files:
 *    npm run transcribe
 * 
 * 2. Process a single file (e.g., 063.jpg):
 *    npm run transcribe -- 63
 * 
 * 3. Process a range of files (e.g., 063.jpg to 066.jpg):
 *    npm run transcribe -- 63..66
 * 
 * Requirements:
 * - .env file with GEMINI_API_KEY
 * - Images in logbook-transcription/files/
 */

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const FILES_DIR = path.join("logbook-transcription", "files");
const OUTPUT_DIR = path.join("logbook-transcription", "transcriptions");

/**
 * Transcribes a single logbook image file using Gemini API.
 * @param {string} fileName - The name of the file to transcribe (e.g., "063.jpg")
 * @returns {Promise<string|null>} The transcription text or null if failed.
 */
async function transcribe(fileName) {
  try {
    const filePath = path.join(FILES_DIR, fileName);
    const fileBuffer = await fs.readFile(filePath);
    const base64Image = fileBuffer.toString("base64");

    const promptText = `Transcribe this flight logbook page into strict Markdown format. 
Follow this exact template structure. Do not deviate.

# FILENAME: ${fileName}

# DATE
[Month Year]

# AIRPORT
[Airport Name]
[This is often written at the very top of the page above the log table]

# SQUADRON
[Squadron Name, always in the format of "Number Squadron", eg "313 Squadron"]
[Typically 313 Squadron, if you are unsure leave it blank. If it is just letters w/o number, it's the Airport Name not Squadron!]

# TOTALS PREVIOUS
- Day Dual: [Value]
- Day Pilot: [Value]
- Night Dual: [Value]
- Night Pilot: [Value]

# LOGBOOK ENTRIES
| Month | Date | Aircraft Type | No. | Pilot | Duty | Time |
|---|---|---|---|---|---|---|
[Logbook rows here. Use " for ditto marks if present in original.]
[Pilot will be "self" or ditto mark for all flights, transcribe as such.]
[Duty should be written with normal capitalization, not ALLCAPS. Duty will be something like "Convoy Patrol", "Beach Head Patrol", "Formation" and other similar ones, but not a long prose description.]

# TOTALS MONTH
- Day Pilot: [Value]
- Night Pilot: [Value]

# GRAND TOTAL
[Value]

# NOTES
- [Location on page]: [Content]
example: - Bottom right page next to "Convoy Patrol" (June 10th): lorem ipsum....
[If the text is written as a paragraph over multiple lines, write it as a single entry. Do not split it into multiple entries unless they are separate notes with whitespace between them.]
[Only write the date if the note seems to be relevant to that date, otherwise just write the page location.]

# PHOTOS
- [Location]: [Description]
[First include actual photos and their description, afterwards can include any text references to photos]

# OTHER
- [Signatures, stamps, assessments, etc]

# HUMAN COMMENTS
- This document has not been reviewed by a human yet. Update this section after reviewing the transcription.
- [Add any other notes here the reviewer should know, for example any uncertainties in transcription, inconsistencies, areas that need closer review, etc. Preface each line for this this with "TO REVIEWER: "]
--------------------------------

If a section is empty or not present, write "None".
Do not write in allcaps, use normal capitalization.
For flight hours, use decimal points instead of dashes when transcribing (e.g. 1.15 not 1:15 or 1-15).
Transcribe everything exactly as written, do not correct any spelling or grammar.
If something is illegible, write "[illegible]" in the field or portion of the text.
Do not add conversational text. Only output the Markdown.
Use standard markdown formatting for lists and tables.
Ensure all table rows have the same number of columns.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error(`Error generating content for ${fileName}:`, error);
    return null;
  }
}

/**
 * Filters the list of files based on command line arguments.
 * @param {string[]} allFiles - List of all available files.
 * @param {string[]} args - Command line arguments.
 * @returns {string[]} List of files to process.
 */
function getFilesToProcess(allFiles, args) {
  if (args.length === 0) {
    return allFiles;
  }

  const arg = args[0];

  if (arg.includes('..')) {
    // Handle range: 63..66
    const [start, end] = arg.split('..').map(Number);
    
    if (!isNaN(start) && !isNaN(end)) {
      return allFiles.filter(file => {
        const match = file.match(/^(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          return num >= start && num <= end;
        }
        return false;
      });
    }
  } else {
    // Handle single file: 63
    const num = parseInt(arg, 10);
    if (!isNaN(num)) {
      return allFiles.filter(file => {
        const match = file.match(/^(\d+)/);
        return match && parseInt(match[1], 10) === num;
      });
    }
  }
  
  return [];
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

    console.log(`Processing ${filesToProcess.length} files:`, filesToProcess);

    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    for (const fileName of filesToProcess) {
      console.log(`Transcribing ${fileName}...`);
      const transcription = await transcribe(fileName);
      
      if (transcription) {
        const outputName = fileName.replace(/\.[^/.]+$/, ".txt");
        const outputPath = path.join(OUTPUT_DIR, outputName);
        
        await fs.writeFile(outputPath, transcription);
        console.log(`Saved transcription to ${outputPath}`);
      }
    }

  } catch (error) {
    console.error("Failed to run transcription:", error);
  }
}

run();
