<template >
  <div class="article-container">
    <div class="article-background"></div>
    <div class="article-content">
      <div class="article-header">
        <h1 class="article-title">{{ article.Title }}</h1>
        <div class="article-meta">
          <span class="article-category">分类：{{ article.Category }}</span>
          <div class="article-stats">
            <span class="article-star">
              <StarOutlined/> {{ article.StarNum }}
            </span>
            <span class="article-likes">
              <LikeOutlined/> {{ article.LikesNum }}
            </span>
            <span class="article-comments">
              <MessageOutlined @click="AddComments"/> {{ article.CommentsNum }}
            </span>
          </div>
        </div>
      </div>
      <div class="article-body">
        <p v-for="(paragraph, index) in article.Content.split('\n')" :key="index" class="article-paragraph">
          {{ paragraph }}
        </p>
      </div>
      <div class="article-footer">
        <div class="article-actions">
          <button class="article-action-btn">
            <StarOutlined /> 收藏
          </button>
          <button class="article-action-btn">
            <LikeOutlined /> 点赞
          </button>
          <button class="article-action-btn">
            <MessageOutlined /> 评论
          </button>
        </div>
      </div>
    </div>
  </div>
  <a-modal v-model:visible="isAddComments" @ok="handleOk" @cancel="handleCancel" title="添加评论">
    <a-form :model="addCommentContent">
      <a-form-item label="评论内容">
        <a-input v-model:value="addCommentContent" placeholder="请输入内容"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { StarOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons-vue';
import {articleAuthStore, userAuthStore} from "@/store/auth.js";
import {useRoute} from "vue-router";
import {message} from "ant-design-vue";
// 定义文章数据结构
const articleApiStore = articleAuthStore()
const userApi = userAuthStore()
const userInfo = userApi.userInfo
const article = ref({   //命名要与后端定义的相同
  ArticleId: '',
  Title: '',
  Content: '',
  Preview: '',
  Category: '',
  StarNum: 0,
  LikesNum: 0,
  CommentsNum: 0,
  ViewNum: 0,
  AuthorId: ''
});
// 获取当前路由对象          router是获取总路由管理器，route是获得当前url
const route = useRoute();
const articleId = route.params.id
const isAddComments = ref(false)
const addCommentContent = ref('')
const commentsData = ref([])
// 模拟获取文章数据
const fetchArticle = async (id) => {
  // 这里应该是从后端获取文章数据的逻辑
  const res = await articleApiStore.getArticleById(id);
  article.value.ArticleId = res.data.article.id
  article.value.Title = res.data.article.title
  article.value.Content = res.data.article.content
  article.value.Preview = res.data.article.preview
  article.value.Category = res.data.article.category
  article.value.AuthorId = res.data.article.author_id
  article.value.CommentsNum = res.data.article.comments_num
  article.value.ViewNum = res.data.article.view_num
  article.value.StarNum = res.data.article.star_num
  article.value.LikesNum = res.data.article.likes_num
};
const getComments = async () => {
  const res = await articleApiStore.getComments(articleId)
  commentsData.value = res.data.success
}
const handleOk = async () => {
  await articleApiStore.addComment(addCommentContent.value, userInfo.id, article.value.ArticleId).then(res => {
    if (res && res.status === 200) {
      message.success("添加成功")
    } else {
      message.error("添加失败")
    }
  })
  isAddComments.value = false;
}
const handleCancel = () => {
  isAddComments.value = false;
}
const AddComments = async () => {
  isAddComments.value = true;
}
// 页面加载时获取文章数据
onMounted(() => {
  fetchArticle(articleId);
  getComments()
});
</script>

<style scoped>
.article-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

.article-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://source.unsplash.com/random/1920x1080/?coding');
  background-size: cover;
  background-position: center;
  opacity: 0.2;
  z-index: -1;
}

.article-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-header {
  text-align: center;
  margin-bottom: 30px;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
}

.article-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #666;
}

.article-category {
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.article-stats {
  display: flex;
  gap: 20px;
}

.article-star, .article-likes, .article-comments {
  display: flex;
  align-items: center;
  font-size: 1rem;
}

.article-star svg, .article-likes svg, .article-comments svg {
  margin-right: 5px;
  color: #ff9d00;
}

.article-body {
  line-height: 1.8;
  color: #444;
  margin-bottom: 40px;
}

.article-paragraph {
  margin-bottom: 20px;
  text-align: justify;
}

.article-footer {
  text-align: center;
}

.article-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.article-action-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  transition: all 0.3s ease;
}

.article-action-btn:hover {
  background-color: #f0f0f0;
}

.article-action-btn svg {
  margin-right: 5px;
  color: #ff9d00;
}
</style>