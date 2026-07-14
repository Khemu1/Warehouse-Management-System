import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    const canActivate = super.canActivate(context);
    return canActivate;
  }
}
