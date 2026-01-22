import { InquiryService } from './inquiry.service';
import { SubmitInquiryDto } from './dto/submit-inquiry.dto';
export declare class InquiryController {
    private readonly inquiryService;
    constructor(inquiryService: InquiryService);
    getWebsiteTasks(userId: string): Promise<{
        id: string;
        targetId: string;
        categoryId: string;
        status: string;
        type: "website" | "linkedin";
        createdAt: Date;
    }[]>;
    getLinkedInTasks(userId: string): Promise<{
        id: string;
        targetId: string;
        categoryId: string;
        status: string;
        type: "website" | "linkedin";
        createdAt: Date;
    }[]>;
    takeInquiry(body: {
        targetId: string;
        categoryId: string;
    }, userId: string): Promise<import("./entities/inquiry-task.entity").InquiryTask>;
    submitInquiry(dto: SubmitInquiryDto, file: any, userId: string): Promise<{
        taskId: string;
        actionIndex: number;
        performedByUserId: string;
        status: import("./entities/inquiry-action.entity").InquiryActionStatus.PENDING;
    } & import("./entities/inquiry-action.entity").InquiryAction>;
}
