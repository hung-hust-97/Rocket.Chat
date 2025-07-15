import Ajv from 'ajv';

import type { GroupsBaseProps } from './BaseProps';
import { withGroupBaseProperties } from './BaseProps';

const ajv = new Ajv({
    coerceTypes: true,
});

export type GroupsRefnameProps = GroupsBaseProps & { fname: string };
const groupsRefnamePropsSchema = withGroupBaseProperties(
    {
        fname: {
            type: 'string',
        },
        roomId: {
            type: 'string',
        }
    },
    ['fname', 'roomId'],
);
export const isGroupsRefnameProps = ajv.compile<GroupsRefnameProps>(groupsRefnamePropsSchema);
