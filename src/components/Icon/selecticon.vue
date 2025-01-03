<template>
	<div class="icon-box relative">
		<a-popover trigger="click" placement="bottom" :get-popup-container="getPopupContainer">
			<template #content>
				<a-tabs :tab-bar-style="{ marginBottom: '10px', padding: '0' }">
					<a-tab-pane key="1" tab="线框风格">
						<div class="icon-list">
							<a-row>
								<a-col :span="2" v-for="item in list" :key="item" class="icon-item" :class="{ active: item == modalVisible }" @click="handleClick(item)">
									<component :is="$antIcons[item]"/>
								</a-col>
							</a-row>
						</div>
					</a-tab-pane>
					<a-tab-pane key="2" tab="实底风格">
						<div class="icon-list">
							<a-row>
								<a-col :span="2" v-for="item in listSolid" :key="item" class="icon-item" :class="{ active: item == modalVisible }" @click="handleClick(item)">
									<component :is="$antIcons[item]"/>
								</a-col>
							</a-row>
						</div>
					</a-tab-pane>
				</a-tabs>
			</template>
			<a-input v-model:value="modalVisible" placeholder="请选择菜单图标" autocomplete="off">
				<template #prefix>
					<component :is="$antIcons[modalVisible]"/>
				</template>
			</a-input>
		</a-popover>
	</div>
</template>
<script lang="ts" setup name="selectIcon">
	import { computed, reactive, ref } from 'vue'
	import {list, listSolid} from '@/utils/icons'
	const props = defineProps({
		modelValue: {
			type: String,
		},
	})
	const getPopupContainer = () => document.querySelector('.icon-box') as HTMLElement
	const emit = defineEmits(['update:modelValue']);
	const modalVisible = computed({
		get: () => props.modelValue,
		set: v => emit('update:modelValue', v),
	})

	//选中图标
	const handleClick = (icon)=>{
      	emit('update:modelValue',icon)
    }

</script>

<style lang="less" scoped>
@import '@/style/index.less';
.icon-list{height: 200px;overflow: auto;}
.icon-list .anticon{font-size: 20px;}
.icon-item{text-align: center;cursor: pointer;}
.icon-item:hover{color: @primary-color;}
.icon-item.active{color: @primary-color;}
::v-deep(.ant-tabs-tab){padding: 0 0 12px;}
</style>