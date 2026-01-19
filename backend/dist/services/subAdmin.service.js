"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubAdminService = void 0;
const common_1 = require("@nestjs/common");
let SubAdminService = class SubAdminService {
    async getDashboard(query, user) {
        return {};
    }
    async getCategories(user) {
        return [];
    }
    async getCategoryRules(categoryId, user) {
        return {};
    }
    async updateCategoryRules(categoryId, body, user) {
        return {};
    }
    async getPerformance(categoryId, query, user) {
        return {};
    }
    async getAlerts(query, user) {
        return [];
    }
    async getLogs(query, user) {
        return { logs: [], total: 0 };
    }
    async flagAction(body, user) {
        return { success: true };
    }
};
exports.SubAdminService = SubAdminService;
exports.SubAdminService = SubAdminService = __decorate([
    (0, common_1.Injectable)()
], SubAdminService);
//# sourceMappingURL=subAdmin.service.js.map