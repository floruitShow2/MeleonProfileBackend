import { HttpException, HttpStatus, Injectable, StreamableFile } from '@nestjs/common'
import { join, resolve } from 'path'
import { WriteStream, createReadStream, createWriteStream, existsSync, mkdirSync, readdirSync, rmdirSync, unlink, unlinkSync, writeFileSync } from 'fs'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'
import type { ApiResponse } from '@/interface/response.interface'
import { LoggerService } from '../logger/logger.service'
import { UserTokenEntity } from '../user/dto/user.dto'
import type { ChunkOptions, MergeOptions, VerifyOptions } from './dto/file.dto'
import { OssService } from '../oss/oss.service'
import { genStoragePath } from '@/utils/format'

@Injectable()
export class FileService {

    response: ApiResponse

    constructor(
        private readonly ossService: OssService,
        private readonly logger: LoggerService
    ) {}

    genUploadDir(user: UserTokenEntity) {
        const uploadDir = join(process.cwd(), `/files/${user.username}/file/`)
        if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })
        return uploadDir
    }

    genChunkDir(user: UserTokenEntity, filehash: string) {
        const chunkDir = join(this.genUploadDir(user), `/chunks/chunkDir_${filehash}`)
        if (!existsSync(chunkDir)) mkdirSync(chunkDir, { recursive: true })
        return chunkDir
    }

    async createUploadedList(user: UserTokenEntity, filehash: string) {
        const chunkDir = this.genChunkDir(user, filehash)
        return existsSync(chunkDir)
            ? await readdirSync(chunkDir)
            : []
    }

    /**
     * @description 校验是否允许上传，以及允许哪些部分上传
     * @param user 
     * @param verifyOptions 
     * @returns 
     */
    async handleVerify(user: UserTokenEntity, verifyOptions: VerifyOptions) {
        try {
            const { username } = user
            const { filename, filehash } = verifyOptions
            const filePath = resolve(this.genUploadDir(user), filename)

            if (existsSync(filePath)) {
                this.response = getFailResponse('The file has already been uploaded', null)
                this.logger.error('/file/uploadFile', `${username}已经上传过${filename}`)
            } else {
                this.response = getSuccessResponse(
                    'verification succeed, allow to upload',
                    {
                        shouldUpload: true,
                        uploadedList: await this.createUploadedList(user, filehash)
                    }
                )
                this.logger.info('/file/uploadFile', `${username}上传${filename}的校验已通过，允许上传文件切片`)
            }

        } catch (err) {
            this.response = getFailResponse('文件上传失败', null)
            this.logger.error('/file/uploadFile', `文件上传失败，失败原因：${err}`)
        }

        return this.response
    }

    /**
     * @description 上传切片到指定目录
     * @param user
     * @param chunk 文件切片数据
     * @param chunkOptions 文件及切片相关数据
     * @returns 
     */
    async handleChunkUpload(user: UserTokenEntity, chunk: Express.Multer.File, chunkOptions: ChunkOptions) {
        
        const { hash, filename, filehash } = chunkOptions
        
        try {
            const filePath = resolve(this.genUploadDir(user), filename)
            // 先创建临时文件夹用于临时存储文件切片
            const chunkDir = this.genChunkDir(user, filehash)
            const chunkPath = resolve(chunkDir, hash)
            // 文件已存在，直接返回
            if (existsSync(filePath)) {
                this.response = getSuccessResponse('File has already existed in server', filename)
                this.logger.info(
                    '/file/uploadFileChunk',
                    `${user.username} 无需上传文件${filename}，文件已存在`
                )
                return this.response
            }
            // 存放 chunk 的目录不存在，创建目录
            if (!existsSync(chunkDir)) {
                await mkdirSync(chunkDir)
            }
            // 切片已存在，直接返回
            if (existsSync(chunkPath)) {
                this.response = getSuccessResponse('Chunk has already been uploaded', hash)
                this.logger.info(
                    '/file/uploadFileChunk',
                    `${user.username} 无需上传文件${filename}的切片，切片hash：${hash}`
                )
                return this.response
            }
            await writeFileSync(chunkPath, chunk.buffer)

            this.response = getSuccessResponse('File Chunk Has Been Received', hash)
            this.logger.info(
                '/file/uploadFileChunk',
                `${user.username} 上传文件${filename}切片成功，切片hash：${hash}`
            )
        } catch (error) {
            this.response = getFailResponse('Chunk upload failed', null)
            this.logger.error('/file/uploadFileChunk', `${user.username} 上传文件切片失败，失败原因：${error}`)
        }
        return this.response
    }

    pipeStream(path: string, writeStream: WriteStream) {
        return new Promise(resolve => {
            const readStream = createReadStream(path)
            readStream.on('end', () => {
                unlinkSync(path)
                resolve('')
            })
            readStream.pipe(writeStream)
        })
    }

    /**
     * @description 合并文件切片
     * @param user
     * @param filePath
     * @param filehash
     * @param size
     */
    async mergeFileChunk(user: UserTokenEntity, filePath: string, filehash: string, size: number) {
        const chunkDir = this.genChunkDir(user, filehash)
        const chunkPaths: string[] = readdirSync(chunkDir)
        // 根据切片下标进行排序
        // 否则直接读取目录的获得的顺序会错乱
        // sort by chunk index
        // otherwise, the order of reading the directory may be wrong
        chunkPaths.sort((a, b) => Number(a.split('-')[1]) - Number(b.split('-')[1]))
        
        // 并发写入文件
        // write file concurrently
        await Promise.all(
            chunkPaths.map((chunkPath, index) =>
                this.pipeStream(
                    resolve(chunkDir, chunkPath),
                    // 根据 size 在指定位置创建可写流
                    // create write stream at the specified starting location according to size
                    createWriteStream(filePath, {
                        start: index * size
                    })
                )
            )
        )
        // 合并后删除保存切片的目录
        // delete chunk directory after merging
        await rmdirSync(chunkDir)
    }

    /**
     * @description 合并文件切片并存储至指定目录
     * @param user 
     * @param mergeOptions 
     */
    async handleMerge(user: UserTokenEntity, mergeOptions: MergeOptions) {
        const { filehash, filename, size } = mergeOptions
        try {
            await this.mergeFileChunk(
                user,
                resolve(this.genUploadDir(user), filename),
                filehash,
                size
            )
            this.response = getSuccessResponse('文件合并成功', filename)
            this.logger.info('/file/merge', `${user.username}上传文件${filename}，执行合并操作成功`)
        } catch (err) {
            this.response = getFailResponse('文件合并失败', null)
            this.logger.error(
                '/file/merge',
                `${user.username}上传文件${filename}，执行合并操作失败，失败原因：${err}`
            )
        }
        return this.response
    }

    /**
     * @description 将文件上传至阿里云OSS对象存储
     * @param user 用户信息
     * @param file 文件
     * @returns 
     */
    async uplodaFileToOSS(user: UserTokenEntity, file: Express.Multer.File) {
        if (!file) {
            throw new HttpException('参数异常，文件未上传', HttpStatus.FORBIDDEN)
        }
        const username = user?.username ?? 'meleon'
        const filename = file.originalname
        try {
            const ossUrl = await this.ossService.putOssFile(`/${username}/${filename}`, file.path)
            this.response = getSuccessResponse('文件上传成功', ossUrl)
            this.logger.info(
                '/file/oss/uploadFile',
                `${username}上传文件[${filename}]至 Aliyun OSS 成功，文件地址为 ${ossUrl}`
            )
        } catch (err) {
            this.response = getFailResponse('文件上传失败', null)
            this.logger.error(
                '/file/oss/uploadFile',
                `${username}上传文件[${filename}]失败，失败原因：${err}`
            )
        }

        return this.response
    }

    cleanUpFile(path: string) {
        try {
            if (existsSync(path)) {
                unlinkSync(path)
            }
        } catch (err) {
            console.log(err)
        } 
    }

    async downloadFileFromOSS(user: UserTokenEntity, path: string) {
        try {
            const res = await this.ossService.downloadFileStream(path)
            const storagePath = genStoragePath(`/oss/${path}`).diskPath
            if (res && existsSync(storagePath)) {
                const readStream = createReadStream(storagePath)
                const streamableFile = new StreamableFile(readStream)

                readStream.on('end', () => this.cleanUpFile(storagePath))
                readStream.on('error', () => this.cleanUpFile(storagePath))

                return streamableFile
            } else {
                return '失败了'
            }
        } catch (err) {
            console.log(err)
            return '失败了'
        }
    }
}
