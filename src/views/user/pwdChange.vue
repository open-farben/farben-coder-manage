<template>
	<div class="codelogin-main">
		<p class="tc mb20">修改密码</p>
		<a-form ref="formRef" :model="formState" class="user-layout-login" :rules="rules" :label-col="{span:6}" :wrapper-col="{span: 18}">
			<a-form-item label="旧密码" name="password">
				<a-input-password v-model:value="formState.password" placeholder="请输入密码" />
			</a-form-item>
			<a-form-item label="新密码" name="newPassword">
				<a-popover v-model:open="state.visible" trigger="click" placement="right">
  				  	<template #content>
						<p style="width: 150px;">密码口令长度至少8个字符，且包含大小写字母、数字以及特殊字符中的至少两种组合。</p>
  				  	</template>
  				  	<a-input-password v-model:value="formState.newPassword" placeholder="请输入密码" oncut="return false" onpaste="return false" oncopy="return false"/>
  				</a-popover>
			</a-form-item>
			<a-form-item label="确认密码" name="confirmPassword">
				<a-popover v-model:open="state.confirmPassword" trigger="click" placement="right">
  					<template #content>
					<p style="width: 150px;">密码口令长度至少8个字符，且包含大小写字母、数字以及特殊字符中的至少两种组合。</p>
  					</template>
  					<a-input-password v-model:value="formState.confirmPassword" placeholder="请输入密码" oncut="return false" onpaste="return false" oncopy="return false"/>
  				</a-popover>
			</a-form-item>
			<a-space class="flex flex-hcenter">
				<a-button class="login-button" @click="cancel">返回</a-button>
				<a-button type="primary" class="login-button" @click="handleOk">确定</a-button>
			</a-space>
		</a-form>
	</div>
</template>

<script lang="ts" setup>
	import { Modal, message } from 'ant-design-vue'
	import { defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
  	import { useUserStore } from "@/store/modules/user.pinia";
	import { useRoute } from 'vue-router'
	import router from '@/router';

	const route = useRoute()
	const props = defineProps({
		row: {
			type: Object,
		},
	});
 	const userStore = useUserStore();
	const state = reactive({
		visible:false,
		confirmPassword:false,
	})
	const formRef = ref();
	const formState = ref({
		password: '',
		newPassword: '',
		confirmPassword: '',
	});
	const validatePass = (rule: any, value: any, callback: any) => {
		if (value != '' && value !== formState.value.newPassword) {
			return Promise.reject(new Error("两次输入密码不一致!"));
		}
		return Promise.resolve()
	}
	// 密码不能与用户名相同
	const decidePwd = (rule: any, value: any, callback: any) => {
		if(value === route.query.userId) {
			return Promise.reject(new Error("密码不能与用户名相同!"));
		}
		return Promise.resolve()
	}

	const rules = {
		password: [
			{
				required: true,
				message: '请输入旧密码',
				trigger: 'blur',
			},
			
		],
		newPassword: [
			{
				required: true,
				message: '请输入新密码',
				trigger: 'blur',
			},
			{ pattern: /^[A-Za-z\d@$!.%*?&]{8,}$/, message: '密码口令长度至少8个字符，且包含大小写字母、数字以及特殊字符中的至少两种组合。'},
			{ validator: decidePwd, trigger: 'blur', required: true }

		],
		confirmPassword: [
			{
				required: true,
				message: '请输入确认密码',
				trigger: 'blur',
			},
			{ pattern: /^[A-Za-z\d@$!.%*?&]{8,}$/, message: '密码口令长度至少8个字符，且包含大小写字母、数字以及特殊字符中的至少两种组合。'},
			{ validator: validatePass, trigger: 'blur', required: true }

		],
	};

	

	watch(() => props.row,() => {
		if (props.row) {
			formState.value = props.row
		}
	})
	//表单重置
	const resetForm = () => {
		formRef.value.resetFields();
		formState.value = {
			password: '',
			newPassword: '',
			confirmPassword: '',
		}
	}
	const emit = defineEmits(['refresh']);
	//确定按钮的回调
	const handleOk = () => {
		formRef.value.validate().then((value) => {
			console.log(value);
			userStore.changePwd(route.query.userId,{ ...value }).then((res:any) => {
				if(res) {
					message.success('修改成功')
					router.push({ path: '/user/login' })
				}
			})
		}).catch(error => {
			console.log('error', error);
		});
	}
	const cancel = () => {
		router.push({ path: '/user/login' })
		resetForm()
		emit('refresh', false)
	}
</script>
<style>
.codelogin-main {
	width: 500px;
}
</style>