<template>
	<div class="farLogo">
		<router-link :to="{ name: 'index' }">
			<img src="@/assets/Farben-LOGO.svg" style="height: 15px;margin-left: 8px;">
			<a-divider type="vertical" style="height: 10px; background-color: #1677ff" />
			<img src="@/assets/icons/logo.png" style="width: 32px;height: 32px;"/>
			<h1 v-if="showTitle" style="font-style: 14px;">{{ title }}</h1>
		</router-link>
	</div>
</template>

<script lang="ts" setup name="Logo">
	const props = defineProps({
		title: {
			type: String,
			default: 'GPTCoder管理平台',
			required: false,
		},
		showTitle: {
			type: Boolean,
			default: true,
			required: false,
		},
	})
</script>
<style>
.farLogo {
	flex: 0 0 165px;
    height: 64px;
    position: relative;
    line-height: 64px;
    transition: all 0.3s;
    overflow: hidden;

	h1 {
        color: #fff;
        display: inline-block;
        vertical-align: top;
        font-size: 14px;
        margin: 0 0 0 6px;
        font-weight: 400;
      }
}
</style>