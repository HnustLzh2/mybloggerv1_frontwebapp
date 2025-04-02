<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <a-col flex="200px">
        <div class="title-bar">
          <img class="logo" src="../assets/logo.webp" alt="logo" />
          <div class="title">导航栏</div>
        </div>
      </a-col>
      <a-col flex="auto">
        <a-menu v-model:selectedKeys="current" mode="horizontal" @click="doMenuClick">
          <a-menu-item key="Home">
            首页
          </a-menu-item>
          <a-menu-item key="Articles">
            文章
          </a-menu-item>
          <a-menu-item key="Favorite">
            收藏夹
          </a-menu-item>
          <a-menu-item key="Search">
            搜索 🔍
          </a-menu-item>
          <a-menu-item key="ChoseChat">
            聊天室
          </a-menu-item>
          <a-menu-item key="others">
            <a href="https://github.com/HnustLzh2?tab=repositories" target="_blank" rel="noopener noreferrer">
               我的仓库链接⚡️
            </a>
          </a-menu-item>
        </a-menu>
      </a-col>
      <a-col flex="80px">
          <div>
            <a-button type="primary" href="/login" v-if="!userStore.isAuthenticated">登录</a-button>
            <a-avatar :size="52" src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=2" shape="circle"
                      v-if="userStore.isAuthenticated">
              <template #icon><UserOutlined /></template>
            </a-avatar>
          </div>
      </a-col>
      <a-col flex="80px">
        <div>
          <a-button type="primary" href="/register" v-if="!userStore.isAuthenticated">注册</a-button>
          <a-button type="primary" v-if="userStore.isAuthenticated" @click="logoutF">退出登入</a-button>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref,onMounted } from "vue";
import {useRouter} from "vue-router";
import {tokenStore, userAuthStore} from "../store/auth.js";
import { UserOutlined } from '@ant-design/icons-vue';
import {message} from "ant-design-vue";

const router = useRouter();
const userStore = userAuthStore()
// 点击菜单后的路由跳转事件
const doMenuClick = ({ key }) => {
  router.push({
    name: key,
  });
};

const current = ref(["home"]);
const logoutF = async () => {
  await userStore.logout().then(res => {
    console.log(res);
  });
  message.success("注销成功");
}
// 监听路由变化，更新当前菜单选中状态
    router.afterEach((to, from, failure) => {
      current.value = [to.path];
    });

</script>
<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}

.logo {
  height: 48px;
}
</style>
