import { Schema } from '@nestjs/mongoose'
import { Transform } from 'class-transformer'
import { IsInt, IsNotEmpty, Min } from 'class-validator'

@Schema()
export class PaginationInput {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  page: number

  @IsInt()
  @Min(10)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  pageSize: number
}

export interface PaginationRes<T> {
  content: T[]
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
}
