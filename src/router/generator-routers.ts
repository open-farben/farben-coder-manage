import {routerList} from '@/api/menu'
import { BasicLayout, RouteView } from '@/layouts'
import { defineAsyncComponent } from 'vue';

const modules = import.meta.glob("../../views/**/**.vue")

const constantRouterComponents = {
	// 基础页面 layout 必须引入
	BasicLayout: () => import('@/layouts/BasicLayout.vue'),
	RouteView: RouteView,
	'403': () => import( /* webpackChunkName: "error" */ '@/views/exception/403.vue'),
	'404': () => import( /* webpackChunkName: "error" */ '@/views/exception/404.vue'),
	'500': () => import( /* webpackChunkName: "error" */ '@/views/exception/500.vue'),

	// 你需要动态引入的页面组件
	'overview': () => import('@/views/run/overview/list.vue'),
	'account': () => import('@/views/run/account/list.vue'),
	'version': () => import('@/views/run/version/list.vue'),
	// 'plugin': () => import('@/views/run/plugin/plugin.vue'),
	// 'statistic': () => import('@/views/run/plugin/statistic.vue'),
	// 'feedback': () => import('@/views/run/plugin/feedback.vue'),

	// 'modellist': () => import('@/views/model/list.vue'),
	// 'modelcheck': () => import('@/views/model/check/list.vue'),
	// 'dockingmodel': () => import('@/views/model/check/dockingmodel.vue'),
	// 'prompt': () => import('@/views/model/prompt/list.vue'),
	// 'promptform': () => import('@/views/model/promptform/promptform.vue'),
	// 'promptdetail': () => import('@/views/model/promptform/promptdetail.vue'),

	// 'base': () => import('@/views/knowledge/base/list.vue'),
	// 'build': () => import('@/views/knowledge/manage/build.vue'),
	// 'coding': () => import('@/views/knowledge/coding/list.vue'),
	// 'search': () => import('@/views/knowledge/coding/search.vue'),
	// 'details': () => import('@/views/knowledge/coding/details.vue'),

	'user': () => import('@/views/system/user/list.vue'),
	'dict': () => import('@/views/system/dict/list.vue'),
	// 'license': () => import('@/views/system/license/list.vue'),
	'role': () => import('@/views/system/role/list.vue'),
	'menu': () => import('@/views/system/menu/list.vue'),
	// 'spring': () => import('@/views/system/spring/list.vue'),

	'dept': () => import('@/views/organize/dept/list.vue'),
	'work': () => import('@/views/organize/work/list.vue'),
}

// 前端未找到页面路由（固定不用改）
const notFoundRouter = {
	path: '/:pathMatch(.*)*',
	redirect: '/404',
	hidden: true
}

// 根级菜单
const rootRouter = {
	key: '',
	name: 'index',
	path: '',
	component: 'BasicLayout',
	redirect: '/run/overview',
	meta: {
		title: '首页'
	},
	children: []
}

export const asyncRouterMap = [{
        path: '/',
        name: 'index',
        component: RouteView,
        meta: { title: '平台' },
        redirect: '/notRouter',
        children: [
            {
				path: '/notRouter',
				name: 'notRouter',
				component: () => import('@/views/exception/notRouter.vue'),
				hidden: true,
			}
        ]
    },
]

//动态生成菜单
//@param token
//@returns {Promise<Router>}

