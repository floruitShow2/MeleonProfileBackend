import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { UserTokenEntity } from '../user/dto/user.dto'
import { TeamEntity, type TaskType } from './dto/team.dto'
import { ApiResponse } from '@/interface/response.interface'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'
import { LoggerService } from '../logger/logger.service'
import { InjectModel } from '@nestjs/mongoose'
import { formatToDateTime } from '@/utils/time'
import { TaskEntity } from '../task/dto/task.dto'

@Injectable()
export class TeamService {
    private response: ApiResponse

    constructor(
        @InjectModel(TeamEntity.name) private readonly teamModel: Model<TeamEntity>,
        private readonly logger: LoggerService
    ) {}

    private async findTeamByName(teamName: string, userId: string, needAll = true) {
        try {
            const res: TeamEntity[] = await this.teamModel.aggregate([
                {
                    $match: {
                        $and: [
                            { teamName },
                            { creator: userId }
                        ]
                    }
                },
                {
                    $addFields: {
                        teamId: { $toString: '$_id' }
                    }
                },
                needAll
                    ? {
                        $project: {
                            _id: 0,
                            __v: 0
                        }
                    }
                    : {
                        $project: {
                            _id: 0,
                            __v: 0
                        }
                    }
            ])
            return res ?? []
        } catch {
            return []
        }
    }

    // 创建团队
    async createTeam(user: UserTokenEntity, team: TeamEntity) {
        const { userId, username } = user

        // 如果创建同名任务，则返回失败信息
        const teams = await this.findTeamByName(team.teamName, userId)
        if (teams && teams.length) {
            this.response = getFailResponse(`你已经创建过团队“${team.teamName}”`, null)
            this.logger.error('/team/createTeam', `${username}创建重复团队，取消创建`)
            return this.response
        }

        // 创建时仅会传递 teamEntity 的部分参数，需要补全
        team.creator = userId
        team.createTime = formatToDateTime(new Date())
        console.log(team)

        try {
            const res = await this.teamModel.create(team)
            res.save()
            this.response = getSuccessResponse('团队创建成功', res._id)
            this.logger.info('/team/createTeam', `${username}创建团队【${team.teamName}】成功`)
        } catch (err) {
            this.response = getFailResponse('团队创建失败', null)
            this.logger.error('/team/createTeam', `${username}创建团队失败，失败原因：${err}`)
        }

        return this.response
    }

    /**
     * @description 查询团队列表
     * @param user 
     * @returns 
     */
    async findTeams(user: UserTokenEntity) {
        const { userId, username } = user
        try {
            const res = await this.teamModel.aggregate([
                {
                    $match: {
                        $or: [
                            { creator: userId },
                            {
                                'members.userId': { $in: [userId] }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        teamId: { $toString: '$_id' },
                        creatorObjectId: { $toObjectId: '$creator' }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'creatorObjectId',
                        foreignField: '_id',
                        as: 'creators'
                    }
                },
                {
                    $addFields: {
                        creator: {
                            $arrayElemAt: ['$creators', 0]
                        }
                    }
                },
                {
                    $addFields: {
                        'creator.userId': {
                            $toString: '$_id'
                        }
                    }
                },
                {
                    $project: {
                        teamId: 1,
                        teamName: 1,
                        logo: 1,
                        createTime: 1,
                        taskCount: { $size: '$tasks' },
                        'creator.username': 1,
                        'creator.avatar': 1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        __v: 0
                    }
                }
            ])

            this.response = getSuccessResponse('查询团队成功', res)
            this.logger.info('/team/getTeamsList', `${username}调用查询团队接口，执行成功`)
        } catch (err) {
            this.response = getFailResponse('查询团队失败', null)
            this.logger.error('/team/getTeamsList', `${username}调用查询团队接口，执行失败，失败原因：${err}`)
        }

        return this.response
    }

    async updateTeamTasks(user: UserTokenEntity, teamId: string, taskId: string) {
        try {
            const newRecord: TaskType = {
                taskId,
                createTime: formatToDateTime(new Date())
            }
            const res = await this.teamModel.updateOne(
                { _id: teamId },
                { $push: {
                    tasks: newRecord
                }
            })
            this.logger.info('/teamService/updateTeamTasks', `${user.username}在团队中创建新的任务记录，执行成功, 执行结果：${JSON.stringify(res)}`)
        } catch (err) {
            this.logger.error('/teamService/updateTeamTasks', `${user.username}在团队中创建新的任务记录，执行失败，失败原因：${err}`)
        }
    }
}
