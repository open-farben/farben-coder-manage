<template>
	<div>
		<a-modal centered v-model:open="modalVisible" :title="props.row.id && props.row.id !='' ? '编辑' : '新增'" @ok="handleOk" @cancel="cancel" :width="400">
			<a-form ref="formRef" :model="formState" :rules="rules" :label-col="{span: 4}" :wrapper-col="{span: 20}">
				<a-form-item label="账号" name="userId">
					<a-input :disabled="props.row.id !=''" v-model:value.trim="formState.userId" placeholder="请输入账号" />
				</a-form-item>
				<a-form-item label="姓名" name="userName">
					<a-input v-model:value.trim="formState.userName" placeholder="请输入姓名" />
				</a-form-item>
				<a-form-item label="工号" name="jobNumber">
					<a-input v-model:value.trim="formState.jobNumber" placeholder="请输入工号" :maxlength="20"/>
				</a-form-item>
				<a-form-item label="邮箱" name="email">
					<a-input v-model:value.trim="formState.email" placeholder="请输入邮箱" :maxlength="50"/>
				</a-form-item>
				<a-form-item label="手机" name="phone">
					<a-input v-model:value.trim="formState.phone" placeholder="请输入手机" />
				</a-form-item>
				<a-form-item label="组织" name="organization">
					<a-tree-select
						v-model:value="formState.organization"
						:dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
						:dropdownMatchSelectWidth="false"
						:tree-data="props.treeData"
						placeholder="请选择组织"
						:field-names="{children:'children', label:'organName', key:'organNo', value: 'organNo' }"
						:treeDefaultExpandedKeys="[props.treeData[0].organNo]"
						@select="handleNode"
					>
					</a-tree-select>
				</a-form-item>
				<a-form-item label="职务" name="duty">
					<a-select v-model:value="formState.duty" placeholder="请选择职务">
						<a-select-option v-for="item in state.jobList" :key="item.kindCode" :value="item.kindCode">{{ item.kindValue }}</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="角色" name="roleId">
					<a-select mode="multiple" :showArrow="true" :showSearch="false" :max-tag-count="2" v-model:value="formState.roleId" placeholder="请选择角色" @change="handleChange" :disabled="props.row.roleId=='administrator'?true:false">
						<a-select-option v-for="item in state.roleList" :key="item.id" :value="item.id">{{ item.roleName }}</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="状态" name="inUse">
					<a-radio-group v-model:value="formState.inUse" :options="state.statuList"></a-radio-group>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
	import {addedit} from '@/api/account'
	import { dict } from '@/api/dict'
	import { allRole, getCurrent } from '@/api/role'
	import { message } from 'ant-design-vue'
	import { onMounted, defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
	const props = defineProps({
		row: {
			type: Object,
		},
		treeData: {
			type: Object,
		},
		expandedKeys: {
			type: Object,
		},
		modelValue: {
			type: Boolean,
		},
	});
	const formRef = ref();
	const formState = reactive({
		id: '',
		userId: '',
		userName: '',
		jobNumber: '',
		//role: undefined,
		duty: undefined,
		organization: undefined,
		//organizationName: '',
		fullOrganization: '',
		phone: '',
		email: '',
		inUse: 0,
		roleId: [],
	});
	const state = reactive({
		statuList: [
			{
				value: 0,
				label: '启用',
			}, 
			{
				value: 1,
				label: '停用',
			}, 
		],
		jobList: [],
		roleList: [],
	});
	const rules = {
		userId: [
			{
				required: true,
				message: '请输入账号',
				trigger: 'blur',
			},
			{ min: 3, max: 18, message: '账号最小长度3位,最大长度18位'},
			{ pattern: /^[a-zA-Z0-9]*$/, message: '账号只能是数字和英文'}
		],
		userName: [
			{
				required: true,
				message: '请输入姓名',
				trigger: 'blur',
			},
			{ min: 2, max: 20, message: '姓名最小长度2位,最大长度20位'},
		],
		jobNumber: [
			{
				required: false,
				message: '请输入工号',
				trigger: 'blur',
			},
		],
		duty: [
			{
				required: true,
				message: '请选择职务',
				trigger: 'blur',
			},
		],
		organization: [
			{
				required: true,
				message: '请选择组织',
				trigger: 'blur',
			}, 
		],
		phone: [
			{
				required: false,
				message: '请输入手机',
				trigger: 'blur',
			},
			{ pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号'}
		],
		email: [
			{
				required: true,
				message: '请输入邮箱',
				trigger: 'blur',
			},
			{ pattern: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, message: '请输入正确的邮箱'}
		],
		inUse: [
			{
				required: true,
				message: '请选择状态',
				trigger: 'blur',
			},
		],
		roleId: [
			{
				required: true,
				message: '请选择角色',
				trigger: 'blur',
			},
		],
	};

	watch(() => props.modelValue,() => {
		if (props.modelValue) {
			getData()
			let params = {
				id: props.row.id,
				userId: props.row.userId,
				userName: props.row.userName,
				jobNumber: props.row.jobNumber,
				duty: props.row.duty,
				organization: props.row.organization,
				fullOrganization: props.row.fullOrganization,
				phone: props.row.phone,
				email: props.row.email,
				inUse: props.row.inUse,
				roleId: props.row.roleId && props.row.id ? props.row.roleId.split(',') : [],
			}
			Object.assign(formState , params)
			if(props.row.id) {
				getCurrentRole()
			}
			
		}
	})
	//获取当前角色
	const getCurrentRole = () => {
		let params = {
			id: props.row.id,
		}
		getCurrent(params).then((res:any) => {
			console.log(res.data.roleList);
			if(res.data){
				formState.roleId = res.data.roleList
			}
		})
	}
	//获取角色
	const getRole = () => {
		allRole().then((res:any) => {
			if(res.data){
				state.roleList = res.data
			}
		})
	}

	//获取数据
	const getData = () => {
		let params = {
			dictCode: 'JOB_INFO',
		}
		dict(params).then((res:any) => {
			if(res.data){
				state.jobList = res.data || []

			}
		})
	}
	//选择树
	const handleNode = (e, info) => {
		console.log("==info==", info)
		//formState.organizationName = info.organName
		formState.fullOrganization = info.fullOrganNo
    }
	//表单重置
	const resetForm = () => {
		formRef.value.resetFields();
	}
	//选择角色
	const handleChange = (val) => {
		if (val.length > 10) {
			val.pop();
			message.info('最多只能选10个角色')
		}
	}
	const emit = defineEmits(['update:modelValue', 'refresh']);
	const modalVisible = computed({
		get: () => props.modelValue,
		set: v => emit('update:modelValue', v),
	})
	//确定按钮的回调
	const handleOk = () => {
		formRef.value.validate().then(() => {
			console.log('values', formState);
			let params = {
				id: formState.id,
				userId: formState.userId,
				userName: formState.userName,
				jobNumber: formState.jobNumber,
				duty: formState.duty,
				organization: formState.organization,
				fullOrganization: formState.fullOrganization,
				phone: formState.phone,
				email: formState.email,
				inUse: formState.inUse,
				roleId: formState.roleId ? formState.roleId.join(',') : '',
			}
			console.log(formState.inUse);
			
			addedit(params).then((res) => {
				if(res.code == '0'){
					if(props.row.id){
						message.success('修改成功')
					}else{
						message.success('添加成功')
					}
					emit('update:modelValue', false)
					emit('refresh')
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
	onMounted(() => {
		getRole()
	})
</script>