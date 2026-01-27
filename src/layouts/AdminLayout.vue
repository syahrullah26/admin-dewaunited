<script setup lang="ts">
import AdminSidebar from '@/components/AdminSidebar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <AdminSidebar />

    <!-- CONTENT -->
    <div
      class="pt-20 lg:pt-6 transition-all duration-300
             lg:ml-64"
    >
      <RouterView />
    </div>
  </div>
</template>
