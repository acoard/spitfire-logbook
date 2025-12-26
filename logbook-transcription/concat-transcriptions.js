import fs from 'fs';
import path from 'path';

const transcriptionsDir = './logbook-transcription/transcriptions';
const outputFile = './logbook-transcription/all-transcriptions.txt';

function concatFiles() {
  try {
    const files = fs.readdirSync(transcriptionsDir)
      .filter(file => file.endsWith('.txt'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    // Open output stream in binary mode
    const writeStream = fs.createWriteStream(outputFile);

    for (const file of files) {
      const filePath = path.join(transcriptionsDir, file);
      // Read as raw buffer to avoid encoding issues
      const data = fs.readFileSync(filePath);
      writeStream.write(data);
      // Optional: Add a newline if files might not have one at the end
      // writeStream.write(Buffer.from('\n')); 
    }

    writeStream.end();
    console.log(`Successfully concatenated ${files.length} files to ${outputFile}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

concatFiles();

