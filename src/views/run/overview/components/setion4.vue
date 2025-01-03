<template>
	<a-card :loading="loading" :bordered="false" :body-style="{ padding: '0', marginBottom: '0px' }">
		<div class="salesCard">
			<a-tabs default-active-key="1" size="small" :tab-bar-style="{ marginBottom: '24px', paddingLeft: '16px' }">
				<template #leftExtra>
					<div class="extra-wrapper">
						<div class="title">各职务使用插件功能情况</div>
					</div>
				</template>
				<template #rightExtra>
					<div class="extra-wrapper">
						<div class="extra-item">
							<a-select class="mr20" v-model:value="state.duty" placeholder="请选择职务" @change="getData">
								<a-select-option v-for="item in jobList" :key="item.kindCode" :value="item.kindCode">{{ item.kindValue }}</a-select-option>
							</a-select>
							<a-tree-select
								v-model:value="state.fullOrganNo"
								:dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
								:dropdownMatchSelectWidth="false"
								:tree-data="treeData"
								placeholder="请选择机构"
								:field-names="{children:'children', label:'organName', key:'fullOrganNo', value: 'fullOrganNo' }"
								:treeDefaultExpandedKeys="[treeData[0].fullOrganNo]"
								@change="getData"
							>
							</a-tree-select>
							<a @click="selectDate('day')" :class="{'active':state.datytype == 'day'}">日</a>
							<a @click="selectDate('month')" :class="{'active':state.datytype == 'month'}">月</a>
							<a @click="selectDate('year')" :class="{'active':state.datytype == 'year'}">年</a>
						</div>
						<template v-if="state.datytype != 'day'">
							<a-range-picker :picker="state.datytype" v-model:value="state.date" @change="dateChange" :disabled-date="disabledDate" :allowClear="false" :style="{ width: '256px' }"/>
						</template>
						<template v-else>
							<a-range-picker v-model:value="state.date" @change="dateChange" :disabled-date="disabledDate" :allowClear="false" :style="{ width: '256px' }"/>
						</template>
					</div>
				</template>
				<a-tab-pane loading="true" tab="" key="1">
					<pie :data="state.barData" :total="state.total" :disableLegend="true" title="" id="sales4" />
				</a-tab-pane>
			</a-tabs>
		</div>
	</a-card>
</template>

