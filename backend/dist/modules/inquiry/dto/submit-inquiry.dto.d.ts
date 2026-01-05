export declare enum InquiryActionType {
    EMAIL = "EMAIL",
    LINKEDIN = "LINKEDIN",
    CALL = "CALL"
}
export declare class SubmitInquiryDto {
    inquiryTaskId: string;
    actionType: InquiryActionType;
}
