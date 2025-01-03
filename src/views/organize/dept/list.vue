<template>
	<a-card class="h100" :body-style="{padding: '20px'}" :bordered="false">
		<div class="flex">
			<div class="tree-box">
				<dept-tree
					ref="deptTree"
					:deptOptions="state.deptOptions"
					:selectedKeys="state.selectedKeys"
					@select="handleNode"
					@action="handleAction"
					
				/>
			</div>
			<div class="flex-1">
				<div class="title mb15 flex flex-vcenter">
					<a-tabs v-model:activeKey="state.activeKey" class="table-tab" type="card">
						<a-tab-pane key="1" tab="机构基本信息" v-if="state.parentOrganNo != 0">
							<FormModel ref="childComp" :row="row" :treeData="state.deptOptions" @refresh="FormRefresh"></FormModel>
						</a-tab-pane>
						<a-tab-pane key="2" :tab="state.parentOrganNo != 0 ? '下级机构' : '机构列表'">
							<div class="flex">
								<a-form ref="formRef" class="flex-1" :model="state" layout="inline">
									<a-row :gutter="0">
										<a-col>
											<a-form-item label="" name="searchKey">
												<a-input placeholder="请输入机构代码/机构名称" v-model:value.trim="state.searchKey" allowClear  @change="search" />
											</a-form-item>
										</a-col>
									</a-row>
								</a-form>
								<a-space class="mb15">
									<a-button type="primary" @click="handleAdd">新增</a-button>
									<a-button @click="handleBdel">批量删除</a-button>
								</a-space>
							</div>
							<a-table rowKey="id" :loading="state.loading" @change="tableChange" :dataSource="state.list" :columns="state.columns" :pagination="state.pagination" :rowSelection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }">
								<template #bodyCell="{ column, record }">
									<template v-if="column.key === 'action'">
										<a-space>
											<a @click="handleEdit(record)">编辑</a>
											<a @click="handleDel(record)">删除</a>
										</a-space>
									</template>
								</template>
							</a-table>
						</a-tab-pane>
					</a-tabs>
				</div>
			</div>
		</div>
	</a-card>
	<add-model v-model="state.visible" :row="row" :treeData="state.deptOptions" @refresh="refresh"></add-model>
	<edit-model v-model="state.hide" :row="row" :treeData="state.deptOptions" @refresh="refresh"></edit-model>
</template>
<script lang="ts" setup name="accountlist">
	import {treeList, list, listDel} from '@/api/dept'
	import { ref, reactive, onMounted, h } from 'vue'
	import { Modal, message } from 'ant-design-vue'
	import AddModel from './addModel.vue';
	import EditModel from './editModel.vue';
	import FormModel from './form.vue';
	import DeptTree from './deptTree.vue'

	const formRef = ref();
	const childComp = ref(null);
	const row = ref({})
	const nodeInfo = ref({})
	const state = reactive({
		loading: false,
		searchKey: '',
		activeKey: '2',
		selectedKeys: ['10011001001'],
		visible: false,
		hide: false,
		ids: '',
		pagination: {
			current: 1,
			pageSize: 10, // 默认每页显示数量
			total: 0, //总条数
			showSizeChanger: true, // 显示可改变每页数量
			pageSizeOptions: ['10', '20', '50', '100'], // 每页数量选项
			showTotal: (total:number) => `共 ${total} 条`, // 显示总数
		},
		deptOptions: [],
		columns: [
			{
				title: '机构代码',
				dataIndex: 'organNo',
			    align: 'center',
			},
			{
				title: '机构名称',
				dataIndex: 'organName',
			    align: 'center',
			},
			{
				title: '上级机构',
				dataIndex: 'parentOrganName',
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
		parentOrganNo: 0,
	})
	//表格选中
	const onSelectChange = (selectedRowKeys:any,selectedRows:never) => {
	    state.selectedRowKeys = selectedRowKeys  ;
	    //state.selectedRows = selectedRows;
	}
	//选择树
	const handleNode = (e, info) => {
		state.selectedKeys = e
		row.value = info.node
		nodeInfo.value = info.node
		state.parentOrganNo = info.node.parentOrganNo
		if(row.value.parentOrganNo == 0){
			state.activeKey = '2'
		}
		state.list = []
		getData()
    }
	//树操作
	const handleAction = (type, e) => {
		if(type == 'add'){
			nodeInfo.value = e.dataRef
			row.value = e.dataRef
			state.parentOrganNo = e.dataRef.parentOrganNo
			handleAdd()
		}else if(type == 'edit'){
			nodeEdit(e)
		}else{
			handleDel(e)
		}
    }
	//搜索
	const search = () => {
		state.pagination.current = 1
		state.list = []
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
			parentOrganNo: nodeInfo.value.organNo || state.deptOptions[0].organNo || '',
			parentOrganName: nodeInfo.value.organName || state.deptOptions[0].organName || undefined,
			organName: '',
			organAddress: '',
			organPost: '',
		}
		console.log("===row.value==", row.value)
	    state.visible = true;
	}
	//编辑树
	const nodeEdit = (e) => {
		row.value = e.dataRef
	    state.hide = true;
	}
	//编辑
	const handleEdit = (e) => {
		row.value = e
	    state.hide = true;
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
				row.organName,
				),
				h('span', '】这个机构删除吗？'),
			]),
			okText: '确认',
			cancelText: '取消',
			onOk: (async() => {
				await delRow(row)
			}),
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
					h('span', '】个机构全部删除吗？'),
				]),
				okText: '确认',
				cancelText: '取消',
				onOk: (async() => {
					await delRow(row)
				}),
				onCancel() { }
			})
		}else{
			message.info('请先选择要删除的机构')
		}
		
    }
	const delRow = (row:any) => {
		let params = {
			ids: state.ids,
		}
		listDel(params).then((res) => {
			if(res.code == '0'){
				message.success('删除成功')
				state.selectedRowKeys = []
				getTree()
			}
		})
	}
	//刷新
	const refresh = () => {
		getTree()
	}
	const FormRefresh = () => {
		getTree()
		childComp.value.getDetail()
	}
	//获取树数据
	const getTree = () => {
		let params = {}
		treeList(params).then((res) => {
			state.deptOptions = res.data
			if(nodeInfo.value.parentOrganNo){
				row.value = nodeInfo.value
				state.parentOrganNo = nodeInfo.value.parentOrganNo
			}else{
				row.value = state.deptOptions[0]
				state.parentOrganNo = state.deptOptions[0].parentOrganNo
			}
			state.selectedRowKeys = [state.deptOptions[0].id]
			getData()
		})
	}
	//获取数据
	const getData = () => {
		state.loading = true
		let params = {
			pageNo: state.pagination.current,
			pageSize: state.pagination.pageSize,
			organNo: row.value.fullOrganNo || state.deptOptions[0].fullOrganNo,
			searchKey: state.searchKey,
		}
		list(params).then((res) => {
			if(res.data && res.data.records.length !== 0){
				state.list = res.data.records || []
				state.pagination.total = res.data.totalRow
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
		getTree()
	})
</script>
<style lang="less" scoped>
.tree-box{padding-right: 20px;border-right: 1px solid #eee;margin-right: 20px;}
:deep(.table-tab){width: 100%;}
//:deep(.table-tab .ant-tabs-tab){padding:3px 0}
//:deep(.table-tab .ant-tabs-nav::before){border-bottom:0}
//:deep(.table-tab .ant-tabs-nav .ant-tabs-ink-bar){height:0}
</style>