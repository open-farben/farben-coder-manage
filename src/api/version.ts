import request from '@/utils/request'

const api = {
    list: '/coder-api/plugin/pagePlugin',

    listAdd: '/coder-api/plugin/addPlugin',
    listEdit: '/coder-api/plugin/modifyPlugin',
    listDel: '/coder-api/plugin/deletePlugin',
    listDisable: '/coder-api/plugin/changeStatus',

    pluginList: '/coder-api/plugin/listDownloadPlugins',
    download: '/coder-api/plugin/downloadPlugin',
}

export default api

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
        params: parameter
    })
}

export function listDisable(parameter) {
    return request({
        url: api.listDisable,
        method: 'post',
        data: parameter
    })
}


export function pluginList(parameter) {
    return request({
        url: api.pluginList,
        method: 'get',
        params: parameter
    })
}

export function download(parameter) {
    return request({
        url: api.download,
        method: 'get',
        params: parameter
    })
}
