import { defineStore } from "pinia";
import request from '@/utils/request'

export const useAccountStore = defineStore("account", {
    state: () => {
        return {

        }
    },
    getters: {

    },
    actions: {
       // 平台用户解锁
        accountReset(parameter){
            return new Promise((resolve, reject) => {
                request({
                    url: `/coder-api/account/unlock/${parameter}`,
                    method: 'get',
                }).then(res => {
                    resolve(res)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 插件用户解锁
        pluginReset(parameter){
            return new Promise((resolve, reject) => {
                request({
                    url: `/coder-api/plugin/unlock/${parameter}`,
                    method: 'get',
                }).then(res => {
                    resolve(res)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 分页查询用户反馈
        getPageFeedback(parameter){
            return new Promise((resolve, reject) => {
                request({
                    url: '/coder-api/feedback/pageFeedback',
                    method: 'get',
                    params: parameter,
                }).then((res:any) => {
                    if(res.code == 0) {
                        resolve(res.data)
                    }
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 查询用户反馈问答
        getFeedbackQA(parameter){
            return new Promise((resolve, reject) => {
                request({
                    url: '/coder-api/feedback/getFeedbackQA',
                    method: 'get',
                    params: parameter,
                }).then((res:any) => {
                    if(res.code == 0) {
                        resolve(res.data)
                    }
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 查询用户反馈上文
        getFeedbackHistory(parameter){
            return new Promise((resolve, reject) => {
                request({
                    url: '/coder-api/feedback/getFeedbackHistory',
                    method: 'get',
                    params: parameter,
                }).then((res:any) => {
                    if(res.code == 0) {
                        resolve(res.data)
                    }
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 用户反馈导出
        exportFeedback(parameter){
            return new Promise((resolve, reject) => {
                request({
                    url: '/coder-api/feedback/exportFeedback',
                    method: 'get',
                    params: parameter,
                }).then((res:any) => {
                    resolve(res)
                }).catch(error => {
                    reject(error)
                })
            })
        }
    }
})