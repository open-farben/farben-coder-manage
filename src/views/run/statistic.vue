<template>
  	<a-card :body-style="{padding: '20px'}" :bordered="false">
		<div class="title mb15 flex flex-vcenter">
			<a-space class="flex-1 f14">
				<a-form ref="formRef" :model="state" layout="inline">
					<a-form-item name="date" label="时间">
						<a-range-picker :style="{width: '256px'}" :presets="state.pickerOptions" :value="state.date" format="YYYY-MM-DD" v-model:value="state.date" :placeholder="['开始时间', '结束时间']" :allowClear="false" @change="dateChange"/>
					</a-form-item>
					<a-form-item name="userId" label="账号">
						<a-input placeholder="请输入账号" v-model:value="state.userId"/>
					</a-form-item>
					<a-space>
						<a-button type="primary" @click="search">搜索</a-button>
						<a-button @click="resetForm">重置</a-button>
					</a-space>
				</a-form>
			</a-space>
			<a-button @click="handleExport">导出</a-button>
		</div>
		<a-table rowKey="account" @change="tableChange" :loading="state.loading" :dataSource="state.list" :columns="columns" :pagination="state.pagination" :scroll="{ x: 1800 }"></a-table>
  	</a-card>
</template>
<script lang="ts" setup name="statistic">
	import { download } from '@/utils/request'
	import {list} from '@/api/run'
	import { ref, reactive, computed, onMounted } from 'vue'
	import dayjs from 'dayjs';

	const formRef = ref();
	const state = reactive({
		loading: false,
		date: [dayjs(), dayjs()],
		userId: '',
		startTime: dayjs().format('YYYY-MM-DD'),
		endTime: dayjs().format('YYYY-MM-DD'),
		orderStr: '',
		orderBy: '',
		pickerOptions: [
			{
				label: '今天',
				value: [dayjs(), dayjs()],
			},
			{
				label: '最近7天',
				value: [dayjs().add(-7, 'd'), dayjs()],
			}, 
			{
				label: '最近14天',
				value: [dayjs().add(-14, 'd'), dayjs()],
			}, 
			{
				label: '最近30天',
				value: [dayjs().add(-30, 'd'), dayjs()],
			}, 
		],
		pagination: {
			current: 1,
			pageSize: 10, // 默认每页显示数量
			total: 0, //总条数
			showSizeChanger: true, // 显示可改变每页数量
			pageSizeOptions: ['10', '20', '50', '100'], // 每页数量选项
			showTotal: (total:number) => `共 ${total} 条`, // 显示总数
		},
		list: [],
	})
	const sortedInfo = ref();
	const columns = computed(() => {
		const sorted = sortedInfo.value || {};
		return [
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
				width: 100,
			},
			{
				title: '职务',
				dataIndex: 'dutyName',
			    align: 'center',
				width: 100,
			},
			{
				title: '累计使用次数',
				dataIndex: 'useCount',
				key: 'useCount',
				align: 'center',
				minWidth: 150,
				sorter: true,
				sortOrder: sorted.columnKey === 'useCount' && sorted.order,
			},
			{
				title: '生成代码次数',
				dataIndex: 'generationCount',
				key: 'generationCount',
				align: 'center',
				minWidth: 150,
				sorter: true,
				sortOrder: sorted.columnKey === 'generationCount' && sorted.order,
			},
			{
				title: '注释代码次数',
				dataIndex: 'explainCount',
				key: 'explainCount',
				align: 'center',
				minWidth: 150,
				sorter: true,
				sortOrder: sorted.columnKey === 'explainCount' && sorted.order,
			},
			{
				title: '转换代码次数',
				dataIndex: 'translateCount',
				key: 'translateCount',
				align: 'center',
				minWidth: 150,
				sorter: true,
				sortOrder: sorted.columnKey === 'translateCount' && sorted.order,
			},
			{
				title: '平均代码补全率',
				dataIndex: 'avgCompletionRate',
				key: 'avgCompletionRate',
				align: 'center',
				minWidth: 150,
				customRender: function (row:any) {
				    return (row.value * 100 || 0).toFixed(2) + '%'
				}
			},
			{
				title: '代码生成行数',
				dataIndex: 'generationLines',
				align: 'center',
				minWidth: 150,
			},
			{
				title: '代码采用行数',
				dataIndex: 'acceptLines',
				align: 'center',
				minWidth: 150,
			},
			{
				title: '平均响应时长(ms)',
				dataIndex: 'avgResponseRate',
				align: 'center',
				minWidth: 150,
				customRender: function (row:any) {
				    return (row.value || 0).toFixed(0)
				}
			},
			{
				title: '最近使用时间',
				dataIndex: 'lastUsedTime',
				align: 'center',
				minWidth: 150,
				customRender: function (row:any) {
				    return row.value && dayjs(row.value).format("YYYY-MM-DD HH:mm:ss")
				}
			},
			{
				title: '当前插件版本',
				dataIndex: 'version',
				align: 'center',
				minWidth: 150,
			},
		]
	})
	//获取数据
	const getData = () => {
		state.loading = true
		let params = {
			pageNo: state.pagination.current,
			pageSize: state.pagination.pageSize,
			searchText: state.userId,
			startDay: state.startTime,
			endDay: state.endTime,
			orderStr: state.orderStr,
			orderBy: state.orderBy,
		}
		list(params).then((res) => {
			if(res.data){
				state.list = res.data.records || []
				state.pagination.total = res.data.totalRow || 0
			}
			state.loading = false
		})
	}
	//时间选择
	const dateChange = (value:any, dateString:any) => {
		state.date = value
		state.startTime = dateString[0]
		state.endTime = dateString[1]
	}
	//表格排序
	const tableChange = (pagination, filters, sorter) => {
		state.pagination.current = pagination.current
		state.pagination.pageSize = pagination.pageSize
		sortedInfo.value = sorter
		if(sorter.order == 'ascend'){
			state.orderBy = 'ASC'
			state.orderStr = sorter.columnKey
		}else if(sorter.order == 'descend'){
			state.orderBy = 'DESC'
			state.orderStr = sorter.columnKey
		}else{
			state.orderBy = ''
			state.orderStr = ''
		}
		getData()
	}
	//搜索
	const search = () => {
		state.pagination.current = 1
		getData()
	}
	//重置
	const resetForm = () => {
		sortedInfo.value = null
		state.startTime = dayjs().format('YYYY-MM-DD')
		state.endTime = dayjs().format('YYYY-MM-DD')
		state.orderStr = ''
		state.orderBy = ''
		sortedInfo.value = null
	    formRef.value.resetFields();
		search()
	}
	//设置前端排序暂时不需要
	const setSort = () => {
		sortedInfo.value = {
			order: 'descend',
			columnKey: 'age',
		}
	}

	//导出
	const handleExport = () => {
      	let params = {
       		pageNo: state.pagination.current,
			pageSize: state.pagination.pageSize,
			searchText: state.userId,
			startDay: state.startTime,
			endDay: state.endTime,
      	}
      	download('/coder-api/statistics/exportPluginUsage',{ ...params }, `用户统计情况_${dayjs().format("YYYY.MM.DD")}.xlsx`)
    }

	onMounted(() => {
		getData()
	})
</script>
