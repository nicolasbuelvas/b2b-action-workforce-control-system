"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategoryRuleDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_category_rule_dto_1 = require("./create-category-rule.dto");
class UpdateCategoryRuleDto extends (0, mapped_types_1.PartialType)(create_category_rule_dto_1.CreateCategoryRuleDto) {
}
exports.UpdateCategoryRuleDto = UpdateCategoryRuleDto;
//# sourceMappingURL=update-category-rule.dto.js.map