import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TeamSchema } from '@/modules/mongo/schema'
import { TeamController } from './team.controller'
import { TeamService } from './team.service'
import { TeamEntity } from './dto/team.dto'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TeamEntity.name, schema: TeamSchema, collection: 'teams' }])
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService]
})
export class TeamModule {}
