import { asyncRouterMap, constantRouterMap } from '@/config/router.config'
import { defineStore } from "pinia";
import { generatorDynamicRouter } from "@/router/generator-routers";

function hasPermission(permission, route) {
    if (route.meta && route.meta.permission) {
        let flag = false
        for (let i = 0, len = permission.length; i < len; i++) {
            flag = route.meta.permission.includes(permission[i])
            if (flag) {
                return true
            }
        }
        return false
    }
    return true
}


function filterAsyncRouter(routerMap, roles) {
    return routerMap.filter(route => {
        if (hasPermission(roles.permissionList, route)) {
            if (route.children && route.children.length) {
                route.children = filterAsyncRouter(route.children, roles)
            }
            return true
        }
        return false
    })
}

interface PermissionState {
    routers: any[];
    menuList: any[];
    addRouters:  any[];
}

export const usePermissionStore = defineStore("permission",{
    state:(): PermissionState => ({
        routers: constantRouterMap,
        addRouters: [],
        menuList: []
    }),
    actions: {
        GenerateRoutes(){
            return new Promise(resolve => {
                generatorDynamicRouter().then((routers: any) => {
                    this.addRouters = routers.routers
                    this.routers = constantRouterMap.concat(routers.routers)
                    this.menuList = constantRouterMap.concat(routers.menuList)
                    resolve(true);
                })
            })
        }
    }
})
