module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testRegex: '(/tests/.*\\.(test|spec))\\.[tj]sx?$',
    collectCoverageFrom: [
        'src/**/*.{ts,js}',
        '!src/**/*.d.ts'
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts']
};