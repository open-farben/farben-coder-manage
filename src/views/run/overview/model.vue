<template>
	<div>
		<a-modal centered v-model:open="modalVisible" title="设置告警阈值" @ok="handleOk" @cancel="cancel" :width="400">
			<a-form ref="formRef" :model="formState" :rules="rules">
				<a-form-item label="平均响应速率" name="baseSpeed">
					<div class="flex flex-vcenter">
						<a-input-number class="flex-1" id="inputNumber" v-model:value="formState.baseSpeed" :step="60" placeholder="请输入" type="number"/>
						<span class="ml10">ms</span>
					</div>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
	import { message } from 'ant-design-vue/es'
	import { speedEdit } from '@/api/run'
	import { defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
	const props = defineProps({
		row: {
			type: Object,
		},
		modelValue: {
			type: Boolean,
		},
	});
	const formRef = ref();
	const formState = ref({
		baseSpeed: '',
	});

	const rules = {
		baseSpeed: [
			{
				required: true,
				message: '请输入平均响应速率',
				trigger: 'change',
			},
			{ pattern: /^([1-9][0-9]{0,6}|10000000)$/, message: '平均响应速率范围1-10000000'},
		],
	};

	watch(() => props.modelValue,() => {
		if (props.modelValue) {
			formState.value = props.row
			//console.log("===formState==", formState)
			//Object.assign(formState , props.row)
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
			let params = {
				baseSpeed: formState.value.baseSpeed,
			}
			speedEdit(params).then((res) => {
				message.success('操作成功')
				emit('update:modelValue', false)
				emit('refresh')
				resetForm()
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