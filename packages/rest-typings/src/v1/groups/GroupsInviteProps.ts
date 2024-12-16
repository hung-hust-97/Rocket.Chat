import type { WithUserId } from './BaseProps';
import { withUserIdProps } from './BaseProps';

export type GroupsInviteProps = WithUserId;
export type GroupsInviteMultipleProps = {
    username: string;
    groupIds: string[];
};
export const isGroupsInviteProps = withUserIdProps;
