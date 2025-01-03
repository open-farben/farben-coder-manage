<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="tabList">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
<script lang="ts" setup name="RouteView">
import { ref, watch, computed } from 'vue';
import { useStore } from 'vuex'

const store = useStore()

const tabList = computed(() => {
  return store.state.tagsView.cachedViews
})

</script>
