<template>
	<div class="user-wrapper">
		<div class="content-box">
			<!-- <span style="overflow: hidden;display: inline-block;">
				<SelectLang :class="theme" class="action" />
			</span> -->
			<a-dropdown>
				<span class="action ant-dropdown-link user-dropdown-menu">
					<a-avatar class="avatar" size="small" :src="UserInfo.avatar" />
					<span class="nickname">{{ UserInfo.userId }}</span>
				</span>
				<template #overlay>
					<a-menu class="user-dropdown-menu-wrapper">
						<a-menu-item key="0">
							<a href="javascript:;" @click="handleUpwd">
								<LockOutlined />
								<span>修改密码</span>
							</a>
						</a-menu-item>
						<a-menu-item key="1">
							<a href="javascript:;" @click="handleLogout">
								<LogoutOutlined />
								<span>退出登录</span>
							</a>
						</a-menu-item>
					</a-menu>
				</template>
			</a-dropdown>	
			<span class="action ant-dropdown-link user-dropdown-menu"  @click="handleNotice" >
				<BellOutlined/>
			</span>
		</div>
		<user-model v-model="visible"></user-model>
	</div>
</template>

<script lang="ts" setup name="UserMenu">
	import { Modal } from 'ant-design-vue'
	import { SettingOutlined, LogoutOutlined, LockOutlined } from '@ant-design/icons-vue'
	import { useRouter } from 'vue-router'
	import { clearUserInfo } from '@/utils/util'
	import UserModel from './userModel.vue';
	import { ref, onMounted, reactive } from 'vue'
  	import { useUserStore } from "@/store/modules/user.pinia";


	const props = defineProps(['theme'])
	const router = useRouter()
	const route = router.currentRoute
	const visible = ref(false)
	const userStore = useUserStore();
	const UserInfo = userStore.userInfo;
	const handleLogout = () => {
		Modal.confirm({
			title: '提示',
			content: '确定要注销登录吗 ?',
			okText: '确定',
			onOk: () => {
				return userStore.Logout().then(() => {
				    clearUserInfo()
				    router.push({path: '/user/login', query: {redirect: route.value.fullPath}})
				})
			},
			onCancel() { }
		})
	}
	const handleUpwd = () => {
		visible.value = true
	}

</script>
<style lang="less">
	.user-dropdown-menu-wrapper {
		.ant-dropdown-menu-item {
			width: 100% !important;
		}
	}
	.ant-pro-drop-down .anticon{
		margin-right: 0;
	}
	.user-info {
		box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
		transition: all .1s ease-out;
		width: 300px;
		float: right;
		background-color: #fff;
		border:1px #fff solid;
	}
</style>