<template>
  <div >
    <a-modal centered v-model:open="modalVisible" title="授权" @ok="handleOk" @cancel="cancel" :width="800" >
      <div style="height: 400px;overflow-Y: auto;">
        <a-transfer v-model:target-keys="targetKeys" class="tree-transfer" :data-source="dataSource"
          :render="item => item.title" :show-select-all="false">
          <template #children="{ direction, selectedKeys, onItemSelect }">
            <a-tree block-node checkable default-expand-all v-if="direction === 'left'"
              :checked-keys="[...selectedKeys, ...targetKeys]"
              :tree-data="treeData"
              @select="(_, props) => { onChecked(props, [...selectedKeys, ...targetKeys], onItemSelect) }"
              @check="(_, props) => { onChecked(props, [...selectedKeys, ...targetKeys], onItemSelect) }" />
            <a-tree block-node checkable default-expand-all v-if="targetKeys.length && direction === 'right'"
              :checked-keys="[...selectedKeys]"
              :tree-data="selectTreeData"
              @select="(_, props) => { onChecked(props, [...selectedKeys], onItemSelect) }"
              @check="(_, props) => { onChecked(props, [...selectedKeys], onItemSelect) }" />
          </template>
        </a-transfer>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { BuildTree } from '@far/utils/tree';
import { message, type TransferProps, type TreeProps } from 'ant-design-vue';
import { defineProps, defineEmits, computed, ref, watch } from 'vue';
import { useOrganizeStore } from "@/store/modules/organize.pinia"

const organizeStore = useOrganizeStore();
const props = defineProps({
  row: {
    type: Object,
  },
  modelValue: {
    type: Boolean,
  },
  sourceTreeData: {
    type: Array<any>
  },
  selectTreeKeys: {
    type: Array<any>
  }
});

watch(() => props.modelValue, () => {
  if (props.sourceTreeData) {
    transferDataSource?.splice(0, transferDataSource.length)
    // 穿梭框的数据原是组件，这里是将树状数据转换为数组
    flatten(JSON.parse(JSON.stringify(props.sourceTreeData)));
  }

  if (props.selectTreeKeys) {
    targetKeys.value = props.selectTreeKeys;
    
  }
})
const emit = defineEmits(['update:modelValue', 'refresh']);
const modalVisible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})
// 确定按钮的回调
const handleOk = () => {
  // 处理脏数据
  const saveKeys = targetKeys.value.filter( str => transferDataSource?.some( item => item.key === str ));
  if(saveKeys.length === 0) {
    message.error('请选择用户');
  }else{
    organizeStore.saveWorkGroup({ userIds: JSON.stringify(saveKeys) }).then(
      res => {
        if (res) {
          transferDataSource?.splice(0, transferDataSource.length)
          emit('update:modelValue', false)
          emit('refresh')
        }
      }
    )
  }
  
}

const cancel = () => {
  transferDataSource?.splice(0, transferDataSource.length)
  emit('update:modelValue', false)
  emit('refresh')
}
// 扁平化数据
const transferDataSource: TransferProps['dataSource'] = [];
function flatten(list: TransferProps['dataSource'] = []) {
  list.forEach(item => {
    transferDataSource.push(item);
    flatten(item.children);
  });
  
}

function isChecked(selectedKeys: (string | number)[], eventKey: string | number) {
  return selectedKeys.indexOf(eventKey) !== -1;
}

// 组装左侧树 给树数据增加disabled属性 选中后对应这边就无法选中
function handleTreeData(treeNodes: TransferProps['dataSource'], targetKeys: string[] = []) {
  return treeNodes.map(({ children, ...props }) => ({
    ...props,
    // 有子的父级不可以操作 已经被选中的不能在左侧操作 没权限的不能操作
    disabled: !!children.length || targetKeys.includes(props.key as string) || props.readonly || !!props.origin.organNo,
    children: handleTreeData(children ?? [], targetKeys),
  }));
}

// 组装右侧树 使用选中的key
function handleSelectedTreeData(targetKeys: string[] = []) {
  const nodeMap = {};
  // 通过key筛选出节点与对应的父级节点，用于构造新树
  transferDataSource?.forEach(item => {
    if (!item.key) return;
    const pushParent = (item) => {
      // 关于对应的父节点也放入map中
      if (item.parentId) {
        const parentNode = transferDataSource.find( node => node.key === item.parentId);
        if (parentNode && parentNode.key) {
          delete parentNode.children
          // 禁用父级，使其无法交互
          parentNode.disabled = true;
          nodeMap[parentNode.key] = parentNode;
          pushParent(parentNode);
        }
      }
    }
    if (targetKeys.includes(item.key)) {
      // 存在于targeKey中的ID时，将当前node放入map
      nodeMap[item.key] = { ...item, disabled: item.origin.readonly };
      pushParent(item);
    }
  });
  return BuildTree(Object.values(nodeMap), 'key');
}

const targetKeys = ref<string[]>([]);

const dataSource = ref(transferDataSource);

const selectTreeData = computed(() => {
  return handleSelectedTreeData(targetKeys.value);
});

const treeData = computed(() => {
  return handleTreeData(props.sourceTreeData, targetKeys.value);
});

const onChecked = (
  e: Parameters<TreeProps['onCheck']>[1] | Parameters<TreeProps['onSelect']>[1],
  checkedKeys: string[],
  onItemSelect: (n: any, c: boolean) => void,
) => {
  const { eventKey } = e.node;
  onItemSelect(eventKey, !isChecked(checkedKeys, eventKey));
};
</script>