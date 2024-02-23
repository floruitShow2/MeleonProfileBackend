import { Injectable } from '@nestjs/common'
import mongoose, { Model } from 'mongoose'
import { UserTokenEntity } from '../user/dto/user.dto'
import { TeamEntity, type TaskType, type MemberType } from './dto/team.dto'
import { ApiResponse } from '@/interface/response.interface'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'
import { LoggerService } from '../logger/logger.service'
import { InjectModel } from '@nestjs/mongoose'
import { formatToDateTime } from '@/utils/time'

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

    /**
     * @description 创建新团队
     * @param user 
     * @param team 团队基础信息
     * @returns 
     */
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
        const current = formatToDateTime(new Date())
        team.creator = userId
        team.createTime = current
        team.members = [{ userId: userId, joinTime: current, role: 0 }]

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
                        members: 1,
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

    /**
     * @description 更新团队项目
     * @param user 
     * @param teamId 
     * @param taskId 
     */
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

    /**
     * @description 更新团队成员
     * @param user 
     * @param teamId 
     * @param member 
     */
    async addTeamMembers(user: UserTokenEntity, teamId: string, member: Pick<MemberType, 'userId' | 'role'>) {
        try {
            const { userId, username } = user
            const team = await this.teamModel.findOne({ _id: teamId }, { teamId: 1, creator: 1, members: 1 })

            // 未查询到团队
            if (!team) {
                this.response = getFailResponse('该团队不存在', null)
                this.logger.error('/team/addMember', `未查询到id为${teamId}的团队记录`)
                return this.response
            }

            // 查询到用户，但无新增用户的权限
            const hasRole = team.members.find(item => item.userId === userId && item.role < 2)
            if (team.creator !== userId && !hasRole) {
                this.response = getFailResponse('您没有新增用户的权限', null)
                this.logger.error('/team/addMember', `${username} 没有向团队${teamId}新增用户的权限`)
                return this.response
            }

            const findIdx = team.members.findIndex(item => item.userId === member.userId)
            
            // 如果已经存在该成员，仅更新下用户角色信息
            if (findIdx !== -1) {
                this.response = getFailResponse('该成员已经加入团队', null)
                this.logger.error('/team/addMember', `${username}已经向团队${teamId}新增过用户${member.userId}`)
                return this.response
            }

            // 新增用户
            const newMembers = [
                ...team.members,
                {
                    ...member,
                    joinTime: formatToDateTime(new Date())
                }
            ]

            const res = await this.teamModel.updateOne(
                { _id: teamId },
                { $set: { members: newMembers } }
            )
            
            if (res.acknowledged && res.modifiedCount > 0) {
                // 更新成功
                this.response = getSuccessResponse(findIdx !== -1 ? '成员信息已更新' : '新成员添加成功', member.userId)
                this.logger.info(
                    '/team/addMember',
                    findIdx !== -1
                        ? `${username}更新了团队${teamId}中添加成员${member.userId}的角色信息`
                        : `${username}成功向团队${teamId}中添加新成员${member.userId}`
                )
            } else {
                // 更新失败
                this.response = getFailResponse('新成员添加失败', member.userId)
                this.logger.error(
                    '/team/addMember',
                    `${username}未能向团队${teamId}中添加新成员${member.userId}`
                )
            }

        } catch (err) {
            this.response = getFailResponse('新成员添加失败', member.userId)
            this.logger.error('/team/addMember', err)
        }

        return this.response
    }

    async getTeamMembers(user: UserTokenEntity, teamId: string) {
        const { userId } = user
        const res = await this.teamModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(teamId) }
            },
            {
                $addFields: {
                    members: {
                        $map: {
                            input: '$members',
                            as: 'member',
                            in: {
                                userId: { $toObjectId: '$$member.userId' },
                                    joinTime: '$$member.joinTime',
                                  role: '$$member.role'
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'members.userId',
                    foreignField: '_id',
                    as: 'membersDetail'
                }
            },
            {
                $project: {
                    members: 1,
                    'membersDetail.username': 1
                }
            }
        ])

        if (!res || !res.length) {
            this.response = getFailResponse('未找到匹配的团队成员', null)
            return this.response
        }

        console.log(res)
        const { members, membersDetail } = res[0]
        const membersMap: Record<string, MemberType> = {}
        members.forEach(item => {
            membersMap[item.userId] = item
        })

        membersDetail.map(item => {  })
    }
}
