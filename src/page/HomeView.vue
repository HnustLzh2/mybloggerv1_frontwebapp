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
    <div v-else style="text-align: center; padding: 20px">
      暂无文章数据
    </div>
  </a-spin>
  <a-modal v-model:visible="isAddFavorateArticle" title="添加到文件夹中" @ok="addToFolder" @cancel="cancelModal">
    <a-list item-layout="horizontal" :data-source="folders">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <!--这个checkbox为item添加了一个属性checked-->
              <a-checkbox v-model:checked="item.checked">{{ item.folder_name }}</a-checkbox>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
  </a-modal>
</template>

<script setup>
import {LikeOutlined, MessageOutlined, StarOutlined, EyeOutlined} from '@ant-design/icons-vue';
import {onMounted, ref, onUnmounted} from 'vue';
import {articleAuthStore, folderStore, userAuthStore} from '@/store/auth';
import {useRoute, useRouter} from 'vue-router';
import {message, Modal} from "ant-design-vue";
const isAddFavorateArticle = ref(false);
const articleAuth = articleAuthStore();
const userAuth = userAuthStore();
const folderApi = folderStore()
const folders = ref([]);
const selectedFolders = ref([]);
const currentArticleId = ref(null);

// 定义加载状态
const isLoading = ref(true);

// 定义文章列表数据
const listData = ref([]);
const userInfo = userAuth.userInfo
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
    pagination.value.pageSize = pageSize;
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
// 获取所有收藏夹
const getFolders = async () => {
  try {
    const userId = userInfo.id;
    const response = await folderApi.GetAllFolder(userId);
    if (response && response.data && response.data.data) {
      // 为每个收藏夹添加一个 checked 属性，用于多选
      folders.value = response.data.data.map(folder => ({
        ...folder,
        checked: false
      }));
    }
  } catch (error) {
    console.error('Get folders error:', error);
  }
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
        { type: StarOutlined, text: article.star_num.toString() },
        { type: LikeOutlined, text: article.likes_num.toString() },
        { type: MessageOutlined, text: article.comments_num.toString() },
        { type: EyeOutlined, text: article.view_num.toString() },
      ]
    })); // 将获取到的文章数据赋值给 listData
  } catch (error) {
    console.error('获取文章数据失败:', error);
  } finally {
    isLoading.value = false; // 加载完成后关闭加载状态
  }
};
const clickType = async (type, item) => {
  switch (type) {
    case StarOutlined:
      try {
        currentArticleId.value = item.id;
        isAddFavorateArticle.value = true;
        await getFolders();
      }catch (e) {
        console.error(e);
        message.error("添加失败")
      }
      break;
    case LikeOutlined:
      try {
        await articleAuth.likeArticle(item.id);
        message.success("添加成功")
      }catch (e) {
        console.error(e);
        message.error("添加失败")
      }
      break;
  }
}
// 添加到收藏夹
const addToFolder = async () => {
  try {
    // 获取所有选中的收藏夹
    const selected = folders.value.filter(folder => folder.checked);
    if (selected.length === 0) {
      Modal.error({
        title: '错误',
        content: '请至少选择一个收藏夹'
      });
      return;
    }

    // 遍历选中的收藏夹，将文章添加到每个收藏夹
    for (const folder of selected) {
      await articleAuth.addFavoriteArticle(currentArticleId.value, folder.id);
    }

    Modal.success({
      title: '成功',
      content: '文章已成功添加到选中的收藏夹'
    });
    // 关闭模态框
    isAddFavorateArticle.value = false;
  } catch (error) {
    Modal.error({
      title: '错误',
      content: '添加文章到收藏夹失败'
    });
    console.error('Add to folder error:', error);
  }
};
// 取消模态框
const cancelModal = () => {
  isAddFavorateArticle.value = false;
  // 重置选中状态
  folders.value.forEach(folder => {
    folder.checked = false;
  });
};
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