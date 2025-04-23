import { SwiftCodeService } from '../../services/swiftCodeService';
import { Bank } from '../../models/Bank';
import { Branch } from '../../models/Branch';
import { Country } from '../../models/Country';

const mockBankRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn()
};

const mockBranchRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn()
};

const mockCountryRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn()
};

jest.mock('../../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn((entity) => {
            if (entity === Bank) return mockBankRepo;
            if (entity === Branch) return mockBranchRepo;
            if (entity === Country) return mockCountryRepo;
            return null;
        })
    }
}));

describe('SwiftCodeService', () => {
    let service: SwiftCodeService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new SwiftCodeService();
    });

    describe('getSwiftCodeDetails', () => {
        it('should return headquarters details with branches', async () => {
            const mockBank = {
                swiftCode: 'ABCDGB2LXXX',
                bankName: 'Test Bank',
                address: 'Test Address',
                countryISO2: 'GB',
                country: {
                    name: 'UNITED KINGDOM'
                }
            };

            const mockBranches = [
                {
                    swiftCode: 'ABCDGB2L123',
                    bankName: 'Test Branch 1',
                    address: 'Branch Address 1',
                    countryISO2: 'GB',
                    headquartersCode: 'ABCDGB2LXXX',
                    country: {
                        name: 'UNITED KINGDOM'
                    }
                },
                {
                    swiftCode: 'ABCDGB2L456',
                    bankName: 'Test Branch 2',
                    address: 'Branch Address 2',
                    countryISO2: 'GB',
                    headquartersCode: 'ABCDGB2LXXX',
                    country: {
                        name: 'UNITED KINGDOM'
                    }
                }
            ];

            mockBankRepo.findOne.mockResolvedValue(mockBank);
            mockBranchRepo.find.mockResolvedValue(mockBranches);

            const result = await service.getSwiftCodeDetails('ABCDGB2LXXX');

            expect(mockBankRepo.findOne).toHaveBeenCalledWith({
                where: { swiftCode: 'ABCDGB2LXXX' },
                relations: ['country']
            });

            expect(mockBranchRepo.find).toHaveBeenCalledWith({
                where: { headquartersCode: 'ABCDGB2LXXX' },
                relations: ['country']
            });

            expect(result).toEqual({
                swiftCode: 'ABCDGB2LXXX',
                bankName: 'Test Bank',
                address: 'Test Address',
                countryISO2: 'GB',
                countryName: 'UNITED KINGDOM',
                isHeadquarter: true,
                branches: [
                {
                    swiftCode: 'ABCDGB2L123',
                    bankName: 'Test Branch 1',
                    address: 'Branch Address 1',
                    countryISO2: 'GB',
                    isHeadquarter: false
                },
                {
                    swiftCode: 'ABCDGB2L456',
                    bankName: 'Test Branch 2',
                    address: 'Branch Address 2',
                    countryISO2: 'GB',
                    isHeadquarter: false
                }
                ]
            });
        });

        it('should return branch details', async () => {
            const mockBranch = {
                swiftCode: 'ABCDGB2L123',
                bankName: 'Test Branch',
                address: 'Branch Address',
                countryISO2: 'GB',
                headquartersCode: 'ABCDGB2LXXX',
                country: {
                    name: 'UNITED KINGDOM'
                }
            };

            mockBranchRepo.findOne.mockResolvedValue(mockBranch);

            const result = await service.getSwiftCodeDetails('ABCDGB2L123');

            expect(mockBranchRepo.findOne).toHaveBeenCalledWith({
                where: { swiftCode: 'ABCDGB2L123' },
                relations: ['country']
            });

            expect(result).toEqual({
                swiftCode: 'ABCDGB2L123',
                bankName: 'Test Branch',
                address: 'Branch Address',
                countryISO2: 'GB',
                countryName: 'UNITED KINGDOM',
                isHeadquarter: false
            });
        });

        it('should return null if swift code not found', async () => {
            mockBankRepo.findOne.mockResolvedValue(null);
            mockBranchRepo.findOne.mockResolvedValue(null);

            const result = await service.getSwiftCodeDetails('NONEXISTENT');
            expect(result).toBeNull();
        });
    });
});