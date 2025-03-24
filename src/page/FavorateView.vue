<template>
  <div>
    <a-button type="primary" @click="createFolder">创建收藏夹</a-button>
    <a-list item-layout="horizontal" :data-source="folders">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a @click="viewFolder(item.folder_id)">{{ item.folder_name }}</a>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>

    <a-modal v-model:visible="isFolderModalVisible" title="创建收藏夹" @ok="handleFolderModalOk" @cancel="handleFolderModalCancel">
      <a-form :model="folderForm">
        <a-form-item label="收藏夹名称">
          <a-input v-model:value="folderForm.folder_name" placeholder="请输入收藏夹名称" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="isArticleModalVisible" title="文章列表" @cancel="handleArticleModalCancel">
      <a-list item-layout="horizontal" :data-source="articles">
        <template #renderItem="{ item }">
          <a-list-item key="item.title">
            <template #actions>
            <span v-for="{ type, text } in item.actions" :key="type">
              <component v-bind:is="type" style="margin-right: 8px" @click="clickType(type, item)"/>
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
    </a-modal>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue';
import {useRoute, useRouter} from "vue-router";
import {folderStore, userAuthStore} from "../store/auth.js"

const folderApi = folderStore()
const folders = ref([]);
const articles = ref([]);
const isFolderModalVisible = ref(false);
const isArticleModalVisible = ref(false);
const folderForm = ref({ folder_name: '' });
const router = useRouter();
const maxLength = ref(100);
let userInfo = ref(localStorage.getItem('userInfo'));
const getFolders = async () => {
  try {
    const userId = userInfo.id;
    console.log(userId);
    const response = folderApi.GetAllFolder(userId)
    folders.value = response.data.data;
  } catch (error) {
    console.error('Get folders error:', error);
  }
};
// 跳转到文章详情
const moveToDetail = (item) => {
  router.push(`/article/${item.id}`); // 通过路由来传递数据
};
// 计算截断后的内容
const truncatedContent = (content) => {
  return content.substring(0, maxLength.value) + '...';
};
const createFolder = () => {
  isFolderModalVisible.value = true;
};

const handleFolderModalOk = async () => {
  const user_id = userInfo.id // 替换为当前用户ID
  const result = await folderApi.createCustomizedFolder(folderForm.value.folder_name, user_id);
  if (result) {
    folders.value.push(result.data.data);
    isFolderModalVisible.value = false;
  }
};

const handleFolderModalCancel = () => {
  isFolderModalVisible.value = false;
};

const viewFolder = async (folderId) => {
  const result = await folderApi.GetArticleFromFolder(folderId);
  if (result) {
    articles.value = result.data.data;
    isArticleModalVisible.value = true;
  }
};

const handleArticleModalCancel = () => {
  isArticleModalVisible.value = false;
};

onMounted(() => {
  getFolders();
})
</script>

<style scoped>
/* 添加一些样式 */
</style>