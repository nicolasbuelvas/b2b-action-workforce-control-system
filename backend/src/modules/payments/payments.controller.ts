import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreateActionPriceDto } from './dto/create-action-price.dto';
import { UpdateActionPriceDto } from './dto/update-action-price.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Controller('api/payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ========= ACTION PRICING (Super Admin Only) =========

  /**
   * Get all action prices
   * GET /api/payments/prices
   */
  @Get('prices')
  async getActionPrices() {
    return this.paymentsService.getActionPrices();
  }

  /**
   * Get pricing for specific role
   * GET /api/payments/prices?role=website_researcher
   */
  @Get('prices-by-role')
  async getPricesByRole(@Query('role') role: string) {
    return this.paymentsService.getPricesByRole(role);
  }

  /**
   * Create or update action price
   * POST /api/payments/prices
   */
  @Post('prices')
  async createActionPrice(@Body() dto: CreateActionPriceDto) {
    return this.paymentsService.createOrUpdatePrice(dto);
  }

  /**
   * Update action price
   * PATCH /api/payments/prices/:id
   */
  @Patch('prices/:id')
  async updateActionPrice(
    @Param('id') id: string,
    @Body() dto: UpdateActionPriceDto,
  ) {
    return this.paymentsService.updatePrice(id, dto);
  }

  /**
   * Delete action price
   * DELETE /api/payments/prices/:id
   */
  @Delete('prices/:id')
  async deleteActionPrice(@Param('id') id: string) {
    return this.paymentsService.deletePrice(id);
  }

  // ========= PAYMENT RECORDS =========

  /**
   * Get worker's payment summary
   * GET /api/payments/summary/:userId
   */
  @Get('summary/:userId')
  async getPaymentSummary(@Param('userId') userId: string) {
    return this.paymentsService.getWorkerPaymentSummary(userId);
  }

  /**
   * Get worker's payment details
   * GET /api/payments/details/:userId?status=pending
   */
  @Get('details/:userId')
  async getPaymentDetails(
    @Param('userId') userId: string,
    @Query('status') status?: string,
  ) {
    return this.paymentsService.getWorkerPaymentDetails(userId, status as any);
  }

  /**
   * Get all payments (Super Admin)
   * GET /api/payments/all?role=website_researcher&status=pending
   */
  @Get('all')
  async getAllPayments(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.paymentsService.getAllPayments({
      role,
      status: status as any,
      page,
      limit,
    });
  }

  /**
   * Get payment records by user
   * GET /api/payments/records/:userId
   */
  @Get('records/:userId')
  async getPaymentRecords(@Param('userId') userId: string) {
    return this.paymentsService.getPaymentRecords(userId);
  }

  // ========= PAYMENT PROCESSING =========

  /**
   * Approve pending payment
   * PATCH /api/payments/approve/:paymentId
   */
  @Patch('approve/:paymentId')
  async approvePayment(@Param('paymentId') paymentId: string) {
    return this.paymentsService.approvePayment(paymentId);
  }

  /**
   * Process payments (mark as paid)
   * PATCH /api/payments/process
   */
  @Patch('process')
  async processPayments(@Body() dto: ProcessPaymentDto) {
    return this.paymentsService.processPayments(dto.paymentIds);
  }

  /**
   * Reject payment
   * PATCH /api/payments/reject/:paymentId
   */
  @Patch('reject/:paymentId')
  async rejectPayment(@Param('paymentId') paymentId: string) {
    return this.paymentsService.rejectPayment(paymentId);
  }

  // ========= ANALYTICS =========

  /**
   * Get top performers by role
   * GET /api/payments/top-performers?role=website_researcher&category=...
   */
  @Get('top-performers')
  async getTopPerformers(
    @Query('role') role: string,
    @Query('category') category?: string,
  ) {
    return this.paymentsService.getTopPerformers(role, category);
  }

  /**
   * Get earnings by role
   * GET /api/payments/earnings?role=website_researcher
   */
  @Get('earnings')
  async getEarningsByRole(@Query('role') role: string) {
    return this.paymentsService.getEarningsByRole(role);
  }

  /**
   * Get payment statistics
   * GET /api/payments/stats
   */
  @Get('stats')
  async getPaymentStats() {
    return this.paymentsService.getPaymentStats();
  }
}
