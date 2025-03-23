<template>
  <a-tabs v-model:activeKey="activeKey" @tab-click="clickTab">
    <a-tab-pane v-for="category in categories" :key="category" :tab="category">
      <article-list :category="category" />
    </a-tab-pane>
  </a-tabs>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {articleAuthStore} from '../store/auth'
import ArticleList from '@/components/ArticleList.vue'; // 假设这是文章列表组件的路径

// 定义分类数据
const categories = ref([]);
const articleAuth = articleAuthStore()
// 获取所有分类
const fetchCategories = async () => {
  try {
    const response = await articleAuth.getCategory();
    categories.value = response.data.categories;
  } catch (error) {
    console.error('获取分类失败:', error);
  }
};

// 当前激活的标签页
const activeKey = ref("");
// 点击标签页时的处理函数
const clickTab = async (key) => {
  activeKey.value = key;
  console.log(key);
};
// 页面加载时获取分类数据
onMounted(() => {
  fetchCategories();
});
</script>