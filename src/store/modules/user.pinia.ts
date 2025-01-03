import { defineStore } from "pinia";
import request from '@/utils/request'
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/store/mutation-types";
import { codePassword, getInfo, login, codeLogin, logout, updataPassword, refreshToken } from "@/api/login";
import ls from '@/utils/Storage'
import defaultConfig from '@/config/defaultSettings'
import { encrypt } from "@far/utils/jsencrypt";

export const useUserStore = defineStore("user", {
    state: () => {
        return {
            token: '',
            refreshToken:'',
            name: '',
            welcome: '',
            avatar: '',
            roles: [],
            permissions: [],
            info: {},
            // Prompt模板管理查询存储
            query: {
                model: undefined,
                modelAbility: undefined,
                templateName: undefined
            },
            // Prompt编辑存储
            prompt: {
                id: ''
            },
            encrypt: new encrypt(defaultConfig.publicKey, ''),
            organization:[],
        }
    },
    getters: {
        userInfo: state => state.info,
    },
    actions: {
        // 登录
        Login(userInfo: any, account: boolean = true) {
            const postData = {
                ...userInfo,
                userId: this.encrypt.encrypt(userInfo.userId) || '',
                password: this.encrypt.encrypt(userInfo.password) || ''
            }
            return new Promise((resolve, reject) => {
                (account ? login : codeLogin)(postData).then(response => {
                    if (account && response.code == '0') {
                        ls.set(ACCESS_TOKEN, response.data.accessToken)
                        ls.set(REFRESH_TOKEN, response.data.refreshToken)
                        this.token = response.data.accessToken;
                        this.refreshToken = response.data.accessToken;
                    }
                    resolve(response)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 获取用户信息
        GetInfo(){
            return new Promise((resolve, reject) => {
                getInfo().then(res => {
                    res.data.avatar = 'https://gw.alipayobjects.com/zos/rmsportal/jZUIxmJycoymBprLOUbT.png';
                    res.data.role = [ 'admin' ];
                    this.$patch({
                        roles: res.data.role,
                        permissions: [],
                        info: res.data,
                        name: res.data.userId,
                        welcome: '',
                        avatar: res.data.avatar
                    })
                    resolve(res.data)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 登出
        Logout() {
            return new Promise((resolve) => {
                logout().then(() => {
                    this.$patch({
                        roles: [],
                        permissions: [],
                        token: '',
                    })
                    ls.remove(ACCESS_TOKEN)
                    ls.remove(REFRESH_TOKEN)
                }).finally(() => {
                    resolve(true)
                })
            })
        },
        // 更新token
        RefreshToken() {
            let refresh = ls.get(REFRESH_TOKEN)
            let token= ls.get(ACCESS_TOKEN);
            
            return new Promise((resolve, reject) => {
                refreshToken({ RefreshToken : refresh,Authorization:'Bearer ' + token }).then(response => {
                    ls.set(ACCESS_TOKEN, response.data.accessToken)
                    ls.set(REFRESH_TOKEN, response.data.refreshToken)
                    this.token = response.data.accessToken;
                    this.refreshToken = response.data.accessToken;
                    resolve(true)
                }).catch(error => {
                    resolve(false)
                })
            })
        },
        // 登出重置
        RestToken() {
            return new Promise(resolve => {
                this.$patch({
                    roles: [],
                    permissions: [],
                    token: '',
                })
                ls.remove(ACCESS_TOKEN)
                ls.remove(REFRESH_TOKEN)
                resolve(true)
            })
        },
        // 查看平台登录次数
        accountCheck(parameter) {
            return new Promise((resolve, reject) => {
                request({
                    url: `/coder-api/account/check/${parameter}`,
                    method: 'get',
                }).then(res => {
                    console.log(res);
                    resolve(res.data)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 更改账号密码
        changePwd(userId,params: { password: string, newPassword: string }) {
            const postData = {
                userId:userId,
                password: this.encrypt.encrypt(params.password) || '',
                newPassword: this.encrypt.encrypt(params.newPassword) || ''
            }
            return new Promise((resolve, reject) => {
                request({
                    url: '/coder-api/account/pwd/edit',
                    method: 'post',
                    data:postData
                }).then(res => {
                    console.log(res);
                    resolve(res.data)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        updatePassword(userId,params: { password: string, newPassword: string }) {
            const postData = {
                userId:userId,
                password: this.encrypt.encrypt(params.password) || '',
                newPassword: this.encrypt.encrypt(params.newPassword) || ''
            }
            return updataPassword(postData)
        },
        codePassword(userId,params: { userId: string, password: string, newPassword: string }) {
            const postData = {
                // ...params,
                account: this.encrypt.encrypt(userId) || '',
                // userId:userId,
                password: this.encrypt.encrypt(params.password) || '',
                newPassword: this.encrypt.encrypt(params.newPassword) || ''
            }
            return codePassword(postData)
        },
        // 设置提示词
        setPrompt(prompt: any) {
            this.prompt = prompt;
        },
    }
})