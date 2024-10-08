import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '@/decorator/Roles'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取当前上下文守卫的 controller 或 service 的所有关于用户角色的元数据
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    if (!requiredRoles || !requiredRoles.length || (requiredRoles && requiredRoles[0] === '*')) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    console.log(requiredRoles, user.role)
    return requiredRoles.includes(user.role)
  }
}
