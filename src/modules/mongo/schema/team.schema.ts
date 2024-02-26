import { TeamEntity } from '@/modules/team/DTO/team.dto'
import { SchemaFactory } from '@nestjs/mongoose'

export const TeamSchema = SchemaFactory.createForClass(TeamEntity)