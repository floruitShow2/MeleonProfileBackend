import { Schema, Prop } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema()
export class Blog extends Document {
  @Prop()
  readonly filename: string

  @Prop()
  readonly content: string

  @Prop()
  readonly tags: string[]

  @Prop()
  publisher: string

  @Prop()
  publishTime: string
}
