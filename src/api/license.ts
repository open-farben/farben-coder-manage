import request from '@/utils/request'

const api = {
    list: '/coder-api/auth/getLicenseInfo',
    edit: '/coder-api/auth/refreshLicense',
    ssl:'/coder-api/sslCheck/checkCertificate  '
}

export default api

export function list(parameter) {
    return request({
        url: api.list,
        method: 'get',
        params: parameter
    })
}

export function edit(parameter) {
    return request({
        url: api.edit,
        method: 'post',
        data: parameter
    })
}

export function SSL() {
    return request({
        url: api.ssl,
        method: 'get',
    })
}

