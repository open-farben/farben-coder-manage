'use strict';
import { BasicLayout, UserLayout, RouteView } from "@/layouts";
import errorPage from '@/views/Exception/500.vue'

export const asyncRouterMap = [{
        path: '/',
        name: 'index',
        component: BasicLayout,
        meta: { title: '平台' },
        redirect: '/run/overview',
        children: [
            // dashboard
            {
            	path: '/dashboard',
            	name: 'dashboard',
            	redirect: '/dashboard/analysis',
            	component: RouteView,
				hidden: true,
            	meta: { title: '平台', icon: 'HomeOutlined', keepAlive: true, permission: ['admin'] },
            	children: [
            		{
            			path: '/dashboard/analysis/:pageNo([1-9]\\d*)?',
            			name: 'Analysis',
            			component: () => import('@/views/dashboard/Workplace.vue'),
            			meta: { title: '分析', keepAlive: false, permission: ['admin'], hidden: false }
            		},
            		// 外部链接
            		{
            			path: '/dashboard/monitor',
            			name: 'Monitor',
            			meta: { title: '外链', target: 'http://www.baidu.com', permission: ['admin'], blank: true }
            		},
            		{
            			path: '/dashboard/workplace',
            			name: 'Workplace',
            			component: () => import('@/views/Home.vue'),
            			meta: { title: '工作台', keepAlive: true, permission: ['admin'] }
            		}
            	]
            },
			{
				path: '/run',
				component: RouteView,
				redirect: '/run/statistic',
				name: 'run',
				meta: { title: '运营管理', icon: 'AccountBookOutlined', keepAlive: true },
				children: [
					{
						path: '/run/overview',
						name: 'overview',
						component: () => import('@/views/run/overview/list.vue'),
						meta: { title: '概览', keepAlive: true, permission: ['admin'] },
					},
					{
						path: '/run/account',
						name: 'account',
						component: () => import('@/views/run/account/list.vue'),
						meta: { title: '账号列表', keepAlive: true, permission: ['admin'] }
					},
					{
						path: '/run/version',
						name: 'version',
						component: () => import('@/views/run/version/list.vue'),
						meta: { title: '版本管理', keepAlive: true, permission: ['admin'] }
					},
				]
			},
			{
            	path: '/system',
            	name: 'system',
            	redirect: '/system/role',
            	component: RouteView,
            	meta: { title: '权限管理', icon: 'UserOutlined' },
            	children: [
					{
            			path: '/system/user',
            			name: 'userList',
            			component: () => import('@/views/system/user/list.vue'),
            			meta: { title: '用户管理', keepAlive: true }
            		},
					{
            			path: '/system/dict',
            			name: 'dict',
            			component: () => import('@/views/system/dict/list.vue'),
            			meta: { title: '字典配置', keepAlive: true, hidden: false }
            		},
            		{
            			path: '/system/role',
            			name: 'role',
            			component: () => import('@/views/system/role/list.vue'),
            			meta: { title: '角色管理', keepAlive: true, hidden: true }
            		},
            		{
            			path: '/system/menu',
            			name: 'menu',
            			component: () => import('@/views/system/menu/list.vue'),
            			meta: { title: '菜单管理', keepAlive: true, hidden: true }
            		},
            	]
            },
			{
            	path: '/organize',
            	name: 'organize',
            	redirect: '/organize/dept',
            	component: RouteView,
            	meta: { title: '组织管理', icon: 'ApartmentOutlined' },
            	children: [
					{
            			path: '/organize/dept',
            			name: 'dept',
            			component: () => import('@/views/organize/dept/list.vue'),
            			meta: { title: '组织机构', keepAlive: true, hidden: false }
            		},
            	]
            },
            // forms
            {
            	path: '/form',
            	name: 'form',
            	redirect: '/form/base-form',
            	component: RouteView,
				hidden: true,
            	meta: { title: '表单', icon: 'FormOutlined', permission: ['user'] },
            	children: [
            		{
            			path: '/form/base-form',
            			name: 'BaseForm',
            			component: () => import('@/views/Home.vue'),
            			meta: { title: '基础表单', keepAlive: true }
            		},
            		{
            			path: '/form/step-form',
            			name: 'StepForm',
            			component: () => import('@/views/Home.vue'),
            			meta: { title: '分步表单', keepAlive: true }
            		},
            		{
            			path: '/form/advanced-form',
            			name: 'AdvanceForm',
            			component: () => import('@/views/Home.vue'),
            			meta: { title: '高级表单', keepAlive: true }
            		}
            	]
            },
            
            // list
            {
            	path: '/list',
            	name: 'list',
            	component: RouteView,
				hidden: true,
            	redirect: '/list/table-list',
            	meta: { title: '列表', icon: 'TableOutlined', permission: ['table'] },
            	children: [
            		{
            			path: '/list/table-list/:pageNo([1-9]\\d*)?',
            			name: 'TableListWrapper',
            			hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            			component: () => import('@/views/Home.vue'),
            			meta: { title: '查询表格', keepAlive: true }
            		},
            		{
            			path: '/list/basic-list',
            			name: 'BasicList',
            			component: () => import('@/views/Home.vue'),
            			meta: { title: '查询表格', keepAlive: true }
            		},
            		{
            			path: '/list/card',
            			name: 'CardList',
            			component: () => import('@/views/Home.vue'),
            			meta: { title: '卡片列表', keepAlive: true }
            		},
            		{
            			path: '/list/search',
            			name: 'SearchList',
            			component: () => import('@/views/Home.vue'),
            			redirect: '/list/search/article',
            			meta: { title: '搜索列表', keepAlive: true },
            			children: [
            				{
            					path: '/list/search/article',
            					name: 'SearchArticles',
            					component: () => import('@/views/Home.vue'),
            					meta: { title: '搜索列表（文章' }
            				},
            				{
            					path: '/list/search/project',
            					name: 'SearchProjects',
            					component: () => import('@/views/Home.vue'),
            					meta: { title: '搜索列表（项目' }
            				},
            				{
            					path: '/list/search/application',
            					name: 'SearchApplications',
            					component: () => import('@/views/Home.vue'),
            					meta: { title: '搜索列表（应用）' }
            				}
            			]
            		}
            	]
            },
            
            // profile
            {
            	path: '/profile',
            	name: 'profile',
            	component: RouteView,
				hidden: true,
            	redirect: '/profile/basic',
            	meta: { title: '详情页', icon: 'ProfileOutlined' },
            	children: [
            		{
            			path: '/profile/basic',
            			name: 'ProfileBasic',
            			component: () => import('@/views/Home.vue'),
            			meta: { title: '基础详情页' }
            		},
            		{
            			path: '/profile/advanced',
            			name: 'ProfileAdvanced',
            			component: () => import('@/views/Home.vue'),
            			meta: { title: '高级详情页' }
            		}
            	]
            },
            
            // result
            {
            	path: '/result',
            	name: 'result',
            	component: RouteView,
				hidden: true,
            	redirect: '/result/success',
            	meta: { title: '结果页', icon: 'CheckCircleOutlined' },
            	children: [
            		{
            			path: '/result/success',
            			name: 'ResultSuccess',
            			component: () => import(/* webpackChunkName: "result" */ '@/views/Home.vue'),
            			meta: { title: '成功页', keepAlive: false, hiddenHeaderContent: true }
            		},
            		{
            			path: '/result/fail',
            			name: 'ResultFail',
            			component: () => import(/* webpackChunkName: "result" */ '@/views/Home.vue'),
            			meta: { title: '失败页', keepAlive: false, hiddenHeaderContent: true }
            		}
            	]
            },
            
            // exception
            {
            	path: '/exception',
            	name: 'exception',
            	component: RouteView,
				hidden: true,
            	redirect: '/exception/403',
            	meta: { title: '异常页', icon: 'WarningOutlined' },
            	children: [
            		{
            			path: '/exception/403',
            			name: '403',
            			component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/403.vue'),
            			meta: { title: '403' }
            		},
            		{
            			path: '/exception/404',
            			name: '404',
            			component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404.vue'),
            			meta: { title: '404' }
            		},
            		{
            			path: '/exception/500',
            			name: '500',
            			component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/500.vue'),
            			meta: { title: '500' }
            		}
            	]
            },
        ]
    },
]

