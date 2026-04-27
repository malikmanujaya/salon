import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type RequestUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
  salonId: string | null;
  salon: { id: string; name: string; slug: string } | null;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    return request.user;
  },
);
