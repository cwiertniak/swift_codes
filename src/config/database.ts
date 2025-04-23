import { DataSource } from "typeorm";
import { Bank } from "../models/Bank";
import { Branch } from "../models/Branch";
import { Country } from "../models/Country";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "swift_codes_db",
    synchronize: true,
    logging: false,
    entities: [Country, Bank, Branch],
    subscribers: [],
    migrations: [],
});

export const initializeDatabase = async (): Promise<void> => {
    try {
        await AppDataSource.initialize();
        console.log("Database connection established");
    } catch (error) {
        console.error("Error during database initialization:", error);
        throw error;
    }
};