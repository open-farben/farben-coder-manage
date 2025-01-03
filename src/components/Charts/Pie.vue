<template>
	<div :style="{ padding: '0 16px 25px 16px' }">
		<div class="chart-wrapper" :style="{ width: '100%', margin: '0px auto 0 auto' }">
			<div :id="id"></div>
		</div>
	</div>
</template>

<script lang="ts" setup name="Bar">
	import { watch, onMounted } from 'vue'
	import { Pie } from '@antv/g2plot'
	import {toPrecision} from '@/utils/util'

	const props = defineProps({
		id: {
			type: String,
			default: ''
		},
		title: {
			type: String,
			default: ''
		},
		total: {
			type: Number,
			default: 0
		},
		disableLegend: {
			type: Boolean,
			default: false
		},
		data: {
			default: () => {
				return []
			}
		}
	})
	let columnPlot
	const inChart = () => {
		columnPlot && columnPlot.destroy();
		let legendSelected:any = {}
		for(let key of Object.keys(props.data)){
			if(props.data[key].value != 0){
				legendSelected[props.data[key].type] = true
			}else{
				legendSelected[props.data[key].type] = false
			}
		}
		columnPlot = new Pie(document.getElementById(props.id), {
			height: 240,
			radius: 0.8,
			data: props.data,
			angleField: 'value',
  			colorField: 'type',
			forceFit: true,
			description: {
				visible: true,
				text:
				'指定颜色映射字段(colorField)，饼图切片将根据该字段数据显示为不同的颜色。指定颜色需要将color配置为一个数组。\n当把饼图label的类型设置为inner时，标签会显示在切片内部。设置offset控制标签的偏移值。',
			},
			label: {
				visible: true,
				type: 'spider',
				formatter: (text, item) => `${item._origin.type}: ${item._origin.value}次`,
			},
			tooltip: {
				formatter: (datum) => {
					return { name: datum.type, value: toPrecision((datum.value / props.total) * 100) + "%" }
				},
			},
		})
		columnPlot.render()
		if(props.disableLegend){
			const options = {
				legend: {
					selected: legendSelected
				}
			}
			columnPlot.update(options)
		}
		
	}
	onMounted(() => {
		inChart()
	})
	watch(
		() => props.data,
		(newvalue) => {
			if(newvalue){
				columnPlot.changeData(newvalue)
				if(props.disableLegend){
					inChart()
				}
			}
		}
	)

</script>