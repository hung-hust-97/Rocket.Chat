"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomRead = void 0;
const RoomBridge_1 = require("../bridges/RoomBridge");
class RoomRead {
    constructor(roomBridge, appId) {
        this.roomBridge = roomBridge;
        this.appId = appId;
    }
    getById(id) {
        return this.roomBridge.doGetById(id, this.appId);
    }
    getCreatorUserById(id) {
        return this.roomBridge.doGetCreatorById(id, this.appId);
    }
    getByName(name) {
        return this.roomBridge.doGetByName(name, this.appId);
    }
    getCreatorUserByName(name) {
        return this.roomBridge.doGetCreatorByName(name, this.appId);
    }
    getMessages(roomId, options = {}) {
        var _a;
        if (typeof options.limit !== 'undefined' && (!Number.isFinite(options.limit) || options.limit > 100)) {
            throw new Error(`Invalid limit provided. Expected number <= 100, got ${options.limit}`);
        }
        (_a = options.limit) !== null && _a !== void 0 ? _a : (options.limit = 100);
        if (options.sort) {
            this.validateSort(options.sort);
        }
        return this.roomBridge.doGetMessages(roomId, options, this.appId);
    }
    getMembers(roomId) {
        return this.roomBridge.doGetMembers(roomId, this.appId);
    }
    getDirectByUsernames(usernames) {
        return this.roomBridge.doGetDirectByUsernames(usernames, this.appId);
    }
    getModerators(roomId) {
        return this.roomBridge.doGetModerators(roomId, this.appId);
    }
    getOwners(roomId) {
        return this.roomBridge.doGetOwners(roomId, this.appId);
    }
    getLeaders(roomId) {
        return this.roomBridge.doGetLeaders(roomId, this.appId);
    }
    // If there are any invalid fields or values, throw
    validateSort(sort) {
        Object.entries(sort).forEach(([key, value]) => {
            if (!RoomBridge_1.GetMessagesSortableFields.includes(key)) {
                throw new Error(`Invalid key "${key}" used in sort. Available keys for sorting are ${RoomBridge_1.GetMessagesSortableFields.join(', ')}`);
            }
            if (value !== 'asc' && value !== 'desc') {
                throw new Error(`Invalid sort direction for field "${key}". Expected "asc" or "desc", got ${value}`);
            }
        });
    }
}
exports.RoomRead = RoomRead;

//# sourceMappingURL=RoomRead.js.map
