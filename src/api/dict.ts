import request from '@/utils/request'

const api = {
    dict: '/coder-api/dict/option/item',
    list: '/coder-api/dict/list',
    detail: '/coder-api/dict/detail',
    edit: '/coder-api/dict/edit',

    listAdd: '/coder-api/dict/option/add',
    listEdit: '/coder-api/dict/option/edit',
    listDel: '/coder-api/dict/option/delete',
    listDisable: '/coder-api/dict/option/disable',
}

export default api

export function dict(parameter) {
    return request({
        url: api.dict,
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

export function edit(parameter) {
    return request({
        url: api.edit,
        method: 'post',
        data: parameter
    })
}

export function detail(parameter) {
    return request({
        url: api.detail,
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
