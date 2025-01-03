<template>
	<div id="userLayout" :class="['user-layout-wrapper', isMobile && 'mobile']">
		<div class="container">
			<div class="user-layout-content flex flex-center flex-column">
				<template v-if="route.query && route.query.account || state.pwdShow == true">
					<pwd-model :row="formState" :firstLogin="state.firstLogin" @refresh="refresh"></pwd-model>
				</template>
				<template v-else>
					<div class="top">
						<div class="header">
							<a>
								<img src="~@/assets/Farben-LOGO.svg" class="farben" alt="logo">
								<a-divider type="vertical" style="height: 15px; background-color: #1677ff" />
								<img src="~@/assets/icons/logo.png" class="logo" alt="logo" />
								<span class="title">GPTCoder</span>
							</a>
						</div>
					</div>
					<div class="main">
						<div class="codelogin-user flex flex-vcenter">
							<router-link class="action f14" target="_blank" :to="{ path: '/user/download' }">
								<DownloadOutlined />
								插件下载
							</router-link>
							<a-dropdown v-if="userInfo.name || state.visible == true || state.ispwd == true">
								<span class="action ant-dropdown-link user-dropdown-menu">
									<a-avatar class="avatar" size="small" :src="userInfo.avatar" />
									<span class="nickname">{{ userInfo.name }}</span>
								</span>
								<template #overlay>
									<a-menu class="user-dropdown-menu-wrapper">
										<a-menu-item key="0">
											<a href="javascript:;" @click="updataPwd">
												<EditOutlined />
												<span>修改密码</span>
											</a>
										</a-menu-item>
									</a-menu>
								</template>
							</a-dropdown>
						</div>
						<a-form id="formLogin" ref="formLogin" class="user-layout-login" :model="formState" :rules="rules" v-if="state.isLogin == false && state.visible == false">
							<a-form-item name="userId">
								<a-input size="large" type="text" placeholder="请输入账号"
									v-model:value="formState.userId">
									<template #prefix>
										<UserOutlined :style="{ color: 'rgba(0,0,0,.25)' }" />
									</template>
								</a-input>
							</a-form-item>

							<a-form-item name="password">
								<a-input-password size="large" placeholder="请输入密码" v-model:value="formState.password">
									<template #prefix>
										<LockOutlined :style="{ color: 'rgba(0,0,0,.25)' }" />
									</template>
								</a-input-password>
							</a-form-item>
							<a-form-item style="margin-top: 24px">
								<a-button size="large" type="primary" htmlType="submit" class="login-button" :loading="state.loginBtn" :disabled="state.loginBtn" @click="handleSubmit">登 录</a-button>
							</a-form-item>
						</a-form>
						<div class="user-layout-login" v-if="state.isLogin == true && state.visible == false">
							<p class="tc"><CheckCircleOutlined :style="{fontSize: '18px', color: '#52c41a'}" /><span class="ml5">登录成功</span></p>
							<p class="c999 f14 tc">您可以关闭此页面，在您所使用的IDE工具中开始体验您的辅助编程之旅。</p>
						</div>
						<div class="user-layout-login" v-if="state.ispwd == true">
							<p class="tc"><CheckCircleOutlined :style="{fontSize: '18px', color: '#52c41a'}" /><span class="ml5">修改成功</span></p>
						</div>
					</div>
				</template>
			</div>
		</div>
	</div>
	<loginModel v-model="state.iserror" :tableData="state.errorList" :row="formState"></loginModel>
</template>

