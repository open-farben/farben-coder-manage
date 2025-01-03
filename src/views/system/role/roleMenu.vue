<template>
	<div>
		<a-modal centered v-model:open="modalVisible" title="角色授权" @ok="handleOk" @cancel="cancel" :width="500">
			<a-tabs v-model:activeKey="activeKey">
				<a-tab-pane key="1" tab="菜单授权">
					<a-spin :spinning="state.loading">
						<a-space class="mb15">
							<a-button type="default" size="min" @click="getAll(0)">全部选择</a-button>
							<a-button type="default" size="min" @click="getAll(1)">全部不选</a-button>
						</a-space>
						<a-form ref="formRef" :model="formState" :rules="rules">
							<a-form-item name="menuList">
								<div class="tree-box">
									<a-tree v-model:expandedKeys="state.expandedKeys"
										v-model:checkedKeys="formState.menuList" checkable :tree-data="state.treeData"
										:fieldNames="{ children: 'children', title: 'menuName', key: 'id', value: 'id' }"
										@check="onCheck">
									</a-tree>
								</div>
							</a-form-item>
						</a-form>
					</a-spin>
				</a-tab-pane>
				<a-tab-pane key="2" tab="数据授权" force-render>
					<a-form ref="formRefData" :model="formData" layout="inline" class="mb15">
						<a-form-item label="权限范围" name="dataValue">
							<a-select v-model:value="formData.dataValue" style="width: 200px" placeholder="请选择权限范围">
								<a-select-option v-for="item in state.optionsFinal" :disabled="item.disabled" :key="item.type" :value="item.type">{{ item.value }}</a-select-option>
							</a-select>
						</a-form-item>
					</a-form>
					<a-spin :spinning="state.loading" v-if="formData.dataValue == 1">
						<a-space class="mb15">
							<a-button type="default" size="min" @click="getAllData(0)">全部选择</a-button>
							<a-button type="default" size="min" @click="getAllData(1)">全部不选</a-button>
						</a-space>
						<a-form ref="formRefData" :model="formData" :rules="rules"> 
							<a-form-item name="dataList">
								<div class="tree-box">
									<a-tree v-model:expandedKeys="state.expandedKeysData"
										v-model:checkedKeys="formData.dataList" checkable :tree-data="state.data"
										:fieldNames="{ children: 'children', title: 'organName', key: 'organNo', value: 'organNo' }"
										@check="onDataCheck">
									</a-tree>
								</div>
							</a-form-item>
						</a-form>
					</a-spin>
				</a-tab-pane>
			</a-tabs>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { authorize, dataAuthorize, getauth } from '@/api/role'
import { menuTree } from '@/api/menu'
import {treeList} from '@/api/dept'
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
	options: {
		type: Array,
	},
})
const activeKey = ref('1');
const formRef = ref();
const formRefData = ref();
const formState = reactive({
	id: '',
	menuList: [],
})
const formData = reactive({
	dataValue: 0,
	dataList:[],  //menulist
})
const state = reactive({
	loading: false,
	expandedKeys: ['0'],
	selectedKeys: [],
	checkedKeys: [],
	treeData: [],
	options: [],
	optionsAll:[
		{
			type: 0,
			value: '全部数据权限'
		},
		{
			type: 1,
			value: '自定数据权限'
		},
		{
			type: 2,
			value: '本机构及以下数据权限'
		},
		{
			type: 3,
			value: '本机构数据权限'
		}
	],
	optionsFinal:[],
	checkedKeysData:[], // checkedKeys
	data:[],  //treeData
	expandedKeysData:[], // expandedKeys
	dataUpload:[], // 数据授权上传内容
})
const rules = {
	menuList: [
		{
			required: true,
			message: '请选择菜单',
			trigger: 'change',
		},
	],
	dataList: [
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
		getData()
		formData.dataValue = props.row.rangeScope
		state.options = props.options
		state.optionsFinal = handleOptions(state.optionsAll,state.options)
		console.log(state.optionsFinal,2222222222);
		
	}
})
// 处理数据授权数据
const handleOptions = (arrAll,arr) => {
	const typeInArr = new Set(arr.map(item => item.type))
	console.log(typeInArr,2222, new Set(arr.map(item => item.type)));
	
	return arrAll.map(item1 => {
		if(!typeInArr.has(item1.type)) {
			return {...item1,disabled:true}
		}
		return item1
	})
}
//表单重置
const resetForm = () => {
	formRef.value.resetFields();
}
// 菜单授权
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
		state.checkedKeys = []
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
	menuTree({auth:'asdfgh'}).then((res: any) => {
		if (res.code == '0') {
			state.treeData = res.data || []
			state.loading = false
			if (state.treeData.length > 0) {
				getAuth()
			}
		}
	})
}