<script lang="ts" setup name="overview">
	import {dutycount} from '@/api/run'
	import { ref, reactive, onMounted } from 'vue'
	import dayjs from 'dayjs'
	import Pie from '@/components/Charts/Pie.vue'

	const props = defineProps({
		jobList: {
			type: Object,
		},
		treeData: {
			type: Object,
		},
	});
	
	const state = reactive({
		date: [dayjs().subtract(6, 'days'), dayjs()],
		startDate: dayjs().subtract(6, 'days').format('YYYY-MM-DD'),
		endDate: dayjs().format('YYYY-MM-DD'),
		datytype: 'day',
		duty: undefined,
		fullOrganNo: undefined,

		barData: [],
		total: 0,
	})

	//禁用是期
	const disabledDate = current => {
		return current && current > dayjs().endOf('day');
	}

	//获取日期
	const getAllDate = (datytype, startDate, endDate) => {
      	let daysList = [];
      	const start = dayjs(startDate);
      	const end = dayjs(endDate);
      	const day = end.diff(start, datytype);
	  	if(datytype == 'month'){
			daysList.push(start.format("YYYY-MM"));
	  	} else if(datytype == 'year'){
			daysList.push(start.format("YYYY"));
	  	}else{
			daysList.push(start.format("YYYY-MM-DD"));
	  	}
      	for (let i = 1; i <= day; i++) {
			if(datytype == 'month'){
				daysList.push(start.add(i, datytype).format("YYYY-MM"));
			} else if(datytype == 'year'){
				daysList.push(start.add(i, datytype).format("YYYY"));
			}else{
				daysList.push(start.add(i, datytype).format("YYYY-MM-DD"));
			}
      	}
      	return daysList;
    };

	//日月年选择
	const selectDate = (type) => {
		state.datytype = type
		if(state.datytype == 'month'){
			state.startDate = dayjs().add(-5, 'month').format('YYYY-MM-DD')
			state.endDate = dayjs().format('YYYY-MM-DD')
			state.date = [dayjs().add(-5, 'month'), dayjs()]
			
		} else if(state.datytype == 'year'){
			state.startDate = dayjs().add(-2, 'year').format('YYYY-MM-DD')
			state.endDate = dayjs().format('YYYY-MM-DD')
			state.date = [dayjs().add(-2, 'year'), dayjs()]
		}else{
			state.startDate = dayjs().subtract(6, 'days').format('YYYY-MM-DD')
			state.endDate = dayjs().format('YYYY-MM-DD')
			state.date = [dayjs().subtract(6, 'days'), dayjs()]
		}
		getData()
	}

	//时间选择
	const dateChange = (value:any, dateString:any) => {
		if(state.datytype == 'month'){
			state.startDate = dayjs(dateString[0]).startOf('month').format('YYYY-MM-DD')
			state.endDate = dayjs(dateString[1]).endOf('month').format('YYYY-MM-DD')
		} else if(state.datytype == 'year'){
			state.startDate = dayjs(dateString[0]).startOf('year').format('YYYY-MM-DD')
			state.endDate = dayjs(dateString[1]).endOf('year').format('YYYY-MM-DD')
		}else{
			state.date = value
			state.startDate = dateString[0]
			state.endDate = dateString[1]
		}
		getData()
	}

	// created
	const loading = ref<boolean>(true)
	setTimeout(() => {
		loading.value = !loading.value
	}, 500)

	//获取数据
	const getData = () => {
		let date = []
		let list = []
		let params = {
			startDate: state.startDate,
			endDate: state.endDate,
			type: state.datytype,
			duty: state.duty,
			fullOrganNo: state.fullOrganNo,
		}
		dutycount(params).then((res) => {
			date = getAllDate(state.datytype, state.startDate, state.endDate);
			const arr = [
				{
					name: '代码提示',
					funId: 'code_hinting' 
				},
				{
					name: '智能问答',
					funId: 'ai_answer' 
				},
				{
					name: '代码纠正',
					funId: 'code_correction' 
				},
				{
					name: '代码解释',
					funId: 'code_explain' 
				},
				{
					name: '单元测试',
					funId: 'unit_test' 
				},
				{
					name: '代码注释',
					funId: 'code_comment' 
				},
				
				{
					name: '代码转换',
					funId: 'code_conversion' 
				},
				{
					name: '知识库问答',
					funId: 'knowledge_qa' 
				},
				{
					name: '代码搜索',
					funId: 'code_search' 
				},
			];
			
			arr.forEach( item  => {
				const data = res.data.find( resDate => item.funId === resDate.funId);
				if (data) {
					const label = arr.find((item) => item.funId === data.funId)
					data.type = label.name
					list.push(data);
				} else {
					list.push({
						date: null,
						value: 0,
						type: item.name,
						funId: item.funId 
					})
				}
			})
			state.barData = list
			state.total = res.data.reduce((sumData, key)=>{
				return sumData + key.value
			},0)
		})
	}
	const getData111 = () => {
		let date = []
		let list = []
		let params = {
			startDate: state.startDate,
			endDate: state.endDate,
			type: state.datytype,
			duty: state.duty,
			fullOrganNo: state.fullOrganNo,
		}
		dutycount(params).then((res) => {
			/*date = getAllDate(state.datytype, state.startDate, state.endDate)
			for(let i in date){
				list.push({
					date: date[i],
    				count: 0,
				})
			}
			for(let i in res.data){
				for(let x in list){
					if(res.data[i].date === list[x].date){
						list[x].count = res.data[i].count;
					}
				}
			}*/
			state.barData = res.data
			state.total = res.data.reduce((sumData, key)=>{
				return sumData + key.value
			},0)
		})
	}

	onMounted(() => {
		getData()
	})

</script>

<style lang="less" scoped>
.total-row{margin-left: -20px;}
.total-col{margin-left: 20px;position: relative;display: inline-block;vertical-align: middle;width: calc(100% / 6  - 20px);}
.total{padding: 15px 15px;height: 110px;color: #333;cursor: pointer;}
.total p{margin: 0 0 10px;}
.total:hover{box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);transition: all .1s ease-out}
.total-num{font-size: 24px;font-weight: 600;}
.total img{width: 50px;height: 50px;}
.total-alam{font-size: 12px;color: #ff4d4f;position: absolute;bottom: 0;}

.extra-wrapper {
  line-height: 55px;
  padding-right: 20px;

  .extra-item {
    display: inline-block;
    margin-right: 20px;

    a {
      margin-left: 20px;
	  color: #333;
    }
	a.active {
	  color: #1890ff;
    }
  }
}

.antd-pro-pages-dashboard-analysis-twoColLayout {
  position: relative;
  display: flex;
  display: block;
  flex-flow: row wrap;
}

.antd-pro-pages-dashboard-analysis-salesCard {
  height: calc(100% - 24px);

  ::v-deep(.ant-card-head) {
    position: relative;
  }
}

.dashboard-analysis-iconGroup {
  i {
    margin-left: 16px;
    color: rgba(0, 0, 0, 0.45);
    cursor: pointer;
    transition: color 0.32s;
  }
}

.analysis-salesTypeRadio {
  position: absolute;
  right: 54px;
  bottom: 12px;
}

::v-deep(.ant-table-row) {
  color: rgba(0, 0, 0, 0.65);

  &:hover {
    background-color: #fff1f0;
  }
}

::v-deep(.ant-table-tbody) {
  &>tr.ant-table-row:hover {
    &>td {
      background-color: #fff1f0;
    }
  }
}

.salesCard{
	::v-deep .ant-tabs-tab + .ant-tabs-tab{
		margin: 0 0 0 10px;
	}
	::v-deep .ant-tabs-ink-bar {
		background: transparent;
	}
}
</style>
