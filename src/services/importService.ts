import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Country } from '../models/Country';
import { Bank } from '../models/Bank';
import { Branch } from '../models/Branch';
import { parseSwiftCodesFile, processSwiftCodes } from '../utils/swiftParser';

export class ImportService {
    private countryRepository: Repository<Country>;
    private bankRepository: Repository<Bank>;
    private branchRepository: Repository<Branch>;

    constructor() {
        this.countryRepository = AppDataSource.getRepository(Country);
        this.bankRepository = AppDataSource.getRepository(Bank);
        this.branchRepository = AppDataSource.getRepository(Branch);
    }

    async importFromFile(filePath: string): Promise<void> {
        try {
            const rawRecords = await parseSwiftCodesFile(filePath);
            const { countries, banks, branches } = processSwiftCodes(rawRecords);

        for (const [_, countryData] of countries) {
            const country = new Country();
            country.iso2 = countryData.iso2;
            country.name = countryData.name;

            await this.countryRepository.save(country).catch(error => {
                if (error.code !== '23505') {
                    throw error;
                }
            });
        }

        for (const [_, bankData] of banks) {
            const bank = new Bank();
            bank.swiftCode = bankData.swiftCode;
            bank.bankName = bankData.bankName;
            bank.address = bankData.address || '';
            bank.countryISO2 = bankData.countryISO2;

            await this.bankRepository.save(bank).catch(error => {
                if (error.code !== '23505') {
                    throw error;
                }
            });
        }

        for (const [_, branchData] of branches) {
            const headquartersExists = await this.bankRepository.findOne({ 
                where: { swiftCode: branchData.headquartersCode } 
            });

            if (!headquartersExists) {
                console.log(`Warning: Skipping branch ${branchData.swiftCode} - referenced headquarters ${branchData.headquartersCode} not found`);
                continue;
            }
            
            const branch = new Branch();
            branch.swiftCode = branchData.swiftCode;
            branch.bankName = branchData.bankName;
            branch.address = branchData.address || '';
            branch.countryISO2 = branchData.countryISO2;
            branch.headquartersCode = branchData.headquartersCode;

            await this.branchRepository.save(branch).catch(error => {
                if (error.code !== '23505') {
                    console.error(`Error saving branch ${branchData.swiftCode}:`, error.detail || error.message);
                }
            });
        }

        console.log(`Import completed: ${banks.size} banks and ${branches.size} branches from ${countries.size} countries`);
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }
}