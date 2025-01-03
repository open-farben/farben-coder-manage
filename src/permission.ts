import router from '@/router'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import { ACCESS_TOKEN } from '@/store/mutation-types'
import ls from '@/utils/Storage'
import { setDocumentTitle } from '@/utils/domUtil'
import { notification } from 'ant-design-vue';
import { toRaw } from 'vue'
import { useUserStore } from "@/store/modules/user.pinia";
import { usePermissionStore } from "@/store/modules/permission.pinia";

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['login', 'codelogin', 'download', 'register', 'registerResult','pwdChange'] // 不进行拦截的路由名称集合
const defaultRoutePath = '/';


router.beforeEach((to:any, from:any, next:any) => {
	NProgress.start() // 加载进度条
	setDocumentTitle(to);
	if (whiteList.includes(to.name as any)) {
		// 白名单页面直接打开
		next()
	} else {
		if (ls.get(ACCESS_TOKEN)) {
			const userStore= useUserStore();
			const permissionStore = usePermissionStore();
			if (userStore.roles.length === 0) {
				// request login userInfo
				userStore.GetInfo().then((res:any) => {
					// const roles = res.data && res.data.role
					// generate dynamic router
					userStore.organization.push(res.fullOrganization)
					permissionStore.GenerateRoutes().then(() => {
						// 根据roles权限生成可访问的路由表
						// 动态添加可访问路由表
						const routers = toRaw(permissionStore.addRouters);
						routers.forEach((item:any)=>{
							router.addRoute(item) 
						})
						// 请求带有 redirect 重定向时，登录自动重定向到该地址
						const redirect = decodeURIComponent(from.query.redirect || to.path)
						if (to.path === redirect) {
							next({ path: to.fullPath })
						} else {
							// 跳转到目的路由
							next({path: redirect})
						}
					})
				}).catch(() => {
					notification.error({
						message: '错误',
						description: '请求用户信息失败，请重试'
					})
					// 失败时，获取用户信息失败时，调用登出，来清空历史保留信息
					userStore.RestToken().then(() => {
						next({path: '/user/login', query: {redirect: to.fullPath}})
					})
				})
			} else {
				next()
			}
		} else {
			next({ path: '/user/login', query: { redirect: to.fullPath } })
			NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
		}
	}
})

// 路由懒加载失败时的提示
router.onError((error:any) => {
	if (window.env === 'localhost') {
		notification.error({
			message: 'Dynamic import error',
			description: error.stack,
		});
	} else {
		router.push({ name: 'error', params: { errorMsg: error.stack } })
	}
})

router.afterEach(() => {
	NProgress.done() // finish progress bar
})