<template>
	<div>
		<a-modal centered v-model:open="modalVisible" :title="props.row.id !='' ? '编辑' : '新增'" @ok="handleOk" @cancel="cancel" :width="400">
			<a-form ref="formRef" :model="formState" :rules="rules" :label-col="{span: 4}" :wrapper-col="{span: 20}">
				<a-form-item label="账号" name="account">
					<a-input :disabled="props.row.id !=''" v-model:value.trim="formState.account" placeholder="请输入账号" />
				</a-form-item>
				<a-form-item label="姓名" name="name">
					<a-input v-model:value.trim="formState.name" placeholder="请输入姓名" />
				</a-form-item>
				<a-form-item label="工号" name="jobNumber">
					<a-input v-model:value.trim="formState.jobNumber" placeholder="请输入工号" :maxlength="20"/>
				</a-form-item>
				<a-form-item label="邮箱" name="email">
					<a-input v-model:value.trim="formState.email" placeholder="请输入邮箱" :maxlength="50"/>
				</a-form-item>
				<a-form-item label="手机" name="mobile">
					<a-input v-model:value.trim="formState.mobile" placeholder="请输入手机" />
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
				<a-form-item label="状态" name="status">
					<a-radio-group v-model:value="formState.status" :options="state.statuList"></a-radio-group>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
	import {addUser, editUser} from '@/api/run'
	import { dict } from '@/api/dict'
	import { onMounted, defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
	import { message } from 'ant-design-vue'
	const props = defineProps({
		row: {
			type: Object,
		},
		treeData: {
			type: Object,
		},
		modelValue: {
			type: Boolean,
		},
	});
	const formRef = ref();
	const formState = reactive({
		id: '',
		account: '',
		name: '',
		jobNumber: '',
		organization: undefined,
		duty: undefined,
		fullOrganization: '',
		mobile: '',
		email: '',
		status: 'ENABLE',
	});
	const state = reactive({
		statuList: [
			{
				value: 'ENABLE',
				label: '启用',
			}, 
			{
				value: 'DISABLE',
				label: '停用',
			}, 
		],
		jobList: [],
	});
	const rules = {
		account: [
			{
				required: true,
				message: '请输入账号',
				trigger: 'blur',
			},
			{ min: 3, max: 18, message: '账号最小长度3位,最大长度18位'},
			{ pattern: /^[a-zA-Z0-9]*$/, message: '账号只能是数字和英文'}
		],
		name: [
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
		mobile: [
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
		status: [
			{
				required: true,
				message: '请选择状态',
				trigger: 'blur',
			},
		],
	};

	watch(() => props.modelValue,() => {
		if (props.modelValue) {
			getData()
			Object.assign(formState , props.row)
		}
	})
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
		//console.log("==info==", info)
		//console.log("==e==", e)
		//formState.organizationName = info.organName
		formState.fullOrganization = info.fullOrganNo
    }
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
		formRef.value.validate().then(() => {
			if(formState.jobNumber == ''){
				formState.jobNumber = null
			}
			if(props.row.id){
				editUser(formState).then((res) => {
					if(res.code == '0'){
						message.success('修改成功')
						emit('update:modelValue', false)
						emit('refresh')
						resetForm()
					}
				})
			}else{
				addUser(formState).then((res) => {
					if(res.code == '0'){
						message.success(res.message)
						emit('update:modelValue', false)
						emit('refresh')
						resetForm()
					}
				})
			}
		}).catch(error => {
			console.log('error', error);
		});
	}
	const cancel = () => {
		emit('update:modelValue', false)
		resetForm()
	}
</script>