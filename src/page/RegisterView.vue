<template>
  <div id="register-container">
    <h1 class="title">注册</h1>
    <a-form
        style="max-width: 480px; margin: 0 auto"
        :model="formState"
        name="basic"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 20 }"
        autocomplete="off"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
    >
      <a-form-item
          label="邮箱"
          name="email"
          :rules="[{ required: true, message: 'Please input your email!' }, { max: 32 }]"
      >
        <a-input v-model:value="formState.email" />
      </a-form-item>

      <a-form-item
          label="密码"
          name="password"
          :rules="[{ required: true, message: 'Please input your password!' }, { min: 8, max: 18 }]"
      >
        <a-input-password v-model:value="formState.password" />
      </a-form-item>
      <a-form-item
          label="用户名"
          name="username"
          :rules="[{ required: true, message: 'Please input your username!' }]"
      >
        <a-input v-model:value="formState.username"/>
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 5, span: 20 }">
        <a-button type="primary" html-type="submit">注册</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import {userAuthStore} from "@/store/auth.js";
import {useRouter} from "vue-router";
import {message} from "ant-design-vue";

const router = useRouter();     //初始化这个router
const userStore = userAuthStore()
const formState = reactive({
  email: '',
  password: '',
  username: '',
})
const authorization = ref('user')
const onFinish = async () => {
  try {
      await userStore.register(formState.email, formState.password, formState.username, authorization.value).then(
          res => {
            if (res.status === 200) {
              router.push({name: 'Login'});
              message.success("注册成功")
              console.log(res);
            }else {
              message.error(`遇到了一个不可预知的问题`,3,function () {
                  console.log(res);
              })
            }
          }
      );
  }catch(err) {
    message.error(`遇到了一个不可预知的问题`,3,function () {
      console.log(res);
    })
  }
  console.log('Success:', formState);
};

const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};
</script>

<style scoped>
#register-container {
  margin-top: 20px;
}
#register-container .title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 32px;
  padding-left: 38px;
}
</style>
