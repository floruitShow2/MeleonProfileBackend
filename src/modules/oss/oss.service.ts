import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as OSS from 'ali-oss'
import { DecryptPrivateInfo } from '@/utils/encrypt'
import OSSConfig from './constants/oss.constant'
import { join } from 'path'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { genStoragePath } from '@/utils/format'

@Injectable()
export class OssService {
    client: OSS
    constructor(private readonly configService: ConfigService) {
        this.client = new OSS({
            ...OSSConfig,
            accessKeyId: DecryptPrivateInfo(this.configService.get('NEST_OSS_ID')),
            accessKeySecret: DecryptPrivateInfo(this.configService.get('NEST_OSS_SECRET')),
        })
    }

    /**
     * @description 创建新的bucket
     * @param name 
     */
    async putBucket(name: string) {
        try {
            const bucketOptions: OSS.PutBucketOptions = {
                storageClass: 'Standard',
                acl: 'private',
                dataRedundancyType: 'LRS',
                timeout: 3000
            }
            const result = await this.client.putBucket(`meleon-profile-${name}`, bucketOptions)
            console.log(result)
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * @description 列出所有的存储空间
     */
    async listBuckets() {
        try {
            const result = await this.client.listBuckets({ prefix: 'meleon-profile' })
            console.log(result)
        } catch (err) {
            console.log(err)
        }
    }
    
    /**
     * @description 上传文件到 OSS 并返回文件地址
     * @param ossPath 
     * @param localPath 
     * @returns 
     */
    async putOssFile(ossPath: string, localPath: string) {
        try {
            const res = await this.client.put(ossPath, localPath)
            await this.client.putACL(ossPath, 'public-read')
            console.log(res)
            return res.url
        } catch (err) {
            console.log('oss', err)
            throw err
        }
    }

    /**
     * @description 获取文件URL
     * @param path 
     * @returns 
     */
    async getFileSignatureUrl(path: string) {
        if (!path) {
            console.log('get file signature failed: file name can not be empty')
            return ''
        }

        try {
            const result = await this.client.signatureUrl(path, { expires: 3000 })
            return result
        } catch (err) {
            throw err
        }
    }

    /**
     * @description 将 OSS 上的文件下载到本地
     * @param path 文件存储在 OSS 服务器上的路径
     * @returns true | false 下载是否成功
     */
    async downloadFileStream(path: string) {
        try {
            const result = await this.client.getStream(path)
            const folders = path.split('/')
            const filename = folders.pop()
            const { diskPath: targetFolder } = genStoragePath(join(
                '/oss',
                folders.join('/')
            ))
            
            await new Promise((resolve, reject) => {
                if (!existsSync(targetFolder)) mkdirSync(targetFolder, { recursive: true })
                const writeStream = createWriteStream(join(targetFolder, filename), { flags: 'w' })
                result.stream.pipe(writeStream)
                result.stream.on('error', () => {
                    reject(false)
                })
                writeStream.on('finish', () => {
                    resolve(true)
                })
            })
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    }
}
