<template>
	<a-card :body-style="{padding: '20px'}" :bordered="false">
		<div class="title mb15 flex flex-vcenter">
			<a-space class="flex-1">
				<a-form ref="formRef" :model="state" layout="inline" :label-col="{span: 6}" :wrapper-col="{span: 18}">
					<a-row :gutter="0">
						<a-col :md="8" :sm="24">
							<a-form-item label="状态" name="status">
								<a-select v-model:value="state.status" placeholder="请选择状态">
									<a-select-option v-for="item in state.statuList" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
								</a-select>
							</a-form-item>
						</a-col>
						<a-col :md="13" :sm="24">
							<a-form-item label="菜单名称" name="menuName">
								<a-input placeholder="请输入菜单名称" v-model:value.trim="state.menuName"/>
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
		    </a-space>
		</div>
		<a-table rowKey="id" :dataSource="state.list" :columns="state.columns">
			<template #bodyCell="{ column, record }">
				<template v-if="column.key === 'status'">
					<a-switch :checked="record.status" @change="handleStatus(record)" :checked-value="0" :unchecked-value="1" size="small"/>
				</template>
				<template v-if="column.key === 'action'">
					<a-space>
						<a @click="handleEdit(record)">编辑</a>
						<a @click="handleAdd(record)" v-if="record.menuType != 'C'">新增</a>
						<a @click="handleDel(record)">删除</a>
					</a-space>
				</template>
			</template>
		</a-table>
	</a-card>
	<menu-model v-model="state.visible" :row="row" @refresh="search" :treeData="state.list"></menu-model>
</template>
<script lang="ts" setup name="accountlist">
	import {list, listDel, listDisable} from '@/api/menu'
	import { ref, reactive, onMounted, h } from 'vue'
	import MenuModel from './menuModel.vue';
	import { handleTree } from '@/utils/util'
	import { Modal, message } from 'ant-design-vue'
import { Item } from 'ant-design-vue/es/menu';

	const formRef = ref()
	const row = ref({})
	const state = reactive({
		status: '',
		menuName: '',

		loading: false,
		visible: false,
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
		columns: [
			{
				title: '菜单名称',
				dataIndex: 'menuName',
			    align: 'center',
			},
			{
				title: '图标',
				dataIndex: 'icon',
			    align: 'center',
			},
			{
				title: '排序',
				dataIndex: 'orderNum',
			    align: 'center',
			},
			// {
			// 	title: '权限标识',
			// 	dataIndex: 'permission',
			//     align: 'center',
			// },
			{
				title: '菜单路由',
				dataIndex: 'path',
			    align: 'center',
			},
			{
				title: '组件路径',
				dataIndex: 'component',
			    align: 'center',
			},
			{
				title: '状态',
				dataIndex: 'status',
				key: 'status',
			    align: 'center',
			},
			// {
			// 	title: '创建时间',
			// 	dataIndex: 'createTime',
			//     align: 'center',
			// },
			{
				title: '操作',
				key: 'action',
				align: 'center',
			},
		],
		treeData: [],
		list: [],
	})
	//新增
	const handleAdd = (e) => {
		row.value = {
			id: '',
			parentId: e && e.id ? e.id : '0',
			menuType: 'M',
			icon: '',
			menuName: '',
			orderNum: '',
			blank: 1,
			path: '',
			component: '',
			permission: '',
			query: '',
			keepAlive: 1,
			hidden: 0,
			status: 0,
		}
	    state.visible = true;
	}
	//编辑
	const handleEdit = (e:any) => {
		row.value = e
	    state.visible = true;
	}
	//搜索
	const search = () => {
		getData()
	}
	//重置
	const resetForm = () => {
		formRef.value.resetFields();
		search()
	}
	//删除
	const handleDel = (row:any) => {
		console.log(row)
		Modal.confirm({
			title: '提示',
			content: () =>
			row.menuType == 'C' ?
			h('span', {}, [
				h('span', '确定要将【'),
				h(
				'span',
				{
					style: {
					color: '#1677ff',
					},
				},
				row.menuName,
				),
				h('span', '】这个菜单删除吗？'),
			]) : h('span', {}, [
				h('span', '确定要将目录【'),
				h(
				'span',
				{
					style: {
					color: '#1677ff',
					},
				},
				row.menuName,
				),
				h('span', `】及其下属所有目录/菜单(共${row.children.length}个) 都删除吗？`),
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
			id: row.id,
		}
		listDel(params).then((res:any) => {
			if(res.code == '0'){
				message.success('删除成功')
				getData()
			}
		})
	}
	//状态
	const handleStatus = (row:any) => {
		let text = row.status == 1 ? "启用" : "停用";
		Modal.confirm({
			title: '提示',
			content: () =>
			row.menuType == 'C' ?
			h('span', {}, [
				h('span', '确定要将【'),
				h(
				'span',
				{
					style: {
					color: '#1677ff',
					},
				},
				row.menuName,
				),
				h('span', `】这个菜单${text}吗？`),
			]) : h('span', {}, [
				h('span', '确定要将目录【'),
				h(
				'span',
				{
					style: {
					color: '#1677ff',
					},
				},
				row.menuName,
				),
				h('span', `】及其下属所有目录/菜单(共${row.children.length}个) 都${text}吗？`),
			]),
			okText: '确认',
			cancelText: '取消',
			onOk: (async() => {
				let params = {
					id: row.id,
					status: row.status == 0 ? 1 : 0,
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
	//菜单列表
	const getData = () => {
		state.loading = true
		let params = {
			status: state.status,
			menuName: state.menuName,
		}
		list(params).then((res:any) => {
			if(res.code == '0'){
				state.list = handleTree(res.data || [], 'id')
			}
			state.loading = false
		})
	}
	onMounted(() => {
		getData()
	})
</script>