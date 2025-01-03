<template>
  <a-config-provider :locale="locale">
    <router-view />
  </a-config-provider>
</template>

<script lang="ts" setup name="App">
import { ref } from 'vue'
import zh_CN from 'ant-design-vue/es/locale/zh_CN'
import { setDeviceType } from '@/utils/device'
import emitter from '@/utils/eventBus'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');
const locale = ref(zh_CN);
window.onresize = setDeviceType
setDeviceType()

const router = useRouter()
emitter.once('axios_goto_login', () => {
  router.push({ name: 'login' })
})
</script>

<style>
</style>
