<script setup>
import {ref, onMounted} from "vue";
import BasicLayout from "@/layout/BasicLayout.vue";
import {userAuthStore} from "@/store/auth.js";
onMounted(() => {
  const userAuth = userAuthStore()
})
</script>

<template>
  <div id="app">
    <BasicLayout />
  </div>
</template>

<style>
</style>
