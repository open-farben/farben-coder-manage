<template>
	<a-card :body-style="{padding: '20px'}" :bordered="false">
		<div class="title mb15 flex flex-vcenter">
			<a-space class="flex-1">
				<a-form ref="formRef" :model="state" layout="inline" :label-col="{span: 5}" :wrapper-col="{span: 19}">
					<a-row :gutter="0">
                		<a-col :md="7" :sm="24">
							<a-form-item label="组织" name="organization">
								<a-tree-select
									v-model:value="state.organization"
									:dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
									:dropdownMatchSelectWidth="false"
									:tree-data="state.treeData"
									placeholder="请选择组织"
									:field-names="{children:'children', label:'organName', key:'fullOrganNo', value: 'fullOrganNo' }"
									:treeDefaultExpandedKeys="state.expandedKeys"
								>
								</a-tree-select>
							</a-form-item>
						</a-col>
						<a-col :md="7" :sm="24">
							<a-form-item label="状态" name="status">
								<a-select v-model:value="state.status" placeholder="请选择状态">
									<a-select-option v-for="item in state.statuList" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
								</a-select>
							</a-form-item>
						</a-col>
						<a-col :md="7" :sm="24">
							<a-form-item label="账号" name="searchKey">
								<a-input placeholder="请输入账号/姓名/工号" v-model:value.trim="state.searchKey"/>
							</a-form-item>
						</a-col>
						<a-col :md="3" :sm="24">
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
		<a-table rowKey="userId" :loading="state.loading" @change="tableChange" :dataSource="state.list" :columns="state.columns" :pagination="state.pagination" :rowSelection="{selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }" :scroll="{ x: 1350 }">
			<template #bodyCell="{ column, record }">
				<template v-if="column.key === 'locked'">
					{{ record.locked == 1 ? '是' : '否' }}
				</template>
				<template v-if="column.key === 'inUse'">
					<a-switch :checked="record.inUse" @change="handleStatus(record)" :checked-value="0" :unchecked-value="1" size="small" :disabled="record.accountType == 0"/>
				</template>
				<template v-if="column.key === 'action'">
					<a-space>
						<a v-if="record.locked == 1" @click="handleReset(record)">账号重置</a>
						<a @click="handleRest(record)">重置密码</a>
						<a @click="handleEdit(record)" v-if="record.accountType != 0">编辑</a>
						<a @click="handleDel(record)" v-if="record.accountType != 0">删除</a>
					</a-space>
				</template>
			</template>
		</a-table>
		<user-model v-model="state.visible" :row="row" :treeData="state.treeData" @refresh="search"></user-model>
	</a-card>
