import type { RoomType } from '@rocket.chat/core-typings';
import { Users, Rooms, Subscriptions } from '@rocket.chat/models';
import { escapeRegExp } from '@rocket.chat/string-helpers';

import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { API } from '../api';
import { composeRoomWithLastMessage } from '../helpers/composeRoomWithLastMessage';
import { getPaginationItems } from '../helpers/getPaginationItems';

interface ISearchResults {
	users: IUserResult[];
	groups: IGroupResult[];
	channels: IChannelResult[];
}

interface IUserResult {
	_id: string;
	username?: string;
	name?: string;
	status?: string;
	active?: boolean;
	type: 'user';
}

interface IGroupResult {
	_id: string;
	name?: string;
	fname?: string;
	t?: RoomType;
	u?: any;
	lastMessage?: any;
	_updatedAt?: Date;
	usersCount?: number;
	tenantId?: string;
}

interface IChannelResult {
	_id: string;
	name?: string;
	fname?: string;
	t?: RoomType;
	u?: any;
	lastMessage?: any;
	_updatedAt?: Date;
	usersCount?: number;
	tenantId?: string;
}

// TODO: Temporarily disabled tenant filtering
// Helper function to get user's tenant info
// async function getUserTenantInfo(userId: string) {
// 	const currentUser = await Users.findOneById(userId, {
// 		projection: { active_tenant: 1, all_tenants: 1 },
// 	});

// 	return {
// 		activeTenant: (currentUser as any)?.active_tenant,
// 		allTenants: (currentUser as any)?.all_tenants,
// 	};
// }

// Helper function to search users
async function searchUsers(searchTerm: string, _userId: string, paginationOffset: number, paginationCount: number) {
	const userQuery: any = {
		$or: [
			{ username: { $regex: escapeRegExp(searchTerm.trim()), $options: 'i' } },
			{ name: { $regex: escapeRegExp(searchTerm.trim()), $options: 'i' } },
		],
		active: true,
		type: { $ne: 'app' },
	};

	// TODO: Temporarily removed tenant filtering
	// const { activeTenant } = await getUserTenantInfo(userId);
	// if (activeTenant) {
	// 	userQuery.active_tenant = activeTenant;
	// } else {
	// 	return [];
	// }

	const users = await Users.find(userQuery, {
		projection: {
			_id: 1,
			username: 1,
			name: 1,
			status: 1,
			active: 1,
		},
		sort: { username: 1 },
		limit: paginationCount,
		skip: paginationOffset,
	}).toArray();

	return users.map(
		(user): IUserResult => ({
			_id: user._id,
			username: user.username,
			name: user.name,
			status: user.status,
			active: user.active,
			type: 'user',
		}),
	);
}

// Helper function to search groups
async function searchGroups(searchTerm: string, userId: string, paginationOffset: number, paginationCount: number) {
	const groupSearchTerm = escapeRegExp(searchTerm.trim());

	// TODO: Temporarily removed tenant filtering
	// const { activeTenant } = await getUserTenantInfo(userId);
	// if (!activeTenant) {
	// 	return [];
	// }

	// Get user's subscribed private groups
	const userSubscriptions = await Subscriptions.findByUserIdAndTypes(userId, ['p'], {
		projection: { rid: 1 },
	}).toArray();

	const userGroupIds = userSubscriptions.map((sub) => sub.rid);

	if (userGroupIds.length === 0) {
		return [];
	}

	const groupQuery = {
		_id: { $in: userGroupIds },
		$or: [{ name: { $regex: groupSearchTerm, $options: 'i' } }, { fname: { $regex: groupSearchTerm, $options: 'i' } }],
		t: 'p' as RoomType,
		// tenantId: activeTenant, // TODO: Temporarily removed tenant filtering
	};

	const groups = await Rooms.find(groupQuery, {
		projection: {
			_id: 1,
			name: 1,
			fname: 1,
			t: 1,
			u: 1,
			lastMessage: 1,
			_updatedAt: 1,
			usersCount: 1,
			tenantId: 1,
		},
		sort: { name: 1 },
		limit: paginationCount,
		skip: paginationOffset,
	}).toArray();

	// Compose rooms with last message
	const composedGroups = await Promise.all(
		groups.map(async (group) => {
			const composedRoom = await composeRoomWithLastMessage(group, userId);
			return {
				...composedRoom,
				type: 'group' as const,
			};
		}),
	);

	return composedGroups;
}

