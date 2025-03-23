<template>
  <div id="login-container">
    <h1 class="title">登入</h1>
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

      <a-form-item :wrapper-col="{ offset: 5, span: 20 }">
        <a-button type="primary" html-type="submit">登入</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup>
import { reactive } from 'vue';
import {userAuthStore} from "@/store/auth"
import {useRouter} from "vue-router";
import {message} from "ant-design-vue";

const router = useRouter()
const userStore = userAuthStore()
const formState = reactive({
  email: '',
  password: '',
});
const onFinish = async () => {
  try {
    const res = await userStore.login(formState.email, formState.password);
    console.log('Response:', res);
    if (res.status === 200) {
      await router.push({name: 'Home'});
      console.log('Success:', res.data);
    } else {
      console.error('Error:', res.data);
      message.warn(res.data.error);
    }
  } catch (err) {
    console.error('Error:', err);
  }
};

const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

</script>

<style scoped>
#login-container {
  margin-top: 20px;
}
#login-container .title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 32px;
  padding-left: 38px;
}
</style>
