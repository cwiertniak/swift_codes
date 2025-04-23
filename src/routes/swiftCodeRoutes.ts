import { Router } from 'express';
import { SwiftCodeController } from '../controllers/swiftCodeController';

const router = Router();
const swiftCodeController = new SwiftCodeController();

router.get('/v1/swift-codes/:swiftCode', swiftCodeController.getSwiftCode);

router.get('/v1/swift-codes/country/:countryISO2', swiftCodeController.getSwiftCodesByCountry);

router.post('/v1/swift-codes', swiftCodeController.addSwiftCode);

router.delete('/v1/swift-codes/:swiftCode', swiftCodeController.deleteSwiftCode);

export default router;