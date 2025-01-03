<template>
	<div>
		<a-modal centered v-model:open="modalVisible" :title="props.row.id && props.row.id !='' ? '编辑' : '新增'" @ok="handleOk" @cancel="cancel" :width="500">
			<a-form ref="formRef" :model="formState" :rules="rules" :label-col="{span: 4}" :wrapper-col="{span: 20}">
				<a-form-item label="角色名称" name="roleName">
					<a-input v-model:value="formState.roleName" placeholder="请输入角色名称" :maxlength="20"/>
				</a-form-item>
				<a-form-item label="权限标识" name="roleKey">
					<a-input :disabled="props.row.id !=''" v-model:value="formState.roleKey" placeholder="请输入权限字符" :maxlength="18"/>
				</a-form-item>
				<a-form-item label="角色描述" name="remark">
					<a-textarea v-model:value="formState.remark" placeholder="请输入备注" allow-clear :maxlength="200"/>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
    import {listAdd, listEdit} from '@/api/role'
	import { defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
    import { Modal, message } from 'ant-design-vue'

	const props = defineProps({
		row: {
			type: Object,
		},
		modelValue: {
			type: Boolean,
		},
	})
	const formRef = ref();
	const formState = reactive({
        id: '',
		roleName: '',
		roleKey: '',
		remark: '',
	})
	const rules = {
		roleName: [
			{
				required: true,
				message: '请输入角色名称',
				trigger: 'blur',
			},
		],
		roleKey: [
			{
				required: true,
				message: '请输入权限字符',
				trigger: 'blur',
			},
			{ pattern: /^[a-zA-Z]*$/, message: '权限字符只能是英文'}
		],
		remark: [
			{
				required: false,
				message: '请输入备注',
				trigger: 'change',
			},
		],
	}

	watch(() => props.modelValue,() => {
		if (props.modelValue) {
			Object.assign(formState , props.row)
		}
	})
	//表单重置
	const resetForm = () => {
		formRef.value.resetFields();
	}
	const emit = defineEmits(['update:modelValue', 'refresh', 'auth']);
	const modalVisible = computed({
		get: () => props.modelValue,
		set: v => emit('update:modelValue', v),
	})

	//确定按钮的回调
	const handleOk = () => {
		formRef.value.validate().then(() => {
            console.log('values', formState);
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
					console.log('resresres', res);
                    if(res.code == '0'){
                        message.success('添加成功')
                        emit('update:modelValue', false)
                        emit('refresh')
                        resetForm()
						if(res.data){
							confirm(res.data)
						}
                    }
                })
			}
		}).catch(error => {
			console.log('error', error);
		});
	}

	const confirm = (e:any) => {
		Modal.confirm({
			title: '提示',
			content: '是否立即去授权菜单 ?',
			okText: '确定',
			onOk: () => {
				emit('auth', {id: e})
			},
			onCancel() {}
		})
    }
	const cancel = () => {
		emit('update:modelValue', false)
		resetForm()
	}
</script>