"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const action_entity_1 = require("./action.entity");
const typeorm_2 = require("typeorm");
let ActionsService = class ActionsService {
    constructor(actionRepo) {
        this.actionRepo = actionRepo;
    }
    async getAll() {
        return this.actionRepo.find({ where: { deletedAt: null }, relations: ['inputs', 'evidence', 'approval'] });
    }
    async create(dto) {
        const action = this.actionRepo.create(dto);
        return this.actionRepo.save(action);
    }
    async update(id, dto) {
        await this.actionRepo.update(id, dto);
        return this.actionRepo.findOne({ where: { id }, relations: ['inputs', 'evidence', 'approval'] });
    }
    async enableDisable(id, enabled) {
        await this.actionRepo.update(id, { enabled });
        return this.actionRepo.findOne({ where: { id } });
    }
    async softDelete(id) {
        await this.actionRepo.update(id, { deletedAt: new Date() });
        return { success: true };
    }
};
exports.ActionsService = ActionsService;
exports.ActionsService = ActionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(action_entity_1.Action)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ActionsService);
//# sourceMappingURL=actions.service.js.map