export const generatorDynamicRouter = () => {
	return new Promise((resolve, reject) => {
		routerList().then(res => {
			const {	data } = res
			//排序
			data.sort(function(a, b) {
				return a.orderNum - b.orderNum;
			});
			//后端数据, 根级树数组,  根级 PID
			const menuNav = []
			const childrenNav = []
			let menuRoot = rootRouter


			const route = []
			const childrenRouter = []
			//后端数据, 根级树数组,  根级 PID
			//listToTree(treeData, childrenNav, '0')
			let resData = [...data]
			const obj = data.find((item) => item.path === '/model')
			if(obj && obj.id){
				const defaultMenu = [
					{
						"id": "460877b7e8bf45658af8c7573be10d4f11",
						"menuName": "新增模型表单",
						"parentId": obj.id,
						"path": "/prompt/promptform",
						"name": "promptform",
						"component": "promptform",
						"menuType": "M",
						"hidden": 1,
						"status": null,
						"permission": null,
						"icon": "",
						"createBy": "admin",
						"createTime": 1700453217000
					},
					{
						"id": "460877b7e8bf45658af8c7573be10d4f12",
						"menuName": "模型表单",
						"parentId": obj.id,
						"path": "/prompt/promptdetail/:id/:type",
						"name": "promptdetail",
						"component": "promptdetail",
						"menuType": "M",
						"hidden": 1,
						"status": null,
						"permission": null,
						"icon": "",
						"createBy": "admin",
						"createTime": 1700453217000
					},
					{
						"id": "460877b7e8bf45658af8c7573be10d4f16",
						"menuName": "对接模型配置",
						"parentId": obj.id,
						"path": "/check/dockingmodel",
						"name": "dockingmodel",
						"component": "dockingmodel",
						"menuType": "M",
						"hidden": 1,
						"status": null,
						"permission": null,
						"icon": "",
						"createBy": "admin",
						"createTime": 1700453217000
					},
				]
				resData.push(...defaultMenu)
			}
			const base = data.find((item) => item.path === '/knowledge')
			if(base && base.id){
				const defaultMenu = [
					{
						"id": "460877b7e8bf45658af8c7573be10d4f13",
						"menuName": "新增知识库",
						"parentId": base.id,
						"path": "/manage/build/:id",
						"name": "build",
						"component": "build",
						"menuType": "M",
						"hidden": 1,
						"status": null,
						"permission": null,
						"icon": "",
						"createBy": "admin",
						"createTime": 1700453217000
					},
					{
						"id": "460877b7e8bf45658af8c7573be10d4f14",
						"menuName": "搜索预览",
						"parentId": base.id,
						"path": "/coding/search",
						"name": "search",
						"component": "search",
						"menuType": "M",
						"hidden": 1,
						"status": null,
						"permission": null,
						"icon": "",
						"createBy": "admin",
						"createTime": 1700453217000
					},
					{
						"id": "460877b7e8bf45658af8c7573be10d4f15",
						"menuName": "代码库详情",
						"parentId": base.id,
						"path": "/coding/details/:id/:type",
						"name": "details",
						"component": "details",
						"menuType": "M",
						"hidden": 1,
						"status": null,
						"permission": null,
						"icon": "",
						"createBy": "admin",
						"createTime": 1700453217000
					}
				]
				resData.push(...defaultMenu);
			}
			listToTree(resData, childrenRouter, "0")
			rootRouter.children = childrenRouter

			let list = rootRouter.children
			console.log(childrenRouter,111111);
			
			
			let childitem = list.find(item => Object.keys(item).includes('children'));
			console.log(childitem,55555);

			rootRouter.redirect = childitem.children[0].path 
			console.log(rootRouter.redirect);
			

			// rootRouter.redirect = rootRouter.children[0].children[0].path 


			route.push(rootRouter)
			const routers = generator(route)
			routers.push(notFoundRouter)

			listToTree(data, childrenNav, "0")
			menuRoot.children = childrenNav
			menuNav.push(menuRoot)
			const menuList = generator(menuNav)
			menuList.push(notFoundRouter)

			if(rootRouter.children.length !== 0){
				resolve({
					menuList: menuList,
					routers: routers
				})
			}else{
				resolve({
					menuList: [],
					routers: asyncRouterMap
				})
			}
		}).catch(err => {
			reject(err)
		})
	})
}


//格式化树形结构数据 生成 vue-router 层级路由表
//@param routerMap
//@param parent
//@returns {*}

export const generator = (routerMap, parent) => {
	return routerMap.map(item => {
		const {	title,	show, hideChildren, hiddenHeaderContent, target, icon } = item.meta || {}
		const currentRouter = {
			//如果路由设置了 path，则作为默认 path，否则 路由地址 动态拼接生成如 /dashboard/workplace
			path: item.path || `${parent && parent.path || ''}/${item.key}`,
			//路由名称，建议唯一
			name: item.name || item.key || '',
			//该路由对应页面的 组件 :方案1
			//component: constantRouterComponents[item.component || item.key],
			//该路由对应页面的 组件 :方案2 (动态加载)
			//component: (constantRouterComponents[item.component || item.key]) || (() => import(`@/views/${item.component}`)),
			//vite该路由对应页面的 组件 :方案3 (动态加载)
			component: (constantRouterComponents[item.component || item.key]) || (() => defineAsyncComponent(modules[`@/views/${item.component}`])),

			//meta: 页面标题, 菜单图标, 页面权限(供指令权限用，可去掉)
			meta: {
				title: title,
				icon: icon || undefined,
				hiddenHeaderContent: hiddenHeaderContent,
				target: target,
				permission: item.name
			}
		}
		//是否设置了隐藏菜单
		if (show === false) {
			currentRouter.hidden = true
		}
		//是否设置了隐藏子菜单
		if (hideChildren) {
			currentRouter.hideChildrenInMenu = true
		}
		//为了防止出现后端返回结果不规范，处理有可能出现拼接出两个 反斜杠
		if (!currentRouter.path.startsWith('http')) {
			currentRouter.path = currentRouter.path.replace('//', '/')
		}
		//重定向
		item.redirect && (currentRouter.redirect = item.redirect)
		//是否有子菜单，并递归处理
		if (item.children && item.children.length > 0) {
			//Recursion
			currentRouter.children = generator(item.children, currentRouter)
		}
		return currentRouter
	})
}

/**
 * 数组转树形结构
 * @param list 源数组
 * @param tree 树
 * @param parentId 父ID
 */
const listToTree = (list, tree, parentId) => {
	list.forEach(item => {
		item.key = item.id
		item.meta = {
			title: item.menuName,
			icon: item.icon,
			show: item.hidden != 1,
			keepAlive: item.keepAlive == 1,
		}
		if(item.menuType == 'M' && item.component == '' || item.component == null){
			item.component = 'RouteView'
		}
		//判断是否为父级菜单
		if (item.parentId === parentId) {
			const child = {
				...item,
				key: item.key || item.name,
				name: item.name,
				children: []
			}
			// 迭代 list， 找到当前菜单相符合的所有子菜单
			listToTree(list, child.children, item.id)
			
			if(child.children.length > 0){
				child.redirect = child.children[0].path
			}
			//删掉不存在 children 值的属性
			if (child.children.length <= 0) {
				delete child.children
			}
			//加入到树中
			tree.push(child)
		}
	})
}