import Ajv from 'ajv';

const ajv = new Ajv({
	coerceTypes: true,
});

export type UserCreateParamsPOST = {
	email: string;
	name: string;
	password: string;
	username: string;
	active?: boolean;
	bio?: string;
	nickname?: string;
	statusText?: string;
	roles?: string[];
	joinDefaultChannels?: boolean;
	requirePasswordChange?: boolean;
	setRandomPassword?: boolean;
	sendWelcomeEmail?: boolean;
	verified?: boolean;
	customFields?: object;
	/* @deprecated */
	fields: string;
	all_tenant?: object;
};

const userCreateParamsPostSchema = {
	type: 'object',
	properties: {
		email: { type: 'string' },
		name: { type: 'string' },
		password: { type: 'string' },
		username: { type: 'string' },
		active: { type: 'boolean', nullable: true },
		bio: { type: 'string', nullable: true },
		nickname: { type: 'string', nullable: true },
		statusText: { type: 'string', nullable: true },
		roles: { type: 'array', items: { type: 'string' } },
		joinDefaultChannels: { type: 'boolean', nullable: true },
		requirePasswordChange: { type: 'boolean', nullable: true },
		setRandomPassword: { type: 'boolean', nullable: true },
		sendWelcomeEmail: { type: 'boolean', nullable: true },
		verified: { type: 'boolean', nullable: true },
		customFields: { type: 'object' },
		fields: { type: 'string', nullable: true },
		all_tenant: {
			type: 'object',
			properties: {
				tenant_id: { type: 'string' },
				tenant_name: { type: 'string' },
				roles: {
					type: 'array',
					items: { type: 'string', }
				},
			},
			required: ['tenant_id', 'tenant_name', 'roles'],
			nullable: true,
		}
	},
	additionalProperties: false,
	required: ['email', 'name', 'password', 'username'],
};

export const isUserCreateParamsPOST = ajv.compile<UserCreateParamsPOST>(userCreateParamsPostSchema);
