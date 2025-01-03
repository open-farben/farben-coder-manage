<template>
  <div class="main" style="width: 20%;">
    
    <a-form id="formLogin" ref="formLogin" class="user-layout-login" :model="formState" :rules="rules">
      <a-form-item name="userId">
        <a-input size="large" type="text" placeholder="请输入账号"
                 v-model:value="formState.userId">
          <template #prefix>
            <UserOutlined :style="{ color: 'rgba(0,0,0,.25)' }"/>
          </template>
        </a-input>
      </a-form-item>

      <a-form-item name="password">
        <a-input-password size="large" placeholder="请输入密码" v-model:value="formState.password">
          <template #prefix>
            <LockOutlined :style="{ color: 'rgba(0,0,0,.25)' }"/>
          </template>
        </a-input-password>
      </a-form-item>

      <!-- <a-form-item>
        <a-checkbox v-model:checked="formState.rememberMe" style="float:left">自动登录</a-checkbox>
        <router-link :to="{ name: 'recover' }" class="forge-password"
          style="float: right">忘记密码</router-link>
      </a-form-item> -->
      <a-form-item style="margin-top: 24px">
        <a-button size="large" type="primary" htmlType="submit" class="login-button" :loading="state.loginBtn"
                  :disabled="state.loginBtn" @click="handleSubmit">登 录
        </a-button>
      </a-form-item>
    </a-form>
  </div>
  <div style="font-size: 12px;color: rgba(0, 0, 0, 0.7);text-align: center;position: absolute;bottom: 0;padding-bottom: 30px;">copyright © 2023 深圳市法本信息技术股份有限公司</div>
</template>

<script lang="ts" setup name="Login">
import { reactive, ref, toRaw, h } from 'vue'
import { notification, Modal } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useUserStore } from "@/store/modules/user.pinia"

const formLogin = ref()
const router = useRouter()

const userStore = useUserStore();

const state = reactive({
  isLoginError: false,
  loginBtn: false,
})

// #region 表单相关
const formState = reactive({
  userId: '',
  password: '',
})

const rules = {
  userId: [ { required: true, message: '请输入账号', trigger: 'change' } ],
  password: [ { required: true, message: '请输入密码', trigger: 'blur' } ],
}
//登录
const handleSubmit = (e) => {
  e.preventDefault()
  formLogin.value.validate([ 'userId', 'password' ]).then(() => {
    const values = toRaw(formState)
    state.loginBtn = true
    userStore.Login({ ...values })
        .then((res) => loginSuccess(res))
        .catch(err => requestFailed(err))
        .finally(() => {
          state.loginBtn = false
        })
  }).catch((error) => {
    setTimeout(() => {
      state.loginBtn = false
    }, 600)
  })
}
//登录成功
const loginSuccess = (res) => {
  if (res.code == '0') {
    if (res.data) {
      router.push({ path: '/' })
      
      //延迟1秒显示欢迎信息
      setTimeout(() => {
        notification.success({
          message: '欢迎',
          description: `欢迎回来`
        })
      }, 1000)
      state.isLoginError = false
    } else {
      notification['error']({
        message: '错误',
        description: 'TOKEN不存在',
        duration: 4
      })
    }
  }else if(res.code == 'A0123') {
    Modal.confirm({
			title: '提示',
			content: () =>
			h('span', {}, [
				h('span', '初次登录系统，建议您尽快修改默认密码，确保账号安全。'),
			]),
			okText: '修改密码',
			cancelText: '暂不修改',
			onOk: (() => {
        console.log('qqqq');

				router.push({path: '/user/pwdChange',query: { userId: formState.userId }})

			}),
			onCancel() {}
		})
  } else {
    state.loginBtn = false
  }

}
//登录失败
const requestFailed = (err) => {
  state.isLoginError = true
  notification['error']({
    message: '错误',
    description: ((err.response || {}).data || {}).message || '请求出现错误，请稍后再试',
    duration: 4
  })
}
// #endregion
</script>

<style lang="less" scoped>
@import '../../style/index.less';

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
</style>