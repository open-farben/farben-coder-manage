<template>
	<div>
		<a-modal centered v-model:open="modalVisible" title="编辑" @ok="handleOk" @cancel="cancel" :width="400">
			<a-form ref="formRef" :model="formState" :rules="rules" :label-col="{span: 5}" :wrapper-col="{span: 19}">
				<a-form-item label="字典编码" name="dictCode">
					<a-input :disabled="true" v-model:value="formState.dictCode" placeholder="请输入编码" />
				</a-form-item>
				<a-form-item label="字典名称" name="dictName">
					<a-input v-model:value="formState.dictName" placeholder="请输入名称" :maxlength="50"/>
				</a-form-item>
				<a-form-item label="字典描述" name="mark">
					<a-textarea v-model:value="formState.mark" placeholder="请输入描述" allow-clear :maxlength="50"/>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
	import { edit } from '@/api/dict'
	import { defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
	import { message } from 'ant-design-vue'
	const props = defineProps({
		row: {
			type: Object,
		},
		modelValue: {
			type: Boolean,
		},
	});
	const formRef = ref();
	const formState = reactive({
		id: '',
		dictCode: '',
		dictName: '',
		mark: '',
	});
	const rules = {
		dictCode: [
			{
				required: true,
				message: '请输入编码',
				trigger: 'blur',
			},
		],
		dictName: [
			{
				required: true,
				message: '请输入名称',
				trigger: 'blur',
			},
		],
		mark: [
			{
				required: false,
				message: '请输入描述',
				trigger: 'blur',
			},
		],
	};

	watch(() => props.modelValue,() => {
		if (props.modelValue) {
			Object.assign(formState , props.row)
		}
	})
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
			edit(formState).then((res) => {
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