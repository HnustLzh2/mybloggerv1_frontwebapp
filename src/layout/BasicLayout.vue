<script setup>

import GlobalHeader from "@/components/GlobalHeader.vue";
</script>

<template>
  <div id="basicLayout">
    <a-layout>
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://github.com/HnustLzh2?tab=repositories" target="_blank">
          廖神的仓库，点个👍，🙏
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<style scoped>
#basicLayout {
  background: #fff;
}
#basicLayout .footer {
  background: #efefef;
  text-align: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
}

#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #fff);
  padding-bottom: 100px;
}

#basicLayout .header {
  background: white;
  color: unset;
  padding-inline: 20px;
}
</style>