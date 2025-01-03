<template>
  <div class="flex flex-center flex-vcenter flex-column h100">
    <RedditCircleFilled style="color:#eee;font-size:200px"/>
    <p class="mt20 c999">您没有访问权限，请联系管理员</p>
  </div>
</template>

<script>
export default {
  name: 'ExceptionnotRouter',
  methods: {
    toHome () {
      this.$router.push({ path: '/' })
    }
  }
}
</script>
