import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LinkedInResearchTask,
  LinkedInResearchStatus,
} from '../entities/linkedin-research-task.entity';
import { LinkedInResearchSubmission } from '../entities/linkedin-research-submission.entity';
import { CreateLinkedInResearchDto } from '../dto/create-linkedin-research.dto';

@Injectable()
export class LinkedInResearchService {
  constructor(
    @InjectRepository(LinkedInResearchTask)
    private readonly taskRepo: Repository<LinkedInResearchTask>,

    @InjectRepository(LinkedInResearchSubmission)
    private readonly submissionRepo: Repository<LinkedInResearchSubmission>,
  ) {}

  async getWebsiteTasks(userId: string): Promise<LinkedInResearchTask[]> {
    return this.taskRepo.find({
      where: [
        {
          assignedToUserId: userId,
          status: LinkedInResearchStatus.PENDING,
        },
        {
          assignedToUserId: userId,
          status: LinkedInResearchStatus.IN_PROGRESS,
        },
      ],
    });
  }

  async claimTask(taskId: string, userId: string): Promise<LinkedInResearchTask> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });

    if (!task) {
      throw new BadRequestException('Research task not found');
    }

    if (task.assignedToUserId && task.assignedToUserId !== userId) {
      throw new BadRequestException('Task is already assigned to another user');
    }

    task.assignedToUserId = userId;
    task.status = LinkedInResearchStatus.IN_PROGRESS;

    return this.taskRepo.save(task);
  }

  async submitResearch(
    taskId: string,
    userId: string,
    dto: CreateLinkedInResearchDto,
  ): Promise<LinkedInResearchSubmission> {
    // Validate input
    if (!dto.contactName || !dto.contactName.trim()) {
      throw new BadRequestException('Contact name is required');
    }

    if (!dto.linkedinProfileUrl || !dto.linkedinProfileUrl.trim()) {
      throw new BadRequestException('LinkedIn profile URL is required');
    }

    if (!dto.country || !dto.country.trim()) {
      throw new BadRequestException('Country is required');
    }

    if (!dto.language || !dto.language.trim()) {
      throw new BadRequestException('Language is required');
    }

    // Verify task exists and is assigned to user
    const task = await this.taskRepo.findOne({ where: { id: taskId } });

    if (!task) {
      throw new BadRequestException('Research task not found');
    }

    if (task.assignedToUserId !== userId) {
      throw new BadRequestException('This task is not assigned to you');
    }

    if (task.status !== LinkedInResearchStatus.IN_PROGRESS) {
      throw new BadRequestException('Task is not in progress');
    }

    // Create submission
    const submission = this.submissionRepo.create({
      researchTaskId: taskId,
      contactName: dto.contactName.trim(),
      linkedinProfileUrl: dto.linkedinProfileUrl.trim(),
      country: dto.country.trim(),
      language: dto.language.trim(),
      notes: dto.notes?.trim() || null,
    });

    await this.submissionRepo.save(submission);

    // Mark task as submitted
    task.status = LinkedInResearchStatus.SUBMITTED;
    await this.taskRepo.save(task);

    return submission;
  }
}