<script lang="ts" setup name="Login">
	import { isMobile } from '@/utils/device';
	import { reactive, ref, toRaw, h } from 'vue'
	import { notification, Modal } from 'ant-design-vue'
	import { useRouter, useRoute } from 'vue-router'
	import PwdModel from './pwdModel.vue';
	import { UserOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
	import loginModel from './loginModel.vue';
  	import { useUserStore } from "@/store/modules/user.pinia";
	
	const formLogin = ref()
	const router = useRouter()
	const route = useRoute()
    const userStore = useUserStore();

	document.title = '登录'

	const state = reactive({
		visible: false,
		isLoginError: false,
		loginBtn: false,
		isLogin: false,
		ispwd: false,

		pwdShow: false,

		iserror: false,
		errorList: [],

		firstLogin: false,
	})
	
	const userInfo = reactive({
		'name': '',
		'avatar': 'https://gw.alipayobjects.com/zos/rmsportal/jZUIxmJycoymBprLOUbT.png',
	})

	// #region 表单相关
	const formState = reactive({
		uuid: route.query.sessionId || '',
		machineId: route.query.machineId || '',
		device: route.query.device || '',

		ideName: route.query.ideName || '',
		ideVersion: route.query.ideVersion || '',
		pluginType: route.query.pluginType || '',
		pluginVersion: route.query.pluginVersion || '',

		userId: route.query.account || '',
		password: '',
	})
	if(Object.keys(route.query).length != 0){
		if(route.query.account){
			state.pwdShow = true
		}
		router.push({ query: {} });
	} else {
	  notification['error']({
        message: '请重新登陆',
        description: '登陆条件不完整',
        duration: 4
      })
	}
	console.log("===route.query===", route.query)
	console.log("===uuid===", formState)

	const rules = {
	    userId: [{ required: true, message: '请输入账号', trigger: 'change' }],
	    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
	}

	//登录
	const handleSubmit = (e) => {
		e.preventDefault()
		formLogin.value.validate([ 'userId', 'password' ]).then(() => {
		const values = toRaw(formState)
		const loginParams: any = { ...values }
		state.loginBtn = true
		//调用加密账号密码 插件登陆，不需要保存登陆状态
		userStore.Login(loginParams, false).then((res) => {
			loginSuccess(res)
			state.loginBtn = false
		}).catch(err => requestFailed(err)).finally(() => {
			state.loginBtn = false
		})

		}).catch((error) => {
		setTimeout(() => {
			state.loginBtn = false
		}, 600)
		})
	}
	//登录成功
	const loginSuccess = (res) => {
		if(res.code == '0'){
			/*router.push({ path: '/' })*/
			//延迟1秒显示欢迎信息
			setTimeout(() => {
				notification.success({
					message: '欢迎',
					description: `欢迎回来`
				})
			}, 1000)
			state.isLoginError = false
			state.isLogin = true
			userInfo.name = formState.userId
		}else if(res.code == '99999'){
			//登录限制
			state.errorList = res.data
			state.iserror = true
		}else if(res.code == 'A0123') {
  		  	Modal.confirm({
				title: '提示',
				content: () =>
				h('span', {}, [
					h('span', '初次登录系统，建议您尽快修改默认密码，确保账号安全。'),
				]),
				okText: '修改密码',
				cancelText: '暂不修改',
				onOk: (() => {
					state.ispwd = false
	    			state.pwdShow = true;
					state.firstLogin = true
				}),
				onCancel() {}
			})
  		}else{
			state.loginBtn = false
		}
	    
	}
	//登录失败
	const requestFailed = (err) => {
	    state.isLoginError = true
	    notification['error']({
	        message: '错误',
	        description: ((err.response || {}).data || {}).message || '请求出现错误，请稍后再试',
	        duration: 4
	    })
	}
	// #endregion
	//修改密码
	const updataPwd = () => {
		state.ispwd = false
	    state.pwdShow = true;
	}
	const refresh = (e) => {
		state.ispwd = e
		state.pwdShow = false
	    state.visible = e;
		state.firstLogin = false
	}
</script>

<style lang="less" scoped>
	@import '../../style/index.less';
	#userLayout.user-layout-wrapper {
		height: 100%;

		&.mobile {
			.container {
				.main {
					max-width: 368px;
					width: 98% !important;
				}
			}
		}

		.container {
			width: 100%;
			min-height: 100%;
			background: #f0f2f5 url(@/assets/background.svg) no-repeat 50%;
			background-size: 100%;
			//padding: 50px 0 84px;
			position: relative;

			.user-layout-content {
				padding: 32px 0 24px;
				height: 100vh;

				.top {
					text-align: center;

					.header {
						height: 44px;
						line-height: 44px;
						margin-bottom: 40px;

						.farben {
							height: 38px;
							vertical-align: top;
							border-style: none;
						}
						
						.logo {
							height: 44px;
							vertical-align: top;
							margin-right: 16px;
							border-style: none;
						}

						.title {
							font-size: 33px;
							color: rgba(0, 0, 0, 0.85);
							font-family: Avenir, 'Helvetica Neue', Arial, Helvetica, sans-serif;
							font-weight: 600;
							position: relative;
							top: 2px;
						}
					}

					.desc {
						font-size: 14px;
						color: rgba(0, 0, 0, 0.45);
						margin-top: 12px;
						margin-bottom: 40px;
					}
				}

				.main {
					min-width: 260px;
					width: 368px;
					margin: 0 auto;
				}

			}

			a {
				text-decoration: none;
			}
		}
	}
	.user-layout-login {
		label {
			font-size: 14px;
		}

		.getCaptcha {
			display: block;
			width: 100%;
			height: 40px;
		}

		.forge-password {
			font-size: 14px;
		}

		button.login-button {
			padding: 0 15px;
			font-size: 16px;
			height: 40px;
			width: 100%;
		}

		.user-login-other {
			text-align: left;
			margin-top: 24px;
			line-height: 22px;

			.anticon {
				font-size: 24px;
				color: rgba(0, 0, 0, 0.2);
				margin-left: 16px;
				vertical-align: middle;
				cursor: pointer;
				transition: color 0.3s;

				&:hover {
					color: @primary-color;
				}
			}

			.register {
				float: right;
			}
		}
	}
	.codelogin-user{
		position: absolute;
		top: 0;
		right: 0;
		height: 44px;
		.action{
			padding: 0 12px;
			.avatar{
				margin: 10px 8px 10px 0;
			}
		}
		
	}
	.codelogin-main{
		margin: 0 auto;
		// background: #fff;
		padding: 20px;
	}
</style>