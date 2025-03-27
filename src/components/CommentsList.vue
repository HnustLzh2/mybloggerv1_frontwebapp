<script setup>
import { defineProps } from 'vue';
import {
  LikeOutlined,
  DeleteOutlined,
  MessageOutlined
} from '@ant-design/icons-vue';
import { format } from 'date-fns';
import { message } from 'ant-design-vue';
import {userAuthStore} from "@/store/auth.js";
const userAuth = userAuthStore()
const userInfo = userAuth.userInfo
const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  }
});

const handleLikeReply = (replyId) => {
  // 点赞回复的逻辑
  message.success('点赞回复');
};

const handleDeleteReply = (replyId) => {
  // 删除回复的逻辑
  message.success('删除回复');
};

const showReplyForm = (commentId) => {
  // 显示回复表单的逻辑
  message.success('显示回复表单');
};

const handleSubmitReply = (parentId) => {
  // 提交回复的逻辑
  message.success('提交回复');
};
</script>

<template>
  <div>
    <a-list
        class="reply-list"
        :data-source="comments"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-comment
              :author="item.user_name"
              :avatar="item.user_avatar"
              :datetime="format(new Date(item.publish_time), 'yyyy-MM-dd HH:mm')"
          >
            <template #content>
              <p>{{ item.content }}</p>
              <!-- 点赞按钮 -->
              <a-tooltip title="点赞">
                <span @click="handleLikeReply(item.id)">
                  <LikeOutlined />
                  <span class="comment-like-count">{{ item.like_count }}</span>
                </span>
              </a-tooltip>
              <!-- 删除按钮 -->
              <a-tooltip v-if="item.send_userid === userInfo.id" title="删除">
                <span @click="handleDeleteReply(item.id)">
                  <DeleteOutlined />
                </span>
              </a-tooltip>
            </template>
            <template #actions>
              <span @click="showReplyForm(item.id)">回复</span>
            </template>
            <!-- 子评论列表 -->
            <template #children>
              <CommentsList :comments="item.replied_comments" />
            </template>
          </a-comment>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<style scoped>
.reply-list {
  margin-left: 40px;
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 10px;
}
</style>