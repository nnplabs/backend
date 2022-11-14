"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDB = void 0;
class AppDB {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getAll(ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.app.findMany({
                where: {
                    ownerAddress: ownerAddress,
                },
                include: this.includeRelations(),
            });
        });
    }
    getById(appId) {
        return __awaiter(this, void 0, void 0, function* () {
            const app = yield this.prisma.app.findUnique({
                where: {
                    id: appId,
                },
                include: this.includeRelations(),
            });
            return app;
        });
    }
    get(appName, ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const app = yield this.prisma.app.findUnique({
                where: {
                    name_ownerAddress: {
                        name: appName,
                        ownerAddress: ownerAddress,
                    },
                },
                include: this.includeRelations(),
            });
            return app;
        });
    }
    create({ name, description, metadata, ownerAddress }) {
        return __awaiter(this, void 0, void 0, function* () {
            const app = yield this.prisma.app.create({
                data: {
                    name: name,
                    description: description,
                    metadata: metadata,
                    ownerAddress: ownerAddress,
                },
                include: this.includeRelations(),
            });
            return app;
        });
    }
    update(appName, ownerAddress, { description, metadata, name }) {
        return __awaiter(this, void 0, void 0, function* () {
            const app = yield this.prisma.app.upsert({
                where: {
                    name_ownerAddress: {
                        name: appName,
                        ownerAddress: ownerAddress,
                    },
                },
                update: {
                    name: name,
                    description: description,
                    metadata: metadata,
                },
                create: {
                    name: name,
                    description: description,
                    metadata: metadata,
                    ownerAddress: ownerAddress,
                },
                include: this.includeRelations(),
            });
            return app;
        });
    }
    delete(appName, ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.app.deleteMany({
                where: {
                    ownerAddress: ownerAddress,
                    name: appName,
                },
            });
        });
    }
    includeRelations(Event = true, Provider = true, User = true) {
        return {
            Event: Event,
            Provider: Provider,
            User: User,
        };
    }
}
exports.AppDB = AppDB;
