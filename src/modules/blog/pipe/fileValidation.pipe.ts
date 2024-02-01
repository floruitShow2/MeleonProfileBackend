import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class FilesizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value.size > 100 ? value : false
  }
}
