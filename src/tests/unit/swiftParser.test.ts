import { isHeadquarters, getHeadquartersCode } from '../../utils/swiftParser';

describe('Swift Parser Utils', () => {
    describe('isHeadquarters', () => {
        it('should return true for codes ending with XXX', () => {
            expect(isHeadquarters('ABCDGB2LXXX')).toBe(true);
            expect(isHeadquarters('EFGHUS33XXX')).toBe(true);
        });

        it('should return false for codes not ending with XXX', () => {
            expect(isHeadquarters('ABCDGB2L123')).toBe(false);
            expect(isHeadquarters('EFGHUS33')).toBe(false);
        });
    });

    describe('getHeadquartersCode', () => {
        it('should convert branch code to headquarters code', () => {
        expect(getHeadquartersCode('ABCDGB2L123')).toBe('ABCDGB2LXXX');
        expect(getHeadquartersCode('EFGHUS33456')).toBe('EFGHUS33XXX');
        });

        it('should handle shorter codes correctly', () => {
            expect(getHeadquartersCode('ABCD')).toBe('ABCDXXXX');
        });
    });
});