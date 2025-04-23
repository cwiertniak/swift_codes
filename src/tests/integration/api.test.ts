import request from 'supertest';
import app from '../../app';

jest.mock('../../config/database', () => {
    const mockCountryRepo = {
        findOne: jest.fn(),
        save: jest.fn(),
        find: jest.fn()
    };

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

    return {
        AppDataSource: {
            initialize: jest.fn().mockResolvedValue(true),
            isInitialized: true,
            getRepository: jest.fn((entityName) => {
                if (entityName.name === 'Country') return mockCountryRepo;
                if (entityName.name === 'Bank') return mockBankRepo;
                if (entityName.name === 'Branch') return mockBranchRepo;
                return null;
            })
        },
        initializeDatabase: jest.fn().mockResolvedValue(true),
        _mocks: {
            mockCountryRepo,
            mockBankRepo,
            mockBranchRepo
        }
    };
});

const { _mocks: { mockCountryRepo, mockBankRepo, mockBranchRepo } } = require('../../config/database');

describe('API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /v1/swift-codes/:swiftCode', () => {
        it('should return 404 if swift code not found', async () => {
            mockBankRepo.findOne.mockResolvedValue(null);
            mockBranchRepo.findOne.mockResolvedValue(null);

            const response = await request(app).get('/v1/swift-codes/NONEXISTENT');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'SWIFT code not found');
        });

        it('should return headquarters data with branches', async () => {
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
                    country: {
                        name: 'UNITED KINGDOM'
                    }
                }
            ];

            mockBankRepo.findOne.mockResolvedValue(mockBank);
            mockBranchRepo.find.mockResolvedValue(mockBranches);

            const response = await request(app).get('/v1/swift-codes/ABCDGB2LXXX');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('swiftCode', 'ABCDGB2LXXX');
            expect(response.body).toHaveProperty('branches');
            expect(response.body.branches).toHaveLength(1);
        });
    });
});