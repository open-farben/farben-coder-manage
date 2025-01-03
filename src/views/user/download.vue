<template>
	<div id="userLayout" :class="['user-layout-wrapper', isMobile && 'mobile']">
		<div class="container">
			<div class="user-layout-content flex flex-column">
				<div class="top">
					<div class="header">
						<a>
							<img src="~@/assets/icons/logo.png" class="logo" alt="logo" />
							<span class="title">GPTCoder</span>
						</a>
					</div>
				</div>
				<div class="main download flex">
					<div class="download-item" v-for="(item, index) in state.list" :key="index">
						<a-card :body-style="{width: '100%', padding: '20px 50px 20px'}" :bordered="false">
							<div class="f18 tc"><b>{{item.type}}</b></div>
							<div class="f14 download-list" v-for="(data, key) in item.itemList" :key="key">
								<b class="f18">{{data.version}}版本</b>
								<div class="flex flex-column">
									<span>上传时间：{{ toLocalTimeStr({ date:data.createTime, format: "YYYY-MM-DD" }) }}</span>
									<span>插件大小：{{ formatBytes(data.fileSize) }}</span>
									<span>IDE：{{ data.ideVersion }}</span>
									<span v-if="data.hashToolName && data.hashValue">Hash-Tool: {{ data.hashToolName }}</span>
									<a-tooltip v-if="data.hashToolName && data.hashValue" placement="left" :title="data.hashValue">
										<span class="ellips">Hash-value: {{ data.hashValue }}</span>
									</a-tooltip>
								</div>
								<div class="download-text ellipsis2">描述：{{data.description}}</div>
								<div align="right" class="mt20">
									<a-button type="primary" size="min" @click="handleDownload(data)">下载</a-button>
								</div>
							</div>
						</a-card>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup name="Login">
	import { toLocalTimeStr, formatBytes } from "@/utils/util";
	import { isMobile } from '@/utils/device';
	import { onMounted, reactive } from 'vue'
	import { pluginList } from '@/api/version'

	document.title = '下载'

	const state = reactive({
		loading: false,
		list: [],
	})

	//下载
	const handleDownload = (e:any) => {
		console.log(window.location.origin)
		window.open(`../../coder-api/plugin/downloadPlugin?id=${e.id}`)
	}
	//获取数据
	const getData = () => {
		state.loading = true
		let params = {}
		pluginList(params).then((res:any) => {
			if(res.data){
				state.list = res.data || []
			}
			state.loading = false
		})
	}
	onMounted(() => {
		getData()
	})
</script>

<style lang="less" scoped>
	@import '../../style/index.less';
	.ellips {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	#userLayout.user-layout-wrapper {
		height: 100%;

		&.mobile {
			.container {
				.main {
					max-width: 368px;
					width: 98% !important;
				}
			}
		}

		.container {
			width: 100%;
			min-height: 100%;
			background: #f0f2f5 url(@/assets/background.svg) no-repeat 50%;
			background-size: 100%;
			//padding: 50px 0 84px;
			position: relative;

			.user-layout-content {
				padding: 32px 0 24px;
				min-height: 100vh;

				.top {
					text-align: center;

					.header {
						height: 44px;
						line-height: 44px;
						margin-bottom: 40px;

						.logo {
							height: 44px;
							vertical-align: top;
							margin-right: 16px;
							border-style: none;
						}

						.title {
							font-size: 33px;
							color: rgba(0, 0, 0, 0.85);
							font-family: Avenir, 'Helvetica Neue', Arial, Helvetica, sans-serif;
							font-weight: 600;
							position: relative;
							top: 2px;
						}
					}

					.desc {
						font-size: 14px;
						color: rgba(0, 0, 0, 0.45);
						margin-top: 12px;
						margin-bottom: 40px;
					}
				}

				.main {
					margin: 0 auto;
				}

			}

			a {
				text-decoration: none;
			}
		}
	}
	.user-layout-login {
		label {
			font-size: 14px;
		}

		.getCaptcha {
			display: block;
			width: 100%;
			height: 40px;
		}

		.forge-password {
			font-size: 14px;
		}

		button.login-button {
			padding: 0 15px;
			font-size: 16px;
			height: 40px;
			width: 100%;
		}

		.user-login-other {
			text-align: left;
			margin-top: 24px;
			line-height: 22px;

			.anticon {
				font-size: 24px;
				color: rgba(0, 0, 0, 0.2);
				margin-left: 16px;
				vertical-align: middle;
				cursor: pointer;
				transition: color 0.3s;

				&:hover {
					color: @primary-color;
				}
			}

			.register {
				float: right;
			}
		}
	}
	.codelogin-user{
		position: absolute;
		top: 0;
		right: 0;
		.action{
			padding: 0 12px;
			.avatar{
				margin: 10px 8px 10px 0;
			}
		}
		
	}
	.codelogin-main{
		margin: 0 auto;
		background: #fff;
		padding: 20px;
	}
	.download{width: 80%;}
	.download-list{padding:20px;margin-top:20px;border:1px solid #e6e6e6}
	.download-item{width:50%;padding: 0 20px;display: flex;align-items: stretch;}
	.download-item .ant-card{width: 100%;}
	.download-text{height: 44px;}
</style>