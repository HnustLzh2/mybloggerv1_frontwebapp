<template>
  <div class="search-container">
    <a-input-search
        v-model:value="searchText"
        placeholder="请输入搜索内容"
        @search="handleSearch"
        style="text-align: center; margin: 10px 10px 10px 10px"
        enter-button="搜索"
        size="large"
    />
    <a-list
        v-if="listData.length > 0"
        item-layout="vertical"
        size="middle"
        :pagination="pagination"
        :data-source="listData"
    >
      <template v-slot:renderItem="{ item }">
        <a-list-item key="item.title">
          <a-list-item-meta :description="item.preview">
            <template #title>
              <a @click="moveToDetail(item)">{{ item.title }}</a>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
    <div v-else style="text-align: center; padding: 20px">
      暂无文章数据
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {articleAuthStore} from "@/store/auth.js";
import {EditOutlined} from "@ant-design/icons-vue";

const searchText = ref(''); // 搜索框绑定的值
const listData = ref([]); // 文章列表数据
const articleApis = articleAuthStore()
const pagination = ref({
  current: 1, // 当前页码
  pageSize: 10, // 每页显示的数量
  total: 0, // 数据总数
  onChange: (page, pageSize) => {
    // 翻页或更改页面大小时重新获取数据
    pagination.value.current = page;
    pagination.value.pageSize = pageSize
    fetchArticles(searchText.value, page, pageSize);
    // 更新查询参数
    router.push({ path: '/', query: { page: page, pageSize: pageSize } });
  },
  onShowSizeChange: (current, size) => {
    // 更改页面大小时重新获取数据
    pagination.value.current = current;
    pagination.value.pageSize = size;
    fetchArticles(searchText.value, current, size);
    // 更新查询参数
    router.push({ path: '/', query: { page: current, pageSize: size } });
  },
});

const router = useRouter();

// 搜索文章
const handleSearch =  () => {
  fetchArticles(searchText.value, 1, pagination.value.pageSize);
};

// 获取文章数据
const fetchArticles = async (text, page, size) => {
  try {
    console.log(text);
    const response = await articleApis.searchArticle(text, page, size);
    listData.value = response.data.success;
    pagination.value.total = response.data.total;
    pagination.value.current = page;
    pagination.value.pageSize = size;
  } catch (err) {
    console.log(err);
  }
};

// 跳转到文章详情
const moveToDetail = (item) => {
  router.push(`/article/${item.id}`);
};
</script>

<style scoped>
.search-container {
  padding: 20px;
}
</style>