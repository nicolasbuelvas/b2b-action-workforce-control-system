import { ResearchTask } from './research-task.entity';
export declare class ResearchSubmission {
    id: string;
    researchTaskId: string;
    researchTask: ResearchTask;
    language: string;
    contactName?: string;
    contactLinkedinUrl?: string;
    country?: string;
    email: string;
    phone: string;
    techStack: string;
    notes: string;
    screenshotPath: string;
    createdAt: Date;
}
