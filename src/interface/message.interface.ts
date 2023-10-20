import { Prop, Schema } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema()
export class Message extends Document {
  @Prop()
  readonly data: string

  @Prop()
  readonly id: string

  @Prop()
  readonly type: 'message' | 'notice' | 'todo'
}
