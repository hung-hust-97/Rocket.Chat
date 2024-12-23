import type { IRocketChatRecord } from './IRocketChatRecord';

export type IPushTokenTypes = 'gcm' | 'apn';

export type IDeviceTypes = 'DESKTOP' | 'WEB' | 'IOS' | 'ANDROID';

export interface IPushToken extends IRocketChatRecord {
	token: Record<IPushTokenTypes, string>;
	deviceType: IDeviceTypes;
	appName: string;
	userId: string;
	enabled: boolean;
	createdAt: Date;
	updatedAt: Date;
}
