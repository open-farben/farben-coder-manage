<template>
	<a-card :body-style="{padding: '20px'}" :bordered="false">
		<div class="title mb15 flex flex-vcenter">
			<a-space class="flex-1">
				<a-form ref="formRef" :model="state" layout="inline" :label-col="{span: 6}" :wrapper-col="{span: 18}">
					<a-row :gutter="0">
                		<a-col :md="6" :sm="24">
							<a-form-item label="组织" name="fullOrganization">
								<a-tree-select
									v-model:value="state.fullOrganization"
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
						<a-col :md="6" :sm="24">
							<a-form-item label="状态" name="status">
								<a-select v-model:value="state.status" placeholder="请选择状态">
									<a-select-option v-for="item in state.statuList" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
								</a-select>
							</a-form-item>
						</a-col>
						<a-col :md="6" :sm="24">
							<a-form-item label="账号" name="userName">
								<a-input placeholder="请输入账号/姓名/工号" v-model:value.trim="state.userName"/>
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
		        <a-button @click="handleImport">导入</a-button>
		    </a-space>
		</div>
		<a-table rowKey="id" :loading="state.loading" @change="tableChange" :dataSource="state.list" :columns="state.columns" :pagination="state.pagination" :rowSelection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }" :scroll="{ x: 1800 }">
			<template #bodyCell="{ column, record }">
				<template v-if="column.key === 'locked'">
					{{ record.locked == 1 ? '是' : '否' }}
				</template>
				<template v-if="column.key === 'status'">
					<a-switch v-model:checked="record.status" @change="handleStatus(record)" checked-value="ENABLE" unchecked-value="DISABLE" size="small"/>
				</template>
				<template v-if="column.key === 'action'">
					<a-space>
						<a v-if="record.locked == 1" @click="handleReset(record)">账号重置</a>
						<a @click="handleRest(record)">重置密码</a>
						<a @click="handleEdit(record)">编辑</a>
						<a @click="handleDel(record)">删除</a>
					</a-space>
				</template>
			</template>
		</a-table>
		<account-model v-model="state.visible" :row="row" :treeData="state.treeData" @refresh="editSearch"></account-model>
		<ImportModel v-model="state.show" @refresh="search"></ImportModel>
	</a-card>
