<template>
	<div style="width:400px;">
		<a-spin :spinning="state.loading">
			<a-form ref="formRef" :model="formState" :rules="rules" :label-col="{span: 5}">
				<a-form-item label="机构名称" name="organName">
					<a-input v-model:value="formState.organName" placeholder="请输入机构名称" :maxlength="50"/>
				</a-form-item>
				<a-form-item label="上级机构" name="parentOrganName" key="parentOrganName">
					<a-tree-select
						v-model:value="formState.parentOrganName"
						:dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
						:dropdownMatchSelectWidth="false"
						:tree-data="props.treeData"
						placeholder="请选择上级机构"
						:field-names="{children:'children', label:'organName', key:'id', value: 'id' }"
						:treeDefaultExpandedKeys="[props.treeData[0].id]"
						@select="handleNode"
					>
					</a-tree-select>
				</a-form-item>
				<a-form-item label="机构地址" name="organAddress">
					<a-textarea v-model:value="formState.organAddress" placeholder="请输入地址" allow-clear :maxlength="200"/>
				</a-form-item>
				<a-form-item label="邮政编码" name="organPost">
					<a-input v-model:value="formState.organPost" placeholder="请输入邮箱" :maxlength="10"/>
				</a-form-item>
				<a-form-item label="" style="text-align: center;">
					<a-button type="primary" @click="handleOk">保存</a-button>
				</a-form-item>
			</a-form>
		</a-spin>
	</div>
</template>

<script lang="ts" setup>
	import { onMounted, defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
	import {detail, listEdit} from '@/api/dept'
	import { message } from 'ant-design-vue'
	const props = defineProps({
		row: {
			type: Object,
		},
		treeData: {
			type: Object,
		},
	});
	const formRef = ref();
	const state = reactive({
		loading: false,
	})
	const formState = ref({
		id: '',
		parentOrganNo: '',
		parentOrganName: undefined,
		organName: '',
		organAddress: '',
		organPost: '',
	});
	const rules = {
		parentOrganName: [
			{
				required: true,
				message: '请选择上级机构',
				trigger: 'blur',
			},
		],
		organName: [
			{
				required: true,
				message: '请输入机构名称',
				trigger: 'blur',
			},
		],
		organAddress: [
			{
				required: false,
				message: '请输入机构地址',
				trigger: 'blur',
			},
		],
		organPost: [
			{
				required: false,
				message: '请输入邮政编码',
				trigger: 'blur',
			},
		],
	};

	watch(() => props.row,() => {
		if (props.row.parentOrganNo) {
			console.log("==props.row==", props.row.parentOrganNo)
			//formState.value = props.row
			getDetail()
		}
	})
	//选择树
	const handleNode = (e, info) => {
		console.log("==info==", info)
		formState.value.parentOrganName = info.organName
		formState.value.parentOrganNo = info.organNo
    }
	//表单重置
	const resetForm = () => {
		formRef.value.resetFields();
	}
	const emit = defineEmits(['refresh']);
	//确定按钮的回调
	const handleOk = () => {
		formRef.value.validate().then(() => {
			listEdit(formState.value).then((res) => {
				if(res.code == '0'){
					message.success('修改成功')
					emit('refresh')
					resetForm()
				}
			})
		}).catch(error => {
			console.log('error', error);
		});
	}
	const cancel = () => {
		resetForm()
	}
	//获取数据
	const getDetail = () => {
		state.loading = true
		let params = {
			id: props.row.id || props.treeData[0].id,
		}
		detail(params).then((res) => {
			if(res.code == '0'){
				formState.value = res.data
			}
			state.loading = false
		})
	}
	onMounted(() => {
		getDetail()
	})
	defineExpose({
		getDetail,
	})
</script>