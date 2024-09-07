import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsArray, IsNotEmpty } from 'class-validator'
import mongoose, { Document } from 'mongoose'

type QuestionCategory = 'Vue' | 'React'

@Schema()
class QuestionFile {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  language: string

  value: string
}

@Schema()
export class QuestionEntity extends Document {
  @Prop()
  @ApiProperty({
    description: '问题标题'
  })
  title: string

  @Prop()
  @ApiProperty({
    description: '问题内容'
  })
  content: string

  @Prop()
  @ApiProperty({
    description: '问题分类'
  })
  category: QuestionCategory

  @Prop()
  @ApiProperty({
    description: '关联文件'
  })
  @IsArray()
  files: QuestionFile[]

  @Prop()
  @ApiProperty({
    description: '创建人'
  })
  createBy: mongoose.Types.ObjectId

  @Prop()
  @ApiProperty({
    description: '创建时间'
  })
  createdTime: string
}

export class CreateQuestionInput extends PickType(QuestionEntity, [
  'title',
  'content',
  'category',
  'files'
]) {}
