import { Schema } from '@nestjs/mongoose'

export interface GithubTokenEntity {
  access_token: string
  expires_in: number
  refresh_token: string
  refresh_token_expires_in: string
  token_type: 'bearer'
  scope: string
}

export interface GithubUserInfo {
  // 账号名称
  login: string
  // 账号id，用于判断是否重复授权
  id: string
  // 用户名
  name: string
  // 头像地址
  avatar_url: string
  // 简介
  bio: null
  // github 个人中心
  html_url: string
  // 就职公司
  company: string
  // 邮箱
  email: string
  // 账号创建时间
  created_at: string
  // 账号信息上次更新时间
  updated_at: string
}

export interface GithubEmailInfo {
  email: string
  primary: boolean
}
