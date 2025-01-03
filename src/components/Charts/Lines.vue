<template>
	<div :style="{ padding: '0 16px 25px 16px' }">
		<h4 :style="{ marginBottom: '20px' }">{{ title }}</h4>
		<div class="chart-wrapper" :style="{ height: '254px', width: '100%', margin: '25px auto 0 auto' }">
			<div :id="id"></div>
		</div>
	</div>
</template>

<script lang="ts" setup name="Lines">
	import { watch, onMounted } from 'vue'
	import { Line } from '@antv/g2plot'

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
		columnPlot = new Line(document.getElementById(props.id), {
			data: props.data,
			xField: 'date',
			yField: 'value',
			seriesField: 'name',
			height: 254,
			//color: '#38A0FF',
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