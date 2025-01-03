<template>
	<div>
		<a-modal centered v-model:open="modalVisible" title="菜单授权" @ok="handleOk" @cancel="cancel" :width="500">
			<a-form ref="formRef" :model="state" layout="inline" class="mb15">
				<a-form-item label="关键字" name="roleName">
					<a-select v-model:value="formState.dataValue" style="width: 200px">
						<a-select-option v-for="item in state.options" :key="item.label" :value="item.label">{{ item.value }}</a-select-option>
					</a-select>
				</a-form-item>
			</a-form>
			<a-spin :spinning="state.loading" v-if="formState.dataValue == 1">
				<a-space class="mb15">
					<a-button type="default" size="min" @click="getAll(0)">全部选择</a-button>
					<a-button type="default" size="min" @click="getAll(1)">全部不选</a-button>
				</a-space>
				<a-form ref="formRef" :model="formState" :rules="rules">
					<a-form-item name="menuList">
						<div class="tree-box">
							<a-tree v-model:expandedKeys="state.expandedKeys" v-model:checkedKeys="formState.menuList"
								checkable :tree-data="state.treeData"
								:fieldNames="{ children: 'children', title: 'menuName', key: 'id', value: 'id' }"
								@check="onCheck">
							</a-tree>
						</div>
					</a-form-item>
				</a-form>
			</a-spin>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { authorize, getauth } from '@/api/role'
import { menuTree } from '@/api/menu'
import { defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
import { message } from 'ant-design-vue'
import { handleTree } from '@/utils/util'

const props = defineProps({
	row: {
		type: Object,
	},
	modelValue: {
		type: Boolean,
	},
})
const formRef = ref();
const formState = reactive({
	id: '',
	dataValue: 0,
	menuList: []
})
const state = reactive({
	loading: false,
	expandedKeys: ['0'],
	selectedKeys: [],
	checkedKeys: [],
	treeData: [],
	options: [
		{
			label: 0,
			value: '全部数据权限'
		},
		{
			label: 1,
			value: '自定数据权限'
		},
		{
			label: 2,
			value: '本机构数据权限'
		},
		{
			label: 3,
			value: '本机构及以下数据权限'
		},
		{
			label: 4,
			value: '仅本人数据权限'
		},
	]
})
const rules = {
	menuList: [
		{
			required: true,
			message: '请选择菜单',
			trigger: 'change',
		},
	],
}

watch(() => props.modelValue, () => {
	if (props.modelValue) {
		Object.assign(formState, props.row)
		console.log("===props.row===", props.row)
		getMenu()
	}
})
//表单重置
const resetForm = () => {
	formRef.value.resetFields();
}
//复选框选中
const onCheck = (checkedKeysValue, e) => {
	console.log('onCheck', checkedKeysValue);
	console.log('e.halfCheckedKeys :>> ', e);
	formState.menuList = checkedKeysValue
	state.checkedKeys = [...checkedKeysValue, ...e.halfCheckedKeys]
}
//回显
const resolveAllEunuchNodeId = (json: any[], idArr: any[], temp: any[] = []) => {
	for (const item of json) {
		if (item.children && item.children.length !== 0) {
			resolveAllEunuchNodeId(item.children, idArr, temp);
		} else {
			temp.push(...idArr.filter((id) => id === item.id));
		}
	}
	return temp;

}
//全选
const getAll = (e) => {
	if (e === 0) {
		getAllMenuNode(state.treeData)
	} else {
		state.checkedKeys = []
		formState.menuList = []
	}
}

const getAllMenuNode = (nodes) => {
	if (!nodes || nodes.length === 0) {
		return []
	}
	nodes.forEach(node => {
		state.checkedKeys.push(node.id)
		formState.menuList.push(node.id)
		return getAllMenuNode(node.children)
	})
}
const emit = defineEmits(['update:modelValue', 'refresh']);
const modalVisible = computed({
	get: () => props.modelValue,
	set: v => emit('update:modelValue', v),
})

//菜单选中
const getAuth = () => {
	console.log("===getAuth===", props.row)
	getauth({ id: props.row.id }).then((res: any) => {
		if (res.code == '0') {
			formState.menuList = resolveAllEunuchNodeId(state.treeData, res.data.menuList, [])
			state.checkedKeys = resolveAllEunuchNodeId(state.treeData, res.data.menuList, [])
		}
	})
}

//获取菜单
const getMenu = () => {
	state.treeData = []
	state.loading = true
	menuTree().then((res: any) => {
		if (res.code == '0') {
			state.treeData = res.data || []
			state.loading = false
			if (state.treeData.length > 0) {
				getAuth()
			}
		}
	})
}

//确定按钮的回调
const handleOk = () => {
	formRef.value.validate().then(() => {
		console.log('values', formState);
		let params = {
			roleId: formState.id,
			menuList: state.checkedKeys,
		}
		authorize(params).then((res) => {
			if (res.code == '0') {
				message.success('操作成功')
				emit('update:modelValue', false)
				emit('refresh')
				resetForm()
			}
		})
	}).catch(error => {
		console.log('error', error);
	});
}
const cancel = () => {
	emit('update:modelValue', false)
	resetForm()
}
</script>
<style lang="less" scoped>
.spin {
	margin: 20px;
}
.tree-box {
	height: 155px;
	overflow: auto;
}
</style>