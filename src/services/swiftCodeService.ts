import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Bank } from '../models/Bank';
import { Branch } from '../models/Branch';
import { Country } from '../models/Country';
import { isHeadquarters, getHeadquartersCode } from '../utils/swiftParser';

export interface SwiftCodeDTO {
    swiftCode: string;
    bankName: string;
    address: string;
    countryISO2: string;
    isHeadquarter: boolean;
    countryName?: string;
}

export interface SwiftCodeDetailsDTO extends SwiftCodeDTO {
    branches?: SwiftCodeDTO[];
}

export interface CountrySwiftCodesDTO {
    countryISO2: string;
    countryName: string;
    swiftCodes: SwiftCodeDTO[];
}

export class SwiftCodeService {
    private bankRepository: Repository<Bank>;
    private branchRepository: Repository<Branch>;
    private countryRepository: Repository<Country>;

    constructor() {
        this.bankRepository = AppDataSource.getRepository(Bank);
        this.branchRepository = AppDataSource.getRepository(Branch);
        this.countryRepository = AppDataSource.getRepository(Country);
    }

    public async getSwiftCodeDetails(swiftCode: string): Promise<SwiftCodeDetailsDTO | null> {
        try {
            if (isHeadquarters(swiftCode)) {
                const bank = await this.bankRepository.findOne({
                    where: { swiftCode },
                    relations: ['country']
                });
                if (!bank) return null;

                const branches = await this.branchRepository.find({
                    where: { headquartersCode: swiftCode },
                    relations: ['country']
                });

                return {
                    swiftCode: bank.swiftCode,
                    bankName: bank.bankName,
                    address: bank.address || '',
                    countryISO2: bank.countryISO2,
                    countryName: bank.country.name,
                    isHeadquarter: true,
                    branches: branches.map(branch => ({
                        swiftCode: branch.swiftCode,
                        bankName: branch.bankName,
                        address: branch.address || '',
                        countryISO2: branch.countryISO2,
                        isHeadquarter: false
                    }))
                };
            } else {
                const branch = await this.branchRepository.findOne({
                    where: { swiftCode },
                    relations: ['country']
                });
                if (!branch) return null;

                return {
                    swiftCode: branch.swiftCode,
                    bankName: branch.bankName,
                    address: branch.address || '',
                    countryISO2: branch.countryISO2,
                    countryName: branch.country.name,
                    isHeadquarter: false
                };
            }
        } catch (error) {
            console.error('Error getting SWIFT code details:', error);
            throw error;
        }
    }

    public async getSwiftCodesByCountry(countryISO2: string): Promise<CountrySwiftCodesDTO | null> {
        try {
            const iso = countryISO2.toUpperCase();
            const country = await this.countryRepository.findOne({
                where: { iso2: iso }
            });
            if (!country) return null;

            const banks = await this.bankRepository.find({
                where: { countryISO2: iso },
                relations: ['country']
            });

            const branches = await this.branchRepository.find({
                where: { countryISO2: iso },
                relations: ['country']
            });

            const swiftCodes: SwiftCodeDTO[] = [
                ...banks.map(bank => ({
                    swiftCode: bank.swiftCode,
                    bankName: bank.bankName,
                    address: bank.address || '',
                    countryISO2: bank.countryISO2,
                    isHeadquarter: true
                })),
                ...branches.map(branch => ({
                    swiftCode: branch.swiftCode,
                    bankName: branch.bankName,
                    address: branch.address || '',
                    countryISO2: branch.countryISO2,
                    isHeadquarter: false
                }))
            ];

            return {
                countryISO2: country.iso2,
                countryName: country.name,
                swiftCodes
            };
        } catch (error) {
            console.error('Error getting SWIFT codes by country:', error);
            throw error;
        }
    }

    public async addSwiftCode(data: {
        swiftCode: string;
        bankName: string;
        address: string;
        countryISO2: string;
        countryName: string;
        isHeadquarter: boolean;
    }): Promise<boolean> {
        try {
            const iso = data.countryISO2.toUpperCase();
            const countryName = data.countryName.toUpperCase();

            let country = await this.countryRepository.findOne({
                where: { iso2: iso }
            });
            if (!country) {
                country = new Country();
                country.iso2 = iso;
                country.name = countryName;
                await this.countryRepository.save(country);
            }

            if (data.isHeadquarter) {
                const bank = new Bank();
                bank.swiftCode = data.swiftCode;
                bank.bankName = data.bankName;
                bank.address = data.address;
                bank.countryISO2 = iso;
                await this.bankRepository.save(bank);
            } else {
                const hqCode = getHeadquartersCode(data.swiftCode);
                let headquarters = await this.bankRepository.findOne({
                    where: { swiftCode: hqCode }
                });
                if (!headquarters) {
                    headquarters = new Bank();
                    headquarters.swiftCode = hqCode;
                    headquarters.bankName = data.bankName;
                    headquarters.address = data.address;
                    headquarters.countryISO2 = iso;
                    await this.bankRepository.save(headquarters);
                }

                const branch = new Branch();
                branch.swiftCode = data.swiftCode;
                branch.bankName = data.bankName;
                branch.address = data.address;
                branch.countryISO2 = iso;
                branch.headquartersCode = hqCode;
                await this.branchRepository.save(branch);
            }

            return true;
        } catch (error) {
            console.error('Error adding SWIFT code:', error);
            throw error;
        }
    }

    public async deleteSwiftCode(swiftCode: string): Promise<boolean> {
        try {
            if (isHeadquarters(swiftCode)) {
                const branches = await this.branchRepository.find({
                    where: { headquartersCode: swiftCode }
                });
                if (branches.length) {
                    await this.branchRepository.remove(branches);
                }

                const bank = await this.bankRepository.findOne({
                    where: { swiftCode }
                });
                if (bank) {
                    await this.bankRepository.remove(bank);
                    return true;
                }

                return false;
            } else {
                const branch = await this.branchRepository.findOne({
                    where: { swiftCode }
                });
                if (branch) {
                    await this.branchRepository.remove(branch);
                    return true;
                }

                return false;
            }
        } catch (error) {
            console.error('Error deleting SWIFT code:', error);
            throw error;
        }
    }
}
