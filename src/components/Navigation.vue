<template>
  <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
  >
    <el-menu-item index="Home">首页</el-menu-item>
    <el-menu-item index="SpecialSubject">专题</el-menu-item>
    <el-menu-item index="Articles" >文章</el-menu-item>
    <el-menu-item index="Favorate">收藏夹</el-menu-item>
    <el-menu-item index="Search">搜索</el-menu-item>
    <el-menu-item index="Login">登入</el-menu-item>
    <el-menu-item index="Register">注册</el-menu-item>
<!--    <el-menu-item index="Logout">注销</el-menu-item>-->
  </el-menu>
  <div class="h-6" />
</template>

<script setup>
import { ref, watch} from 'vue'
import "element-plus";
import {useRoute, useRouter} from "vue-router";
const route = useRoute();
const router = useRouter()
const activeIndex = ref("Home")
watch(route, (newRoute) => {
  activeIndex.value = newRoute.name?.toString() || 'home';
})
const handleSelect = (key) => {
    console.log(key)
    router.push({name: key})
}
</script>
