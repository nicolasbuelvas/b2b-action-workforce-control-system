import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Action } from './action.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ActionsService {
  constructor(
    @InjectRepository(Action)
    private readonly actionRepo: Repository<Action>,
  ) {}

  async getAll() {
    return this.actionRepo.find({ where: { deletedAt: null }, relations: ['inputs', 'evidence', 'approval'] });
  }

  async create(dto: any) {
    const action = this.actionRepo.create(dto);
    return this.actionRepo.save(action);
  }

  async update(id: string, dto: any) {
    await this.actionRepo.update(id, dto);
    return this.actionRepo.findOne({ where: { id }, relations: ['inputs', 'evidence', 'approval'] });
  }

  async enableDisable(id: string, enabled: boolean) {
    await this.actionRepo.update(id, { enabled });
    return this.actionRepo.findOne({ where: { id } });
  }

  async softDelete(id: string) {
    await this.actionRepo.update(id, { deletedAt: new Date() });
    return { success: true };
  }
}
