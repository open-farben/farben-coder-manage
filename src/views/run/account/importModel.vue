<template>
	<div>
		<a-modal centered v-model:open="modalVisible" title="批量导入账号" @ok="handleOk" @cancel="handleCancel" :width="400">
			<div class="c999 mb15">注：需要<a @click="handleExport">下载模板</a>，按照规则填写账号信息后上传文档。</div>
			<a-form ref="formRef" :model="formState" :rules="rules">
				<a-form-item label="" name="fileList">
					<FileUpload v-model:fileList="formState.fileList" :itemRender="true" :outUpload="true" :acceptType="['xlsx']">
						<div class="flex">
							<a-button>
								<upload-outlined></upload-outlined>
								上传文件
							</a-button>
							<div class="flex-1 ml10 flex flex-vcenter" v-if="formState.fileList.length != 0">{{ formState.fileList[0].name }}</div>
						</div>
					</FileUpload>
				</a-form-item>
			</a-form>
		</a-modal>
		<a-modal centered v-model:open="state.visible" :footer="null" title="导入账号失败提示" @cancel="cancel" :width="400">
			<div class="c999">本次共计导入{{formState.total}}个账号，其中{{formState.success}}个账号导入成功，<span class="red">{{formState.fail}}个账号导入失败</span>，请 <a-button type="primary" size="small" @click="handleDownload">下载失败记录</a-button> 查看失败原因，修改后再次上传。</div>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
	import { download } from '@/utils/request'
	import {upload} from '@/api/upload'
	import { nextTick, onMounted, defineProps, defineEmits, computed, reactive, ref, toRaw, watch, onUnmounted } from 'vue';
	import FileUpload from '@/components/Upload/fileUpload.vue'
	import { message } from 'ant-design-vue'
	import dayjs from 'dayjs';

	const props = defineProps({
		modelValue: {
			type: Boolean,
		},
	});
	const formRef = ref();
	const timer = ref(null);
	const state = reactive({
		visible: false,
	})
	const formState = reactive({
		fileList: [],
		success: 0,
		total: 0,
		fail: 0,
		cacheKey: '',
	});
	const rules = {
		fileList: [
			{
				required: true,
				message: '请上传文件',
				trigger: 'blur',
			},
		],
	};

	watch(() => props.modelValue,() => {
		if (props.modelValue) {
			
		}
	})
	const emit = defineEmits(['update:modelValue', 'refresh']);
	const modalVisible = computed({
		get: () => props.modelValue,
		set: v => emit('update:modelValue', v),
	})

	//确定按钮的回调
	const handleOk = () => {
		formRef.value.validate().then(() => {
			const formData = new FormData()
			formData.append('file', formState.fileList[0]);
			upload('/coder-api/plugin/import', formData).then((res:any) => {
				if(res.code == '0'){
					formState.cacheKey = res.data.cacheKey
					formState.success = res.data.success
					formState.total = res.data.total
					formState.fail = res.data.total - res.data.success
					emit('refresh')
					emit('update:modelValue', false)
					resetForm()
					if(formState.success != formState.total){
						state.visible = true
					}else{
						message.success('导入成功')
					}
				}
			})
		}).catch(error => {
			console.log('error', error);
		});
	}
	const handleCancel = () => {
		emit('update:modelValue', false)
		resetForm()
	}
	const cancel = () => {
		state.visible = false
	}

	//表单重置
	const resetForm = () => {
		formState.fileList = []
		formRef.value.resetFields();
	}

	//导出
	const handleExport = () => {
      	let params = {}
      	download('/coder-api/plugin/template/export',{ ...params }, `账号导入模板_${dayjs().format("YYYY.MM.DD")}.xlsx`)
    }

	//下载失败记录
	const handleDownload = () => {
		let params = {
			key: formState.cacheKey,
		}
      	download('/coder-api/plugin/import/error',{ ...params }, `账号导入失败记录_${dayjs().format("YYYY.MM.DD")}.xlsx`).then((res:any) => {
			console.log("res", res)
		})
		timer.value = setTimeout(()=>{
			state.visible = false
		},1000);
    }
	onUnmounted(() => {
		timer.value && clearTimeout(timer.value)
	})
</script>