export const constantRouterMap = [
	{
		path: '/user',
		name: 'user',
		component: UserLayout,
		redirect: '/user/login',
		hidden: true,
		children: [
			{
				path: 'login',
				name: 'login',
				component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login.vue'),
				meta: { title: '登录' }
			},
			{
				path: 'pwdChange',
				name: 'pwdChange',
				component: () => import(/* webpackChunkName: "user" */ '@/views/user/pwdChange.vue'),
				meta: { title: '登录' }
			},
			{
				path: 'register',
				name: 'register',
				component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register.vue')
			},
			{
				path: 'registerResult',
				name: 'registerResult',
				component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult.vue')
			},
			{
				path: 'recover',
				name: 'recover',
				component: undefined
			},
		]
	},
	{
		path: '/user/codelogin',
		name: 'codelogin',
		component: () => import(/* webpackChunkName: "user" */ '@/views/user/codelogin.vue'),
		meta: { title: '登录' }
	},
	{
		path: '/user/download',
		name: 'download',
		component: () => import(/* webpackChunkName: "user" */ '@/views/user/download.vue'),
		meta: { title: '插件下载' }
	},
	{
		path: '/exception/500',
		name: 'error',
		component: errorPage,
	},
	{
		path: '/:path(.*)',
		name: 'NoMatch',
		component: () => import('@/views/exception/404.vue'),
	}
]