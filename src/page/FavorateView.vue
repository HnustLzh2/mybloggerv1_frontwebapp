<template>
  <div class="favorate-view">
    <a-button type="primary" @click="createFolder" style="position: fixed; right: 20px;bottom: 120px; z-index: 100">创建收藏夹</a-button>
    <a-list item-layout="horizontal" :data-source="folders">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a @click="viewFolder(item.id)">{{ item.folder_name }}</a>
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

    <a-modal v-model:visible="isArticleModalVisible" title="文章列表" @cancel="handleArticleModalCancel" @ok="handleArticleModalOk">
      <a-list item-layout="vertical" :data-source="articles">
        <template #renderItem="{ item }">
          <a-list-item key="item.title">
            <a-list-item-meta :description="item.preview">
              <template #title>
                <a @click="moveToDetail(item)">{{ item.title }}</a>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-modal>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue';
import { useRouter} from "vue-router";
import {folderStore, userAuthStore} from "../store/auth.js"

const folderApi = folderStore()
const userApi = userAuthStore()
const folders = ref([]);
const articles = ref([]);
const isFolderModalVisible = ref(false);
const isArticleModalVisible = ref(false);
const folderForm = ref({ folder_name: '' });
const router = useRouter();
const userInfo = userApi.userInfo;
const getFolders = async () => {
  try {
    const userId = userInfo.id;
    const response = await folderApi.GetAllFolder(userId)
    folders.value = response.data.data;
    console.log(folders.value)
  } catch (error) {
    console.error('Get folders error:', error);
  }
};
// 跳转到文章详情
const moveToDetail = (item) => {
  router.push(`/article/${item.id}`); // 通过路由来传递数据
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
    await getFolders();
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
const handleArticleModalOk = () => {
  isArticleModalVisible.value = false;
}
onMounted(() => {
  getFolders();
})
</script>

<style scoped>
</style>