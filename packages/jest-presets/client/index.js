"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var preset = '@rocket.chat/jest-presets/client';
exports.default = {
    preset: preset,
    setupFilesAfterEnv: ["".concat(preset, "/jest-setup.js")],
};
