<template>
	<div :style="{ padding: '0 16px 25px 16px' }">
		<h4 :style="{ marginBottom: '20px' }">{{ title }}</h4>
		<div class="chart-wrapper" :style="{ height: '254px', width: '100%', margin: '25px auto 0 auto' }">
			<div :id="id"></div>
		</div>
	</div>
</template>

<script lang="ts" setup name="Bar">
	import { watch, onMounted } from 'vue'
	import { Column } from '@antv/g2plot'

	const props = defineProps({
		id: {
			type: String,
			default: ''
		},
		title: {
			type: String,
			default: ''
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
		columnPlot = new Column(document.getElementById(props.id), {
			data: props.data,
			isStack: true,
			xField: 'date',
			yField: 'value',
			seriesField: 'type',
			height: 254,
			legend: {
			layout: 'horizontal',
				position: 'top-left',
				//offsetY: -10,
			},
			label: {
				// 可手动配置 label 数据标签位置
				position: 'middle', // 'top', 'bottom', 'middle'
				// 可配置附加的布局方法
				layout: [
					// 柱形图数据标签位置自动调整
					{ type: 'interval-adjust-position' },
					// 数据标签防遮挡
					{ type: 'interval-hide-overlap' },
					// 数据标签文颜色自动调整
					{ type: 'adjust-color' },
				],
			},
			yAxis: {
				grid: {
					line: {
						style: {
							lineWidth: 0.5,
							lineDash: [4, 5]
						}
					}
				}
			},
		})
		columnPlot.render()
	}
	onMounted(() => {
		inChart()
	})
	watch(
		() => props.data,
		(newvalue) => {
			if(newvalue){
				columnPlot.changeData(newvalue)
			}
		}
	)

</script>