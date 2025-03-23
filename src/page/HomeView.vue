<template>
  <a-spin :spinning="isLoading">
    <a-list
        v-if="listData.length > 0"
        item-layout="vertical"
        size="middle"
        :pagination="pagination"
        :data-source="listData"
    >
      <template #footer>
      </template>
      <template v-slot:renderItem="{ item }">
        <a-list-item key="item.title">
          <template #actions>
            <span v-for="{ type, text } in item.actions" :key="type">
              <component v-bind:is="type" style="margin-right: 8px" @click="ClickType(type)"/>
              {{ text }}
            </span>
          </template>
          <template #extra>
            <img
                width="272"
                alt="logo"
                src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
            />
          </template>
          <a-list-item-meta :description="item.preview">
            <template #title>
              <a @click="moveToDetail(item)">{{ item.title }}</a>
            </template>
          </a-list-item-meta>
          <!-- 显示截断后的内容 -->
          <div v-if="item.content.length > maxLength">
            {{ truncatedContent(item.content) }}
          </div>
          <!-- 显示完整内容 -->
          <div v-else>
            {{ item.content }}
          </div>
        </a-list-item>
      </template>
    </a-list>
    <div v-else style="text-align: center; padding: 20px">
      暂无文章数据
    </div>
  </a-spin>
</template>

<script setup>
import {LikeOutlined, MessageOutlined, StarOutlined} from '@ant-design/icons-vue';
import {onMounted, ref, onUnmounted} from 'vue';
import {articleAuthStore} from '@/store/auth';
import {useRoute, useRouter} from 'vue-router';

const articleAuth = articleAuthStore();

// 定义加载状态
const isLoading = ref(true);

// 定义文章列表数据
const listData = ref([]);

// 获取当前路由对象
const route = useRoute();
const router = useRouter();

// 分页配置
const pagination = ref({
  current: 1, // 当前页码
  pageSize: 3, // 每页显示的数量
  onChange: (page, pageSize) => {
    // 更新当前页码
    pagination.value.current = page;
    pagination.pageSize = pageSize;
    // 更新查询参数
    router.push({ path: '/', query: { page: page, pageSize: pageSize } });
  },
  onShowSizeChange: (current, size) => {
    pagination.value.pageSize = size;
    pagination.value.current = current;
    router.push({ path: '/', query: { page: current, pageSize: size } });
  },
  pageSizeOptions: ['3', '5', '10', '20', '50'],
});

// 设置最大显示长度
const maxLength = ref(100);

// 计算截断后的内容
const truncatedContent = (content) => {
  return content.substring(0, maxLength.value) + '...';
};

// 获取文章数据
const fetchArticles = async () => {
  try {
    isLoading.value = true;
    // 从查询参数中获取当前页码
    pagination.value.pageSize = parseInt(route.query.pageSize) || 3;
    pagination.value.current = parseInt(route.query.page) || 1;
    const response = await articleAuth.getAllArticles();
    listData.value = response.data.articles.map(article => ({
      ...article,
      actions: [
        { type: StarOutlined, text: article.favorites_Num.toString() },
        { type: LikeOutlined, text: article.likes_Num.toString() },
        { type: MessageOutlined, text: article.comments_Num.toString() },
      ]
    })); // 将获取到的文章数据赋值给 listData
  } catch (error) {
    console.error('获取文章数据失败:', error);
  } finally {
    isLoading.value = false; // 加载完成后关闭加载状态
  }
};
const clickType = (type) => {

}

// 跳转到文章详情
const moveToDetail = (item) => {
  router.push(`/article/${item.id}`); // 通过路由来传递数据
};
// 保存滚动位置
const saveScrollPosition = () => {
  localStorage.setItem('homeScrollTop', window.scrollY);
};
// 在组件挂载时获取文章数据
onMounted(() => {
  window.addEventListener('scroll', saveScrollPosition);
  fetchArticles();
});
//结束的时候吗？
onUnmounted(() => {
  window.removeEventListener('scroll', saveScrollPosition);
});
</script>