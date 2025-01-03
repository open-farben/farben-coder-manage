import request from '@/utils/request'

const api = {
    list: '/coder-api/account/pageUser',
    addedit: '/coder-api/account/addUser',
    deleteUser: '/coder-api/account/deleteUser',
    resetPassword: '/coder-api/account/pwd/reset',
    listDisable: '/coder-api/account/disable',
}

export default api

export function list(parameter) {
    return request({
        url: api.list,
        method: 'get',
        params: parameter
    })
}

export function addedit(parameter) {
    return request({
        url: api.addedit,
        method: 'post',
        data: parameter
    })
}

export function deleteUser(parameter) {
    return request({
        url: api.deleteUser,
        method: 'DELETE',
        data: parameter
    })
}

export function resetPassword(parameter) {
    return request({
        url: api.resetPassword,
        method: 'post',
        data: parameter
    })
}

export function listDisable(parameter) {
    return request({
        url: api.listDisable,
        method: 'post',
        data: parameter
    })
}


