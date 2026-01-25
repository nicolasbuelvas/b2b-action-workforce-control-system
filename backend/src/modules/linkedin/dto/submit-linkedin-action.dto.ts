export class SubmitLinkedInActionDto {
  messageContent: string;
  emailProvided?: boolean;
  emailValue?: string;
  screenshotFile?: Buffer;
}
