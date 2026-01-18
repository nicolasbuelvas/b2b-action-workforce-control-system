import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryRule, RuleStatus } from './entities/category-rule.entity';
import { CreateCategoryRuleDto } from './dto/create-category-rule.dto';
import { UpdateCategoryRuleDto } from './dto/update-category-rule.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class CategoryRulesService {
  constructor(
    @InjectRepository(CategoryRule)
    private readonly categoryRuleRepo: Repository<CategoryRule>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll() {
    await this.seedInitialRules();
    return this.categoryRuleRepo.find({
      relations: ['category'],
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const rule = await this.categoryRuleRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!rule) {
      throw new NotFoundException('Category rule not found');
    }
    return rule;
  }

  async create(dto: CreateCategoryRuleDto) {
    const rule = this.categoryRuleRepo.create(dto);
    return this.categoryRuleRepo.save(rule);
  }

  async update(id: string, dto: UpdateCategoryRuleDto) {
    const rule = await this.findOne(id);
    Object.assign(rule, dto);
    return this.categoryRuleRepo.save(rule);
  }

  async remove(id: string) {
    const rule = await this.findOne(id);
    return this.categoryRuleRepo.remove(rule);
  }

  async toggleStatus(id: string) {
    const rule = await this.findOne(id);
    rule.status = rule.status === RuleStatus.ACTIVE ? RuleStatus.INACTIVE : RuleStatus.ACTIVE;
    return this.categoryRuleRepo.save(rule);
  }

  async seedInitialRules() {
    const categories = await this.categoryRepo.find();
    const rulesToCreate: Partial<CategoryRule>[] = [];

    for (const category of categories) {
      const existingRulesForCategory = await this.categoryRuleRepo.count({
        where: { categoryId: category.id },
      });
      if (existingRulesForCategory > 0) continue;

      // Researcher rules
      rulesToCreate.push({
        categoryId: category.id,
        actionType: 'Website Research',
        role: 'Researcher',
        requiredActions: 1,
        screenshotRequired: false,
        status: RuleStatus.ACTIVE,
        priority: 0,
      });
      rulesToCreate.push({
        categoryId: category.id,
        actionType: 'LinkedIn Research',
        role: 'Researcher',
        requiredActions: 1,
        screenshotRequired: false,
        status: RuleStatus.ACTIVE,
        priority: 0,
      });

      // Inquirer rules
      rulesToCreate.push({
        categoryId: category.id,
        actionType: 'Website Inquiry',
        role: 'Inquirer',
        requiredActions: 1,
        screenshotRequired: true,
        status: RuleStatus.ACTIVE,
        priority: 0,
      });
      rulesToCreate.push({
        categoryId: category.id,
        actionType: 'LinkedIn Inquiry',
        role: 'Inquirer',
        requiredActions: 3,
        screenshotRequired: true,
        status: RuleStatus.ACTIVE,
        priority: 0,
      });

      // Auditor rules
      rulesToCreate.push({
        categoryId: category.id,
        actionType: 'Website Review',
        role: 'Auditor',
        requiredActions: 1,
        screenshotRequired: false,
        status: RuleStatus.ACTIVE,
        priority: 0,
      });
      rulesToCreate.push({
        categoryId: category.id,
        actionType: 'LinkedIn Review',
        role: 'Auditor',
        requiredActions: 1,
        screenshotRequired: false,
        status: RuleStatus.ACTIVE,
        priority: 0,
      });
    }

    await this.categoryRuleRepo.save(rulesToCreate);
  }

  async getEffectiveConfig(categoryId: string, actionType: string, role: string) {
    const rules = await this.getApplicableRules(categoryId, actionType, role);
    
    // Get category defaults (assuming category has config)
    // This would need to be injected or passed
    // For now, return the highest priority rule overrides
    const effective = {
      dailyLimit: null as number | null,
      cooldownDays: null as number | null,
      requiredActions: 1,
      screenshotRequired: false,
    };

    if (rules.length > 0) {
      const rule = rules[0]; // Highest priority
      effective.dailyLimit = rule.dailyLimitOverride;
      effective.cooldownDays = rule.cooldownDaysOverride;
      effective.requiredActions = rule.requiredActions;
      effective.screenshotRequired = rule.screenshotRequired;
    }

    return effective;
  }

  // Rule evaluation logic
  async getApplicableRules(categoryId: string, actionType: string, role: string) {
    return this.categoryRuleRepo.find({
      where: {
        categoryId,
        actionType,
        role,
        status: RuleStatus.ACTIVE,
      },
      order: { priority: 'DESC' },
    });
  }
}