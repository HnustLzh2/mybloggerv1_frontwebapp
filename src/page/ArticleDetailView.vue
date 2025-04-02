<template xmlns="">
  <div class="article-container">
    <div class="article-background"></div>
    <div class="article-content">
      <!-- 现有的文章内容结构 -->
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
            <span class="article-view">
              <EyeOutlined/> {{article.ViewNum}}
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

    <!-- 评论区 -->
    <div class="comments-section">
      <h2 class="comments-title">评论({{ commentsData.length }})</h2>

      <!-- 添加评论表单 -->
      <a-form :model="addCommentForm" class="comment-form">
        <a-form-item label="发表评论">
          <a-input
              v-model:value="addCommentForm.content"
              type="textarea"
              :rows="4"
              placeholder="分享你的想法..."
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSubmitComment" :disabled="!addCommentForm.content.trim()">
            发表评论
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 评论列表 -->
      <a-list
          class="comment-list"
          item-layout="vertical"
          :data-source="commentsData"
          :pagination="{
          onChange: page => {
            console.log(page);
          },
          pageSize: 5,
        }"
      >
        <template #renderItem="{ item }">
          <a-list-item class="comment-item">
            <!-- 评论者信息 -->
            <a-comment
                :author="item.user_name"
                :avatar="item.user_avatar"
                :datetime="formatTime(item.publish_time)"
            >

              <!-- 评论内容 -->
              <template #content>
                <p>{{ item.content }}</p>
                <!-- 点赞按钮 -->
                <a-tooltip title="点赞">
                  <span @click="handleLikeComment(item.id)">
                    <LikeOutlined :class="{ liked: item.Liked }" />
                    <span class="comment-like-count">{{ item.like_count }}</span>
                  </span>
                </a-tooltip>
                <!-- 删除按钮（如果用户有权限） -->
                <span  style="padding-left: 50px"> </span>
                <a-tooltip v-if="item.send_userid === userInfo.id" title="删除">
                  <span @click="handleDeleteComment(item.id)">
                    <DeleteOutlined />
                  </span>
                </a-tooltip>
              </template>
              <!-- 回复评论区域 -->
              <template #actions>
                <span v-if="item.replied_comments?.length" class="reply-count" @click="toggleCommentExpand(item.id)">
                  {{ expandedComments.has(item.id) ? '收起' : '展开' }}
                  {{ item.replied_comments.length }} 条回复
                   </span>
                <span @click="showReplyForm(item.id)">回复</span>
              </template>
              <!-- 回复表单 -->
              <template v-if="replyingCommentId === item.id" #actions>
                <a-input
                    v-model:value="replyForm.content"
                    placeholder="写下你的回复..."
                    @press-enter="handleSubmitReply(item)"
                />
                <a-button type="text" @click="cancelReply">取消</a-button>
                <a-button type="primary" @click="handleSubmitReply(item)">发送</a-button>
              </template>
              <!-- 子评论列表 -->
              <div v-if="expandedComments.has(item.id) && item.replied_comments?.length"
                   class="nested-replies">
                <CommentsList :comments="item.replied_comments" :article="article" :really-data="commentChilrend" :get-comment="getComments"/>
              </div>
            </a-comment>
          </a-list-item>
        </template>
      </a-list>
    </div>
  </div>

  <!-- 添加评论的模态框 -->
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
import {
  StarOutlined,
  LikeOutlined,
  MessageOutlined,
  DeleteOutlined,EyeOutlined
} from '@ant-design/icons-vue';
import { articleAuthStore, userAuthStore } from "@/store/auth.js";
import { useRoute } from "vue-router";
import { message } from "ant-design-vue";
import { format } from 'date-fns';
import CommentsList from "@/components/CommentsList.vue";