</template>
<script lang="ts" setup name="account">
	import {list, deleteUser, resetPassword, listDisable} from '@/api/account'
	import {treeList} from '@/api/dept'
	import { ref, reactive, onMounted, h } from 'vue'
	import UserModel from './userModel.vue';
    import { useAccountStore } from "@/store/modules/account.pinia";
	import { Modal, message } from 'ant-design-vue'

	const accountStore = useAccountStore();
	const formRef = ref()
	const row = ref({})
	const state = reactive({
		searchKey: '',
		organization: undefined,
		status: '',
		ids: '',
		expandedKeys: [],
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
				value: 0,
				label: '启用',
			}, 
			{
				value: 1,
				label: '停用',
			}, 
		],
		treeData: [],
		columns: [
			{
				title: '账号',
				dataIndex: 'userId',
			    align: 'center',
				width: 80,
			},
			{
				title: '工号',
				dataIndex: 'jobNumber',
			    align: 'center',
				width: 80,
			},
			{
				title: '姓名',
				dataIndex: 'userName',
			    align: 'center',
				width: 80,
			},
			{
				title: '组织',
				dataIndex: 'organizationName',
			    align: 'center',
				width: 100,
			},
			{
				title: '职务',
				dataIndex: 'dutyName',
			    align: 'center',
				width: 100,
			},
			{
				title: '角色',
				dataIndex: 'roleName',
			    align: 'center',
				width: 100,
			},
			{
				title: '手机号',
				dataIndex: 'phone',
			    align: 'center',
				width: 80,
			},
			{
				title: '邮箱',
				dataIndex: 'email',
			    align: 'center',
				width: 80,
			},
			{
				title: '账号是否锁定',
				key: 'locked',
				dataIndex: 'locked',
			    align: 'center',
				width: 160,
			},
			{
				title: '状态',
				key: 'inUse',
				dataIndex: 'inUse',
			    align: 'center',
				width: 80,
			},
			{
				title: '操作',
				key: 'action',
				align: 'center',
				width: 210,
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
	//获取数据
	const getData = () => {
		state.loading = true
		let params = {
			pageNo: state.pagination.current,
			pageSize: state.pagination.pageSize,
			organization: state.organization,
			status: state.status,
			searchKey: state.searchKey,
		}
		list(params).then((res:any) => {
			if(res.data){
				state.list = res.data.records || []
				state.pagination.total = res.data.totalRow
			}
			state.loading = false
		})
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
	// 账号解锁
	const handleReset = (row) => {
		Modal.confirm({
			title: '提示',
			content: () =>
			h('span', {}, [
				h('span', '确定将【'),
				h(
				'span',
				{
					style: {
					color: '#1677ff',
					},
				},
				row.userId,
				),
				h('span', '】的账号重置吗？'),
			]),
			okText: '确认',
			cancelText: '取消',
			onOk: () => {
				accountStore.accountReset(row.userId).then((res:any) => {
					if(res.code == '0'){
						message.success(res.message)
						getData()
					}else{
						message.error(res.message)
					}
				})
			},
			onCancel() { }
		})
	}

	//新增
	const handleAdd = () => {
		row.value = {
			id: '',
			userId: '',
			userName: '',
			jobNumber: '',
			duty: undefined,
			organization: undefined,
			organizationName: '',
			fullOrganization: '',
			phone: '',
			email: '',
			inUse: 0,
			roleId: [],
		}
	    state.visible = true;
	}
	//编辑
	const handleEdit = (e:any) => {
		row.value = e
	    state.visible = true;
	}
	//状态
	const handleStatus = (row:any) => {
		let text = row.inUse ? "启用" : "停用";
		Modal.confirm({
			title: '提示',
			content: `确定要${text}这个账号吗？`,
			okText: '确认',
			cancelText: '取消',
			onOk: (async() => {
				let params = {
					id: row.id,
					status: row.inUse == 0 ? 1 : 0,
				}
				await listDisable(params).then((res:any) => {
					if(res.code == '0'){
						message.success('操作成功')
						getData()
					}
				})
			}),
			onCancel() {
				row.inUse = row.inUse
			}
		})
    }
	//删除
	const handleDel = (row:any) => {
		state.ids = row.userId
		Modal.confirm({
			title: '提示',
			content: () =>
			h('span', {}, [
				h('span', '确定将账号【'),
				h(
				'span',
				{
					style: {
					color: '#1677ff',
					},
				},
				row.userId + ' (' + row.userName + ')',
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
					h('span', '】个账号全部删除吗？'),
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
	const delRow = (row:any) => {
		let params = {
			ids: state.ids,
		}
		deleteUser(params).then((res) => {
			if(res.code == '0'){
				message.success('删除成功')
				state.selectedRowKeys = []
				getData()
			}
		})
	}
	//重置密码
	const handleRest = (row:any) => {
		Modal.confirm({
			title: '提示',
			content: () =>
			h('span', {}, [
				h('span', '确定将【'),
				h(
				'span',
				{
					style: {
					color: '#1677ff',
					},
				},
				row.userId + ' (' + row.userName + ')',
				),
				h('span', '】的密码重置吗？'),
			]),
			okText: '确认',
			cancelText: '取消',
			onOk: (async() => {
				await resetPassword({id: row.userId}).then((res) => {
					if(res.code == '0'){
						message.success('操作成功')
						getData()
					}
				})
			}),
			onCancel() { }
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
		getTree()
	})

</script>