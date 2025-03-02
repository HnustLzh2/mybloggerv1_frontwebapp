<script setup>
import Navigation from "@/components/Navigation.vue";
</script>

<template>
  <div class="basic-container">
      <el-header class="basic-header">
        <Navigation/>
      </el-header>
      <el-main class="basic-main">
        <router-view/>
      </el-main>
      <el-footer class="basic-footer">
        footer
      </el-footer>
  </div>
</template>

<style>
.basic-container {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: stretch;
  align-content: stretch;
  gap: 5px
}

.basic-header {
  width: auto;
  height: auto;
  order: 0;
}

.basic-main {
  width: auto;
  height: 700px;
  order: 0;
}

.basic-footer {
  width: auto;
  height: 890px;
  order: 0;
}
</style>
