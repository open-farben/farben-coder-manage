<template>
	<div id="userLayout" :class="['user-layout-wrapper', isMobile && 'mobile']">
		<div class="container">
			<div class="user-layout-content flex flex-center flex-column">
				<div class="top">
					<div class="header">
						<a>
							<img src="~@/assets/Farben-LOGO.svg" class="farben" alt="logo">
							<a-divider type="vertical" style="height: 15px; background-color: #1677ff" />
							<img src="~@/assets/icons/logo.png" class="logo" alt="logo" />
							<span class="title">GPTCoder管理平台开源</span>
						</a>
					</div>
				</div>
				<router-view />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup name="UserLayout">
	import { isMobile } from '@/utils/device';
	import { onMounted, onBeforeUnmount } from 'vue';

	onMounted(() => {
		document.body.classList.add('userLayout');
	});
	onBeforeUnmount(() => {
		document.body.classList.remove('userLayout');
	});
</script>

<style lang="less" scoped>
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
			background: #f0f2f5 url(../assets/background.svg) no-repeat 50%;
			background-size: 100%;
			//padding: 50px 0 84px;
			position: relative;

			.user-layout-lang {
				width: 100%;
				height: 40px;
				line-height: 44px;
				text-align: right;

				::v-deep(.select-lang-trigger) {
					cursor: pointer;
					padding: 12px;
					margin-right: 16px;
					display: inline-flex;
					align-items: center;
					justify-content: center;
					font-size: 16px;
					vertical-align: middle;
				}
			}

			.user-layout-content {
				padding: 32px 0 24px;
				height: 100vh;

				.top {
					text-align: center;

					.header {
						height: 44px;
						line-height: 44px;
						margin-bottom: 38px;

						.badge {
							position: absolute;
							display: inline-block;
							line-height: 1;
							vertical-align: middle;
							margin-left: -12px;
							margin-top: -10px;
							opacity: 0.8;
						}

						.logo {
							height: 44px;
							vertical-align: top;
							margin-right: 16px;
							border-style: none;
						}

						.farben {
							height: 38px;
							vertical-align: top;
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
					min-width: 260px;
					width: 368px;
					margin: 0 auto;
				}

				.footer {
					// position: absolute;
					width: 100%;
					bottom: 0;
					padding: 0 16px;
					margin: 48px 0 24px;
					text-align: center;

					.links {
						margin-bottom: 8px;
						font-size: 14px;

						a {
							color: rgba(0, 0, 0, 0.45);
							transition: all 0.3s;

							&:not(:last-child) {
								margin-right: 40px;
							}
						}
					}

					.copyright {
						color: rgba(0, 0, 0, 0.45);
						font-size: 14px;
					}
				}
			}

			a {
				text-decoration: none;
			}
		}
	}
</style>