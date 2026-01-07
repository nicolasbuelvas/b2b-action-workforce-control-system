import { InquiryService } from './inquiry.service';
import { SubmitInquiryDto } from './dto/submit-inquiry.dto';
export declare class InquiryController {
    private readonly inquiryService;
    constructor(inquiryService: InquiryService);
    takeInquiry(body: {
        targetId: string;
        categoryId: string;
    }, userId: string): Promise<import("./entities/inquiry-task.entity").InquiryTask>;
    submitInquiry(dto: SubmitInquiryDto, file: any, userId: string): Promise<{
        inquiryTaskId: string;
        performedByUserId: string;
        actionType: import("./dto/submit-inquiry.dto").InquiryActionType;
        screenshotHash: string;
    } & import("./entities/inquiry-action.entity").InquiryAction>;
}
