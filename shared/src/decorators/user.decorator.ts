import { JwtPayload, RequestWithUser } from "../types";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtPayload => {
    return ctx.switchToHttp().getRequest<RequestWithUser>().user;
  },
);
