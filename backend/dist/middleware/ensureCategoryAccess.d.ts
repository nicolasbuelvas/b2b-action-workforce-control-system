import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class EnsureCategoryAccess implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
