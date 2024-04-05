import { Body, Controller, Get, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { genStoragePath } from '@/utils/format'
import { TeamEntity } from './dto/team.dto'
import { TeamService } from './team.service'
import type { MemberType } from './interface/team.interface'

@Controller('team')
@ApiTags('Teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly configService: ConfigService
  ) {}

  // 查询团队
  @Get('/getTeamsList')
  getTeamsList(@Req() req: Request) {
    return this.teamService.findTeams(req['user'])
  }

  // 创建团队
  @Post('/createTeam')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: function (req, res, cb) {
          const { diskPath } = genStoragePath(`avatar/${req['user'].username}/logo`)
          cb(null, diskPath)
        },
        filename: function (req, res, cb) {
          cb(null, res.originalname)
        }
      })
    })
  )
  createTeam(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() team: TeamEntity
  ) {
    const user = req['user']
    team.logo = file?.filename
      ? `${this.configService.get('NEST_APP_URL')}/static/avatar/${user.username}/logo/${
          file.filename
        }`
      : `${this.configService.get('NEST_APP_URL')}/static/avatar/avatar_${
          Math.floor(Math.random() * 5) + 1
        }.png`
    return this.teamService.createTeam(req['user'], team)
  }

  // 更新团队【更新团队成员、移交团队所有权等】
  // @Post('updateTeam')
  // updateTeam() {}

  // 注销团队
  // @Post('removeTeam')
  // removeTeam() {}

  // 添加新成员
  @Post('addMember')
  addMember(@Req() req: Request, @Body() data: { teamId: string; member: MemberType }) {
    return this.teamService.addTeamMembers(req['user'], data.teamId, data.member)
  }

  // 查询团队成员
  // @Get('getTeamMembers')
  // getTeamMembers(@Req() req: Request, @Param('teamId') teamId: string) {}

  // 修改成员权限

  // 移除成员
}
