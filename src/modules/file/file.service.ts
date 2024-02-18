import { Injectable } from '@nestjs/common'
import { resolve } from 'path'
import { existsSync, readdir } from 'fs'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'
import type { ApiResponse } from '@/interface/response.interface'
import { UPLOAD_DIR } from './constant'
import { LoggerService } from '../logger/logger.service'
import { UserTokenEntity } from '../user/dto/user.dto'
import type { VerifyOptions } from './dto/file.dto'

@Injectable()
export class FileService {

    response: ApiResponse

    constructor(private readonly logger: LoggerService) {}

    getChunkDir(filehash: string) {
        return resolve(UPLOAD_DIR, `chunkDir_${filehash}`)
    }

    async createUploadedList(filehash: string) {
        console.log(filehash, this.getChunkDir(filehash))
        return existsSync(this.getChunkDir(filehash))
            ? await readdir(this.getChunkDir(filehash), null)
            : []
    }

    async handleVerify(user: UserTokenEntity, verifyOptions: VerifyOptions) {
        try {
            const { username } = user
            const { filename, filehash } = verifyOptions
            const filePath = resolve(UPLOAD_DIR, filename)

            if (existsSync(filePath)) {
                this.response = getFailResponse('The file has already been uploaded', null)
                this.logger.error('/file/uploadFile', `${username}已经上传过${filename}`)
            } else {
                this.response = getSuccessResponse('verification succeed, allow to upload', await this.createUploadedList(filehash))
                this.logger.info('/file/uploadFile', `${username}上传${filename}的校验已通过，允许上传文件切片`)
            }

        } catch (err) {
            this.response = getFailResponse('文件上传失败', null)
            this.logger.error('/file/uploadFile', `文件上传失败，失败原因：${err}`)
        }

        return this.response
    }
}
