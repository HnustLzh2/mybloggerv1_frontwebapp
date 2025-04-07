<template>
  <div class="chat-room-container">
    <!-- 顶部选项卡 -->
    <a-tabs v-model:activeKey="activeKey" @change="handleTabChange">
      <a-tab-pane key="all" tab="全部聊天室"></a-tab-pane>
      <a-tab-pane key="your" tab="自己加入的聊天室"></a-tab-pane>
    </a-tabs>

    <!-- 创建聊天室按钮 -->
    <div class="create-room-container" v-if="activeKey === 'all'">
      <a-button type="primary" @click="showCreateRoomModal">创建聊天室</a-button>
    </div>

    <!-- 聊天室列表 -->
    <div class="room-list">
      <a-spin :spinning="loading">
        <a-empty v-if="!roomList.length" description="暂无聊天室" />
        <div v-else>
          <a-card
              v-for="room in roomList"
              :key="room.chat_room_id"
              class="room-card"
              hoverable
          >
            <template #title>
              <div class="room-title">
                {{ room.room_name }}
              </div>
            </template>
            <template #extra>
              <a-button type="primary" size="small" @click="joinRoom(room.chat_room_id)">加入</a-button>
            </template>
            <div class="room-info">
              <p>创建者: {{ room.creator_name }}</p>
              <p>创建时间: {{ formatDate(room.created_at) }}</p>
            </div>
          </a-card>
        </div>
      </a-spin>
    </div>

    <!-- 创建聊天室模态框 -->
    <a-modal
        v-model:visible="createRoomVisible"
        title="创建聊天室"
        @ok="handleCreateRoom"
    >
      <a-form :model="roomForm">
        <a-form-item label="聊天室名称">
          <a-input v-model:value="roomForm.room_name" placeholder="请输入聊天室名称" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import {chatStore, userAuthStore} from "@/store/auth.js";
import axios from "axios";
import {useRouter} from "vue-router";

// 使用聊天室 store
const chatApis = chatStore();

// 当前选中的标签
const activeKey = ref('all');

// 是否正在加载
const loading = ref(false);

// 聊天室列表
const roomList = ref([]);

// 创建聊天室模态框是否可见
const createRoomVisible = ref(false);

// 创建聊天室表单
const roomForm = ref({
  room_name: '',
});

// 加载所有聊天室
const loadAllRooms = async () => {
  loading.value = true;
  try {
    const result = await chatApis.getAllChatRooms();
    if (result && result.data) {
      roomList.value = result.data.chat_rooms;
      console.log(roomList.value);
    }
  } catch (error) {
    message.error('加载聊天室失败');
  } finally {
    loading.value = false;
  }
};

// 加载用户加入的聊天室
const loadYourRooms = async () => {
  loading.value = true;
  try {
    // 假设用户ID是1，实际项目中应该从用户信息中获取
    const result = await chatApis.getAllYourCharRooms(userInfo.id);
    if (result && result.data) {
      roomList.value = result.data.success;

    }
  } catch (error) {
    message.error('加载用户聊天室失败');
  } finally {
    loading.value = false;
  }
};

// 根据当前标签加载数据
const loadData = () => {
  if (activeKey.value === 'all') {
    loadAllRooms();
  } else {
    loadYourRooms();
  }
};

// 标签切换处理
const handleTabChange = (key) => {
  activeKey.value = key;
  loadData();
};

// 显示创建聊天室模态框
const showCreateRoomModal = () => {
  roomForm.value.room_name = '';
  createRoomVisible.value = true;
};
const userApis = userAuthStore()
const userInfo = userApis.userInfo
// 处理创建聊天室
const handleCreateRoom = async () => {
  if (!roomForm.value.room_name) {
    message.error('请输入聊天室名称');
    return;
  }
  try {
    const result = await chatApis.createChatRoom(roomForm.value.room_name, userInfo.id);
    if (result && result.data) {
      message.success('创建聊天室成功');
      createRoomVisible.value = false;
      await loadAllRooms(); // 刷新聊天室列表
    }
  } catch (error) {
    message.error('创建聊天室失败');
  }
};

const router = useRouter()
// 加入聊天室
const joinRoom = async (roomId) => {
  await router.push(`/chat/room/${roomId}`);
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 页面加载时初始化
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.chat-room-container {
  padding: 20px;
}

.create-room-container {
  margin: 20px 0;
  text-align: right;
}

.room-list {
  margin-top: 20px;
}

.room-card {
  margin-bottom: 16px;
}

.room-title {
  font-weight: bold;
  font-size: 16px;
}

.room-info {
  margin-top: 10px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
}
</style>