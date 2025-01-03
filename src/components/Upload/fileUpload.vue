<template>
	<a-upload
		name="file"
		:multiple="false" 
		:showUploadList="showUploadList"
		:action="state.uploadUrl"
		:customRequest="customRequest == true ? customUpload : null"
		v-model:file-list="currentFileList" 
		:before-upload="beforeUpload"
		@change="handleChange"
	>
		<slot></slot>
		<a-button v-if="!itemRender">
			<upload-outlined></upload-outlined>
			上传文件
		</a-button>
		<template #itemRender="{ file, actions }" v-if="customslot">
			<div class="flex flex-vcenter">
				<div class="flex-1" :style="file.status === 'error' ? 'color: red' : ''">
					<LinkOutlined />
					{{ file.name }}
				</div>
				<a-space class="flex">
					<a class="f12" href="javascript:;" @click="actions.download">下载</a>
					<span class="f12 c999">|</span>
					<a class="f12" href="javascript:;" @click="actions.remove">删除</a>
				</a-space>
			</div>
		</template>
	</a-upload>
</template>
<script lang="ts" setup name="fileUpload">
	import {upload} from '@/api/upload'
	import { message } from 'ant-design-vue';
	import { computed, reactive, ref } from 'vue'
	const props = defineProps({
		itemRender: {
			type: Boolean,
			default: false,
		},
		showUploadList: {
			type: Boolean,
			default: false,
		},
		//自定义请求
		customRequest: {
			type: Boolean,
			default: true,
		},
		//自定义文件列表插槽
		customslot: {
			type: Boolean,
			default: false,
		},
		//是否需要回调方法
		callback: {
			type: Boolean,
			default: false,
		},
		//外部上传
		outUpload: {
			type: Boolean,
			default: false,
		},
		fileList: {
			type: Object,
		},
		//上传文件类型限制
		acceptType: {
		    type: Array,
		    default: () => [],
		},
		uploadType: {
		    type: String,
		    default: 'file',
		},
	});
	const emit = defineEmits(['update:fileList', 'uploadSucces','support']);
	const state = reactive({
		uploadUrl: "http://192.168.1.31:9080/coder-api/plugin/analysisPluginFile",
		//fileList: [],
	})
	// 当前文件列表  
	const currentFileList = computed({
		get: () => props.fileList,
		set: v => emit('update:fileList', v),
	})
	//上传前触发的事件
	const beforeUpload = (file, fileList) => {
		//截取文件扩展名
		let filename = file.name.replace(/.*\./, "")
		const isSize = file.size / 1024 / 1024
		if (!props.acceptType.includes(filename)) {
        	message.error(`文件类型错误, 只支持${props.acceptType}格式`);
			emit('support',false)
        	return false;
      	}
		if(isSize > 100) {
			message.error('文件大小不可超过100M');
			emit('support',false)
        	return false;
		}
		emit('support',true)
		return true;
	}
	//点击上传
	const handleChange = (info:any) => {
		if (info.file.status !== 'uploading') {
			console.log(info.file, info.fileList);
		}
		if (info.file.status === 'done') {
			emit('update:fileList', info.fileList)
			message.success(`${info.file.name} file uploaded successfully`);
			message.success('上传成功')
		} else if (info.file.status === 'error') {
			message.error(`${info.file.name} file upload failed.`);
		}
	};
	//自定义上传
	const customUpload = (e) => {
		console.log("customUpload", e.file)
		const formData = new FormData()
		formData.append('file', e.file);
		console.log("formData", formData)
		if(props.outUpload){
			emit('update:fileList', [e.file])
		}else{
			upload('/coder-api/plugin/import', formData).then((res:any) => {
				console.log("res", res)
				if(res.code == '0'){
					message.success('上传成功')
					if(props.callback){
						emit('uploadSucces', res.data)
					}else{
						emit('update:fileList', [res.data])
					}
				}
			})
		}
	}
</script>

<style lang="less" scoped>
::v-deep(.ant-upload-list){margin-bottom: 20px;}
</style>