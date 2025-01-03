import request from '@/utils/request'

const api = {
    list: '/coder-api/role/list',

    listAdd: '/coder-api/role/add',
    listEdit: '/coder-api/role/edit',
    listDel: '/coder-api/role/delete',

    allRole: '/coder-api/role/select',
    authorize: '/coder-api/role/authorize',
    getauth: '/coder-api/role/detail',
    dataAuthorize:'/coder-api/role/range/authorize',

    getCurrent:'/coder-api/account/info',
    rangeList:'/coder-api/role/range/list'
}

export default api

export function allRole(parameter) {
    return request({
        url: api.allRole,
        method: 'get',
        params: parameter
    })
}

export function authorize(parameter) {
    return request({
        url: api.authorize,
        method: 'post',
        data: parameter
    })
}

export function dataAuthorize(parameter) {
    return request({
        url: api.dataAuthorize,
        method: 'post',
        data: parameter
    })
}

export function getauth(parameter) {
    return request({
        url: api.getauth,
        method: 'get',
        params: parameter
    })
}

export function list(parameter) {
    return request({
        url: api.list,
        method: 'get',
        params: parameter
    })
}

export function listAdd(parameter) {
    return request({
        url: api.listAdd,
        method: 'post',
        data: parameter
    })
}

export function listEdit(parameter) {
    return request({
        url: api.listEdit,
        method: 'post',
        data: parameter
    })
}

export function listDel(parameter) {
    return request({
        url: api.listDel,
        method: 'DELETE',
        data: parameter
    })
}

export function getCurrent(parameter) {
    return request({
        url: api.getCurrent,
        method: 'get',
        params: parameter
    })
}
export function rangeList() {
    return request({
        url: api.rangeList,
        method: 'get',
    })
}