// 数据授权
const getData = () => {
	state.data = []
	state.loading = true
	let params = {}
	treeList(params).then((res) => {
		if (res.code == '0') {
			state.data = res.data || []
			state.loading = false
			console.log("===state.treeData===", state.data);
			
			if (state.data.length > 0) {
				getDataAuth()
			}
		}
	})
}
const getDataAuth = () => {
	getauth({ id: props.row.id }).then((res: any) => {
		if (res.code == '0') {
			formData.dataList = resolveAllDataEunuchNodeId(state.data, res.data.organList, [])
			state.checkedKeysData = resolveAllDataEunuchNodeId(state.data, res.data.organList, [])
			state.dataUpload = []
			for(let i in res.data.organList) {
				let item = {
					organNo:res.data.organList[i],
					fullOrganNo:res.data.fullOrganList[i],
				}
				state.dataUpload.push(item)
			}
			console.log(state.dataUpload,22222222222);
			
		}
	})
}
const resolveAllDataEunuchNodeId = (json: any[], idArr: any[], temp: any[] = []) => {
	for (const item of json) {
		if (item.children && item.children.length !== 0) {
			resolveAllDataEunuchNodeId(item.children, idArr, temp);
		} else {
			temp.push(...idArr.filter((organNo) => (organNo) => organNo === item.organNo));
		}
	}
	return temp;
}
const getAllData = (e) => {
	if (e === 0) {
		state.dataUpload = []
		state.checkedKeysData = []
		formData.dataList = []
		getAllDataNode(state.data)
		console.log(state.dataUpload,state.checkedKeysData,33333333);
	} else {
		state.checkedKeysData = []
		formData.dataList = []
	}
}
const getAllDataNode = (nodes) => {
	if (!nodes || nodes.length === 0) {
		return []
	}
	nodes.forEach(node => {
		const item = {
			organNo:node.organNo,
			fullOrganNo:node.fullOrganNo,
		}
		state.dataUpload.push(item)
		state.checkedKeysData.push(node.organNo)
		formData.dataList.push(node.organNo)
		return getAllDataNode(node.children)
	})
}
const onDataCheck = (checkedKeysValue, e) => {
	console.log('onCheck', checkedKeysValue);
	console.log('e.halfCheckedKeys :>> ', e);
	formData.dataList = checkedKeysValue
	state.checkedKeysData = [...checkedKeysValue, ...e.halfCheckedKeys]
	state.dataUpload = []
	for(let i in e.checkedNodes) {
		let item = {
			organNo:e.checkedNodes[i].organNo,
			fullOrganNo:e.checkedNodes[i].fullOrganNo,
		}
		state.dataUpload.push(item)
	}
	
}

//确定按钮的回调
const handleOk = () => {
		formRef.value.validate().then(() => {
			if(formData.dataValue!=null) {
				let params = {
					roleId: formState.id,
					menuList: state.checkedKeys,
				}
				authorize(params).then((res:any) => {
					if (res.code == '0') {
						message.success('操作成功')
						resetForm()
					}
				})

				let paramRole = {
					"roleId": formState.id,
					"rangeType": formData.dataValue,
					"organList": state.dataUpload
				}
				dataAuthorize(paramRole).then((res:any) => {
					if (res.code == '0') {
						message.success('操作成功')
						emit('update:modelValue', false)
						emit('refresh')
						resetForm()
					}
				})
			}else{
				console.log(formData.dataValue);
				
				message.error('请选择数据授权范围')
			}
		}).catch(error => {
			message.error('请选择菜单授权范围')
		});
	
}
const cancel = () => {
	emit('update:modelValue', false)
	resetForm()
	formData.dataList = []

}
</script>
<style lang="less" scoped>
.tree-box {
	height: 155px;
	overflow: auto;
}
</style>
