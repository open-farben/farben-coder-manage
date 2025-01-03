import request from '@/utils/request'

const api = {
    list: '/coder-api/statistics/pluginUsage',
    pluginFunction: '/coder-api/statistics/pluginFunction',
    totalList: '/coder-api/dashboard/stat',
    dashboard: '/coder-api/dashboard/user',
    fun: '/coder-api/dashboard/fun',
    dutycount: '/coder-api/dashboard/fun/count',
    funcount: '/coder-api/dashboard/duty/count',
    speedEdit: '/coder-api/dashboard/speed/edit',

    userList: '/coder-api/plugin/pageUser',
    addUser: '/coder-api/plugin/addUser',
    editUser: '/coder-api/plugin/editUser',
    deleteUser: '/coder-api/plugin/deleteUser',
    resetPassword: '/coder-api/plugin/resetPassword',
    enableUser: '/coder-api/plugin/enableUser',
    disableUser: '/coder-api/plugin/disableUser',
}

export default api

export function list(parameter) {
    return request({
        url: api.list,
        method: 'get',
        params: parameter,
        timeout: 0
    })
}

export function pluginFunction(parameter) {
    return request({
        url: api.pluginFunction,
        method: 'get',
        params: parameter,
    })
}

export function totalList(parameter) {
    return request({
        url: api.totalList,
        method: 'get',
        params: parameter
    })
}

export function dashboard(parameter) {
    return request({
        url: api.dashboard,
        method: 'get',
        params: parameter
    })
}
export function fun(parameter) {
    return request({
        url: api.fun,
        method: 'get',
        params: parameter
    })
}
export function funcount(parameter) {
    return request({
        url: api.funcount,
        method: 'get',
        params: parameter
    })
}
export function dutycount(parameter) {
    return request({
        url: api.dutycount,
        method: 'get',
        params: parameter
    })
}

export function speedEdit(parameter) {
    return request({
        url: api.speedEdit,
        method: 'post',
        data: parameter
    })
}

export function userList(parameter) {
    return request({
        url: api.userList,
        method: 'get',
        params: parameter
    })
}

export function addUser(parameter) {
    return request({
        url: api.addUser,
        method: 'post',
        data: parameter
    })
}

export function editUser(parameter) {
    return request({
        url: api.editUser,
        method: 'post',
        data: parameter
    })
}

export function deleteUser(parameter) {
    return request({
        url: api.deleteUser,
        method: 'DELETE',
        params: parameter
    })
}

export function resetPassword(parameter) {
    return request({
        url: api.resetPassword,
        method: 'post',
        data: parameter
    })
}

export function enableUser(parameter) {
    return request({
        url: api.enableUser,
        method: 'post',
        data: parameter
    })
}

export function disableUser(parameter) {
    return request({
        url: api.disableUser,
        method: 'post',
        data: parameter
    })
}

