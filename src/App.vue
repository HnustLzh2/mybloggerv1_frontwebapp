<script setup>

</script>

<template>
  <div class="basic-container">
      <el-header class="basic-header">
        <
      </el-header>
      <el-main class="basic-main">
        Main
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
  height: 120px;
  order: 0;
  alignSelf: auto;
  flexBasis: auto;
  flexGrow: 0;
  flexShrink: 1;
  zIndex: 99
}

.basic-main {
  width: auto;
  height: 700px;
  order: 0;
  alignSelf: auto;
  flexBasis: auto;
  flexGrow: 0;
  flexShrink: 1;
  zIndex: 99
}

.basic-footer {
  width: auto;
  height: 890px;
  order: 0;
  alignSelf: auto;
  flexBasis: auto;
  flexGrow: 0;
  flexShrink: 1;
  zIndex: 99
}
</style>
