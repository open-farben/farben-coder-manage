import request from '@/utils/request'

const api = {
    uploadPlugin: '/coder-api/plugin/analysisPluginFile',
}

export default api

export function uploadPlugin(parameter) {
    return request({
        url: api.uploadPlugin,
        method: 'post',
        data: parameter,
        timeout: 0
    })
}

export function upload(url, parameter) {
    return request({
        url: url,
        method: 'post',
        data: parameter,
        timeout: 0
    })
}

