import Ajv from 'ajv';

import type { GroupsBaseProps } from './BaseProps';
import { withGroupBaseProperties } from './BaseProps';

const ajv = new Ajv({
	coerceTypes: true,
});

export type GroupsSetReadOnlyProps = GroupsBaseProps & { readOnly: boolean };
export type GroupsSetReadOnlyMultipleProps = {
	readOnly: boolean,
	roomIds: string[]
};
const groupsSetReadOnlyPropsSchema = withGroupBaseProperties(
	{
		readOnly: {
			type: 'boolean',
		},
	},
	['readOnly'],
);
export const isGroupsSetReadOnlyProps = ajv.compile<GroupsSetReadOnlyProps>(groupsSetReadOnlyPropsSchema);
