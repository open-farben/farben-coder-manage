<template>
	<div :style="{ padding: '0 16px 25px 16px' }">
		<h4 :style="{ marginBottom: '20px' }">{{ title }}</h4>
		<div class="chart-wrapper" :style="{ height: '254px', width: '100%', margin: '25px auto 0 auto' }">
			<div :id="id"></div>
		</div>
	</div>
</template>

<script lang="ts" setup name="Bars">
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
			xField: 'date',
			yField: 'value',
			isGroup: true,
			seriesField: 'name',
			height: 254,
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
			/*tooltip: {
				formatter: (datum) => {
					return { name: datum.name, value: datum.count }
				},
			},*/
			slider: {},
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