</template>
<script lang="ts" setup name="account">
	import {userList, addUser, deleteUser, resetPassword, enableUser, disableUser} from '@/api/run'
	import {treeList} from '@/api/dept'
	import { onMounted, ref, reactive, h } from 'vue'
	import AccountModel from './accountModel.vue';
	import ImportModel from './importModel.vue';
	import { Modal, message } from 'ant-design-vue'
    import { useAccountStore } from "@/store/modules/account.pinia";

	const accountStore = useAccountStore();
	const formRef = ref()
	const row = ref({})
	const state = reactive({
		fullOrganization: undefined,
		status: '',
		userName: '',
		ids: '',
		expandedKeys: [],
		loading: false,
		visible: false,
		show: false,
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
				value: 'ENABLE',
				label: '启用',
			}, 
			{
				value: 'DISABLE',
				label: '停用',
			}, 
		],
		treeData: [],
		columns: [
			{
				title: '账号',
				dataIndex: 'account',
			    align: 'center',
				width: 100,
			},
			{
				title: '工号',
				dataIndex: 'jobNumber',
			    align: 'center',
				width: 100,
			},
			{
				title: '姓名',
				dataIndex: 'name',
			    align: 'center',
				width: 100,
			},
			{
				title: '组织',
				dataIndex: 'organizationName',
			    align: 'center',
				width: 150,
				showSorterTooltip: true,
				ellipsis: true,
			},
			{
				title: '职务',
				dataIndex: 'dutyName',
			    align: 'center',
				width: 120,
			},
			{
				title: '手机号',
				dataIndex: 'mobile',
			    align: 'center',
				width: 100,
			},
			{
				title: '邮箱',
				dataIndex: 'email',
			    align: 'center',
				width: 100,
			},
			{
				title: '当前使用版本',
				dataIndex: 'version',
			    align: 'center',
				width: 150,
			},
			{
				title: '最近使用时间',
				dataIndex: 'lastUsedTime',
			    align: 'center',
				width: 160,
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
				key: 'status',
				dataIndex: 'status',
			    align: 'center',
				width: 100,
			},
			{
				title: '操作',
				key: 'action',
				align: 'center',
				width: 250,
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
	//全选
	const onSelectAll = (selected:any, selectedRows:never, changeRows:any) => {
		if (selected) {
			state.selectedRows = state.selectedRows.concat(changeRows);
		}
		if (!selected) {
			let selectedRows = JSON.parse(JSON.stringify(state.selectedRows));
			let delIndex = [];
			selectedRows.forEach((item:any, index:never) => {
				changeRows.forEach((val:any, itemIndex:never) => {
					if (item.id === val.id) {
						delIndex.push(index);
					}
				})
			})
			delIndex.forEach(item => {
				delete selectedRows[item];
			})
			selectedRows = selectedRows.filter(item => {
				return item != undefined;
			})
			state.selectedRows = selectedRows
		}
	}
	//搜索
	const search = () => {
		state.pagination.current = 1
		getData()
	}
	//编辑搜索
	const editSearch = () => {
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
			account: '',
			name: '',
			jobNumber: '',
			organization: undefined,
			duty: undefined,
			fullOrganization: '',
			mobile: '',
			email: '',
			status: 'ENABLE',
		}
	    state.visible = true;
	}
	//编辑
	const handleEdit = (e:any) => {
		row.value = e
	    state.visible = true;
	}
	//导入
	const handleImport = (e:any) => {
	    state.show = true;
	}
	//启用禁用状态
	const handleStatus = (row:any) => {
		let text = row.status == 'ENABLE' ? "启用" : "停用";
		row.status = row.status == 'ENABLE' ? 'DISABLE' : 'ENABLE',
		Modal.confirm({
			title: '提示',
			content: () =>
			h('span', {}, [
				h('span', '确定将账号【'),
				h('span',{style: {color: '#1677ff'}}, row.account),
				h('span','】' + text),
				h('span', '吗？'),
			]),
			okText: '确认',
			cancelText: '取消',
			onOk: (async() => {
				let params = {
					id: row.id,
				}
				if(row.status == 'ENABLE'){
					await disableUser(params).then((res:any) => {
						if(res.code == '0'){
							message.success('操作成功')
							getData()
						}
					})
				}else{
					await enableUser(params).then((res:any) => {
						if(res.code == '0'){
							message.success('操作成功')
							getData()
						}
					})
				}
			}),
			onCancel() {
				row.status = row.status
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
				h('span', '确定将账号【'),
				h(
				'span',
				{
					style: {
					color: '#1677ff',
					},
				},
				row.account + ' (' + row.name + ')',
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
	//账号重置
	const handleReset = (row:any) => {
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
				row.account + ' (' + row.name + ')',
				),
				h('span', '】的账号重置吗？'),
			]),
			okText: '确认',
			cancelText: '取消',
			onOk: () => {
				accountStore.pluginReset(row.account).then((res:any) => {
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
				row.account + ' (' + row.name + ')',
				),
				h('span', '】的密码重置吗？'),
			]),
			okText: '确认',
			cancelText: '取消',
			onOk: () => {
				resetPassword({id: row.id}).then((res) => {
					if(res.code == '0'){
						message.success(res.message)
						getData()
					}
				})
			},
			onCancel() { }
		})
    }
	//获取数据
	const getData = () => {
		state.loading = true
		let params = {
			pageNo: state.pagination.current,
			pageSize: state.pagination.pageSize,
			organization: state.fullOrganization,
			status: state.status,
			userName: state.userName,
		}
		userList(params).then((res:any) => {
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
		getTree()
	})

</script>