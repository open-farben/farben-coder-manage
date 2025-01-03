<template>
	<div>
		<a-modal centered v-model:open="modalVisible" :title="formState.accout!='' ? '编辑' : '新增'" @ok="handleOk" @cancel="cancel" :width="500">
			<a-form ref="formRef" :model="formState" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
				<a-form-item label="角色名称" name="roleName">
					<a-input v-model:value="formState.roleName" placeholder="请输入角色名称" />
				</a-form-item>
				<a-form-item label="权限字符" name="roleKey">
					<a-input v-model:value="formState.roleKey" placeholder="请输入权限字符" />
				</a-form-item>
				<a-form-item label="状态" name="status">
					<a-select v-model:value="formState.status" placeholder="请选择状态">
						<a-select-option value="shanghai">Zone one</a-select-option>
						<a-select-option value="beijing">Zone two</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="菜单权限">
					<div class="tree-box">
						<a-tree
							v-model:expandedKeys="expandedKeys"
							v-model:selectedKeys="selectedKeys"
							v-model:checkedKeys="checkedKeys"
							checkable
							:tree-data="treeData"
							:field-names="fieldNames"
						>
						</a-tree>
					</div>
      			</a-form-item>
				<a-form-item label="备注" name="remark">
					<a-textarea v-model:value="formState.remark" placeholder="请输入备注" allow-clear />
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script setup>
	import { defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';
	const props = defineProps({
		row: {
			type: Object,
		},
		modelValue: {
			type: Boolean,
		},
	})
	const formRef = ref();
	const labelCol = {
		span: 4,
	}
	const wrapperCol = {
		span: 20,
	}
	const formState = reactive({
		roleName: '',
		roleKey: '',
		status: 0,
		remark: '',
	})

	const expandedKeys = ref(['100', '102']);
	const selectedKeys = ref(['100', '102']);
	const checkedKeys = ref(['100', '102']);

	const treeData = ref([
        {
            "id": 1,
            "label": "系统管理",
            "children": [
                {
                    "id": 100,
                    "label": "用户管理",
                    "children": [
                        {
                            "id": 1000,
                            "label": "用户查询"
                        },
                        {
                            "id": 1001,
                            "label": "用户新增"
                        },
                        {
                            "id": 1002,
                            "label": "用户修改"
                        },
                        {
                            "id": 1003,
                            "label": "用户删除"
                        },
                        {
                            "id": 1004,
                            "label": "用户导出"
                        },
                        {
                            "id": 1005,
                            "label": "用户导入"
                        },
                        {
                            "id": 1006,
                            "label": "重置密码"
                        }
                    ]
                },
                {
                    "id": 101,
                    "label": "角色管理",
                    "children": [
                        {
                            "id": 1007,
                            "label": "角色查询"
                        },
                        {
                            "id": 1008,
                            "label": "角色新增"
                        },
                        {
                            "id": 1009,
                            "label": "角色修改"
                        },
                        {
                            "id": 1010,
                            "label": "角色删除"
                        },
                        {
                            "id": 1011,
                            "label": "角色导出"
                        }
                    ]
                },
                {
                    "id": 102,
                    "label": "菜单管理",
                    "children": [
                        {
                            "id": 1012,
                            "label": "菜单查询"
                        },
                        {
                            "id": 1013,
                            "label": "菜单新增"
                        },
                        {
                            "id": 1014,
                            "label": "菜单修改"
                        },
                        {
                            "id": 1015,
                            "label": "菜单删除"
                        }
                    ]
                },
                {
                    "id": 103,
                    "label": "部门管理",
                    "children": [
                        {
                            "id": 1016,
                            "label": "部门查询"
                        },
                        {
                            "id": 1017,
                            "label": "部门新增"
                        },
                        {
                            "id": 1018,
                            "label": "部门修改"
                        },
                        {
                            "id": 1019,
                            "label": "部门删除"
                        }
                    ]
                },
                {
                    "id": 104,
                    "label": "岗位管理",
                    "children": [
                        {
                            "id": 1020,
                            "label": "岗位查询"
                        },
                        {
                            "id": 1021,
                            "label": "岗位新增"
                        },
                        {
                            "id": 1022,
                            "label": "岗位修改"
                        },
                        {
                            "id": 1023,
                            "label": "岗位删除"
                        },
                        {
                            "id": 1024,
                            "label": "岗位导出"
                        }
                    ]
                },
                {
                    "id": 105,
                    "label": "字典管理",
                    "children": [
                        {
                            "id": 1025,
                            "label": "字典查询"
                        },
                        {
                            "id": 1026,
                            "label": "字典新增"
                        },
                        {
                            "id": 1027,
                            "label": "字典修改"
                        },
                        {
                            "id": 1028,
                            "label": "字典删除"
                        },
                        {
                            "id": 1029,
                            "label": "字典导出"
                        }
                    ]
                },
                {
                    "id": 106,
                    "label": "参数设置",
                    "children": [
                        {
                            "id": 1030,
                            "label": "参数查询"
                        },
                        {
                            "id": 1031,
                            "label": "参数新增"
                        },
                        {
                            "id": 1032,
                            "label": "参数修改"
                        },
                        {
                            "id": 1033,
                            "label": "参数删除"
                        },
                        {
                            "id": 1034,
                            "label": "参数导出"
                        }
                    ]
                },
                {
                    "id": 107,
                    "label": "通知公告",
                    "children": [
                        {
                            "id": 1035,
                            "label": "公告查询"
                        },
                        {
                            "id": 1036,
                            "label": "公告新增"
                        },
                        {
                            "id": 1037,
                            "label": "公告修改"
                        },
                        {
                            "id": 1038,
                            "label": "公告删除"
                        }
                    ]
                },
                {
                    "id": 108,
                    "label": "日志管理",
                    "children": [
                        {
                            "id": 500,
                            "label": "操作日志",
                            "children": [
                                {
                                    "id": 1039,
                                    "label": "操作查询"
                                },
                                {
                                    "id": 1040,
                                    "label": "操作删除"
                                },
                                {
                                    "id": 1041,
                                    "label": "日志导出"
                                }
                            ]
                        },
                        {
                            "id": 501,
                            "label": "登录日志",
                            "children": [
                                {
                                    "id": 1042,
                                    "label": "登录查询"
                                },
                                {
                                    "id": 1043,
                                    "label": "登录删除"
                                },
                                {
                                    "id": 1044,
                                    "label": "日志导出"
                                },
                                {
                                    "id": 1045,
                                    "label": "账户解锁"
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "id": 2,
            "label": "系统监控",
            "children": [
                {
                    "id": 109,
                    "label": "在线用户",
                    "children": [
                        {
                            "id": 1046,
                            "label": "在线查询"
                        },
                        {
                            "id": 1047,
                            "label": "批量强退"
                        },
                        {
                            "id": 1048,
                            "label": "单条强退"
                        }
                    ]
                },
                {
                    "id": 110,
                    "label": "定时任务",
                    "children": [
                        {
                            "id": 1049,
                            "label": "任务查询"
                        },
                        {
                            "id": 1050,
                            "label": "任务新增"
                        },
                        {
                            "id": 1051,
                            "label": "任务修改"
                        },
                        {
                            "id": 1052,
                            "label": "任务删除"
                        },
                        {
                            "id": 1053,
                            "label": "状态修改"
                        },
                        {
                            "id": 1054,
                            "label": "任务导出"
                        }
                    ]
                },
                {
                    "id": 111,
                    "label": "数据监控"
                },
                {
                    "id": 112,
                    "label": "服务监控"
                },
                {
                    "id": 113,
                    "label": "缓存监控"
                },
                {
                    "id": 114,
                    "label": "缓存列表"
                }
            ]
        },
        {
            "id": 3,
            "label": "系统工具",
            "children": [
                {
                    "id": 115,
                    "label": "表单构建"
                },
                {
                    "id": 116,
                    "label": "代码生成",
                    "children": [
                        {
                            "id": 1055,
                            "label": "生成查询"
                        },
                        {
                            "id": 1056,
                            "label": "生成修改"
                        },
                        {
                            "id": 1057,
                            "label": "生成删除"
                        },
                        {
                            "id": 1058,
                            "label": "导入代码"
                        },
                        {
                            "id": 1059,
                            "label": "预览代码"
                        },
                        {
                            "id": 1060,
                            "label": "生成代码"
                        }
                    ]
                },
                {
                    "id": 117,
                    "label": "系统接口"
                }
            ]
        },
        {
            "id": 4,
            "label": "若依官网"
        }
    ])
	const fieldNames = reactive({
        children: 'children',
        title: 'label',
        key: 'id'
    })

	const rules = {
		roleName: [
			{
				required: true,
				message: '请输入角色名称',
				trigger: 'blur',
			},
		],
		roleKey: [
			{
				required: true,
				message: '请输入权限字符',
				trigger: 'blur',
			},
		],
		status: [
			{
				required: true,
				message: '请选择状态',
				trigger: 'change',
			}, 
		],
		remark: [
			{
				required: true,
				message: '请输入备注',
				trigger: 'change',
			},
		],
	}

	watch(() => props.modelValue,() => {
		if (props.modelValue) {
			Object.assign(formState , props.row)
		}
	})
	//选中树
	const onCheck = (checkedKeys, info) => {
        let currentCheckedKeys = []
        if (menuCheckedKeys.checked) {
          currentCheckedKeys = currentCheckedKeys.concat(menuCheckedKeys.checked)
        }
        if (menuCheckedKeys.halfChecked) {
          currentCheckedKeys = currentCheckedKeys.concat(menuCheckedKeys.halfChecked)
        }
        menuCheckedKeys = currentCheckedKeys

    }
	//表单重置
	const resetForm = () => {
		formRef.value.resetFields();
	}
	const emit = defineEmits(['update:modelValue', 'refresh']);
	const modalVisible = computed({
		get: () => props.modelValue,
		set: v => emit('update:modelValue', v),
	})
	//确定按钮的回调
	const handleOk = () => {
		formRef.value.validate().then(() => {
			console.log('values', formState, toRaw(formState));
			console.log('%c Line:21 🧀', 'color:#6ec1c2');
			emit('update:modelValue', false)
			emit('refresh')
			resetForm()
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
</style>