<template>
	<div class="ant-pro-multi-tab">
		<div class="ant-pro-multi-tab-wrapper">
			<a-tabs hideAdd type="editable-card" v-model:activeKey="state.activeKey"
				:tabBarStyle="{ margin: 0, paddingLeft: '16px', paddingTop: '1px' }" @edit="onEdit">
				<a-tab-pane v-for="page in state.pages" :key="page.fullPath" :closable="state.pages.length > 1" style="height: 0">
					<template #tab>
						<a-dropdown :trigger="['contextmenu']">
							<span :style="{ userSelect: 'none' }">{{ page.meta.title }}</span>
							<template #overlay>
								<a-menu @click="({ key, item, domEvent }) => {
                  closeMenuClick(key, page.fullPath);
                }">
									<a-menu-item key="closeSelf">关闭当前页</a-menu-item>
									<a-menu-item key="closeRight">关闭右侧</a-menu-item>
									<a-menu-item key="closeLeft">关闭左侧</a-menu-item>
									<a-menu-item key="closeAll">关闭所有</a-menu-item>
								</a-menu>
							</template>
						</a-dropdown>
					</template>
				</a-tab-pane>
			</a-tabs>
		</div>
	</div>
</template>
<script lang="ts" setup name="MultiTab">
	import { ref, reactive, watch, getCurrentInstance } from 'vue'
	import { useRouter, RouteLocationNormalizedLoaded } from 'vue-router'
	import events from '@/utils/eventBus'
	import { message } from 'ant-design-vue'
	import { useStore } from 'vuex'
	import './index.less'

	const state = reactive({
		fullPathList: [],
		pages: [],
		activeKey: '',
		newTabIndex: 0,
	})

	const store = useStore()
	const router = useRouter()
	const { proxy } = getCurrentInstance()
	
	const selectedLastPath = () => {
		state.activeKey = state.fullPathList[state.fullPathList.length - 1]
	}
	
	; (function created() {
		// 全局的事件绑定用于页面内控制tab标签,暂时用不上
		// #region
		events.once('multiTab.open', (val) => {
			if (!val) {
				throw new Error(`multi-tab: open tab ${val} err`)
			}
			state.activeKey = val
		})
		events.once('multiTab.close', (val) => {
			if (!val) {
				closeSelf(state.activeKey)
				return
			}
			closeSelf(val)
		})
		events.once('multiTab.rename', ({ key, name }) => {
			console.log('rename', key, name)
			try {
				const item = state.pages.find((item) => item.path === key)
				item!.meta.customTitle = name
				proxy.$forceUpdate()
			} catch (e) {
				console.error(e)
			}
		})
		// #endregion

		state.pages.push(router.currentRoute.value)
		store.dispatch('addCachedView', router.currentRoute.value)
		state.fullPathList.push(router.currentRoute.value.fullPath)
		selectedLastPath()
	})()
	
	//添加
	const addTab = (newVal) => {
		state.activeKey = newVal.fullPath
		if (state.fullPathList.indexOf(newVal.fullPath) < 0) {
			//先过滤掉路由带参数, 再添加
			if (newVal.name == 'promptdetail') {
				state.fullPathList = state.fullPathList.filter((item) => !item.startsWith('/prompt/promptdetail/'));
				state.pages = state.pages.filter((item) => item.name != newVal.name)
			}
			state.fullPathList.push(newVal.fullPath)
			state.pages.push(newVal)
			store.dispatch('addCachedView', router.currentRoute.value)
		}
	}
	//编辑
	const onEdit = (targetKey, action) => {
		//proxy[action](targetKey)
		remove(targetKey)
	}
	//删除
	const remove = (targetKey) => {
		const temp = state.pages.find((page) => page.fullPath == targetKey)
		store.dispatch('delCachedView', temp)
		state.pages = state.pages.filter(page => page.fullPath !== targetKey)
		state.fullPathList = state.fullPathList.filter(path => path !== targetKey)
		// 判断当前标签是否关闭，若关闭则跳转到最后一个还存在的标签页
		if (!state.fullPathList.includes(state.activeKey)) {
			selectedLastPath()
		}
	}

	//菜单
	const closeSelf = (e) => {
		// 判断是否为最后一个标签页，如果是最后一个，则无法被关闭
		if (state.fullPathList.length > 1) {
			remove(e)
		} else {
			message.info('这是最后一个标签了, 无法被关闭')
		}
	}
	const closeLeft = (e) => {
		const currentIndex = state.fullPathList.indexOf(e)
		if (currentIndex > 0) {
			state.fullPathList.forEach((item, index) => {
				if (index < currentIndex) {
					remove(item)
				}
			})
		} else {
			message.info('左侧没有标签')
		}
	}
	const closeRight = (e) => {
		const currentIndex = state.fullPathList.indexOf(e)
		if (currentIndex < state.fullPathList.length - 1) {
			state.fullPathList.forEach((item, index) => {
				if (index > currentIndex) {
					remove(item)
				}
			})
		} else {
			message.info('右侧没有标签')
		}
	}
	const closeAll = (e) => {
		const currentIndex = state.fullPathList.indexOf(e)
		state.fullPathList.forEach((item, index) => {
			if (index !== currentIndex) {
				remove(item)
			}
		})
	}
	const closeMenuClick = (key : string, route) => {
		const allFun = { closeAll, closeRight, closeLeft, closeSelf }
		allFun[key](route)
	}

	watch(
		() => router.currentRoute.value,
		(newVal) => {
			addTab(newVal)
		}
	)
	watch(
		() => state.activeKey,
		(newPathKey) => {
			router.push({ path: newPathKey })
		}
	)
</script>
<style lang="less">
	.tab_style() {
		.ant-tabs-card {
			padding-left: 0;

			.ant-tabs-nav-container {

				.ant-tabs-tab-prev:hover,
				.ant-tabs-tab-next:hover {
					// width: 22px;
					background-color: rgba(0, 0, 0, 0.03);
				}

				font-size: 13px;
				height: 40px;
			}

			.ant-tabs-tab {
				margin-right: 0;
				border-radius: 0px;
				border-top: 0px;
				height: 40px;

				.anticon-close {
					// display: none;
				}
			}

			.ant-tabs-tab-active {
				//   padding-bottom: 0px;
				//   background-color: rgba(0, 0, 0, 0.1);
				height: 40px;
				border-bottom-color: transparent;

				.anticon-close {
					display: inline-block;
				}
			}

			.ant-tabs-tab:hover {
				//padding-left: 20px;
				//padding-right: 20px;

				.anticon-close {
					color: #333;
					display: inline-block;
				}
			}
		}
	}

	.ant-pro-multi-tab-wrapper {
		min-height: 40px;
		.tab_style() !important;
	}
</style>