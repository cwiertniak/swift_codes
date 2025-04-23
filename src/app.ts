import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { initializeDatabase } from './config/database';
import swiftCodeRoutes from './routes/swiftCodeRoutes';
import { ImportService } from './services/importService';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());

app.use(swiftCodeRoutes);

app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/', (_, res) => {
    res.send('SWIFT Code API is running.');
});

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

export const startServer = async (dataFilePath?: string): Promise<void> => {
    try {
        await initializeDatabase();

        if (dataFilePath) {
            const importService = new ImportService();
            await importService.importFromFile(dataFilePath);
        }

        const PORT = parseInt(process.env.PORT || '8080', 10);
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on http://0.0.0.0:${PORT}`);
        });
    } catch (error) {
        console.error('Error starting application:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
    const dataFilePath = process.env.DATA_FILE_PATH || getFirstCsvFile(dataDir);
    startServer(dataFilePath);
}

export default app;