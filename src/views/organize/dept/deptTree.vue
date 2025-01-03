<template>
	<div>
		<a-input style="margin-bottom: 8px" placeholder="请输入机构名" @change="onSearch" allowClear>
			<template #suffix>
				<search-outlined style="color: rgba(0, 0, 0, 0.45)" />
			</template>
		</a-input>
		<a-tree :blockNode="true" v-model="state.checkedKeys" :treeData="props.deptOptions" :selectedKeys="state.selectedKeys" :expandedKeys="state.expandedKeys" @expand="onExpand"
		 :autoExpandParent="state.autoExpandParent" :fieldNames="state.replaceFields" @select="handleNode">
			<template #title="item">
				<div class="flex-1 mr10">
					<a-tooltip placement="right">
						<template #title>
							<span>{{item.organName}}</span>
						</template>
						<span class="tree-title" v-html="item.organName.replace(new RegExp(state.searchValue,'g'),'<span style=color:#2d75ff>'+ state.searchValue +'</span>')"></span>
					</a-tooltip>
				</div>
				<a-dropdown placement="bottomRight" v-if="item.parentOrganNo != 0">
					<ellipsis-outlined />
					<template #overlay>
						<a-menu>
							<a-menu-item @click="handleAction('add', item)"><plus-outlined style="color: rgba(0, 0, 0, 0.45)" /> 新增</a-menu-item>
							<a-menu-item @click="handleAction('edit', item)"><form-outlined style="color: rgba(0, 0, 0, 0.45)" /> 编辑</a-menu-item>
							<a-menu-item @click="handleAction('del', item)"><delete-outlined style="color: rgba(0, 0, 0, 0.45)" /> 删除</a-menu-item>
						</a-menu>
					</template>
				</a-dropdown>
			</template>
		</a-tree>
	</div>
</template>

<script setup>
	import { defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
	const props = defineProps({
		deptOptions: {
			type: Object,
		},
		selectedKeys: {
			type: Object,
		},
	});
	const state = reactive({
		replaceFields: { children: 'children', label: 'organName', key: 'id', value: 'id' },
		expandedKeys: props.selectedKeys || ['10011001001'],
		backupsExpandedKeys: [],
		autoExpandParent: false,
		checkedKeys: [],
		selectedKeys: props.selectedKeys || [],
		searchValue: '',
	});
	const emit = defineEmits(['select', 'action']);

	//搜呗
	const onSearch = (e) => {
		//添加这行代码是为了只点击搜索才触发
		state.searchValue = e.target.value;
		//如果搜索值为空，则不展开任何项，expandedKeys置为空
		//如果搜索值不位空，则expandedKeys的值要为搜索值的父亲及其所有祖先
		if (state.searchValue === '') {
			state.expandedKeys = [props.deptOptions[0].id] || [];
		} else {
			//首先将展开项与展开项副本置为空
			state.expandedKeys = [];
			state.backupsExpandedKeys = [];
			//获取所有存在searchValue的节点
			let candidateKeysList = getkeyList(state.searchValue, props.deptOptions, []);
			//遍历满足条件的所有节点
			candidateKeysList.map(
				item => {
					//获取每个节点的母亲节点
					var key = getParentKey(item, props.deptOptions);
					//当item是最高一级，父key为undefined，将不放入到数组中
					//如果母亲已存在于数组中，也不放入到数组中
					if (key && !state.backupsExpandedKeys.some(item => item === key))
						state.backupsExpandedKeys.push(key);
				}
			)
			let length = state.backupsExpandedKeys.length;
			for (let i = 0; i < length; i++) {
				getAllParentKey(state.backupsExpandedKeys[i], props.deptOptions)
			}
			state.expandedKeys = state.backupsExpandedKeys.slice();
		}
	}
	//获取节点中含有value的所有key集合
	const getkeyList = (value, tree, keyList) => {
		//遍历所有同一级的树
		for (let i = 0; i < tree.length; i++) {
			let node = tree[i];
			//如果该节点存在value值则push
			if (node.organName.indexOf(value) > -1) {
				keyList.push(node.id);
			}
			//如果拥有孩子继续遍历
			if (node.children) {
				getkeyList(value, node.children, keyList);
			}
		}
		//因为是引用类型，所有每次递归操作的都是同一个数组
		return keyList;
	}
	//该递归主要用于获取key的父亲节点的key值
	const getParentKey = (key, tree) => {
		let parentKey, temp;
		//遍历同级节点
		for (let i = 0; i < tree.length; i++) {
			const node = tree[i];
			if (node.children) {
				//如果该节点的孩子中存在该key值，则该节点就是我们要找的父亲节点
				//如果不存在，继续遍历其子节点
				if (node.children.some(item => item.id === key)) {
					parentKey = node.id;
				} else if (temp = getParentKey(key, node.children)) {
					//parentKey = this.getParentKey(key,node.children)
					//改进，避免二次遍历
					parentKey = temp;
				}
			}
		}
		return parentKey;
	}
	//获取该节点的所有祖先节点
	const getAllParentKey = (key, tree) => {
		var parentKey;
		if (key) {
			//获得父亲节点
			parentKey = getParentKey(key, tree);
			if (parentKey) {
				//如果父亲节点存在，判断是否已经存在于展开列表里，不存在就进行push
				if (!state.backupsExpandedKeys.some(item => item === parentKey)) {
					state.backupsExpandedKeys.push(parentKey);
				}
				//继续向上查找祖先节点
				getAllParentKey(parentKey, tree)
			}
		}
	}
	// 节点单击事件
	const handleNode = (selectedKeys, info) => {
		//keys, event
		//console.log('onSelect', info);
		state.selectedKeys = selectedKeys;
		//this.$emit('onSelect',this.selectedKeys, info)
		emit('select', state.selectedKeys, info)
	}
	//操作
	const handleAction = (type, e) => {
		emit('action', type, e)
	}
    const onExpand = (expandedKeys) => {
      	state.expandedKeys = expandedKeys
      	state.autoExpandParent = false
    }
</script>
<style lang="less" scoped>
::v-deep(.ant-tree .ant-tree-treenode){width: 100%;}
::v-deep(.ant-tree .ant-tree-node-content-wrapper){width: 100%;}
::v-deep(.ant-tree .ant-tree-title){width: 100%;display: flex;}
.tree-title{display: inline-block;width:100px;overflow:hidden;text-overflow: ellipsis;-webkit-line-clamp: 1;white-space: nowrap;}
</style>