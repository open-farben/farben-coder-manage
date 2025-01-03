<template>
	<div>
		<a-modal centered v-model:open="modalVisible" title="当前登录IDE编辑器管理" :footer="null" @ok="handleOk" @cancel="cancel" :width="500">
			<a-table rowKey="id" :dataSource="state.list" :columns="state.columns" :pagination="false">
				<template #bodyCell="{ column, record, index }">
					<template v-if="column.key === 'action'">
						<a-space>
							<a @click="loginOut(record, index)">强制登出</a>
						</a-space>
					</template>
				</template>
			</a-table>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
	import {pluginLogout} from '@/api/login'
	import { onMounted, defineProps, defineEmits, computed, reactive, ref, toRaw, watch, h } from 'vue';
	import { Modal, message } from 'ant-design-vue'
	import { useRouter } from 'vue-router'

	const props = defineProps({
		modelValue: {
			type: Boolean,
		},
		tableData: {
			type: Object,
		},
		row: {
			type: Object,
		},
	});
	const router = useRouter()
	const state = reactive({
		columns: [
			{
				title: 'IDE类型',
				dataIndex: 'pluginType',
			    align: 'center',
			},
			{
				title: '版本',
				dataIndex: 'ideVersion',
			    align: 'center',
			},
			{
				title: '登录时间',
				dataIndex: 'loginTime',
			    align: 'center',
			},
			{
				title: '操作',
				key: 'action',
				align: 'center',
				width: 90,
			},
		],
		list: [],
	})

	watch(() => props.modelValue,() => {
		if (props.modelValue) {
			console.log(props.tableData)
			Object.assign(state.list , props.tableData)
		}
	})

	const emit = defineEmits(['update:modelValue']);
	const modalVisible = computed({
		get: () => props.modelValue,
		set: v => emit('update:modelValue', v),
	})
	//强制登出
	const loginOut = (row, index) => {
		Modal.confirm({
			title: '提示',
			content: () =>
			h('span', {}, [
				h('span', '确定要注销【'),
				h(
				'span',
				{
					style: {
					color: '#1677ff',
					},
				},
				row.pluginType,
				),
				h('span', '】的登录状态吗？'),
			]),
			okText: '确认',
			cancelText: '取消',
			onOk: (async() => {
				let params = {
					uuid: row.uuid,
					userId: props.row.userId,
					
				}
				await pluginLogout(params).then((res:any) => {
					if(res.code == '0'){
						message.success('操作成功')
						state.list.splice(index, 1)
					}
				})
			}),
			onCancel() { }
		})
	}
	//确定按钮的回调
	const handleOk = () => {
		emit('update:modelValue', false)
	}
	const cancel = () => {
		emit('update:modelValue', false)
	}
</script>