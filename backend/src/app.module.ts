import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

/* === CORE MODULES === */
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';

/* === BUSINESS MODULES === */
import { CategoriesModule } from './categories/categories.module';
import { ResearchModule } from './research/research.module';
import { InquiryModule } from './inquiry/inquiry.module';
import { AuditModule } from './audit/audit.module';

/* === SYSTEM MODULES === */
import { CooldownModule } from './cooldown/cooldown.module';
import { ScreenshotsModule } from './screenshots/screenshots.module';
import { MetricsModule } from './metrics/metrics.module';
import { PaymentsModule } from './payments/payments.module';

/* === ADMIN === */
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'backend',
      autoLoadEntities: true,
      synchronize: true, // ⚠️ SOLO LOCAL – fase 2
    }),

    /* Core */
    AuthModule,
    UsersModule,
    RolesModule,

    /* Business */
    CategoriesModule,
    ResearchModule,
    InquiryModule,
    AuditModule,

    /* System */
    CooldownModule,
    ScreenshotsModule,
    MetricsModule,
    PaymentsModule,

    /* Admin */
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}