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
	import { defineProps, defineEmits, computed, reactive, ref, toRaw, watch, onMounted  } from 'vue';
  	import { useUserStore } from "@/store/modules/user.pinia";
	import { useRoute } from 'vue-router'
	import router from '@/router';

	const route = useRoute()
	const props = defineProps({
		row: {
			type: Object,
		},
		firstLogin: {
			type: Boolean,
		},
	});
	console.log(props.row,'11111222222');
	
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
		if(value === formState.value.userId) {
			return Promise.reject(new Error("密码不能与用户名相同!"));
		}
		return Promise.resolve()
	}

	// 判断密码符合标准
	const checkPwd = (rule: any, value: any, callback: any) => {
		// 定义正则表达式，确保密码至少8个字符长，并且包含至少两种类型的字符（大小写字母、数字、特殊字符）
		const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		
    	// 使用正则表达式测试密码
    	if (regex.test(value)) {
    	    // 检查密码中是否至少包含了两种不同类型的字符（大小写字母、数字、特殊字符）
    	    const hasLower = /[a-z]/.test(value);
    	    const hasUpper = /[A-Z]/.test(value);
    	    const hasDigit = /\d/.test(value);
    	    const hasSpecial = /[@$!%*?&]/.test(value);
		
    	    // 确保至少有两种类型被匹配到
    	    const typesCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
    	    return typesCount >= 2;
    	}
	
    	return false;
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
			{ pattern: /^[A-Za-z\d@$!.%*?&]{8,}$/, message: '密码口令长度至少8个字符密码口令长度至少8个字符，且包含大小写字母、数字以及特殊字符中的至少两种组合。'},
			{ validator: decidePwd, trigger: 'blur', required: true }
		],
		confirmPassword: [
			{
				required: true,
				message: '请输入确认密码',
				trigger: 'blur',
			},
			{ pattern: /^[A-Za-z\d@$!.%*?&]{8,}$/, message: '密码口令长度至少8个字符密码口令长度至少8个字符，且包含大小写字母、数字以及特殊字符中的至少两种组合。'},
			{ validator: validatePass, trigger: 'blur', required: true }
		],
	};

	

	watch(() => props.row,() => {
		console.log(props.row,111111111);
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
			const values = toRaw(value)
			//调用加密
      		userStore.codePassword(props.row.userId,{ ...values }).then((res) => {
				if(res.code == '0'){
					if(props.firstLogin) {
						resetForm()
						emit('refresh', false)
					}else{
						message.success('操作成功')
						emit('refresh', true)
						resetForm()
					}
				}
			})
		});
	}
	const cancel = () => {
		resetForm()
		emit('refresh', false)
	}
</script>
<style>
.codelogin-main {
	width: 500px;
}
</style>