// 定义文章数据结构
const articleApiStore = articleAuthStore();
const userApi = userAuthStore();
const userInfo = userApi.userInfo;
const article = ref({
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
const expandedComments = ref(new Set()); // 存储已展开的评论ID
// 切换评论展开状态
const toggleCommentExpand = (commentId) => {
  if (expandedComments.value.has(commentId)) {
    expandedComments.value.delete(commentId);
  } else {
    expandedComments.value.add(commentId);
  }
};
// 获取当前路由对象
const route = useRoute();
const articleId = route.params.id;

// 评论相关状态
const commentsData = ref([]);
const addCommentForm = ref({
  content: ''
});
const replyForm = ref({
  content: '',
  parent_id: null
});
const replyingCommentId = ref(null);
const isAddComments = ref(false);
const addCommentContent = ref('');

// 获取文章数据
const fetchArticle = async (id) => {
  const res = await articleApiStore.getArticleById(id);
  if (res && res.data) {
    article.value.ArticleId = res.data.article.id;
    article.value.Title = res.data.article.title;
    article.value.Content = res.data.article.content;
    article.value.Preview = res.data.article.preview;
    article.value.Category = res.data.article.category;
    article.value.AuthorId = res.data.article.author_id;
    article.value.CommentsNum = res.data.article.comments_num;
    article.value.ViewNum = res.data.article.view_num;
    article.value.StarNum = res.data.article.star_num;
    article.value.LikesNum = res.data.article.likes_num;
  }
};
const tempData = ref([])
const commentChilrend = ref([])
// 获取评论数据
const getComments = async () => {
  await articleApiStore.getComments(articleId).then((res) => {
    console.log(res);
    if (res && res.data && res.data.success) {
      tempData.value = res.data.success.filter(item => item.parent_comment_id === null);
      commentChilrend.value = res.data.success.filter(item => item.parent_comment_id !== null);
      commentsData.value = tempData.value.map(comment => ({
        ...comment,
        Liked: comment.liked_by_user || false // 假设后端返回是否已点赞的字段
      }));
      console.log(commentsData.value);
    }
  })
};

// 提交评论
const handleSubmitComment = async () => {
  if (!addCommentForm.value.content) {
    message.error('评论内容不能为空');
    return;
  }
  try {
    const res = await articleApiStore.addComment(
      addCommentForm.value.content,
      userInfo.id,
      article.value.ArticleId,
    );
    if (res.status === 200) {
      message.success('评论发表成功');
      addCommentForm.value.content = '';
      await getComments(); // 刷新评论列表
    } else {
      message.error('发表评论失败');
    }
  } catch (error) {
    message.error('发表评论时出错');
    console.error(error);
  }
};

// 点赞评论
const handleLikeComment = async (commentId) => {
  try {
    const res = await articleApiStore.likeComment(commentId, userInfo.id);
    if (res.status === 200) {
      // 更新本地评论数据的点赞状态
      const commentIndex = commentsData.value.findIndex(c => c.id === commentId); //过滤条件，找到对应的commentID
      if (commentIndex !== -1) {
        commentsData.value[commentIndex].like_count += 1;
        commentsData.value[commentIndex].Liked = true;
      }
      message.success('点赞成功');
    } else {
      message.error('点赞失败');
    }
  } catch (error) {
    message.error('点赞时出错');
    console.error(error);
  }
};

// 删除评论
const handleDeleteComment = async (commentId) => {
  try {
    const res = await articleApiStore.deleteComment(commentId);
    if (res.status === 200) {
      message.success('评论已删除');
      await getComments(); // 刷新评论列表
    } else {
      message.error('删除评论失败');
    }
  } catch (error) {
    message.error('删除评论时出错');
    console.error(error);
  }
};

// 显示回复表单
const showReplyForm = (commentId) => {
  replyingCommentId.value = commentId;
  replyForm.value.parent_id = commentId;
};

// 取消回复
const cancelReply = () => {
  replyingCommentId.value = null;
  replyForm.value.content = '';
  replyForm.value.parent_id = null;
};

// 提交回复
const handleSubmitReply = async (parent) => {
  if (!replyForm.value.content) {
    message.error('回复内容不能为空');
    return;
  }
  try {
    const res = await articleApiStore.replyComments(
        replyForm.value.content,
        userInfo.id,
        article.value.ArticleId,
        parent.id,
    );
    if (res.status === 200) {
      message.success('回复发表成功');
      replyForm.value.content = '';
      replyingCommentId.value = null;
      console.log(res);
      parent.replied_comments.push(res.data.success);
      await getComments(); // 刷新评论列表
    } else {
      message.error('发表回复失败');
    }
  } catch (error) {
    message.error('发表回复时出错');
    console.error(error);
  }
};

// 点赞回复
const handleLikeReply = async (replyId) => {
  try {
    const res = await articleApiStore.likeComment(replyId, userInfo.id);
    if (res.status === 200) {
      // 更新本地回复数据的点赞状态
      commentsData.value.forEach(comment => {
        const replyIndex = comment.replied_comments.findIndex(r => r.CommentId === replyId);
        if (replyIndex !== -1) {
          comment.replied_comments[replyIndex].like_count += 1;
          comment.replied_comments[replyIndex].Liked = true;
        }
      });
      message.success('点赞成功');
    } else {
      message.error('点赞失败');
    }
  } catch (error) {
    message.error('点赞时出错');
    console.error(error);
  }
};

// 删除回复
const handleDeleteReply = async (replyId) => {
  try {
    const res = await articleApiStore.deleteReply(replyId);
    if (res.status === 200) {
      message.success('回复已删除');
      await getComments(); // 刷新评论列表
    } else {
      message.error('删除回复失败');
    }
  } catch (error) {
    message.error('删除回复时出错');
    console.error(error);
  }
};

// 格式化时间
const formatTime = (timestamp) => {
  return format(new Date(timestamp), 'yyyy-MM-dd HH:mm');
};

// 页面加载时获取数据
onMounted(() => {
  fetchArticle(articleId);
  getComments();
});

// 模态框相关方法
const handleOk = () => {
  if (!addCommentContent.value.trim()) {
    message.error('评论内容不能为空');
    return;
  }
  handleSubmitComment();
  isAddComments.value = false;
};

const handleCancel = () => {
  isAddComments.value = false;
};

const AddComments = () => {
  isAddComments.value = true;
};
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

.article-star, .article-likes, .article-comments, .article-view {
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

.comments-section {
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comments-title {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.comment-form {
  margin-bottom: 20px;
}

.comment-item {
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.reply-list {
  margin-left: 40px;
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 10px;
}

.liked {
  color: #1890ff;
}

.comment-like-count {
  margin-left: 5px;
}
.reply-count {
  color: #666;
  font-size: 0.9em;
}
</style>