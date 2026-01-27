export declare enum InquiryActionType {
    EMAIL = "EMAIL",
    LINKEDIN = "LINKEDIN",
    CALL = "CALL",
    LINKEDIN_OUTREACH = "LINKEDIN_OUTREACH",
    LINKEDIN_EMAIL_REQUEST = "LINKEDIN_EMAIL_REQUEST",
    LINKEDIN_CATALOGUE = "LINKEDIN_CATALOGUE"
}
export declare class SubmitInquiryDto {
    inquiryTaskId: string;
    actionType: InquiryActionType;
}
