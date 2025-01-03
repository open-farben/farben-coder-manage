<template>
	<a-card :body-style="{padding: '20px'}" :bordered="false">
		<div class="title mb15 flex flex-vcenter">
			<a-space class="flex-1">
				<a-form ref="formRef" :model="state" layout="inline" :label-col="{span: 6}" :wrapper-col="{span: 18}">
					<a-row :gutter="0">
                		<a-col :md="6" :sm="24">
							<a-form-item label="状态" name="status">
								<a-select v-model:value="state.status" placeholder="请选择状态">
									<a-select-option v-for="item in state.statuList" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
								</a-select>
							</a-form-item>
						</a-col>
						<a-col :md="6" :sm="24">
							<a-form-item label="类型" name="type">
								<a-select v-model:value="state.type" placeholder="请选择类型">
									<a-select-option v-for="item in state.typeList" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
								</a-select>
							</a-form-item>
						</a-col>
						<a-col :md="6" :sm="24">
							<a-form-item label="版本" name="version">
								<a-input placeholder="请输入版本号" v-model:value.trim="state.version"/>
							</a-form-item>
						</a-col>
						<a-col :md="4" :sm="24">
							<a-space>
								<a-button type="primary" @click="search">搜索</a-button>
								<a-button @click="resetForm">重置</a-button>
							</a-space>
						</a-col>
					</a-row>
				</a-form>
			</a-space>
			<a-space>
		        <a-button type="primary" @click="handleAdd">上传插件</a-button>
				<a-button @click="handleBdel">批量删除</a-button>
		    </a-space>
		</div>
		<a-table rowKey="id" :loading="state.loading" @change="tableChange" :dataSource="state.list" :columns="state.columns" :pagination="state.pagination" :rowSelection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }">
			<template #bodyCell="{ column, record }">
				<template v-if="column.key === 'status'">
					{{statusFilter(record.status, state.statuList)}}
				</template>
				<template v-if="column.key === 'action'">
					<a-space>
						<a @click="handlePush(record)">{{state.actionList[record.status].label}}</a>
						<a @click="handleEdit(record)">编辑</a>
						<a @click="handleDel(record)">删除</a>
					</a-space>
				</template>
			</template>
		</a-table>
		<versionModel v-model="state.visible" :row="row" :typeList="state.typeList" @refresh="search"></versionModel>
	</a-card>
