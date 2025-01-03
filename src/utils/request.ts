import axios from 'axios'
import ls from '@/utils/Storage'
import { Modal, notification, message } from 'ant-design-vue/es'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/store/mutation-types'

import errorCode from '@/utils/errorCode'
import { blobValidate } from '@/utils/util'
import { saveAs } from 'file-saver';
import { useUserStore } from "@/store/modules/user.pinia";

// 创建 axios 实例
const request = axios.create({
    // API 请求的默认前缀
    baseURL: import.meta.env.DEV?'/web/api':'',
    timeout: 100000 // 请求超时时间
})
const whiteList = ['/coder-api/account/login', '/coder-api/token/refresh']
let tokenUpdateing = false,//token是否处于更新中
    reqLists: Array<any> = []//更新token时请求的队列 
let loginNum = 0

// 异常拦截处理器
const errorHandler = async (error:any) => {
    const userStore = useUserStore();
    if (error.response) {
        const data = error.response.data
        // 从 localstorage 获取 token
        const token = ls.get(ACCESS_TOKEN)
        if (error.response.status === 403) {
            // notification.error({
            //     message: 'Forbidden',
            //     description: data.message
            // })
            if (!tokenUpdateing) {
                tokenUpdateing = true
                const userStore = useUserStore();
                const tokenFinish = await userStore.RefreshToken();
               
                
                if (tokenFinish) {
                    reqLists.forEach((item) => item())
                    reqLists = []
                    tokenUpdateing = false
                    const requestList = {
                        url: error.response.config.url,
                        method: error.response.config.method,
                        params: error.response.config.params,
                    }
                    console.log('tokenFinish',requestList);
                    return await request(requestList)
                }else {
                    Modal.confirm({
                        title: '提示',
                        content: '登录超时，请重新登录',
                        cancelButtonProps: { style: { display: 'none' } }, // 隐藏取消按钮
                        onOk: () => {
                            return userStore.RestToken().then(() => {
                                setTimeout(() => {
                                    window.location.reload()
                                }, 300)
                            })
                        },
                        onCancel() { }
                    })
                    return false
                }
            } else {
                console.log(reqLists);
                
                return new Promise(resolve => {
                    reqLists.push(() => {     
                        resolve(request(error.response.config))
                    })
                })
            }
        }
        if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
            Modal.confirm({
                title: '提示',
                content: '登录超时，请重新登录',
                cancelButtonProps: { style: { display: 'none' } }, // 隐藏取消按钮
                onOk: () => {
                    return userStore.RestToken().then(() => {
                        setTimeout(() => {
                            window.location.reload()
                        }, 300)
                    })
                },
                onCancel() { }
            })
            if (token) {
                // userStore.Logout().then(() => {
                //     setTimeout(() => {
                //         window.location.reload()
                //     }, 1500)
                // })
            }
        }
    }
    return Promise.reject(error)
}

request.interceptors.request.use((config:any) => {
    // 让每个请求携带自定义 token 请根据实际情况自行修改
    if (whiteList.indexOf(config.url) == -1) {
        const token= ls.get(ACCESS_TOKEN);
        token && (config.headers['Authorization'] = 'Bearer ' + token)
    }
    return config
}, errorHandler)

request.interceptors.response.use(async (response: any) => {
    const userStore = useUserStore();
    if (response.data.code == '0' || response.data.code == '200' || response.request.responseType === 'blob' || response.request.responseType === 'arraybuffer') {
        return response.data
    } else {
        if (response.data.code == '99999') {
            return response.data
        }else if(response.data.code == undefined){
            return response.data
        }else if(response.data.code == 'A0123'){
            return response.data
        }else {
            notification.error({
                message: '提示信息',
                description: response.data.message
            })
            return false
        }
    }

}, errorHandler)


// 通用下载方法
export function download(url, params, filename) {
    return request.get(url, {
        params: params,
        responseType: 'blob'
    }).then(async (data: any) => {
        const isBlob = await blobValidate(data)
        if (isBlob) {
            const blob = new Blob([data])
            saveAs(blob, filename)
            message.success('下载成功')
        } else {
            const resText = await data.text()
            const rspObj = JSON.parse(resText)
            const errMsg = errorCode[rspObj.code] || rspObj.message || errorCode['default']
            message.error(errMsg)
        }
    }).catch((r) => {
        message.error('下载文件出现错误，请联系管理员！')
    })
}

// 下载txt
export function downloadTxt(url, params, filename) {
    return request.get(url, {
        params: params,
        responseType: 'blob'
    }).then(async (data: any) => {
        // const isBlob = await blobValidate(data)
        // if (isBlob) {
        //     const blob = new Blob([data],{ type: 'application/;charset=utf-8' })
        //     saveAs(blob, filename)
        //     message.success('下载成功')
        // } else {
        //     const resText = await data.text()
        //     const rspObj = JSON.parse(resText)
        //     const errMsg = errorCode[rspObj.code] || rspObj.message || errorCode['default']
        //     message.error(errMsg)
        // }
        const blob = new Blob([data], { type: 'application/;charset=utf-8' })
        // 创建一个临时的a标签用于下载
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = filename
        // // 将a标签添加到文档中，触发点击事件，然后移除a标签
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }).catch((r) => {
        message.error('下载文件出现错误，请联系管理员！')
    })
}

export default request
