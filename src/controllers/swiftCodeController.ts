import { Request, Response } from 'express';
import { SwiftCodeService } from '../services/swiftCodeService';

export class SwiftCodeController {
    private swiftCodeService: SwiftCodeService;

    constructor() {
        this.swiftCodeService = new SwiftCodeService();
    }

    getSwiftCode = async (req: Request, res: Response): Promise<void> => {
        try {
            const swiftCode = req.params.swiftCode;
            
        if (!swiftCode || swiftCode.length < 8) {
            res.status(400).json({ error: 'Invalid SWIFT code format' });
            return;
        }

        const swiftCodeDetails = await this.swiftCodeService.getSwiftCodeDetails(swiftCode);
        
        if (!swiftCodeDetails) {
            res.status(404).json({ error: 'SWIFT code not found' });
            return;
        }

        res.status(200).json(swiftCodeDetails);
        } catch (error) {
            console.error('Error retrieving SWIFT code:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    getSwiftCodesByCountry = async (req: Request, res: Response): Promise<void> => {
        try {
            const countryISO2 = req.params.countryISO2;
            
            if (!countryISO2 || countryISO2.length !== 2) {
                res.status(400).json({ error: 'Invalid country ISO2 code format' });
                return;
            }

            const swiftCodes = await this.swiftCodeService.getSwiftCodesByCountry(countryISO2);
            
            if (!swiftCodes) {
                res.status(404).json({ error: 'Country not found' });
                return;
            }

            res.status(200).json(swiftCodes);
        } catch (error) {
            console.error('Error retrieving SWIFT codes by country:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    addSwiftCode = async (req: Request, res: Response): Promise<void> => {
        try {
            const { swiftCode, bankName, address, countryISO2, countryName, isHeadquarter } = req.body;
            
            if (!swiftCode || !bankName || !countryISO2 || !countryName) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }
            
            if (swiftCode.length < 8 || swiftCode.length > 11) {
                res.status(400).json({ error: 'Invalid SWIFT code format' });
                return;
            }
            
            if (countryISO2.length !== 2) {
                res.status(400).json({ error: 'Invalid country ISO2 code format' });
                return;
            }

            const success = await this.swiftCodeService.addSwiftCode({
                swiftCode,
                bankName,
                address: address || '',
                countryISO2,
                countryName,
                isHeadquarter: isHeadquarter || false
            });

            if (success) {
                res.status(201).json({ message: 'SWIFT code added successfully' });
            } else {
                res.status(400).json({ error: 'Failed to add SWIFT code' });
            }
        } catch (error: any) {
            console.error('Error adding SWIFT code:', error);
        
            if (error.code === '23505') {
                res.status(409).json({ error: 'SWIFT code already exists' });
                return;
            }
        
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    deleteSwiftCode = async (req: Request, res: Response): Promise<void> => {
        try {
            const swiftCode = req.params.swiftCode;
            
            if (!swiftCode || swiftCode.length < 8) {
                res.status(400).json({ error: 'Invalid SWIFT code format' });
                return;
            }

            const success = await this.swiftCodeService.deleteSwiftCode(swiftCode);
            
            if (success) {
                res.status(200).json({ message: 'SWIFT code deleted successfully' });
            } else {
                res.status(404).json({ error: 'SWIFT code not found' });
            }
        } catch (error: any) {
            console.error('Error deleting SWIFT code:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}