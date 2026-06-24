declare const _default: {
    testEnvironment: string;
    errorOnDeprecated: true;
    transform: {
        '^.+\\.m?(t|j)sx?$': [string, {
            sourceMaps: true;
            jsc: {
                target: "es2015";
                transform: {
                    react: {
                        runtime: "automatic";
                    };
                };
                parser: {
                    syntax: "typescript";
                    tsx: true;
                    decorators: false;
                    dynamicImport: true;
                };
            };
        }];
    };
    transformIgnorePatterns: string[];
    moduleFileExtensions: string[];
    moduleNameMapper: {
        '\\.css$': string;
    };
    collectCoverage: true;
};
export default _default;
