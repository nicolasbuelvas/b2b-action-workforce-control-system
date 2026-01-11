"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryScopeGuard = void 0;
const common_1 = require("@nestjs/common");
let CategoryScopeGuard = class CategoryScopeGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const categoryId = request.params.categoryId || request.body.category_id;
        if (!categoryId)
            return true;
        const hasAccess = user.roles.some(r => r.category_id === null || r.category_id === categoryId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('Category scope violation');
        }
        return true;
    }
};
exports.CategoryScopeGuard = CategoryScopeGuard;
exports.CategoryScopeGuard = CategoryScopeGuard = __decorate([
    (0, common_1.Injectable)()
], CategoryScopeGuard);
//# sourceMappingURL=category-scope.guard.js.map