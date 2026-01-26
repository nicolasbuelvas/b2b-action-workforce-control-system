import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

/* === CORE MODULES === */
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';

/* === BUSINESS MODULES === */
import { CategoriesModule } from './modules/categories/categories.module';
import { ResearchModule } from './modules/research/research.module';
import { InquiryModule } from './modules/inquiry/inquiry.module';
import { AuditModule } from './modules/audit/audit.module';
import { LinkedInModule } from './modules/linkedin/linkedin.module';

/* === SYSTEM MODULES === */
import { CooldownModule } from './modules/cooldown/cooldown.module';
import { ScreenshotsModule } from './modules/screenshots/screenshots.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { PaymentsModule } from './modules/payments/payments.module';

/* === ADMIN === */
import { AdminModule } from './modules/admin/admin.module';
import { CategoryRulesModule } from './modules/category-rules/category-rules.module';
import { SubAdminModule } from './modules/subadmin/subadmin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'backend',
      autoLoadEntities: true,
      synchronize: false,
    }),

    AuthModule,
    UsersModule,
    RolesModule,

    CategoriesModule,
    ResearchModule,
    InquiryModule,
    AuditModule,
    LinkedInModule,

    CooldownModule,
    ScreenshotsModule,
    MetricsModule,
    PaymentsModule,

    AdminModule,
    CategoryRulesModule,
    SubAdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}