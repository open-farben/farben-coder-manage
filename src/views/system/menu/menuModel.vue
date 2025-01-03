<template>
	<div>
		<a-modal centered :destroyOnClose="true" v-model:open="modalVisible" :title="formState.id!='' ? '编辑' : '新增'" @ok="handleOk" @cancel="cancel" :width="650">
			<a-spin :spinning="state.loading">
                <a-form class="menuform" ref="formRef" :model="formState" :rules="rules" :label-col="{span: 8}" :wrapper-col="{span: 16}">
                    <a-row>
                        <a-col :span="24">
                            <a-form-item label="上级菜单" name="parentId" :label-col="{span: 4}" :wrapper-col="{span: 20}">
                                <a-tree-select
                                    v-model:value="formState.parentId"
                                    checkable
                                    style="width: 100%"
                                    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                                    :tree-data="state.treeData"
                                    placeholder="请选择上级菜单"
                                    :fieldNames="{children:'children', label:'menuName', key:'id', value: 'id' }"
                                    tree-default-expand-all
                                >
                                </a-tree-select>
                            </a-form-item>
                        </a-col>
                        <a-col :span="24">
                            <a-form-item label="菜单类型" name="menuType" :label-col="{span: 4}" :wrapper-col="{span: 20}">
                                <a-radio-group v-model:value="formState.menuType" :options="state.typeList"></a-radio-group>
                            </a-form-item>
                        </a-col>
                        <a-col :span="24" v-if="formState.menuType != 'F'">
                            <a-form-item label="菜单图标" name="icon" :label-col="{span: 4}" :wrapper-col="{span: 20}">
                                <SelectIcon v-model="formState.icon"/>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item label="菜单名称" name="menuName">
                                <a-input v-model:value="formState.menuName" placeholder="请输入菜单名称" :maxlength="200"/>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item label="显示排序" name="orderNum">
                                <a-input-number type="number" v-model:value="formState.orderNum" placeholder="请输入排序" class="w100" />
                            </a-form-item>
                        </a-col>
                        <a-col :span="12" v-if="formState.menuType == 'F'">
                            <a-form-item name="blank">
                                <template #label>
                                    <a-tooltip title="选择是外链则路由地址需要以`http(s)://`开头">
                                        <QuestionCircleFilled style="color:#999;margin-right:5px;"/>
                                    </a-tooltip>
                                    <span>是否外链</span>
                                </template>
                                <a-radio-group v-model:value="formState.blank" :options="state.blankList"></a-radio-group>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12" v-if="formState.menuType != 'F'">
                            <a-form-item name="path">
                                <template #label>
                                    <a-tooltip title="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头">
                                        <QuestionCircleFilled style="color:#999;margin-right:5px;"/>
                                    </a-tooltip>
                                    <span>路由地址</span>
                                </template>
                                <a-input v-model:value="formState.path" placeholder="请输入路由地址" allow-clear :maxlength="200"/>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12" v-if="formState.menuType != 'M'">
                            <a-form-item name="component">
                                <template #label>
                                    <a-tooltip title="访问的组件路径，如：`system/user/index`，默认在`views`目录下">
                                        <QuestionCircleFilled style="color:#999;margin-right:5px;"/>
                                    </a-tooltip>
                                    <span>组件路径</span>
                                </template>
                                <a-input v-model:value="formState.component" placeholder="请输入组件路径" allow-clear :maxlength="200"/>
                            </a-form-item>
                        </a-col>
                        <!-- <a-col :span="12" v-if="formState.menuType != 'M'">
                            <a-form-item name="permission">
                                <template #label>
                                    <a-tooltip title="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)">
                                        <QuestionCircleFilled style="color:#999;margin-right:5px;"/>
                                    </a-tooltip>
                                    <span>权限字符</span>
                                </template>
                                <a-input v-model:value="formState.permission" placeholder="请输入权限字符" allow-clear />
                            </a-form-item>
                        </a-col> -->
                        <a-col :span="12" v-if="formState.menuType == 'C'">
                            <a-form-item name="query">
                                <template #label>
                                    <a-tooltip title="访问路由的默认传递参数，如：`{id: 1, name: ry}`">
                                        <QuestionCircleFilled style="color:#999;margin-right:5px;"/>
                                    </a-tooltip>
                                    <span>路由参数</span>
                                </template>
                                <a-input v-model:value="formState.query" placeholder="请输入路由参数" allow-clear />
                            </a-form-item>
                        </a-col>
                        <!-- <a-col :span="12" v-if="formState.menuType == 'C'">
                            <a-form-item name="keepAlive">
                                <template #label>
                                    <a-tooltip title="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致">
                                        <QuestionCircleFilled style="color:#999;margin-right:5px;"/>
                                    </a-tooltip>
                                    <span>是否缓存</span>
                                </template>
                                <a-radio-group v-model:value="formState.keepAlive" :options="state.blankList"></a-radio-group>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12" v-if="formState.menuType != 'M'">
                            <a-form-item name="hidden">
                                <template #label>
                                    <a-tooltip title="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问">
                                        <QuestionCircleFilled style="color:#999;margin-right:5px;"/>
                                    </a-tooltip>
                                    <span>显示状态</span>
                                </template>
                                <a-radio-group v-model:value="formState.hidden" :options="state.hiddenList"></a-radio-group>
                            </a-form-item>
                        </a-col> -->
                        <a-col :span="12">
                            <a-form-item name="status">
                                <template #label>
                                    <a-tooltip title="选择停用则路由将不会出现在侧边栏，也不能被访问">
                                        <QuestionCircleFilled style="color:#999;margin-right:5px;"/>
                                    </a-tooltip>
                                    <span>菜单状态</span>
                                </template>
                                <a-radio-group v-model:value="formState.status" :options="state.statuList"></a-radio-group>
                            </a-form-item>
                        </a-col>
                    </a-row>
                </a-form>
            </a-spin>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
    import SelectIcon from '@/components/Icon/selecticon.vue';
	import { defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
    import { message } from 'ant-design-vue'
    import {menuTree, listAdd, listEdit} from '@/api/menu'
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
		parentId: '0',
        menuType: 'M',
        icon: '',
        menuName: '',
        orderNum: '',
        blank: 1,
        path: '',
        component: '',
        permission: '',
        query: '',
        keepAlive: 1,
		hidden: 0,
		status: 0,
	})

	const state = reactive({
        loading: false,
        showIcon: false,
        typeList: [
			{
				value: 'M',
				label: '目录',
			}, 
			{
				value: 'C',
				label: '菜单',
			}, 
            // {
			// 	value: 'F',
			// 	label: '按钮',
			// }, 
		],
        
		blankList: [
			{
				value: 0,
				label: '是',
			}, 
			{
				value: 1,
				label: '否',
			}, 
		],
        hiddenList: [
			{
				value: 0,
				label: '显示',
			}, 
			{
				value: 1,
				label: '隐藏',
			}, 
		],
        statuList: [
			{
				value: 0,
				label: '正常',
			}, 
			{
				value: 1,
				label: '停用',
			}, 
		],
        expandedKeys: ['0'],
	    selectedKeys: [],
	    checkedKeys: [],

        treeData: [],
	})

	const rules = {
		menuName: [
			{
				required: true,
				message: '请输入菜单名称',
				trigger: 'blur',
			},
		],
		orderNum: [
			{
				required: true,
				message: '请输入排序',
				trigger: 'blur',
			},
		],
		path: [
			{
				required: true,
				message: '请输入菜单地址',
				trigger: 'blur',
			}, 
		],
	}

	watch(() => props.modelValue,() => {
		if (props.modelValue) {
			Object.assign(formState , props.row)
            getTree()
		}
	})
	//表单重置
	const resetForm = () => {
		formRef.value.resetFields();
	}
	const emit = defineEmits(['update:modelValue', 'refresh']);
	const modalVisible = computed({
		get: () => props.modelValue,
		set: v => emit('update:modelValue', v),
	})
    const getTree = () => {
        state.treeData = []
        state.loading = true
        menuTree({type: 'M'}).then((res:any) => {
			if(res.code == '0'){
                const menu = { id: '0', menuName: '主类目', children: [] };
                menu.children = res.data;
                state.treeData.push(menu)
                state.loading = false
			}
		})
    }
	//确定按钮的回调
	const handleOk = () => {
		formRef.value.validate().then(() => {
            console.log('values', formState);
            if(props.row.id){
				listEdit(formState).then((res) => {
					if(res.code == '0'){
						message.success('修改成功')
						emit('update:modelValue', false)
						emit('refresh')
						resetForm()
					}
				})
			}else{
				listAdd(formState).then((res) => {
                    if(res.code == '0'){
                        message.success('添加成功')
                        emit('update:modelValue', false)
                        emit('refresh')
                        resetForm()
                    }
                })
			}
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
.tree-box{height:155px;padding: 10px 11px;border-radius: 2px;border: 1px solid #d9d9d9;overflow: auto;}
::v-deep(.icon-box .ant-popover-inner){border: 1px solid #d9d9d9;}
::v-deep(.icon-box .ant-popover){width: 508px;padding: 0;}
::v-deep(.icon-box .ant-popover .ant-popover-arrow){height: 0;}
::v-deep(.ant-popover .ant-popover-arrow::before){height: 0;}
</style>