// Helper function to search channels
async function searchChannels(searchTerm: string, userId: string, paginationOffset: number, paginationCount: number) {
	const channelSearchTerm = escapeRegExp(searchTerm.trim());

	// TODO: Temporarily removed tenant filtering
	// const { activeTenant } = await getUserTenantInfo(userId);
	// if (!activeTenant) {
	// 	return [];
	// }

	// Check if user can view all public channels
	const canViewAllChannels = await hasPermissionAsync(userId, 'view-c-room');

	const channelQuery: any = {
		t: 'c' as RoomType,
		$or: [{ name: { $regex: channelSearchTerm, $options: 'i' } }, { fname: { $regex: channelSearchTerm, $options: 'i' } }],
		// tenantId: activeTenant, // TODO: Temporarily removed tenant filtering
	};

	// If user can't view all channels, only show subscribed ones
	if (!canViewAllChannels) {
		const userChannelSubscriptions = await Subscriptions.findByUserIdAndTypes(userId, ['c'], {
			projection: { rid: 1 },
		}).toArray();

		const userChannelIds = userChannelSubscriptions.map((sub) => sub.rid);
		channelQuery._id = { $in: userChannelIds };
	}

	const channels = await Rooms.find(channelQuery, {
		projection: {
			_id: 1,
			name: 1,
			fname: 1,
			t: 1,
			u: 1,
			lastMessage: 1,
			_updatedAt: 1,
			usersCount: 1,
			tenantId: 1,
		},
		sort: { name: 1 },
		limit: paginationCount,
		skip: paginationOffset,
	}).toArray();

	// Compose rooms with last message
	const composedChannels = await Promise.all(
		channels.map(async (channel) => {
			const composedRoom = await composeRoomWithLastMessage(channel, userId);
			return {
				...composedRoom,
				type: 'channel' as const,
			};
		}),
	);

	return composedChannels;
}

/**
 * Search for groups, users and channels based on search term
 * This API combines group and user search functionality
 */
API.v1.addRoute(
	'search.all',
	{ authRequired: true },
	{
		async get() {
			const { searchTerm } = (this as any).queryParams;

			if (!searchTerm || searchTerm.trim().length === 0) {
				return API.v1.failure('Search term is required');
			}

			const { offset: paginationOffset, count: paginationCount } = await getPaginationItems((this as any).queryParams);

			const [users, groups, channels] = await Promise.all([
				searchUsers(searchTerm, (this as any).userId, paginationOffset, paginationCount),
				searchGroups(searchTerm, (this as any).userId, paginationOffset, paginationCount),
				searchChannels(searchTerm, (this as any).userId, paginationOffset, paginationCount),
			]);

			const results: ISearchResults = {
				users,
				groups,
				channels,
			};

			const totalResults = users.length + groups.length + channels.length;

			return API.v1.success({
				results,
				total: totalResults,
				offset: paginationOffset,
				count: totalResults,
			});
		},
	},
);

/**
 * Search for users only with tenant filtering
 */
API.v1.addRoute(
	'search.users',
	{ authRequired: true },
	{
		async get() {
			const { searchTerm } = (this as any).queryParams;

			const { offset: paginationOffset, count: paginationCount } = await getPaginationItems((this as any).queryParams);

			let users;

			if (searchTerm && searchTerm.trim().length > 0) {
				users = await searchUsers(searchTerm, (this as any).userId, paginationOffset, paginationCount);
			} else {
				users = await searchUsers('', (this as any).userId, paginationOffset, paginationCount);
			}

			return API.v1.success({
				users,
				total: users.length,
				offset: paginationOffset,
				count: users.length,
			});
		},
	},
);

