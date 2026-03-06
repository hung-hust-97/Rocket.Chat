import type { IMessage } from '@rocket.chat/core-typings';
import { Messages, Users } from '@rocket.chat/models';

import { settings } from '../../../settings/server';

const filterStarred = (message: IMessage, uid?: string): IMessage => {
	// if Allow_anonymous_read is enabled, uid will be undefined
	if (!uid) return message;

	// only return starred field if user has it starred
	if (message.starred && Array.isArray(message.starred)) {
		message.starred = message.starred.filter((star) => star._id === uid);
	}
	return message;
};

// TODO: we should let clients get user names on demand instead of doing this

function getNameOfUsername(users: Map<string, string>, username: string): string {
	return users.get(username) || username;
}

export const normalizeMessagesForUser = async (messages: IMessage[], uid?: string): Promise<IMessage[]> => {
	const useRealNames = settings.get('UI_Use_Real_Name');

	const usernames: Set<string> = new Set();
	const anonymousReplyIds: Set<string> = new Set();

	messages.forEach((message) => {
		message = filterStarred(message, uid);

		// Always collect anonymous reply IDs regardless of UI_Use_Real_Name
		if (message.reply?.username === 'anonymous') {
			anonymousReplyIds.add(message.reply._id);
		}

		if (!useRealNames) {
			return;
		}

		if (!message.u?.username) {
			return;
		}
		usernames.add(message.u.username);

		if (message.reply?.username) {
			usernames.add(message.reply.username);
		}

		(message.mentions || []).forEach(({ username }) => {
			if (username) {
				usernames.add(username);
			}
		});

		if (message.reactions) {
			Object.values(message.reactions).forEach((reaction) =>
				reaction.usernames.forEach((username) => usernames.add(username as string))
			);
		}
	});

	const [usersList, anonymousReplies] = await Promise.all([
		useRealNames && usernames.size > 0
			? Users.findUsersByUsernames([...usernames], {
				projection: { username: 1, name: 1 },
			}).toArray()
			: [],
		anonymousReplyIds.size > 0
			? Messages.find({ _id: { $in: [...anonymousReplyIds] } }, { projection: { alias: 1 } }).toArray()
			: [],
	]);

	const names = new Map<string, string>(
		(usersList as { username: string; name: string }[]).map((u) => [u.username, u.name] as [string, string]),
	);
	const anonymousMap = new Map(anonymousReplies.map((m) => [m._id, m.alias]));

	messages.forEach((message: IMessage) => {
		// Always populate alias for anonymous replies, regardless of UI_Use_Real_Name
		if (message.reply?.username === 'anonymous') {
			const alias = anonymousMap.get(message.reply._id);
			if (alias) {
				message.reply.alias = alias;
			}
		}

		if (!useRealNames) {
			return;
		}

		if (!message.u) {
			return;
		}
		message.u.name = getNameOfUsername(names, message.u.username);

		(message.mentions || []).forEach((mention) => {
			if (mention.username) {
				mention.name = getNameOfUsername(names, mention.username);
			}
		});

		if (message.reply) {
			if (message.reply.username) {
				message.reply.name = getNameOfUsername(names, message.reply.username);
			}
		}

		if (message.reactions) {
			Object.values(message.reactions).forEach((reaction) => {
				reaction.names = reaction.usernames.map((username) => getNameOfUsername(names, username));
			});
		}
	});

	return messages;
};
