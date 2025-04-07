<template>
  <div class="chat-container">
    <a-layout class="chat-layout">
      <a-layout-header class="chat-header">
        <h1>{{ roomName }}</h1>
      </a-layout-header>
      <a-layout-content class="chat-messages">
        <div class="message-list" ref="messageList">
          <div
              v-for="msg in messages"
              :key="msg.message_id"
              :class="['message-item', { 'self-message': msg.sender_id === userInfo.id }]"
          >
            <!-- 他人消息 -->
            <div v-if="msg.sender_id !== userInfo.id" class="other-message">
              <div class="message-avatar">
                <a-avatar :src="getAvatar(msg.sender_id)" />
              </div>
              <div class="message-content">
                <div class="message-sender">{{ msg.sender_name }}</div>
                <div class="message-text">{{ msg.message }}</div>
                <div class="message-time">{{ formatDate(msg.timestamp) }}</div>
              </div>
            </div>

            <!-- 自己的消息 -->
            <div v-else class="self-message">
              <div class="message-content">
                <div class="message-sender">{{ msg.sender_name }}</div>
                <div class="message-text">{{ msg.message }}</div>
                <div class="message-time">{{ formatDate(msg.timestamp) }}</div>
              </div>
              <div class="message-avatar">
                <a-avatar :src="getAvatar(msg.sender_id)" />
              </div>
            </div>
          </div>
        </div>
      </a-layout-content>
      <a-layout-footer class="chat-input">
        <a-input
            v-model:value="newMessage"
            placeholder="输入消息..."
            @pressEnter="sendMessage"
        >
          <template #suffix>
            <a-button type="primary" @click="sendMessage">发送</a-button>
          </template>
        </a-input>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup>
import { onMounted,onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { chatStore, userAuthStore } from '@/store/auth.js';
import { nextTick } from 'vue';
const route = useRoute();
const chatApis = chatStore();
const userApis = userAuthStore();
const userInfo = userApis.userInfo;
const roomId = route.params.roomId;
const roomName = ref('聊天室');
const messages = ref([]);
const newMessage = ref('');
const socket = ref(null);

// 初始化 WebSocket 连接
const initWebSocket = () => {
  socket.value = new WebSocket(`ws://localhost:3002/joinRoom?userId=${userInfo.id}&roomId=${roomId}`);
  socket.value.binaryType = 'arraybuffer';
  socket.value.onopen = () => {
    console.log('WebSocket connected');
  };
  socket.value.onmessage = (event) => {
    if (typeof event.data === 'string') {
      try {
        const data = JSON.parse(event.data);
        messages.value.push(data);
        scrollToBottom(); // 确保在消息接收后滚动到底部
      } catch (error) {
        console.log('Received non-JSON message:', event.data);
      }
    }
  };
  socket.value.onclose = (event) => {
    console.log('WebSocket disconnected:', event);
  };
  socket.value.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
};

// 获取聊天室信息和历史消息
const getRoomInfoAndMessages = async () => {
  try {
    const roomId = route.params.roomId;
    const roomInfoResult = await chatApis.getRoomInfo(roomId);
    roomName.value = roomInfoResult.data.chat_room.room_name || '聊天室';

    const response = await chatApis.getChatMessage(roomId);
    messages.value = response.data.success.sort((a, b) => {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
  } catch (error) {
    message.error('获取聊天室信息失败');
    console.error(error);
  }
};

// 发送消息
const sendMessage = () => {
  if (!newMessage.value) return;
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    socket.value.send(newMessage.value);
  }
  newMessage.value = '';
};

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick(); // 确保 DOM 更新完成
  const messageList = document.querySelector('.message-list');
  if (messageList) {
    messageList.scrollTop = messageList.scrollHeight;
  }
};
// 获取头像（示例）
const getAvatar = (userId) => {
  try {
    return `https://randomuser.me/api/portraits/men/${userId % 10}.jpg`;
  } catch {
    // 如果链接无效，返回默认头像
    return 'https://zos.alipayobjects.com/rmsportal/ODTLcjIAWPbMLc.png';
  }
};

// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

// 页面加载时初始化
onMounted(async () => {
  await getRoomInfoAndMessages();
  initWebSocket();
  await scrollToBottom();
});
// 组件卸载时关闭 WebSocket
onUnmounted(() => {
  closeWebSocket();
});
// 关闭 WebSocket 连接
const closeWebSocket = () => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    socket.value.close();
    socket.value = null;
  }
};
// 监听路由变化
watch(
    () => route.params.roomId,
    async (newRoomId) => {
      if (newRoomId) {
        closeWebSocket();
        roomId.value = newRoomId;
        await getRoomInfoAndMessages();
        initWebSocket();
      }
    }
);
</script>

<style scoped>
.chat-container {
  height: 80vh; /* 调整整体页面高度 */
  display: flex;
}

.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 修复房间名字被遮住的问题 */
.chat-header {
  height: 60px; /* 增加高度 */
  background-color: #1890ff;
  color: white;
  padding: 0 20px; /* 调整内边距 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

/* 修复两个滚动框的问题 */
.chat-messages {
  flex: 1;
  height: 100%;
  background-color: #f0f2f5;
  overflow: hidden;
}

.message-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-y: auto; /* 确保滚动条存在 */
  max-height: 100%; /* 确保 message-list 不超出父容器 */
  gap: 15px; /* 为消息之间添加间隙 */
}

/* 他人消息样式 */
.other-message {
  display: flex;
  max-width: 80%;
  margin-left: 10px;
  justify-content: flex-start; /* 消息在左侧 */
}

/* 自己消息样式 */
.self-message {
  margin-right: 10px;
  display: flex;
  justify-content: flex-end;
  max-width: 100%;
}

.message-avatar {
  margin-right: 10px;
}

.self-message .message-avatar {
  margin-right: 0;
  margin-left: 10px;
}

.message-content {
  background-color: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  max-width: 80%;
  text-align: left; /* 确保文字左对齐 */
}

.self-message .message-content {
  background-color: #e6f7ff;
  color: #000;
}

.message-sender {
  font-weight: bold;
  margin-bottom: 5px;
}

.message-text {
  margin-bottom: 5px;
}

.message-time {
  font-size: 12px;
  color: #999;
  text-align: right;
}
</style>