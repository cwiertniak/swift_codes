import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

interface SwiftCodeRecord {
    swiftCode: string;
    bankName: string;
    address?: string;
    countryISO2: string;
    countryName: string;
}

export async function parseSwiftCodesFile(filePath: string): Promise<SwiftCodeRecord[]> {
    return new Promise((resolve, reject) => {
        const results: SwiftCodeRecord[] = [];
    
        fs.createReadStream(path.resolve(filePath))
            .pipe(csvParser())
            .on('data', (data) => {
                const record: SwiftCodeRecord = {
                    swiftCode: data['SWIFT CODE'],
                    bankName: data['NAME'],
                    address: data['ADDRESS'],
                    countryISO2: data['COUNTRY ISO2 CODE']?.toUpperCase(),
                    countryName: data['COUNTRY NAME']?.toUpperCase()
                };
            
                results.push(record);
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

export function isHeadquarters(swiftCode: string): boolean {
    return swiftCode.endsWith('XXX');
}

export function getHeadquartersCode(branchCode: string): string {
    if (branchCode.length >= 8) {
        return branchCode.substring(0, 8) + 'XXX';
    } else {
        return branchCode.padEnd(8, 'X');
    }
}

export function processSwiftCodes(rawRecords: SwiftCodeRecord[]): {
    countries: Map<string, { iso2: string, name: string }>,
    banks: Map<string, SwiftCodeRecord & { isHeadquarter: boolean }>,
    branches: Map<string, SwiftCodeRecord & { isHeadquarter: boolean, headquartersCode: string }>
} {
    const countries = new Map<string, { iso2: string, name: string }>();
    const banks = new Map<string, SwiftCodeRecord & { isHeadquarter: boolean }>();
    const branches = new Map<string, SwiftCodeRecord & { isHeadquarter: boolean, headquartersCode: string }>();

    rawRecords.forEach(record => {
        countries.set(record.countryISO2, {
            iso2: record.countryISO2,
            name: record.countryName
        });

        if (isHeadquarters(record.swiftCode)) {
        banks.set(record.swiftCode, {
            ...record,
            isHeadquarter: true
        });
        } else {
        const headquartersCode = getHeadquartersCode(record.swiftCode);
        branches.set(record.swiftCode, {
            ...record,
            isHeadquarter: false,
            headquartersCode
        });
        }
    });

    return { countries, banks, branches };
}