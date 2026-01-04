import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScreenshotHash } from './entities/screenshot-hash.entity';
import { ScreenshotsService } from './screenshots.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScreenshotHash])],
  providers: [ScreenshotsService],
  exports: [ScreenshotsService],
})
export class ScreenshotsModule {}
