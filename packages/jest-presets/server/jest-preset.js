"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    testEnvironment: 'node',
    errorOnDeprecated: true,
    transform: {
        '^.+\\.m?(t|j)sx?$': [
            '@swc/jest',
            {
                sourceMaps: true,
                jsc: {
                    target: 'es2015',
                    parser: {
                        syntax: 'typescript',
                        decorators: false,
                        dynamicImport: true,
                    },
                },
            },
        ],
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/@babel', '<rootDir>/node_modules/@jest', '/node_modules/(?!@testing-library/)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
    collectCoverage: true,
};
