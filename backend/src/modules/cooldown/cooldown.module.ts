import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CooldownRecord } from './entities/cooldown-record.entity';
import { CooldownService } from './cooldown.service';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CooldownRecord]),
    CategoriesModule,
  ],
  providers: [CooldownService],
  exports: [CooldownService],
})
export class CooldownModule {}