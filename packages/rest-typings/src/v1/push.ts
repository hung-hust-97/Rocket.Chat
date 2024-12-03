import type {
	IMessage,
	IPushNotificationConfig,
	IPushTokenTypes,
	IPushToken,
	IDeviceTypes,
} from '@rocket.chat/core-typings';
import Ajv from 'ajv';

const ajv = new Ajv({
	coerceTypes: true,
});

type PushTokenProps = {
	id?: string;
	type: IPushTokenTypes;
	value: string;
	appName: string;
	deviceType: IDeviceTypes;
};

const PushTokenPropsSchema = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			nullable: true,
		},
		type: {
			type: 'string',
		},
		value: {
			type: 'string',
		},
		appName: {
			type: 'string',
		},
		deviceType: {
			type: 'string',
			allowedValues: ['DESKTOP', 'WEB', 'IOS', 'ANDROID'],
		}
	},
	required: ['type', 'value', 'appName', 'deviceType'],
	additionalProperties: false,
};

export const isPushTokenProps = ajv.compile<PushTokenProps>(PushTokenPropsSchema);

type PushGetProps = {
	id: string;
};

const PushGetPropsSchema = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
		},
	},
	required: ['id'],
	additionalProperties: false,
};

export const isPushGetProps = ajv.compile<PushGetProps>(PushGetPropsSchema);

export type PushEndpoints = {
	'/v1/push.token': {
		POST: (payload: PushTokenProps) => { result: IPushToken };
		DELETE: (payload: { token: string }) => void;
	};
	'/v1/push.get': {
		GET: (params: PushGetProps) => {
			data: {
				message: IMessage;
				notification: IPushNotificationConfig;
			};
		};
	};
	'/v1/push.info': {
		GET: () => {
			pushGatewayEnabled: boolean;
			defaultPushGateway: boolean;
		};
	};
	'/v1/push.test': {
		POST: () => {
			tokensCount: boolean;
		};
	};
};
