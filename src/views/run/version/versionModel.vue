<template>
	<div>
		<a-modal centered v-model:open="modalVisible" :title="props.row.id !='' ? '编辑' : '新增'" @ok="handleOk" @cancel="cancel" :width="400">
			<a-spin :spinning="loading" tip="上传中">
				<a-form ref="formRef" :model="formState" :rules="rules" :label-col="{span: 6}" :wrapper-col="{span: 18}">
					<a-form-item label="上传插件" name="fileList" :rules="props.row.id != '' ? [ { required: false } ] : rules.fileList">
						<FileUpload v-model:fileList="formState.fileList" :itemRender="true" :acceptType="['vsix','zip']" :id="props.row.id" :customRequest="true" :outUpload="true" @uploadSucces="uploadSucces" @changeUpload="changeUpload" @uploadFail="uploadFail">
							<div class="flex">
								<a-button>
									<upload-outlined></upload-outlined>
									上传文件
								</a-button>
							</div>
							<span class="f12 c999">支持扩展名：.vsix,.zip，文件大小不超过100M</span>
						</FileUpload>
					</a-form-item>
					<a-form-item label="版本号" name="version">
						<a-input v-model:value.trim="formState.version" placeholder="请输入版本号" :disabled="true" :maxlength="20"/>
					</a-form-item>
					<a-form-item label="版本描述" name="description">
						<a-textarea v-model:value.trim="formState.description" placeholder="请输入版本描述" :maxlength="200"/>
					</a-form-item>
					<a-form-item label="适配IDE版本" name="ideVersion">
						<a-input v-model:value.trim="formState.ideVersion" placeholder="请输入适配IDE版本" :maxlength="200"/>
					</a-form-item>
					<a-form-item label="IDE类型" name="type">
						<a-select v-model:value="formState.type" placeholder="请选择类型" :disabled="true">
							<a-select-option v-for="item in typeList" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
						</a-select>
					</a-form-item>
					<a-form-item label="是否发布" name="publish" v-if="props.row.id ===''">
						<a-radio-group v-model:value="formState.publish" :options="statuList"></a-radio-group>
					</a-form-item>
				</a-form>
			</a-spin>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
	import {listAdd, listEdit} from '@/api/version'
	import { dict } from '@/api/dict'
	import { onMounted, defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
	import { message } from 'ant-design-vue'
	import FileUpload from '@/components/Upload/uploadPlugin.vue'
	const props = defineProps({
		row: {
			type: Object,
		},
		typeList: {
			type: Object,
		},
		modelValue: {
			type: Boolean,
		},
	});
	const loading = ref(false);
	const formRef = ref();
	const formState = reactive({
		id: '',
		fileList: [],
		version: '',
		description: '',
		type: undefined,
		analysisKey: '',
		publish: true,
		ideVersion:'',
	});
	const statuList = reactive([
		{
			value: true,
			label: '是',
		}, 
		{
			value: false,
			label: '否',
		}, 
	])
	const rules = {
		fileList: [
			{
				required: true,
				message: '请上传插件',
				trigger: 'change',
			},
		],
		version: [
			{
				required: true,
				message: '请输入版本号',
				trigger: 'blur',
			},
		],
		ideVersion: [
			{
				required: true,
				message: '请输入版本号',
				trigger: 'blur',
			},
		],
		description: [
			{
				required: false,
				message: '请输入版本描述',
				trigger: 'blur',
			},
		],
		type: [
			{
				required: true,
				message: '请选择类型',
				trigger: 'blur',
			}, 
		],
		publish: [
			{
				required: true,
				message: '请选择状态',
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
		loading.value = false
		formRef.value.resetFields();
	}
	const emit = defineEmits(['update:modelValue', 'refresh']);
	const modalVisible = computed({
		get: () => props.modelValue,
		set: v => emit('update:modelValue', v),
	})
	//选择图片
	const changeUpload = (e:any) => {
		formState.fileList = e
		loading.value = true
	}
	//上传成功
	const uploadSucces = (e:any) => {
		formState.version = e.version
		formState.description = e.description ? e.description.replace(/<[^>]+>/g, '') : ''
		formState.type = e.type
		formState.analysisKey = e.analysisKey
		loading.value = false
	}
	//上传失败
	const uploadFail = () => {
		loading.value = false
	}
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