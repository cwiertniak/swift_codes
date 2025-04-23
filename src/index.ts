import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { startServer } from './app';

dotenv.config();

function getFirstCsvFile(dirPath: string): string {
    try {
        const files = fs.readdirSync(dirPath);
        const csvFile = files.find(file => file.toLowerCase().endsWith('.csv'));
        
        if (!csvFile) {
            throw new Error('No CSV file found in the data directory');
        }
        
        return path.join(dirPath, csvFile);
    } catch (error) {
        console.error(`Error finding CSV file: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
}

const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
const dataFilePath = process.env.DATA_FILE_PATH || getFirstCsvFile(dataDir);

startServer(dataFilePath).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});