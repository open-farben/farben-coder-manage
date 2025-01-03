import request from '@/utils/request'

const api = {
    treeList: '/coder-api/organ/tree',
    list: '/coder-api/organ/page/list',
    detail: '/coder-api/organ/detail',

    listAdd: '/coder-api/organ/add',
    listEdit: '/coder-api/organ/update',
    listDel: '/coder-api/organ/delete',
}

export default api

export function treeList(parameter) {
    return request({
        url: api.treeList,
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

