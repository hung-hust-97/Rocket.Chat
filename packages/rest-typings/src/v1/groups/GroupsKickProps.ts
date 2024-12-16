import type { WithUserId } from './BaseProps';
import { withUserIdProps } from './BaseProps';

export type GroupsKickProps = WithUserId;
export type GroupsKickMultipleProps = {
    username: string;
    groupNames: string[];
}

export const isGroupsKickProps = withUserIdProps;
