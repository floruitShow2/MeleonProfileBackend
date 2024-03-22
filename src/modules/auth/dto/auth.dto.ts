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
    login: 'floruitShow2',
    // 用户名
    name: null,
    // 头像地址
    avatar_url: 'https://avatars.githubusercontent.com/u/82753320?v=4',
    // 简介
    bio: null,
    // github 个人中心
    html_url: 'https://github.com/floruitShow2',
    // 就职公司
    company: null,
    // 邮箱
    email: null,
    // 账号创建时间
    created_at: '2021-04-18T08:46:19Z',
    // 账号信息上次更新时间
    updated_at: '2024-01-22T01:27:58Z'
    // id: 82753320,
    // node_id: 'MDQ6VXNlcjgyNzUzMzIw',
    // gravatar_id: '',
    // url: 'https://api.github.com/users/floruitShow2',
    // followers_url: 'https://api.github.com/users/floruitShow2/followers',
    // following_url: 'https://api.github.com/users/floruitShow2/following{/other_user}',
    // gists_url: 'https://api.github.com/users/floruitShow2/gists{/gist_id}',
    // starred_url: 'https://api.github.com/users/floruitShow2/starred{/owner}{/repo}',
    // subscriptions_url: 'https://api.github.com/users/floruitShow2/subscriptions',
    // organizations_url: 'https://api.github.com/users/floruitShow2/orgs',
    // repos_url: 'https://api.github.com/users/floruitShow2/repos',
    // events_url: 'https://api.github.com/users/floruitShow2/events{/privacy}',
    // received_events_url: 'https://api.github.com/users/floruitShow2/received_events',
    // type: 'User',
    // site_admin: false,
    // blog: '',
    // location: null,
    // hireable: null,
    // twitter_username: null,
    // public_repos: 3,
    // public_gists: 0,
    // followers: 0,
    // following: 1
}