<template>
	<div>
		<a-modal centered v-model:open="modalVisible" :title="props.row.id && props.row.id !='' ? '编辑' : '新增'" @ok="handleOk" @cancel="cancel" :width="400">
			<a-form ref="formRef" :model="formState" :rules="rules" :label-col="{span: 5}" :wrapper-col="{span: 19}">
				<a-form-item label="字典编码" name="dictCode">
					<a-input :disabled="true" v-model:value="formState.dictCode" placeholder="请输入代码" />
				</a-form-item>
				<a-form-item label="字典键值" name="kindCode">
					<a-input v-model:value="formState.kindCode" placeholder="请输入键值" :maxlength="50"/>
				</a-form-item>
				<a-form-item label="字典标签" name="kindValue">
					<a-input v-model:value="formState.kindValue" placeholder="请输入标签" :maxlength="50"/>
				</a-form-item>
				<a-form-item label="字典排序" name="orderNo">
					<a-input-number class="w100" id="inputNumber" v-model:value="formState.orderNo" placeholder="请输入排序" type="number"/>
				</a-form-item>
				<a-form-item label="状态" name="disable">
					<a-radio-group v-model:value="formState.disable" :options="state.statuList"></a-radio-group>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
	import { defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
	import { listAdd, listEdit } from '@/api/dict'
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
	const state = reactive({
		searchKey: '',
		ids: '',

		visible: false,
		pagination: {
			current: 1,
			pageSize: 10, // 默认每页显示数量
			total: 0, //总条数
			showSizeChanger: true, // 显示可改变每页数量
			pageSizeOptions: ['10', '20', '50', '100'], // 每页数量选项
			showTotal: (total:number) => `共 ${total} 条`, // 显示总数
		},
		statuList: [
			{
				value: 0,
				label: '启用',
			}, 
			{
				value: 1,
				label: '禁用',
			}, 
		],
	})
	const formState = reactive({
		id: '',
		dictCode: '',
		kindCode: '',
		kindValue: '',
		orderNo: '',
		disable: 0,
	});
	const rules = {
		dictCode: [
			{
				required: true,
				message: '请输入字典编码',
				trigger: 'blur',
			},
		],
		kindCode: [
			{
				required: true,
				message: '请输入字典键值',
				trigger: 'blur',
			},
		],
		kindValue: [
			{
				required: true,
				message: '请输入字典标签',
				trigger: 'blur',
			},
		],
		orderNo: [
			{
				required: true,
				message: '请输入字典排序',
				trigger: 'blur',
			},
		],
		disable: [
			{
				required: true,
				message: '请选择状态',
				trigger: 'change',
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
			if(props.row.id){
				listEdit(formState).then((res) => {
					if(res.code == '0'){
						message.success('修改成功')
						emit('update:modelValue', false)
						emit('refresh')
						resetForm()
					}
				})
			}else{
				listAdd(formState).then((res) => {
					if(res.code == '0'){
						message.success('添加成功')
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