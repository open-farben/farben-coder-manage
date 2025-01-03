import request from '@/utils/request'

const api = {
    list: '/agent/models/listModelParameters',
    update:'/agent/models/modifyModelParam'
}

export default api

export function list() {
    return request({
        url: api.list,
        method: 'get',
    })
}

export function updateArguments(parameter) {
    return request({
        url: api.update,
        method: 'post',
        data:parameter
    })
}



