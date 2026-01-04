import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class CategoryScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const categoryId = request.params.categoryId || request.body.category_id;

    if (!categoryId) return true;

    const hasAccess = user.roles.some(
      r => r.category_id === null || r.category_id === categoryId,
    );

    if (!hasAccess) {
      throw new ForbiddenException('Category scope violation');
    }

    return true;
  }
}