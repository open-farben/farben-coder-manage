<template>
	<a-card :body-style="{padding: '20px'}" :bordered="false">
		<div class="title mb15 flex flex-vcenter">
			<a-space class="flex-1">
				<a-form ref="formRef" :model="state" layout="inline" :label-col="{span: 6}" :wrapper-col="{span: 18}">
					<a-row :gutter="0">
                		<a-col :md="11" :sm="24">
							<a-form-item name="date" label="时间">
								<a-range-picker :value="state.date" format="YYYY-MM-DD" :placeholder="['开始时间', '结束时间']" :allowClear="false" @change="dateChange"/>
							</a-form-item>
						</a-col>
						<a-col :md="8" :sm="24">
							<a-form-item name="groupName" label="名称">
								<a-input placeholder="请输入工作组名称" v-model:value="state.groupName"/>
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
		        <a-button type="primary" @click="handleAdd">新增</a-button>
				<a-button @click="handleBdel">批量删除</a-button>
		    </a-space>
		</div>
		<a-table rowKey="id" :loading="state.loading" @change="tableChange" :dataSource="state.list" :columns="state.columns" :pagination="state.pagination" :rowSelection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }" :scroll="{ x: 850 }">
			<template #bodyCell="{ column, record }">
				<template v-if="column.key === 'action'">
					<a-space>
						<a @click="handleRest(record)">授权</a>
						<a @click="handleEdit(record)">编辑</a>
						<a @click="handleDel(record)">删除</a>
					</a-space>
				</template>
			</template>
		</a-table>
	</a-card>
	<editGroup v-model="state.visible" :row="row" :treeData="state.treeData" @refresh="search"></editGroup>
	<empower v-model="state.empower" :sourceTreeData="state.worktreeData" :selectTreeKeys="state.selectedWorkTree" :row="row" @refresh="search"></empower>
</template>
<script lang="ts" setup name="account">
	import { treeList } from '@/api/dept'
	import { onMounted, ref, reactive, h } from 'vue'
	import { useOrganizeStore } from "@/store/modules/organize.pinia"
	import { Modal, message } from 'ant-design-vue'
	import editGroup from './editGroup.vue'
	import empower from './empower.vue'

	const organizeStore = useOrganizeStore();
	const formRef = ref()
	const row = ref({})
	const state = reactive({
        date: [],
        startTime: '',
		endTime: '',
        groupName: '',
		fullOrganization: undefined,
		status: '',
		userName: '',
		ids: '',
		expandedKeys: [],
		loading: false,
		visible: false,
		empower:false,
		show: false,
		pagination: {
			current: 1,
			pageSize: 10, // 默认每页显示数量
			total: 0, //总条数
			showSizeChanger: true, // 显示可改变每页数量
			pageSizeOptions: ['10', '20', '50', '100'], // 每页数量选项
			showTotal: (total:number) => `共 ${total} 条`, // 显示总数
		},
		treeData: [],
		worktreeData: [],
		selectedWorkTree: [],
		columns: [
			{
				title: '工作组名称',
				dataIndex: 'groupName',
			    align: 'center',
				width: 100,
			},
			{
				title: '所属机构',
				dataIndex: 'organName',
			    align: 'center',
				width: 100,
			},
			{
				title: '工作组描述',
				dataIndex: 'introduce',
			    align: 'center',
				width: 150,
				ellipsis: true,
			},
			{
				title: '人数',
				dataIndex: 'userNumber',
			    align: 'center',
				width: 100,
			},
			{
				title: '生效时间',
				dataIndex: 'effectiveDay',
			    align: 'center',
				width: 150,
			},
			{
				title: '失效时间',
				dataIndex: 'failureDay',
			    align: 'center',
				width: 150,
			},
			{
				title: '操作',
				key: 'action',
				align: 'center',
				width: 100,
			},
		],
		list: [],
		selectedRowKeys: [],
		selectedRows: [],
	})
	//获取树数据
	const getTree = () => {
		let params = {}
		treeList(params).then((res) => {
			state.treeData = res.data
			state.expandedKeys = [res.data[0].fullOrganNo]
		})
	}
	//表格选中
	const onSelectChange = (selectedRowKeys:any,selectedRows:never) => {
	    state.selectedRowKeys = selectedRowKeys;
		state.selectedRows = selectedRows.map(item => {
			return item.id
		})
	}
    //时间选择
	const dateChange = (value:any, dateString:any) => {
		state.date = value
		state.startTime = dateString[0]
		state.endTime = dateString[1]
	}
	// 搜索
	const search = () => {
		state.pagination.current = 1
		getData()
	}
	// 重置
	const resetForm = () => {
		state.startTime = ''
		state.endTime = ''
		formRef.value.resetFields();
		search()
	}

	// 新增
	const handleAdd = () => {
		row.value = {
			id: '',
			groupName: '',
			organization: undefined,
			groupDiec:'',
			effectiveDay:'',
			failureDay:'',
			inUse: 0,
		}
	    state.visible = true;
	}
	// 编辑
	const handleEdit = (e:any) => {
		row.value = e
	    state.visible = true;
	}
	// 删除
	const handleDel = (row:any) => {
		state.ids = row.id
		Modal.confirm({
			title: '提示',
			content: () =>
			h('span', {}, [
				h('span', '确定将工作组【'),
				h(
				'span',
				{
					style: {
					color: '#1677ff',
					},
				},
				row.groupName,
				),
				h('span', '】删除吗？'),
			]),
			okText: '确认',
			cancelText: '取消',
			onOk: () => {
				delRow(row)
			},
			onCancel() { }
		})
    }
	// 批量删除
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
					h('span', '】个工作组全部删除吗？'),
				]),
				okText: '确认',
				cancelText: '取消',
				onOk: () => {
					delRow(row)
				},
				onCancel() { }
			})
		}else{
			message.info('请先选择要删除的工作组')
		}
		
    }
	const delRow = (row:any) => {
		let params = {
			ids: state.ids,
		}
		organizeStore.deleteGroup(params).then(()=> {
			message.success('删除成功')
			state.selectedRowKeys = []
			getData()
		})
	}
	// 授权
	const handleRest = (row:any) => {
		organizeStore.GetDistributableInfo({ groupId: row.id}).then((data: any) => {
			state.worktreeData = data.optionalOrgan;
			state.selectedWorkTree = data.memberList;
			row.value = row
			state.empower = true
		})
    }
	// 获取数据
	const getData = () => {
		state.loading = true
		let params = {
			pageSize:state.pagination.pageSize,
			pageNo:state.pagination.current,
			groupName:state.groupName,
			effectiveDay:state.startTime,
			failureDay:state.endTime,
		}
		
		organizeStore.GetGroupList(params).then((res:any) => {
			state.list = res.records
			state.pagination.total = res.totalRow
			state.loading = false
		})
	}
	// 分页
	const tableChange = (pagination, filters, sorter) => {
		state.pagination.current = pagination.current
		state.pagination.pageSize = pagination.pageSize
		getData()
	}

	onMounted(() => {
		getData()
		getTree()
	})

</script>