<template>
  	<div>
		<div class="title mb15 flex flex-vcenter">
			<div class="flex-1">关键指标</div>
			<a-select
				v-model:value="state.value1"
				style="width: 120px"
				@change="handleChange"
			>
				<a-select-option v-for="item in state.dateList" :value="item.value" :key="item.value">{{item.label}}</a-select-option>
			</a-select>
		</div>
		<div class="mb20 total-row">
			<div class="total-col">
				<div class="total fff">
					<p class="c999">用户使用人数</p>
					<div class="flex flex-vcenter">
						<CountTo class="total-num flex-1" :end='state.total.userNum' :autoPlay="true" :duration='1000' />
						<img src="@/assets/icons/icon1.png" />
					</div>
				</div>
			</div>
			<div class="total-col">
				<div class="total fff">
					<p class="c999">模型调用次数</p>
					<div class="flex flex-vcenter">
						<CountTo class="total-num flex-1" :end='state.total.totalNum' :autoPlay="true" :duration='1000' />
						<img src="@/assets/icons/icon2.png" />
					</div>
				</div>
			</div>
			<div class="total-col">
				<div class="total fff">
					<p class="c999">代码生成行数</p>
					<div class="flex flex-vcenter">
						<CountTo class="total-num flex-1" :end='state.total.genNum' :autoPlay="true" :duration='1000' />
						<img src="@/assets/icons/icon3.png" />
					</div>
				</div>
			</div>
			<div class="total-col">
				<div class="total fff">
					<p class="c999">代码采纳行数</p>
					<div class="flex flex-vcenter">
						<p class="total-num flex-1"><CountTo :end='state.total.confirmNum' :autoPlay="true" :duration='1000' /></p>
						<img src="@/assets/icons/icon4.png" />
					</div>
				</div>
			</div>
			<div class="total-col">
				<div class="total fff" @click="handleSet">
					<p class="c999 flex">
						<span class="flex-1">响应速度</span>
						<SettingOutlined/>
					</p>
					<div class="flex flex-vcenter">
						<p class="total-num flex-1"><CountTo :end='state.total.avgTime' :autoPlay="true" :duration='3000' />ms</p>
						<img src="@/assets/icons/icon5.png" />
					</div>
					<template v-if="state.total.avgTime > state.total.baseSpeed">
						<p class="total-alam"><AlertOutlined /> 插件出现卡顿！</p>
					</template>
				</div>
			</div>
			<div class="total-col">
				<div class="total fff">
					<p class="c999">平均代码补全率</p>
					<div class="flex flex-vcenter">
						<p class="total-num flex-1">{{(state.total.completionRate *100).toFixed(2)}}%</p>
						<img src="@/assets/icons/icon5.png" />
					</div>
				</div>
			</div>
		</div>
		<Setion1 :treeData="state.treeData" v-if="state.treeData.length !== 0"></Setion1>
		<Setion2 :treeData="state.treeData" v-if="state.treeData.length !== 0"></Setion2>
		<Setion3 :treeData="state.treeData" v-if="state.treeData.length !== 0"></Setion3>
		<Setion4 :jobList="state.jobList" :treeData="state.treeData" v-if="state.treeData.length !== 0"></Setion4>
		<model v-model="state.visible" :row="row" @refresh="refresh"></model>
  	</div>
</template>

<script lang="ts" setup name="overview">
	import {totalList,dashboard, fun} from '@/api/run'
	import { dict } from '@/api/dict'
	import {treeList} from '@/api/dept'
	import CountTo from '@/components/CountTo/index.vue'
	import { ref, reactive, onMounted } from 'vue'
	import dayjs from 'dayjs'
	import { SettingOutlined, TrophyOutlined } from '@ant-design/icons-vue'
	import Model from './model.vue';
	import Setion1 from './components/setion1.vue';
	import Setion2 from './components/setion2.vue';
	import Setion3 from './components/setion3.vue';
	import Setion4 from './components/setion4.vue';
	
	const state = reactive({
		dateList: [
			{
				value: 'day',
				label: '当日',
			}, 
			{
				value: 'week',
				label: '当周',
			}, 
			{
				value: 'month',
				label: '当月',
			},
			{
				value: 'year',
				label: '当年',
			}
		],

		value1: 'day',

		startTime: dayjs().format('YYYY-MM-DD'),
		endTime: dayjs().format('YYYY-MM-DD'),

		total: {
			userNum: 0,
			totalNum: 0,
			genNum: 0,
			confirmNum: 0,
			avgTime: 0,
			baseSpeed: 0,
			completionRate: 0,
		},
		visible: false,
		jobList: [],

		expandedKeys: [],
		treeData: [],

	})
	const row = ref({})

	//设置
	const handleSet = () => {
		row.value = {
			baseSpeed: state.total.baseSpeed || 0
		}
	    state.visible = true;
	}

	//刷新
	const refresh = () => {
		getTotal()
	}

	//时间选择
	const handleChange = value => {
		if(value == 'month'){
			state.startTime = dayjs().startOf('month').format('YYYY-MM-DD')
			state.endTime = dayjs().endOf('month').format('YYYY-MM-DD')
		} else if(value == 'year'){
			state.startTime = dayjs().startOf('year').format('YYYY-MM-DD')
			state.endTime = dayjs().endOf('year').format('YYYY-MM-DD')
		} else if(value == 'week'){
			state.startTime = dayjs().startOf('week').format('YYYY-MM-DD')
			state.endTime = dayjs().endOf('week').format('YYYY-MM-DD')
		}else{
			state.startTime = dayjs().format('YYYY-MM-DD')
			state.endTime = dayjs().format('YYYY-MM-DD')
		}
		getTotal()
	};
	//获取职务
	const getJob = () => {
		let params = {
			dictCode: 'JOB_INFO',
		}
		dict(params).then((res:any) => {
			if(res.data){
				state.jobList = res.data || []
			}
		})
	}

	//获取树数据
	const getTree = () => {
		let params = {}
		treeList(params).then((res) => {
			state.treeData = res.data
			state.expandedKeys = [res.data[0].organNo]
		})
	}

	//获取统计数据
	const getTotal = () => {
		let params = {
			startDate: state.startTime,
			endDate: state.endTime,
			type: state.value1,
		}
		totalList(params).then((res) => {
			if(res.data){
				state.total = res.data
			}
		})
	}

	onMounted(() => {
		getJob()
		getTotal()
		getTree()
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
