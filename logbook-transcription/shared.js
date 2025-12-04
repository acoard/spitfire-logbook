import path from "node:path";

export const FILES_DIR = path.join("logbook-transcription", "files");
export const OUTPUT_DIR = path.join("logbook-transcription", "transcriptions");

/**
 * Filters the list of files based on command line arguments.
 * @param {string[]} allFiles - List of all available files.
 * @param {string[]} args - Command line arguments.
 * @returns {string[]} List of files to process.
 */
export function getFilesToProcess(allFiles, args) {
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

