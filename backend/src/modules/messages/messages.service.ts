import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notice } from './entities/notice.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { MessageTemplate } from './entities/message-template.entity';
import { UserCategory } from '../categories/entities/user-category.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepo: Repository<Notice>,
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(MessageTemplate)
    private readonly templateRepo: Repository<MessageTemplate>,
    @InjectRepository(UserCategory)
    private readonly userCategoryRepo: Repository<UserCategory>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  // ========= NOTICES =========

  async createNotice(userId: string, data: {
    title: string;
    message: string;
    targetType: string;
    targetRoleIds?: string[];
    targetCategoryIds?: string[];
    targetUserIds?: string[];
    priority?: string;
  }, userRole?: string) {
    // Super admin can send to any category
    if (userRole !== 'super_admin') {
      // Get subadmin's categories to validate access
      const userCategories = await this.userCategoryRepo.find({
        where: { userId },
        select: ['categoryId'],
      });
      const myCategoryIds = userCategories.map(uc => uc.categoryId);

      // If targeting categories, ensure they're in subadmin's scope
      if (data.targetCategoryIds && data.targetCategoryIds.length > 0) {
        const invalidCategories = data.targetCategoryIds.filter(
          catId => !myCategoryIds.includes(catId)
        );
        if (invalidCategories.length > 0) {
          throw new ForbiddenException('Cannot send notice to categories you do not manage');
        }
      }
    }

    const notice = this.noticeRepo.create({
      title: data.title,
      message: data.message,
      createdByUserId: userId,
      targetType: data.targetType,
      targetRoleIds: data.targetRoleIds || [],
      targetCategoryIds: data.targetCategoryIds || [],
      targetUserIds: data.targetUserIds || [],
      priority: data.priority || 'normal',
    });

    const savedNotice = await this.noticeRepo.save(notice);

    // Create read-only message conversations for all recipients
    await this.createNoticeMessages(savedNotice, userId);

    return savedNotice;
  }

  // Create message conversations for notice recipients
  private async createNoticeMessages(notice: Notice, senderId: string) {
    const recipientIds = await this.getNoticeRecipients(notice);
    
    for (const recipientId of recipientIds) {
      // Skip sender
      if (recipientId === senderId) continue;

      // Create or find conversation
      const existingConv = await this.conversationRepo
        .createQueryBuilder('conv')
        .where(':senderId = ANY(conv.participant_user_ids)', { senderId })
        .andWhere(':recipientId = ANY(conv.participant_user_ids)', { recipientId })
        .andWhere('array_length(conv.participant_user_ids, 1) = 2')
        .getOne();

      let conversation;
      if (existingConv) {
        conversation = existingConv;
      } else {
        conversation = this.conversationRepo.create({
          createdByUserId: senderId,
          participantUserIds: [senderId, recipientId],
          subject: `Notice: ${notice.title}`,
        });
        conversation = await this.conversationRepo.save(conversation);
      }

      // Create message
      const message = this.messageRepo.create({
        conversationId: conversation.id,
        senderUserId: senderId,
        messageText: `📢 NOTICE: ${notice.title}\n\n${notice.message}`,
        isRead: false,
        metadata: { noticeId: notice.id, isNotice: true },
      });
      await this.messageRepo.save(message);
    }
  }

  // Get all user IDs who should receive this notice
  private async getNoticeRecipients(notice: Notice): Promise<string[]> {
    const recipientIds = new Set<string>();

    if (notice.targetType === 'ALL') {
      const allUsers = await this.userRepo.find({ select: ['id'] });
      allUsers.forEach(u => recipientIds.add(u.id));
      return Array.from(recipientIds);
    }

    if (notice.targetType === 'USER' && notice.targetUserIds?.length > 0) {
      notice.targetUserIds.forEach(id => recipientIds.add(id));
    }

    if (notice.targetType === 'ROLE' && notice.targetRoleIds?.length > 0) {
      const userRoles = await this.userRoleRepo.find({
        where: { roleId: In(notice.targetRoleIds) },
        select: ['userId'],
      });
      userRoles.forEach(ur => recipientIds.add(ur.userId));
    }

    if (notice.targetType === 'CATEGORY' && notice.targetCategoryIds?.length > 0) {
      // Get all users in these categories (including subadmins)
      const userCategories = await this.userCategoryRepo.find({
        where: { categoryId: In(notice.targetCategoryIds) },
        select: ['userId'],
      });
      userCategories.forEach(uc => recipientIds.add(uc.userId));
    }

    return Array.from(recipientIds);
  }

  async getNoticesForSubAdmin(userId: string, userRole?: string, filters?: {
    categoryId?: string;
    roleId?: string;
    search?: string;
    viewMode?: 'sent' | 'received';
  }) {
    // Super admin sees ALL notices (can filter by category/role)
    if (userRole === 'super_admin') {
      const queryBuilder = this.noticeRepo.createQueryBuilder('notice');
      
      if (filters?.viewMode === 'sent') {
        queryBuilder.where('notice.created_by_user_id = :userId', { userId });
      }
      
      if (filters?.categoryId) {
        queryBuilder.andWhere(':categoryId = ANY(notice.target_category_ids)', { categoryId: filters.categoryId });
      }
      
      if (filters?.roleId) {
        queryBuilder.andWhere(':roleId = ANY(notice.target_role_ids)', { roleId: filters.roleId });
      }
      
      if (filters?.search) {
        queryBuilder.andWhere(
          '(notice.title ILIKE :search OR notice.message ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }
      
      queryBuilder.orderBy('notice.created_at', 'DESC');
      return await queryBuilder.getMany();
    }
    
    // Sub admin sees:
    // 1. Notices they created (sent)
    // 2. Notices sent to their categories (received)
    // 3. Notices sent to their role (received)
    // 4. Notices sent to them specifically (received)
    
    if (filters?.viewMode === 'sent') {
      // Only show notices they created
      const queryBuilder = this.noticeRepo.createQueryBuilder('notice')
        .where('notice.created_by_user_id = :userId', { userId });
      
      if (filters?.search) {
        queryBuilder.andWhere(
          '(notice.title ILIKE :search OR notice.message ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }
      
      queryBuilder.orderBy('notice.created_at', 'DESC');
      return await queryBuilder.getMany();
    }
    
    // Received mode: Get user's categories and roles
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });
    const categoryIds = userCategories.map(uc => uc.categoryId);
    
    const userRoles = await this.userRoleRepo.find({
      where: { userId },
      select: ['roleId'],
    });
    const roleIds = userRoles.map(ur => ur.roleId);
    
    const queryBuilder = this.noticeRepo.createQueryBuilder('notice')
      .where('notice.target_type = :all', { all: 'ALL' })
      .orWhere('notice.target_type = :user AND :userId = ANY(notice.target_user_ids)', { user: 'USER', userId });
    
    if (roleIds.length > 0) {
      queryBuilder.orWhere('notice.target_type = :role AND notice.target_role_ids && :roleIds', { 
        role: 'ROLE', 
        roleIds 
      });
    }
    
    if (categoryIds.length > 0) {
      queryBuilder.orWhere(
        'notice.target_type = :category AND notice.target_category_ids && :categoryIds',
        { category: 'CATEGORY', categoryIds }
      );
    }
    
    if (filters?.categoryId && categoryIds.includes(filters.categoryId)) {
      queryBuilder.andWhere(':filterCategoryId = ANY(notice.target_category_ids)', { 
        filterCategoryId: filters.categoryId 
      });
    }
    
    if (filters?.search) {
      queryBuilder.andWhere(
        '(notice.title ILIKE :search OR notice.message ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
    
    queryBuilder.orderBy('notice.created_at', 'DESC');
    return await queryBuilder.getMany();
  }

  async updateNotice(noticeId: string, userId: string, data: Partial<{
    title: string;
    message: string;
    targetType: string;
    targetRoleIds: string[];
    targetCategoryIds: string[];
    targetUserIds: string[];
    priority: string;
    isActive: boolean;
  }>, userRole?: string) {
    // Super admin can edit any notice
    let notice;
    if (userRole === 'super_admin') {
      notice = await this.noticeRepo.findOne({ where: { id: noticeId } });
    } else {
      notice = await this.noticeRepo.findOne({
        where: { id: noticeId, createdByUserId: userId },
      });
    }

    if (!notice) {
      throw new ForbiddenException('Notice not found or you do not have permission to edit it');
    }

    // If updating categories, validate access (skip for super_admin)
    if (data.targetCategoryIds && userRole !== 'super_admin') {
      const userCategories = await this.userCategoryRepo.find({
        where: { userId },
        select: ['categoryId'],
      });
      const myCategoryIds = userCategories.map(uc => uc.categoryId);

      const invalidCategories = data.targetCategoryIds.filter(
        catId => !myCategoryIds.includes(catId)
      );
      if (invalidCategories.length > 0) {
        throw new ForbiddenException('Cannot target categories you do not manage');
      }
    }

    Object.assign(notice, data);
    return await this.noticeRepo.save(notice);
  }

  async deleteNotice(noticeId: string, userId: string, userRole?: string) {
    // Super admin can delete any notice
    let notice;
    if (userRole === 'super_admin') {
      notice = await this.noticeRepo.findOne({ where: { id: noticeId } });
    } else {
      notice = await this.noticeRepo.findOne({
        where: { id: noticeId, createdByUserId: userId },
      });
    }

    if (!notice) {
      throw new ForbiddenException('Notice not found or you do not have permission to delete it');
    }

    await this.noticeRepo.remove(notice);
    return { success: true, message: 'Notice deleted successfully' };
  }

  async getNoticesForUser(userId: string) {
    // Get user's roles and categories
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      return [];
    }

    const roleIds = user.roles.map(r => r.id);

    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });
    const categoryIds = userCategories.map(uc => uc.categoryId);

    // Find notices that target this user
    const notices = await this.noticeRepo
      .createQueryBuilder('notice')
      .where('notice.isActive = :active', { active: true })
      .andWhere(
        `(
          notice.targetType = 'ALL' 
          OR (notice.targetType = 'USER' AND :userId = ANY(notice.targetUserIds))
          OR (notice.targetType = 'ROLE' AND notice.targetRoleIds && notice.targetRoleIds::uuid[] && :roleIds::uuid[]
)
          OR (notice.targetType = 'CATEGORY' AND notice.targetCategoryIds && notice.targetCategoryIds::uuid[] && :categoryIds::uuid[])
        )`,
        { userId, roleIds, categoryIds }
      )
      .orderBy('notice.createdAt', 'DESC')
      .getMany();

    return notices;
  }

  // ========= CONVERSATIONS & MESSAGES =========

  async createConversation(userId: string, data: {
    participantUserIds: string[];
    subject?: string;
    initialMessage?: string;
  }) {
    const conversation = this.conversationRepo.create({
      createdByUserId: userId,
      participantUserIds: [userId, ...data.participantUserIds],
      subject: data.subject,
    });

    const saved = await this.conversationRepo.save(conversation);

    if (data.initialMessage) {
      await this.sendMessage(userId, saved.id, data.initialMessage);
    }

    return saved;
  }

  async getConversationsForUser(userId: string) {
    const conversations = await this.conversationRepo
      .createQueryBuilder('conv')
      .where(':userId = ANY(conv.participantUserIds)', { userId })
      .orderBy('conv.updatedAt', 'DESC')
      .getMany();

    // Enrich with last message and participant names
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await this.messageRepo.findOne({
          where: { conversationId: conv.id },
          order: { createdAt: 'DESC' },
        });

        const participants = await this.userRepo.find({
          where: { id: In(conv.participantUserIds) },
          select: ['id', 'name', 'email'],
        });

        const unreadCount = await this.messageRepo.count({
          where: {
            conversationId: conv.id,
            isRead: false,
            senderUserId: In(conv.participantUserIds.filter(id => id !== userId)),
          },
        });

        return {
          ...conv,
          lastMessage: lastMessage?.messageText || '',
          lastMessageAt: lastMessage?.createdAt || conv.createdAt,
          participants,
          unreadCount,
        };
      })
    );

    return enriched;
  }

  async getMessages(conversationId: string, userId: string) {
    // Verify user is participant
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation || !conversation.participantUserIds.includes(userId)) {
      throw new ForbiddenException('Not a participant in this conversation');
    }

    const messages = await this.messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    // Get sender names
    const senderIds = [...new Set(messages.map(m => m.senderUserId))];
    const senders = await this.userRepo.find({
      where: { id: In(senderIds) },
      select: ['id', 'name'],
    });

    const senderMap = new Map(senders.map(s => [s.id, s.name]));

    return messages.map(m => ({
      ...m,
      senderName: senderMap.get(m.senderUserId) || 'Unknown',
    }));
  }

  async sendMessage(userId: string, conversationId: string, messageText: string) {
    // Verify user is participant
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation || !conversation.participantUserIds.includes(userId)) {
      throw new ForbiddenException('Not a participant in this conversation');
    }

    const message = this.messageRepo.create({
      conversationId,
      senderUserId: userId,
      messageText,
    });

    // Update conversation timestamp
    await this.conversationRepo.update(conversationId, {
      updatedAt: new Date(),
    });

    return await this.messageRepo.save(message);
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation || !conversation.participantUserIds.includes(userId)) {
      throw new ForbiddenException('Not a participant in this conversation');
    }

    await this.messageRepo
      .createQueryBuilder()
      .update()
      .set({ isRead: true })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('senderUserId != :userId', { userId })
      .execute();

    return { success: true };
  }

  // ========= MESSAGE TEMPLATES =========

  async getTemplates(userId: string, isSuperAdmin: boolean = false) {
    if (isSuperAdmin) {
      return await this.templateRepo.find({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
      });
    }

    // SubAdmin: only templates for their categories
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });
    const categoryIds = userCategories.map(uc => uc.categoryId);

    const templates = await this.templateRepo
      .createQueryBuilder('template')
      .where('template.isActive = :active', { active: true })
      .andWhere(
        '(template.categoryIds IS NULL OR template.categoryIds && :categoryIds)',
        { categoryIds }
      )
      .orderBy('template.createdAt', 'DESC')
      .getMany();

    return templates;
  }

  async createTemplate(userId: string, data: {
    title: string;
    body: string;
    categoryIds?: string[];
  }, isSuperAdmin: boolean = false) {
    if (!isSuperAdmin && data.categoryIds) {
      // Validate subadmin has access to these categories
      const userCategories = await this.userCategoryRepo.find({
        where: { userId },
        select: ['categoryId'],
      });
      const myCategoryIds = userCategories.map(uc => uc.categoryId);

      const invalidCategories = data.categoryIds.filter(
        catId => !myCategoryIds.includes(catId)
      );

      if (invalidCategories.length > 0) {
        throw new ForbiddenException('Cannot create template for categories you do not manage');
      }
    }

    const template = this.templateRepo.create({
      title: data.title,
      body: data.body,
      categoryIds: data.categoryIds || [],
      createdByUserId: userId,
    });

    return await this.templateRepo.save(template);
  }

  async updateTemplate(
    templateId: string,
    userId: string,
    data: { title?: string; body?: string; categoryIds?: string[] },
    isSuperAdmin: boolean = false
  ) {
    const template = await this.templateRepo.findOne({ where: { id: templateId } });

    if (!template) {
      throw new BadRequestException('Template not found');
    }

    if (!isSuperAdmin) {
      // Verify subadmin created this template or it's in their categories
      const userCategories = await this.userCategoryRepo.find({
        where: { userId },
        select: ['categoryId'],
      });
      const myCategoryIds = userCategories.map(uc => uc.categoryId);

      const hasAccess = 
        template.createdByUserId === userId ||
        template.categoryIds.some(catId => myCategoryIds.includes(catId));

      if (!hasAccess) {
        throw new ForbiddenException('Cannot modify this template');
      }
    }

    Object.assign(template, data);
    return await this.templateRepo.save(template);
  }

  async deleteTemplate(templateId: string, userId: string, isSuperAdmin: boolean = false) {
    const template = await this.templateRepo.findOne({ where: { id: templateId } });

    if (!template) {
      throw new BadRequestException('Template not found');
    }

    if (!isSuperAdmin) {
      const userCategories = await this.userCategoryRepo.find({
        where: { userId },
        select: ['categoryId'],
      });
      const myCategoryIds = userCategories.map(uc => uc.categoryId);

      const hasAccess = 
        template.createdByUserId === userId ||
        template.categoryIds.some(catId => myCategoryIds.includes(catId));

      if (!hasAccess) {
        throw new ForbiddenException('Cannot delete this template');
      }
    }

    await this.templateRepo.update(templateId, { isActive: false });
    return { success: true, message: 'Template deleted' };
  }

  // ========= HELPER ENDPOINTS =========

  async getAllRoles() {
    return await this.roleRepo.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async getUsersInCategories(userId: string, userRole?: string) {
    // Super admin sees ALL users
    if (userRole === 'super_admin') {
      const allUsers = await this.userRepo.find({
        select: ['id', 'email', 'name'],
      });
      return allUsers.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name || u.email,
      })).sort((a, b) => a.name.localeCompare(b.name));
    }

    // Sub admin sees users in their categories + all super admins
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    if (userCategories.length === 0) {
      return [];
    }

    const categoryIds = userCategories.map(uc => uc.categoryId);

    const usersInCategories = await this.userCategoryRepo.find({
      where: { categoryId: In(categoryIds) },
      relations: ['user'],
    });

    // Deduplicate users
    const userMap = new Map();
    usersInCategories.forEach(uc => {
      if (uc.user && !userMap.has(uc.user.id)) {
        userMap.set(uc.user.id, {
          id: uc.user.id,
          email: uc.user.email,
          name: uc.user.name || uc.user.email,
        });
      }
    });

    // Also add all super admins so subadmin can message them
    const superAdminRole = await this.roleRepo.findOne({
      where: { name: 'super_admin' },
    });

    if (superAdminRole) {
      const superAdminUserRoles = await this.userRoleRepo.find({
        where: { roleId: superAdminRole.id },
        select: ['userId'],
      });

      const superAdminUserIds = superAdminUserRoles.map(ur => ur.userId);
      
      if (superAdminUserIds.length > 0) {
        const superAdmins = await this.userRepo.find({
          where: { id: In(superAdminUserIds) },
          select: ['id', 'email', 'name'],
        });

        superAdmins.forEach(sa => {
          if (!userMap.has(sa.id)) {
            userMap.set(sa.id, {
              id: sa.id,
              email: sa.email,
              name: sa.name || sa.email,
            });
          }
        });
      }
    }

    return Array.from(userMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }
}
