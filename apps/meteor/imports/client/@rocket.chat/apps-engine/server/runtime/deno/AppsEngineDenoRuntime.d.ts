/// <reference types="node" />
import { EventEmitter } from 'stream';
import * as jsonrpc from 'jsonrpc-lite';
import type { AppManager } from '../../AppManager';
import type { IParseAppPackageResult } from '../../compiler';
import { AppStatus } from '../../../definition/AppStatus';
export declare const ALLOWED_ACCESSOR_METHODS: ("getConfigurationExtend" | "getEnvironmentRead" | "getEnvironmentWrite" | "getConfigurationModify" | "getReader" | "getPersistence" | "getHttp" | "getModifier")[];
export declare const ALLOWED_ENVIRONMENT_VARIABLES: string[];
export declare const JSONRPC_METHOD_NOT_FOUND = -32601;
export declare function isValidOrigin(accessor: string): accessor is typeof ALLOWED_ACCESSOR_METHODS[number];
/**
 * Resolves the absolute path of the Deno executable
 * installed by deno-bin.
 */
export declare function getDenoExecutablePath(): string;
export declare function getDenoWrapperPath(): string;
export type DenoRuntimeOptions = {
    timeout: number;
};
export declare class DenoRuntimeSubprocessController extends EventEmitter {
    private readonly appPackage;
    private deno;
    private state;
    private readonly debug;
    private readonly options;
    private readonly accessors;
    private readonly api;
    private readonly logStorage;
    private readonly bridges;
    private readonly messenger;
    private readonly livenessManager;
    constructor(manager: AppManager, appPackage: IParseAppPackageResult);
    spawnProcess(): void;
    killProcess(): Promise<void>;
    emit(eventName: string | symbol, ...args: any[]): boolean;
    getProcessState(): "unknown" | "ready" | "uninitialized" | "invalid" | "restarting" | "stopped";
    getStatus(): Promise<AppStatus>;
    setupApp(): Promise<void>;
    stopApp(): Promise<void>;
    restartApp(): Promise<void>;
    getAppId(): string;
    sendRequest(message: Pick<jsonrpc.RequestObject, 'method' | 'params'>, options?: {
        timeout: number;
    }): Promise<unknown>;
    private waitUntilReady;
    private waitForResponse;
    private onReady;
    private setupListeners;
    private handleAccessorMessage;
    private handleBridgeMessage;
    private handleIncomingMessage;
    private handleResultMessage;
    private parseStdout;
    private parseError;
}
