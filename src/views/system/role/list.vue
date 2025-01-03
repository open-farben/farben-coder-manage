<template>
	<a-card :body-style="{padding: '20px'}" :bordered="false">
		<div class="title mb15 flex flex-vcenter">
			<a-space class="flex-1">
				<a-form ref="formRef" :model="state" layout="inline">
					<a-row :gutter="0">
						<a-col :md="16" :sm="24">
							<a-form-item label="关键字" name="roleName">
								<a-input placeholder="请输入角色代码/角色名称" v-model:value.trim="state.roleName"/>
							</a-form-item>
						</a-col>
						<a-col :md="8" :sm="24">
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
		<a-table rowKey="id" :loading="state.loading" @change="tableChange" :dataSource="state.list" :columns="state.columns" :pagination="state.pagination" :rowSelection="{selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }">
			<template #bodyCell="{ column, record }">
				<template v-if="column.dataIndex === 'rangeScope'">
					{{ rolePower(record) }}
				</template>
				<template v-if="column.key === 'action'">
					<a-space>
						<a @click="handleAuth(record)">授权</a>
						<!-- <a @click="handleData(record)">数据授权</a> -->
						<a @click="handleEdit(record)">编辑</a>
						<a @click="handleDel(record)">删除</a>
					</a-space>
				</template>
			</template>
		</a-table>
	</a-card>
	<roleModel v-model="state.visible" :row="row" @refresh="search" @auth="handleAuth"></roleModel>
	<roleMenu v-model="state.hidden" :row="row" :options="state.options" @refresh="search"></roleMenu>
</template>
<script lang="ts" setup name="rollist">
	import {list, listDel, rangeList} from '@/api/role'
	import { ref, reactive, onMounted, h } from 'vue'
	import roleModel from './roleModel.vue';
	import roleMenu from './roleMenu.vue';
	import { Modal, message } from 'ant-design-vue'

	const formRef = ref()
	const row = ref({})
	const state = reactive({
		roleName: '',
		ids: '',
		loading: false,
		visible: false,
		hiddenData: false,
		hidden: false,
		pagination: {
			current: 1,
			pageSize: 10, // 默认每页显示数量
			total: 0, //总条数
			showSizeChanger: true, // 显示可改变每页数量
			pageSizeOptions: ['10', '20', '50', '100'], // 每页数量选项
			showTotal: (total:number) => `共 ${total} 条`, // 显示总数
		},
		options: [],
		optionsAll:[
			{
				type: 0,
				value: '全部数据权限'
			},
			{
				type: 1,
				value: '自定数据权限'
			},
			{
				type: 2,
				value: '本机构及以下数据权限'
			},
			{
				type: 3,
				value: '本机构数据权限'
			}
		],
		columns: [
			{
				title: '角色名',
				dataIndex: 'roleName',
			    align: 'center',
				width: 150,
			},
			{
				title: '权限标识',
				dataIndex: 'roleKey',
			    align: 'center',
				width: 150,
			},
			{
				title: '角色描述',
				dataIndex: 'remark',
			    align: 'center',
				width: 200,
			},
			{
				title: '数据权限范围',
				dataIndex: 'rangeScope',
			    align: 'center',
				width: 200,
			},
			{
				title: '操作',
				key: 'action',
				align: 'center',
				width: 200,
			},
		],
		list: [],
		selectedRowKeys: [],
		selectedRows: [],
	})
	//数据权限显示
	const rolePower = (record:any) => {
		if(record.rangeScope!=null) {
			return state.optionsAll.filter(item => {
				
				return item.type === record.rangeScope 
			})[0].value 
		}else{
			return ''
		}
		
	}
	//表格选中
	const onSelectChange = (selectedRowKeys:any,selectedRows:never) => {
	    state.selectedRowKeys = selectedRowKeys;
		state.selectedRows = selectedRows.map(item => {
			return item.userId
		})
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
			roleName: '',
			roleKey: '',
			remark: '',
		}
	    state.visible = true;
	}
	//编辑
	const handleEdit = (e:any) => {
		row.value = e
	    state.visible = true;
	}
	//菜单授权
	const handleAuth = (e:any) => {
		console.log("===e===", e)
		row.value = e
	    state.hidden = true;
	}
	//删除
	const handleDel = (row:any) => {
		state.ids = row.id
		Modal.confirm({
			title: '提示',
			content: () =>
			h('span', {}, [
				h('span', '确定将角色【'),
				h(
				'span',
				{
					style: {
					color: '#1677ff',
					},
				},
				row.roleKey + ' (' + row.roleName + ')',
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
					h('span', '】个角色全部删除吗？'),
				]),
				okText: '确认',
				cancelText: '取消',
				onOk: () => {
					delRow(row)
				},
				onCancel() { }
			})
		}else{
			message.info('请先选择要删除的角色')
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
				getData()
			}
		})
	}
	//获取数据
	const getData = () => {
		state.loading = true
		let params = {
			pageNo: state.pagination.current,
			pageSize: state.pagination.pageSize,
			roleName: state.roleName,
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
	// 获取数据授权
	const getRangeList = () => {
		rangeList().then((res) => {
			if(res.code == 0) {
				state.options = res.data
				console.log(state.options);
			}
		})
	}
	onMounted(() => {
		getRangeList()
		getData()
	})
</script>