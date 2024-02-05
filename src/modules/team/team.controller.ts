import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { TeamEntity } from './dto/team.dto'
import { TeamService } from './team.service'

@Controller('team')
@ApiTags('team')
export class TeamController {

    constructor(private readonly teamService: TeamService) {}

    // 查询团队
    @Get('getTeamsList')
    getTeamsList(@Req() req: Request) {
        return this.teamService.findTeams(req['user'])
    }

    // 创建团队
    @Post('createTeam')
    createTeam(@Req() req: Request, @Body() team: TeamEntity) {
        return this.teamService.createTeam(req['user'], team)
    }

    // 更新团队【更新团队成员、移交团队所有权等】
    @Post('updateTeam')
    updateTeam() {}

    // 注销团队
    @Post('removeTeam')
    removeTeam() {}

}
