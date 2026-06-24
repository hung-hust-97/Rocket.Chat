declare const _default: {
    testEnvironment: string;
    errorOnDeprecated: true;
    transform: {
        '^.+\\.m?(t|j)sx?$': [string, {
            sourceMaps: true;
            jsc: {
                target: "es2015";
                parser: {
                    syntax: "typescript";
                    decorators: false;
                    dynamicImport: true;
                };
            };
        }];
    };
    transformIgnorePatterns: string[];
    moduleFileExtensions: string[];
    collectCoverage: true;
};
export default _default;
