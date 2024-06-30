import { FileTypeEnum } from '@/constants/file.enum'

const mimeTypeMap: Array<[FileTypeEnum, RegExp]> = [
  [FileTypeEnum.IMAGE, /\.(jpg|jpeg|png|gif|bmp|webp)$/i],
  [FileTypeEnum.VIDEO, /\.(mp4|avi)$/i],
  [FileTypeEnum.AUDIO, /\.(mp3|wav)$/i],
  [FileTypeEnum.FILE, /\.[a-zA-Z0-9]+$/i]
]

/**
 * @description 根据 文件信息 生成 文件类型
 * @param file
 * @returns
 */
export const genFileType = (file: Express.Multer.File): FileTypeEnum | null => {
  const { filename } = file
  for (const [fileType, regex] of mimeTypeMap) {
    if (regex.test(filename)) {
      return fileType as FileTypeEnum
    }
  }
  return null
}
