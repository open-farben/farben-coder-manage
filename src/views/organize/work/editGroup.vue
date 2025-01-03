<template>
	<div>
		<a-modal centered v-model:open="modalVisible" :title="props.row.id && props.row.id != '' ? '编辑' : '新增'"
			@ok="handleOk" @cancel="cancel" :width="500">
			<a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
				<a-form-item label="工作组名称" name="groupName">
					<a-input v-model:value.trim="formState.groupName" placeholder="请输入工作组名称" />
				</a-form-item>
				<a-form-item label="所属机构" name="organization">
					<a-tree-select v-model:value="formState.organization"
						:dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" :dropdownMatchSelectWidth="false"
						:tree-data="props.treeData" placeholder="请选择机构"
						:field-names="{ children: 'children', label: 'organName', key: 'organNo', value: 'organNo' }"
						:treeDefaultExpandedKeys="[props.treeData[0].organNo]" @select="handleNode">
					</a-tree-select>
				</a-form-item>
				<a-form-item label="工作组描述" name="groupDiec">
					<a-textarea v-model:value="formState.groupDiec" placeholder="请输入工作组描述" />
				</a-form-item>
				<a-form-item label="期限" name="inUse">
					<a-radio-group v-model:value="formState.inUse" :options="state.statuList"></a-radio-group>
				</a-form-item>
				<a-form-item name="date" label="生效时间" v-bind="rangeConfig" v-if="formState.inUse == 1">
					<a-range-picker v-model:value="formState.date" format="YYYY-MM-DD" :placeholder="['开始时间', '结束时间']"
						@change="dateChange" />
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import dayjs from 'dayjs';
import { useOrganizeStore } from "@/store/modules/organize.pinia"
import { onMounted, defineProps, defineEmits, computed, reactive, ref, toRaw, watch } from 'vue';

const organizeStore = useOrganizeStore();
const props = defineProps({
	row: {
		type: Object,
	},
	treeData: {
		type: Object,
	},
	expandedKeys: {
		type: Object,
	},
	modelValue: {
		type: Boolean,
	},
});
const formRef = ref();
const formState = reactive({
	id: '',
	groupName: '',
	organization: undefined,
	groupDiec: '',
	effectiveDay: '',
	failureDay: '',
	inUse: 0,
	date: [],
});
const state = reactive({
	today: dayjs(),
	statuList: [
		{
			value: 0,
			label: '长期',
		},
		{
			value: 1,
			label: '有期限',
		},
	],
	roleList: [],
});
const rules = {
	groupName: [
		{ required: true, message: '请输入名称', trigger: 'blur' },
		// { min: 3, max: 18, message: '账号最小长度3位,最大长度18位' },
	],
	groupDiec: [
		{max:200,message:"请输入小于200字符"},
	],
	organization: [
		{ required: true, message: '请选择机构', trigger: 'blur' },
	],
	inUse: [
		{ required: true, message: '请选择期限', trigger: 'blur' },
	]
};
const rangeConfig = {
	rules: [{ type: 'array' as const, required: true, message: '请选择日期' }],
};
watch(() => props.modelValue, () => {
	if (props.modelValue) {
		let params = {
			id: props.row.id,
			groupName: props.row.groupName,
			organization: props.row.organNo,
			groupDiec: props.row.introduce,
			effectiveDay: props.row.effectiveDay,
			failureDay: props.row.failureDay,
			inUse: props.row.effectiveDay == null || props.row.effectiveDay == '' ? 0 : 1,
		}
		Object.assign(formState, params)
		console.log(params);
		console.log(formState.date, '66666666666');

		if (formState.id && formState.effectiveDay) {
			let effectiveDate = new Date(props.row.effectiveDay)
			let failureDate = new Date(props.row.failureDay)
			formState.date = [dayjs(effectiveDate), dayjs(failureDate)]
		}

	}
})

//时间选择
const dateChange = (value: any, dateString: any) => {
	formState.date = value
	formState.effectiveDay = dateString[0]
	formState.failureDay = dateString[1]
}
//选择树
const handleNode = (e, info) => {
	console.log("==info==", info)
	//formState.organizationName = info.organName
	formState.fullOrganization = info.fullOrganNo
}
//表单重置
const resetForm = () => {
	formRef.value.resetFields();
}
//选择角色
const handleChange = (val) => {
	if (val.length > 10) {
		val.pop();
		message.info('最多只能选10个角色')
	}
}
const emit = defineEmits(['update:modelValue', 'refresh']);
const modalVisible = computed({
	get: () => props.modelValue,
	set: v => emit('update:modelValue', v),
})
//确定按钮的回调
const handleOk = () => {
	console.log(new Date(formState.effectiveDay).toDateString()!==new Date(formState.failureDay).toDateString());
	
	if (new Date(formState.effectiveDay).toDateString()!==new Date(formState.failureDay).toDateString() && new Date(state.today).toDateString() <= new Date(formState.effectiveDay).toDateString() || formState.inUse == 0 ) {
		formRef.value.validate().then(() => {
			if (formState.id) {
				let params = {
					id: formState.id,
					groupName: formState.groupName,
					organNo: formState.organization,
					introduce: formState.groupDiec,
					effectiveDay: formState.inUse ==0? '' : formState.effectiveDay,
					failureDay: formState.inUse ==0? '' : formState.failureDay,
				}
				organizeStore.editGroup(params).then((res: any) => {
					if(res.code == 0) {
						message.success('保存成功')
						emit('update:modelValue', false)
						emit('refresh')
						resetForm()
					}
				})
			} else {
				let params = {
					groupName: formState.groupName,
					organNo: formState.organization,
					introduce: formState.groupDiec,
					effectiveDay: formState.effectiveDay,
					failureDay: formState.failureDay,
				}
				organizeStore.addGroup(params).then((res: any) => {
					console.log(res,2222222222);
					
					if(res.code == 0) {
						message.success('新增成功')
						emit('update:modelValue', false)
						emit('refresh')
						resetForm()
					}
				})
			}

		}).catch(error => {
			console.log('error', error);
		});
	}else{
		message.error('生效时间失效时间不能小于等于当前时间')
	}

}
const cancel = () => {
	emit('update:modelValue', false)
	resetForm()
}
onMounted(() => {

})
</script>