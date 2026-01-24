import { InquiryService } from './inquiry.service';
export declare class InquiryController {
    private readonly inquiryService;
    constructor(inquiryService: InquiryService);
    getWebsiteTasks(userId: string): Promise<any[]>;
    getLinkedInTasks(userId: string): Promise<any[]>;
    takeInquiry(body: {
        inquiryTaskId: string;
    }, userId: string): Promise<import("./entities/inquiry-task.entity").InquiryTask>;
    submitInquiry(body: any, file: any, userId: string): Promise<{
        action: {
            inquiryTaskId: string;
            actionIndex: number;
            performedByUserId: string;
            status: import("./entities/inquiry-action.entity").InquiryActionStatus.PENDING;
        } & import("./entities/inquiry-action.entity").InquiryAction;
        screenshotDuplicate: any;
    }>;
}
