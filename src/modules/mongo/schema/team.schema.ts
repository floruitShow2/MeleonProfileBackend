import { TeamEntity } from '@/modules/team/dto/team.dto'
import { SchemaFactory } from '@nestjs/mongoose'

export const TeamSchema = SchemaFactory.createForClass(TeamEntity)
