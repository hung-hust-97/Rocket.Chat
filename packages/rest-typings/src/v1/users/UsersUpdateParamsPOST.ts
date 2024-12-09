import Ajv from 'ajv';

const ajv = new Ajv({
	coerceTypes: true,
});

export type UsersUpdateParamsPOST = {
	userId: string;
	data: {
		email?: string;
		name?: string;
		password?: string;
		username?: string;
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
		customFields?: Record<string, unknown>;
		status?: string;
		active_tenant?: object;
		all_tenant?: Array<object>;
	};
	confirmRelinquish?: boolean;
};

const UsersUpdateParamsPostSchema = {
	type: 'object',
	properties: {
		userId: {
			type: 'string',
		},
		confirmRelinquish: {
			type: 'boolean',
		},
		data: {
			type: 'object',
			properties: {
				email: {
					type: 'string',
					nullable: true,
				},
				name: {
					type: 'string',
					nullable: true,
				},
				password: {
					type: 'string',
					nullable: true,
				},
				username: {
					type: 'string',
					nullable: true,
				},
				bio: {
					type: 'string',
					nullable: true,
				},
				nickname: {
					type: 'string',
					nullable: true,
				},
				statusText: {
					type: 'string',
					nullable: true,
				},
				active: {
					type: 'boolean',
					nullable: true,
				},
				roles: {
					type: 'array',
					items: {
						type: 'string',
					},
					nullable: true,
				},
				joinDefaultChannels: {
					type: 'boolean',
					nullable: true,
				},
				requirePasswordChange: {
					type: 'boolean',
					nullable: true,
				},
				setRandomPassword: {
					type: 'boolean',
					nullable: true,
				},
				sendWelcomeEmail: {
					type: 'boolean',
					nullable: true,
				},
				verified: {
					type: 'boolean',
					nullable: true,
				},
				customFields: {
					type: 'object',
					nullable: true,
				},
				status: {
					type: 'string',
					nullable: true,
				},
				active_tenant: {
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
				},
				all_tenant: {
					type: 'array',
					items: {
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
					},
					nullable: true,
				},
			},
			required: [],
			additionalProperties: false,
		},
	},
	required: ['userId', 'data'],
	additionalProperties: false,
};

export const isUsersUpdateParamsPOST = ajv.compile<UsersUpdateParamsPOST>(UsersUpdateParamsPostSchema);
