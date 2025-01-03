<template>
	<a-card :body-style="{padding: '20px'}" :bordered="false">
		<a-row>
			<a-col :span="10">
				<div class="title mb15 flex flex-vcenter">
					<a-space class="flex-1">
						<a-form ref="queryRef" :model="data" layout="inline">
							<a-row :gutter="0">
								<a-col :md="16" :sm="24">
									<a-form-item name="searchKey" label="关键字">
										<a-input placeholder="请输入字典编码/字典名称" v-model:value="data.searchKey"/>
									</a-form-item>
								</a-col>
								<a-col :md="8" :sm="24">
									<a-space>
										<a-button type="primary" @click="getQuery">搜索</a-button>
										<a-button @click="clearForm">重置</a-button>
									</a-space>
								</a-col>
							</a-row>
						</a-form>
					</a-space>
				</div>
				<a-table rowKey="id" @change="tablePage" :dataSource="data.list" :columns="data.columns" :pagination="data.pagination" :scroll="{ x: 450 }">
					<template #bodyCell="{ column, record }">
						<template v-if="column.key === 'dictCode'">
							<a @click="handleRow(record.id)">{{record.dictCode}}</a>
						</template>
						<template v-if="column.key === 'action'">
							<a-space>
								<a @click="handleUpdate(record)">编辑</a>
								<!-- <a>删除</a> -->
							</a-space>
						</template>
					</template>
				</a-table>
			</a-col>
			<a-col :span="1">
				<div style="width: 1px;background: #f0f0f0;margin: 0 22px;;height:100%"></div>
			</a-col>
			<a-col :span="13">
				<div class="title mb15 flex flex-vcenter">
					<a-space class="flex-1">
						<a-button type="primary" @click="handleAdd">新增</a-button>
						<a-button @click="handleBdel">批量删除</a-button>
					</a-space>
				</div>
				<a-table rowKey="id" :loading="state.loading" @change="tableChange" :dataSource="state.list" :columns="state.columns" :pagination="state.pagination" :rowSelection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }" :scroll="{ x: 550 }">
					<template #bodyCell="{ column, record }">
						<template v-if="column.key === 'disable'">
							<a-switch :checked="record.disable" @change="handleStatus(record)" :checked-value="0" :unchecked-value="1" size="small"/>
						</template>
						<template v-if="column.key === 'action'">
							<a-space>
								<a @click="handleEdit(record)">编辑</a>
								<a @click="handleDel(record)">删除</a>
							</a-space>
						</template>
					</template>
				</a-table>
			</a-col>
		</a-row>
	</a-card>
	<DictModel v-model="data.isShow" :row="rows" @refresh="Refresh"></DictModel>
	<DictListModel v-model="state.visible" :row="row" @refresh="refresh"></DictListModel>
