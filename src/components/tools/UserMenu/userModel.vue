<template>
	<div>
		<a-modal centered v-model:open="modalVisible" title="修改密码" @ok="handleOk" @cancel="cancel" :width="400">
			<a-form ref="formRef" :model="formState" :rules="rules" :label-col="{span: 6}" :wrapper-col="{span: 18}">
				<a-form-item label="旧密码" name="password">
					<a-input-password v-model:value="formState.password" placeholder="请输入密码" />
				</a-form-item>
				<a-form-item label="新密码" name="newPassword">
					<a-input-password v-model:value="formState.newPassword" placeholder="请输入密码" />
				</a-form-item>
				<a-form-item label="确认密码" name="confirmPassword">
					<a-input-password v-model:value="formState.confirmPassword" placeholder="请输入密码" />
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
	import { Modal, message } from 'ant-design-vue'
	import { defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
	import { useRouter } from 'vue-router'
  import { useUserStore } from "@/store/modules/user.pinia";

	const props = defineProps({
		modelValue: {
			type: Boolean,
		},
	});
	const router = useRouter()
	const route = router.currentRoute
	const userStore = useUserStore();
	const UserInfo = userStore.userInfo;
	const formRef = ref();
	const formState = reactive({
		password: '',
		newPassword: '',
		confirmPassword: '',
	});
	const validatePass = (rule: any, value: any, callback: any) => {
		if (value != '' && value !== formState.newPassword) {
			return Promise.reject(new Error("两次输入密码不一致!"));
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
			// { pattern: /^[a-zA-Z0-9]{6,18}$/, message: '密码长度6-18位'}
		],
		newPassword: [
			{
				required: true,
				message: '请输入新密码',
				trigger: 'blur',
			},
			{ pattern: /^[A-Za-z\d@$!.%*?&]{8,}$/, message: '密码口令长度至少8个字符，且包含大小写字母、数字以及特殊字符中的至少两种组合。'}
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

	//表单重置
	const resetForm = () => {
		formRef.value.resetFields();
	}
	const emit = defineEmits(['update:modelValue', 'refresh']);
	const modalVisible = computed({
		get: () => props.modelValue,
		set: v => emit('update:modelValue', v),
	})
	//确定按钮的回调
	const handleOk = () => {
		formRef.value.validate().then((value) => {
			const values = toRaw(value)
			userStore.updatePassword(UserInfo.userId,{ ...values }).then((res) => {
				if(res.code == '0'){
					Modal.confirm({
						title: '提示',
						content: '修改成功,请重新登录',
						okText: '确定',
						cancelButtonProps: { style: { display: 'none' }}, // 隐藏取消按钮
						onOk: () => {
							return userStore.Logout().then(() => {
								router.push({path: '/user/login', query: {redirect: route.value.fullPath}})
							})
						},
						onCancel() { }
					})
					emit('update:modelValue', false)
					resetForm()
				}
			})
		}).catch(error => {
			console.log('error', error);
		});
	}
	const cancel = () => {
		emit('update:modelValue', false)
		resetForm()
	}
</script>