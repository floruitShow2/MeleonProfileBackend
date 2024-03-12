import { Injectable } from '@nestjs/common'
import * as OSS from 'ali-oss'
import OSSConfig from './constants/oss.constant'

@Injectable()
export class OssService {
    client: OSS
    constructor() {
        this.client = new OSS(OSSConfig)
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
}
