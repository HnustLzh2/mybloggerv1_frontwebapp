<script setup>
import { defineProps } from 'vue';
import {
  LikeOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';
import { format } from 'date-fns';
import { message } from 'ant-design-vue';
import { articleAuthStore, userAuthStore } from "@/store/auth.js";
import { ref, onMounted } from 'vue';

const articleApiStore = articleAuthStore();
const userAuth = userAuthStore();
const userInfo = userAuth.userInfo;

const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  },
  article: {
    type: Object,
    default: () => {}
  },
  reallyData: {
    type: Array,
    default: () => []
  },
  getComment: {
    type: Function,
    required: true
  }
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

const handleLikeReply = (replyId) => {
  // 点赞回复的逻辑
  message.success('点赞回复');
};

const handleDeleteReply = (replyId) => {
  // 删除回复的逻辑
  message.success('删除回复');
};

const replyingCommentId = ref('');
const replyForm = ref({
  parent_id: null,
  content: ''
});

// 显示回复表单
const showReplyForm = (commentId) => {
  replyingCommentId.value = commentId;
  replyForm.value.parent_id = commentId;
};

const handleSubmitReply = async (parent) => {
  if (!replyForm.value.content) {
    message.error('回复内容不能为空');
    return;
  }
  try {
    if (parent.replied_comments == null) {
      parent.replied_comments = [];
    }
    if (parent.liked_users == null) {
      parent.liked_users = [];
    }
    const res = await articleApiStore.replyComments(
        replyForm.value.content,
        userInfo.id,
        props.article.ArticleId,
        parent.id,
    );

    if (res.status === 200) {
      message.success('回复发表成功');
      replyForm.value.content = '';
      replyingCommentId.value = null;
      console.log(res);
      await props.getComment()
    } else {
      message.error('发表回复失败');
    }
  } catch (error) {
    message.error('发表回复时出错');
    console.error(error);
  }
};

const cancelReply = () => {
  replyingCommentId.value = null;
  replyForm.value.content = '';
  replyForm.value.parent_id = null;
};

// 新变量 truelyData，用于存储筛选后的数据
const truelyData = ref([]);

// 筛选 reallyData 中父评论 ID 等于 comments 中父评论 ID 的数据
onMounted(() => {
  // 获取 comments 中的所有父评论 ID
  const parentIds = props.comments.map(comment => comment.parent_id);

  // 筛选 reallyData 中父评论 ID 匹配的数据
  truelyData.value = props.reallyData.filter(item => parentIds.includes(item.parent_id));
});
</script>

<template>
  <div>
    <a-list :data-source="truelyData">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-comment
              :author="item.user_name"
              :avatar="item.user_avatar"
              :datetime="format(new Date(item.publish_time), 'yyyy-MM-dd HH:mm')"
          >
            <template #content>
              <div>
                <p>{{ item.content }}</p>
                <div>
                  <!-- 操作按钮保持不变... -->
                  <a-tooltip title="点赞">
                  <span @click="handleLikeReply(item.id)">
                    <LikeOutlined :class="{ liked: item.Liked }" />
                    <span class="comment-like-count">{{ item.like_count }}</span>
                  </span>
                  </a-tooltip>
                  <!-- 删除按钮（如果用户有权限） -->
                  <span style="padding-left: 50px"> </span>
                  <a-tooltip v-if="item.send_userid === userInfo.id" title="删除">
                  <span @click="handleDeleteReply(item.id)">
                    <DeleteOutlined />
                  </span>
                  </a-tooltip>
                </div>
              </div>
              <!-- 回复表单保持不变... -->
            </template>
            <!-- 如果是二级评论，不显示展开/收起按钮，只显示回复按钮 -->
            <template #actions>
              <span @click="showReplyForm(item.id)">回复</span>
              <!-- 如果是二级评论，显示回复于父评论的名字 -->
              <p>回复于 {{ item.parent_comment_name }}</p>
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
          </a-comment>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<style scoped>
.reply-count {
  cursor: pointer;
  color: #1890ff;
  transition: color 0.3s;
}

.reply-count:hover {
  color: #40a9ff;
}

/* 移除二级评论的左边距 */
.nested-replies {
  margin-left: 0;
  border-left: none;
  padding-left: 0;
  animation: expand 0.3s ease-out;
}

@keyframes expand {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>