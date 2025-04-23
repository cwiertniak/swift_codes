import dotenv from 'dotenv';
import { AppDataSource } from '../config/database';

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
});

afterAll(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});