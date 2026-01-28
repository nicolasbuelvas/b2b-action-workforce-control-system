import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

interface UserPayload {
  id?: string;
  userId?: string;
  email: string;
  role?: string;
}

@Controller()
@UseGuards(JwtGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // ========= NOTICES (SubAdmin) =========

  @Post('subadmin/notices')
  async createNotice(@CurrentUser() user: UserPayload, @Body() data: any) {
    const userId = user?.id ?? user?.userId;
    const userRole = user?.role;
    return await this.messagesService.createNotice(userId, data, userRole);
  }

  @Get('subadmin/notices')
  async getSubAdminNotices(
    @CurrentUser() user: UserPayload,
    @Query('categoryId') categoryId?: string,
    @Query('roleId') roleId?: string,
    @Query('search') search?: string,
    @Query('viewMode') viewMode?: 'sent' | 'received',
  ) {
    const userId = user?.id ?? user?.userId;
    const userRole = user?.role;
    return await this.messagesService.getNoticesForSubAdmin(userId, userRole, {
      categoryId,
      roleId,
      search,
      viewMode,
    });
  }

  @Patch('subadmin/notices/:id')
  async updateNotice(
    @CurrentUser() user: UserPayload,
    @Param('id') noticeId: string,
    @Body() data: any
  ) {
    const userId = user?.id ?? user?.userId;
    const userRole = user?.role;
    return await this.messagesService.updateNotice(noticeId, userId, data, userRole);
  }

  @Delete('subadmin/notices/:id')
  async deleteNotice(
    @CurrentUser() user: UserPayload,
    @Param('id') noticeId: string
  ) {
    const userId = user?.id ?? user?.userId;
    const userRole = user?.role;
    return await this.messagesService.deleteNotice(noticeId, userId, userRole);
  }

  // ========= CONVERSATIONS & MESSAGES (SubAdmin) =========

  @Post('subadmin/conversations')
  async createConversation(@CurrentUser() user: UserPayload, @Body() data: any) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.createConversation(userId, data);
  }

  @Get('subadmin/conversations')
  async getSubAdminConversations(@CurrentUser() user: UserPayload) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.getConversationsForUser(userId);
  }

  @Get('subadmin/conversations/:id/messages')
  async getConversationMessages(
    @CurrentUser() user: UserPayload,
    @Param('id') conversationId: string
  ) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.getMessages(conversationId, userId);
  }

  @Post('subadmin/conversations/:id/messages')
  async sendMessageToConversation(
    @CurrentUser() user: UserPayload,
    @Param('id') conversationId: string,
    @Body() data: { messageText: string }
  ) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.sendMessage(userId, conversationId, data.messageText);
  }

  @Patch('subadmin/conversations/:id/read')
  async markConversationRead(
    @CurrentUser() user: UserPayload,
    @Param('id') conversationId: string
  ) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.markMessagesAsRead(conversationId, userId);
  }

  // ========= MESSAGE TEMPLATES (SubAdmin) =========

  @Get('subadmin/templates')
  async getSubAdminTemplates(@CurrentUser() user: UserPayload) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.getTemplates(userId, false);
  }

  @Post('subadmin/templates')
  async createSubAdminTemplate(@CurrentUser() user: UserPayload, @Body() data: any) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.createTemplate(userId, data, false);
  }

  @Patch('subadmin/templates/:id')
  async updateSubAdminTemplate(
    @CurrentUser() user: UserPayload,
    @Param('id') templateId: string,
    @Body() data: any
  ) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.updateTemplate(templateId, userId, data, false);
  }

  @Delete('subadmin/templates/:id')
  async deleteSubAdminTemplate(
    @CurrentUser() user: UserPayload,
    @Param('id') templateId: string
  ) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.deleteTemplate(templateId, userId, false);
  }

  // ========= SUPER ADMIN TEMPLATES =========

  @Get('superadmin/templates')
  async getSuperAdminTemplates(@CurrentUser() user: UserPayload) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.getTemplates(userId, true);
  }

  @Get('roles')
  async getAllRoles() {
    return await this.messagesService.getAllRoles();
  }

  @Get('subadmin/users')
  async getSubAdminUsers(@CurrentUser() user: UserPayload) {
    const userId = user?.id ?? user?.userId;
    const userRole = user?.role;
    return await this.messagesService.getUsersInCategories(userId, userRole);
  }

  @Post('superadmin/templates')
  async createSuperAdminTemplate(@CurrentUser() user: UserPayload, @Body() data: any) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.createTemplate(userId, data, true);
  }

  @Patch('superadmin/templates/:id')
  async updateSuperAdminTemplate(
    @CurrentUser() user: UserPayload,
    @Param('id') templateId: string,
    @Body() data: any
  ) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.updateTemplate(templateId, userId, data, true);
  }

  @Delete('superadmin/templates/:id')
  async deleteSuperAdminTemplate(
    @CurrentUser() user: UserPayload,
    @Param('id') templateId: string
  ) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.deleteTemplate(templateId, userId, true);
  }

  // ========= WORKER ENDPOINTS =========

  @Get(':role/notices')
  async getWorkerNotices(@CurrentUser() user: UserPayload) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.getNoticesForUser(userId);
  }

  @Get(':role/conversations')
  async getWorkerConversations(@CurrentUser() user: UserPayload) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.getConversationsForUser(userId);
  }

  @Get(':role/conversations/:id/messages')
  async getWorkerConversationMessages(
    @CurrentUser() user: UserPayload,
    @Param('id') conversationId: string
  ) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.getMessages(conversationId, userId);
  }

  @Post(':role/conversations/:id/messages')
  async sendWorkerMessage(
    @CurrentUser() user: UserPayload,
    @Param('id') conversationId: string,
    @Body() data: { messageText: string }
  ) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.sendMessage(userId, conversationId, data.messageText);
  }

  @Patch(':role/conversations/:id/read')
  async markWorkerConversationRead(
    @CurrentUser() user: UserPayload,
    @Param('id') conversationId: string
  ) {
    const userId = user?.id ?? user?.userId;
    return await this.messagesService.markMessagesAsRead(conversationId, userId);
  }
}