</template>
<script lang="ts" setup name="dict">
	import { list, detail, listDel, listDisable } from '@/api/dict'
	import { ref, reactive, onMounted, h } from 'vue'
	import DictModel from './dictModel.vue';
	import DictListModel from './dictListModel.vue';
	import { Modal, message } from 'ant-design-vue'
	import { useRouter } from 'vue-router'

	const router = useRouter()
	const queryRef = ref();
	const rows = ref({})
	const data = reactive({
		searchKey: '',
		isShow: false,
		pagination: {
			current: 1,
			pageSize: 10, // 默认每页显示数量
			total: 0, //总条数
			showSizeChanger: true, // 显示可改变每页数量
			pageSizeOptions: ['10', '20', '50', '100'], // 每页数量选项
			showTotal: (total:number) => `共 ${total} 条`, // 显示总数
		},
		columns: [
			{
				title: '字典编码',
				dataIndex: 'dictCode',
				key: 'dictCode',
			    align: 'center',
				width: 90,
			},
			{
				title: '字典名称',
				dataIndex: 'dictName',
			    align: 'center',
				width: 100,
			},
			{
				title: '字典描述',
				dataIndex: 'mark',
			    align: 'center',
				width: 120,
			},
			{
				title: '操作',
				key: 'action',
				align: 'center',
				width: 80,
			},
		],
		list: [],
	})

	const row = ref({})
	const state = reactive({
		loading: false,
		visible: false,
		dictId: '',
		dictCode: '',
		ids: '',
		pagination: {
			current: 1,
			pageSize: 10, // 默认每页显示数量
			total: 0, //总条数
			showSizeChanger: true, // 显示可改变每页数量
			pageSizeOptions: ['10', '20', '50', '100'], // 每页数量选项
			showTotal: (total:number) => `共 ${total} 条`, // 显示总数
		},
		columns: [
			{
				title: '字典键值',
				dataIndex: 'kindCode',
				key: 'kindCode',
			},
			{
				title: '字典标签',
				dataIndex: 'kindValue',
			    align: 'center',
				width: 120,
			},
			{
				title: '字典排序',
				dataIndex: 'orderNo',
			    align: 'center',
			},
			{
				title: '字典状态',
				dataIndex: 'disable',
				key: 'disable',
			    align: 'center',
			},
			{
				title: '操作',
				key: 'action',
				align: 'center',
			},
		],
		list: [],
		selectedRowKeys: [],
		selectedRows: [],
	})

	//搜索
	const getQuery = () => {
		data.pagination.current = 1
		getData()
	}
	//重置
	const clearForm = () => {
	    queryRef.value.resetFields();
		getData()
	}
	//编辑
	const handleUpdate = (e:any) => {
		rows.value = e
	    data.isShow = true;
	}
	//刷新
	const Refresh = () => {
	    console.log("刷新")
		getQuery()
	}
	//获取数据
	const getData = () => {
		let params = {
			pageNo: data.pagination.current,
			pageSize: data.pagination.pageSize,
			searchKey: data.searchKey,
		}
		list(params).then((res:any) => {
			if(res.data){
				data.list = res.data.records || []
				data.pagination.total = res.data.totalRow
				if(data.list.length != 0){
					state.dictId = data.list[0].id
					search()
				}else{
					state.list = []
				}
				
			}
		})
	}
	//分页
	const tablePage = (pagination:any, filters:any, sorter:any) => {
		data.pagination.current = pagination.current
		data.pagination.pageSize = pagination.pageSize
		getData()
	}

	const handleRow = (id:string) => {
		state.dictId = id
		search()
	}


	//表格选中
	const onSelectChange = (selectedRowKeys:any,selectedRows:never) => {
	    state.selectedRowKeys = selectedRowKeys;
	}
	//搜索
	const search = () => {
		state.pagination.current = 1
		getDetail()
	}
	//新增
	const handleAdd = () => {
		row.value = {
			id: '',
			dictCode: state.dictCode,
			kindCode: '',
			kindValue: '',
			orderNo: '',
			disable: 0,
		}
	    state.visible = true;
	}
	//编辑
	const handleEdit = (e:any) => {
		row.value = e
	    state.visible = true;
	}
	//刷新
	const refresh = () => {
		search()
	}
	//字典状态
	const handleStatus = (row:any) => {
		let text = row.disable ? "启用" : "停用";
		Modal.confirm({
			title: '提示',
			content: `确定要${text}这一条字典键值吗？`,
			okText: '确认',
			cancelText: '取消',
			onOk: (async() => {
				let params = {
					id: row.id,
					disable: row.disable == 0 ? 1 : 0,
				}
				await listDisable(params).then((res:any) => {
					if(res.code == '0'){
						message.success('操作成功')
						getDetail()
					}
				})
			}),
			onCancel() {
				row.disable = row.disable
			}
		})
    }
	//删除
	const handleDel = (row:any) => {
		state.ids = row.id
		Modal.confirm({
			title: '提示',
			content: () =>
			h('span', {}, [
				h('span', '确定要将字典编码【'),
				h(
				'span',
				{
					style: {
					color: '#1677ff',
					},
				},
				row.kindValue + ' (' + row.kindCode + ')',
				),
				h('span', '】这个字典项删除吗？'),
			]),
			okText: '确认',
			cancelText: '取消',
			onOk: () => {
				delRow(row)
			},
			onCancel() { }
		})
    }
	//批量删除
	const handleBdel = (row:any) => {
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
					h('span', '】个字典编码全部删除吗？'),
				]),
				okText: '确认',
				cancelText: '取消',
				onOk: () => {
					delRow(row)
				},
				onCancel() { }
			})
		}else{
			message.info('请先选择要删除的字典编码')
		}
		
    }
	const delRow = (row:any) => {
		let params = {
			ids: state.ids,
		}
		listDel(params).then((res:any) => {
			if(res.code == '0'){
				message.success('删除成功')
				state.selectedRowKeys = []
				getDetail()
			}
		})
	}
	//获取数据
	const getDetail = () => {
		state.loading = true
		let params = {
			id: state.dictId,
		}
		detail(params).then((res:any) => {
			if(res.data){
				state.list = res.data.dictList.records || []
				state.pagination.total = res.data.dictList.total
				state.dictCode = res.data.dictCode
			}
			state.loading = false
		})
	}
	//分页
	const tableChange = (pagination:any, filters:any, sorter:any) => {
		state.pagination.current = pagination.current
		state.pagination.pageSize = pagination.pageSize
		getDetail()
	}

	onMounted(() => {
		getData()
	})
</script>
<style lang="less" scoped>
.dict-box{margin-left: 20px;}
</style>
