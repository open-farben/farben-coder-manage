import request from '@/utils/request'

const api = {
    routerList: '/coder-api/menu/router/list',
    list: '/coder-api/menu/list',
    menuTree: '/coder-api/menu/tree',

    listAdd: '/coder-api/menu/add',
    listEdit: '/coder-api/menu/edit',
    listDel: '/coder-api/menu/delete',
    listDisable: '/coder-api/menu/disable',

}

export default api

export function routerList(parameter = {}) {
    return request({
        url: api.routerList,
        method: 'get',
        params: parameter
    })
}

export function menuTree(parameter) {
    return request({
        url: api.menuTree,
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

export function listDisable(parameter) {
    return request({
        url: api.listDisable,
        method: 'post',
        data: parameter
    })
}