/**
 * Search for groups only (private groups user has access to)
 */
API.v1.addRoute(
	'search.groups',
	{ authRequired: true },
	{
		async get() {
			const { searchTerm } = (this as any).queryParams;

			if (!searchTerm || searchTerm.trim().length === 0) {
				return API.v1.failure('Search term is required');
			}

			const { offset: paginationOffset, count: paginationCount } = await getPaginationItems((this as any).queryParams);
			const groups = await searchGroups(searchTerm, (this as any).userId, paginationOffset, paginationCount);

			return API.v1.success({
				groups,
				total: groups.length,
				offset: paginationOffset,
				count: groups.length,
			});
		},
	},
);

/**
 * Search for channels only (public channels)
 */
API.v1.addRoute(
	'search.channels',
	{ authRequired: true },
	{
		async get() {
			const { searchTerm } = (this as any).queryParams;

			if (!searchTerm || searchTerm.trim().length === 0) {
				return API.v1.failure('Search term is required');
			}

			const { offset: paginationOffset, count: paginationCount } = await getPaginationItems((this as any).queryParams);
			const channels = await searchChannels(searchTerm, (this as any).userId, paginationOffset, paginationCount);

			return API.v1.success({
				channels,
				total: channels.length,
				offset: paginationOffset,
				count: channels.length,
			});
		},
	},
);

/**
 * Search for rooms (both groups and channels) based on search term
 */
API.v1.addRoute(
	'search.rooms',
	{ authRequired: true },
	{
		async get() {
			const { searchTerm } = (this as any).queryParams;

			if (!searchTerm || searchTerm.trim().length === 0) {
				return API.v1.failure('Search term is required');
			}

			const { offset: paginationOffset, count: paginationCount } = await getPaginationItems((this as any).queryParams);

			// TODO: Temporarily removed tenant filtering
			// const { activeTenant } = await getUserTenantInfo((this as any).userId);
			// if (!activeTenant) {
			// 	return API.v1.success({
			// 		rooms: [],
			// 		total: 0,
			// 		offset: paginationOffset,
			// 		count: 0,
			// 	});
			// }

			// Get user's subscribed rooms (both groups and channels)
			const userSubscriptions = await Subscriptions.findByUserIdAndTypes((this as any).userId, ['p', 'c'], {
				projection: { rid: 1, t: 1 },
			}).toArray();

			const userRoomIds = userSubscriptions.map((sub) => sub.rid);

			if (userRoomIds.length === 0) {
				return API.v1.success({
					rooms: [],
					total: 0,
					offset: paginationOffset,
					count: 0,
				});
			}

			const roomSearchTerm = escapeRegExp(searchTerm.trim());
			const roomQuery = {
				_id: { $in: userRoomIds },
				$or: [{ name: { $regex: roomSearchTerm, $options: 'i' } }, { fname: { $regex: roomSearchTerm, $options: 'i' } }],
				t: { $in: ['p', 'c'] as RoomType[] }, // Both private groups and public channels
				// tenantId: activeTenant, // TODO: Temporarily removed tenant filtering
			};

			const rooms = await Rooms.find(roomQuery, {
				projection: {
					_id: 1,
					name: 1,
					fname: 1,
					t: 1,
					u: 1,
					lastMessage: 1,
					_updatedAt: 1,
					usersCount: 1,
					tenantId: 1,
				},
				sort: { name: 1 },
				limit: paginationCount,
				skip: paginationOffset,
			}).toArray();

			// Compose rooms with last message and add type info
			const composedRooms = await Promise.all(
				rooms.map(async (room) => {
					const composedRoom = await composeRoomWithLastMessage(room, (this as any).userId);
					return {
						...composedRoom,
						type: room.t === 'p' ? ('group' as const) : ('channel' as const),
					};
				}),
			);

			return API.v1.success({
				rooms: composedRooms,
				total: rooms.length,
				offset: paginationOffset,
				count: rooms.length,
			});
		},
	},
);
