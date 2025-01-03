import request from '@/utils/request'

const userApi = {
    //Login: '/auth/login',
	Login: '/coder-api/account/login',
    codeLogin: '/coder-api/plugin/login',
    tokenRefresh:'/coder-api/token/refresh',
    //Logout: '/auth/logout',
	Logout: '/coder-api/account/exit',
    pluginLogout: '/coder-api/plugin/logout',
    codePassword: '/coder-api/plugin/modifyPassword',
    // get my info
    UserInfo: '/coder-api/account/detail',
    updataPassword: '/coder-api/account/pwd/edit',
}

/**
 * login func
 * parameter: {
 *     username: '',
 *     password: '',
 *     remember_me: true,
 *     captcha: '12345'
 * }
 * @param parameter
 * @returns {*}
 */
export function login(parameter) {
    return request({
        url: userApi.Login,
        method: 'post',
        data: parameter
    })
}

export function codeLogin(parameter) {
    return request({
        url: userApi.codeLogin,
        method: 'post',
        data: parameter
    })
}
export function refreshToken(parameter) {
    return request({
        url: userApi.tokenRefresh,
        method: 'post',
        headers: parameter,
        
    })
}

export function getInfo() {
    return request({
        url: userApi.UserInfo,
        method: 'post',
    })
}

export function logout() {
    return request({
        url: userApi.Logout,
        method: 'post',
    })
}

export function pluginLogout(parameter) {
    return request({
        url: userApi.pluginLogout,
        method: 'post',
        data: parameter
    })
}


export function updataPassword(parameter) {
    return request({
        url: userApi.updataPassword,
        method: 'post',
        data: parameter
    })
}

export function codePassword(parameter) {
    return request({
        url: userApi.codePassword,
        method: 'post',
        data: parameter
    })
}

