<template>
	<div>
		<a-modal centered v-model:open="modalVisible" title="编辑" @ok="handleOk" @cancel="cancel" :width="400">
			<a-form ref="formRef" :model="formState" :rules="rules" :label-col="{span: 5}" :wrapper-col="{span: 19}">
				<a-form-item label="机构名称" name="organName">
					<a-input v-model:value="formState.organName" placeholder="请输入机构名称" :maxlength="50"/>
				</a-form-item>
				<a-form-item label="上级机构" required name="parentOrganName">
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
					<a-input v-model:value="formState.organPost" placeholder="请输入邮政编码" :maxlength="10"/>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
	import {detail, listAdd, listEdit} from '@/api/dept'
	import { defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
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
	const state = reactive({
		expandedKeys: props.expandedKeys || ['10011001001'],
	});
	const formState = reactive({
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

	watch(() => props.modelValue,() => {
		if (props.modelValue) {
			//formState.value = props.row
			//Object.assign(formState , props.row)
			getDetail()
		}
	})
	//选择树
	const handleNode = (e, info) => {
		console.log("==info==", info)
		formState.parentOrganName = info.organName
		formState.parentOrganNo = info.organNo
    }
	//获取数据
	const getDetail = () => {
		let params = {
			id: props.row.id,
		}
		detail(params).then((res) => {
			if(res.code == '0'){
				//formState.value = res.data
				Object.assign(formState , res.data)
			}
		})
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
			listEdit(formState).then((res) => {
				if(res.code == '0'){
					message.success('修改成功')
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
</script>