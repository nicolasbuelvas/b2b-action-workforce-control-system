import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScreenshotHash } from './entities/screenshot-hash.entity';
import { Screenshot } from './entities/screenshot.entity';
import { ScreenshotsService } from './screenshots.service';
import { ScreenshotsController } from './screenshots.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ScreenshotHash, Screenshot])],
  controllers: [ScreenshotsController],
  providers: [ScreenshotsService],
  exports: [ScreenshotsService],
})
export class ScreenshotsModule {}