<template>
  <a-list
      item-layout="vertical"
      size="middle"
      :pagination="pagination"
      :data-source="articles"
  >
    <template #renderItem="{ item }">
      <a-list-item>
        <a-list-item-meta>
          <template #title>
            <a @click="moveToDetail(item)">{{ item.title }}</a>
          </template>
          <template #description>
            <span>{{ item.preview }}</span>
          </template>
        </a-list-item-meta>
      </a-list-item>
    </template>
  </a-list>
</template>

<script setup>
import { ref, watch } from 'vue';
import { articleAuthStore } from '@/store/auth.js'; // 假设你的API文件路径是这样
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  category: {
    type: String,
    required: true
  },
});
const articleAuth = articleAuthStore()
// 文章列表数据
const articles = ref([]);

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 4,
  onChange: (page) => {
    pagination.value.current = page;
    fetchArticles();
  }
});

// 获取文章列表
const fetchArticles = async () => {
  try {
    console.log(props.category);
    const response = await articleAuth.getArticlesByCategory(props.category)
    articles.value = response.data.articles;
  } catch (error) {
    console.error('获取文章失败:', error);
  }
};

// 监听categoryId变化，重新获取文章列表
watch(() => props.category, (newVal) => {
  if (newVal) {
    fetchArticles();
  }
});

// 跳转到文章详情
const router = useRouter();
const moveToDetail = (item) => {
  router.push(`/article/${item.id}`);
};
// 初始加载文章列表
fetchArticles();

</script>