import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CooldownRecord } from './entities/cooldown-record.entity';
import { CooldownService } from './cooldown.service';

@Module({
  imports: [TypeOrmModule.forFeature([CooldownRecord])],
  providers: [CooldownService],
  exports: [CooldownService],
})
export class CooldownModule {}
