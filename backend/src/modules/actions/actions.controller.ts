import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ActionsService } from './actions.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('actions')
@UseGuards(JwtGuard, RolesGuard)
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  getAll() {
    return this.actionsService.getAll();
  }

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() dto: any) {
    return this.actionsService.create(dto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.actionsService.update(id, dto);
  }

  @Patch(':id/enable')
  @Roles('SUPER_ADMIN')
  enableDisable(@Param('id') id: string, @Body() body: { enabled: boolean }) {
    return this.actionsService.enableDisable(id, body.enabled);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  softDelete(@Param('id') id: string) {
    return this.actionsService.softDelete(id);
  }
}
