import type { WithUserId } from './BaseProps';
import { withUserIdProps } from './BaseProps';

export type GroupsKickProps = WithUserId;
export type GroupsKickMultipleProps = {
    username: string;
    groupIds: string[];
}

export const isGroupsKickProps = withUserIdProps;