</template>
<script lang="ts" setup name="account">
	import {list, listDel, listDisable} from '@/api/version'
	import {treeList} from '@/api/dept'
	import {statusFilter, formatBytes} from '@/utils/util'
	import { onMounted, ref, reactive, h } from 'vue'
	import versionModel from './versionModel.vue';
	import { Modal, message } from 'ant-design-vue'

	const formRef = ref()
	const row = ref({})
	const state = reactive({
		status: '',
		type: '',
		version: '',
		ids: '',
		loading: false,
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
				value: '',
				label: '全部',
			}, 
			{
				value: 'RELEASED',
				label: '发布',
			}, 
			{
				value: 'UNPUBLISHED',
				label: '未发布',
			}, 
			{
				value: 'REPEAL',
				label: '撤销发布',
			}, 
		],
		actionList: {
			'RELEASED': {
				value: 'REPEAL',
				label: '撤销发布',
			}, 
			'UNPUBLISHED': {
				value: 'RELEASED',
				label: '发布',
			}, 
			'REPEAL': {
				value: 'RELEASED',
				label: '发布',
			}, 
		},
		typeList: [
			{
				value: '',
				label: '全部',
			}, 
			{
				value: 'VSCODE',
				label: 'VSCode',
			}, 
			{
				value: 'JETBRAINS',
				label: 'JetBrains',
			}, 
		],
		columns: [
			{
				title: '版本号',
				dataIndex: 'version',
			    align: 'center',
			},
			{
				title: '版本描述',
				dataIndex: 'description',
			    align: 'center',
				width: 100,
				showSorterTooltip: true,
				ellipsis: true,
			},
			{
				title: 'IDE类型',
				dataIndex: 'type',
			    align: 'center',
			},
			{
				title: '插件大小',
				dataIndex: 'fileSize',
			    align: 'center',
				customRender: function (row:any) {
				    return formatBytes(row.value || 0)
				},
			},
			{
				title: '上传时间',
				dataIndex: 'createTime',
			    align: 'center',
				width: 160,
			},
			{
				title: '上传人',
				dataIndex: 'createUser',
			    align: 'center',
				width: 80,
			},
			{
				title: '状态',
				key: 'status',
				dataIndex: 'status',
			    align: 'center',
				width: 80,
			},
			{
				title: '操作',
				key: 'action',
				align: 'center',
				width: 160,
			},
		],
		list: [],
		selectedRowKeys: [],
	})
	//表格选中
	const onSelectChange = (selectedRowKeys:any,selectedRows:never) => {
	    state.selectedRowKeys = selectedRowKeys;
	}
	//搜索
	const search = () => {
		state.pagination.current = 1
		getData()
	}
	//重置
	const resetForm = () => {
		formRef.value.resetFields();
		search()
	}

	//新增
	const handleAdd = () => {
		row.value = {
			id: '',
			file: '',
			version: '',
			description: '',
			type: undefined,
			status: 'RELEASED',
			analysisKey: '',
			publish: true,
		}
	    state.visible = true;
	}
	//编辑
	const handleEdit = (e:any) => {
		row.value = e
	    state.visible = true;
	}
	//批量删除
	const handleBdel = () => {
		if(state.selectedRowKeys.length != 0){
			state.ids = state.selectedRowKeys.join(',')
			Modal.confirm({
				title: '提示',
				content: () =>
				h('span', {}, [
					h('span', '确定将这【'),
					h(
					'span',
					{
						style: {
						color: '#1677ff',
						},
					},
					state.selectedRowKeys.length,
					),
					h('span', '】个插件全部删除吗？'),
				]),
				okText: '确认',
				cancelText: '取消',
				onOk: () => {
					delRow(row)
				},
				onCancel() { }
			})
		}else{
			message.info('请先选择要删除的账号')
		}
		
    }
	//删除
	const handleDel = (row:any) => {
		state.ids = row.id
		Modal.confirm({
			title: '提示',
			content: () =>
			h('span', {}, [
				h('span', '确定要将【'),
				h(
				'span',
				{
					style: {
					color: '#1677ff',
					},
				},
				row.type + ' (' + row.version + ')',
				),
				h('span', '】的插件删除吗？'),
			]),
			okText: '确认',
			cancelText: '取消',
			onOk: () => {
				delRow(row)
			},
			onCancel() { }
		})
    }
	const delRow = (row:any) => {
		let params = {
			ids: state.ids,
		}
		listDel(params).then((res) => {
			if(res.code == '0'){
				message.success('删除成功')
				state.selectedRowKeys = []
				getData()
			}
		})
	}

	//发布撤销发布
	const handlePush = (row:any) => {
		let text = state.actionList[row.status].label;
		Modal.confirm({
			title: '提示',
			content: () =>
			h('span', {}, [
				h('span', '确定将【'),
				h('span',{style: {color: '#1677ff'}}, row.type + '端 '),
				h('span',{style: {color: '#1677ff'}}, row.version),
				h('span','】' + '插件' + state.actionList[row.status].label),
				h('span', '吗？'),
			]),
			okText: '确认',
			cancelText: '取消',
			onOk: (async() => {
				let params = {
					id: row.id,
					status: state.actionList[row.status].value,
				}
				await listDisable(params).then((res:any) => {
					if(res.code == '0'){
						message.success('操作成功')
						getData()
					}
				})
			}),
			onCancel() {
				row.status = row.status
			}
		})
    }

	//获取数据
	const getData = () => {
		state.loading = true
		let params = {
			pageNo: state.pagination.current,
			pageSize: state.pagination.pageSize,
			type: state.type,
			status: state.status,
			version: state.version,
		}
		list(params).then((res:any) => {
			if(res.data){
				state.list = res.data.records || []
				state.pagination.total = res.data.totalRow || 0
			}
			state.loading = false
		})
	}
	//分页
	const tableChange = (pagination, filters, sorter) => {
		state.pagination.current = pagination.current
		state.pagination.pageSize = pagination.pageSize
		getData()
	}


	onMounted(() => {
		getData()
	})

</script>