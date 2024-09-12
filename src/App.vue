<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import {onBeforeMount, onMounted, ref} from "vue";
// import AceCodeEditor from "@/components/api-flow/components/node-editor/components/ace-code-editor.vue";

onBeforeMount(async () => {
})
const code = ref('')
</script>
<template>
  <!--  <ace-code-editor lang="html" v-model="code" placeholder=""></ace-code-editor>-->
  <RouterView />
</template>

<style  lang="scss">
html.dark {
  --el-table-tr-bg-color: rgba(0, 0, 0, 0) !important;
}

.el-switch--small .el-switch__core .el-switch__inner {
  height: 12px !important;
  padding: 0 8px 0 calc(14px + 2px) !important;
}

.el-switch--small.is-checked .el-switch__core .el-switch__inner {
  padding: 0 18px 0 6px !important;
}

// 框选框颜色
.x6-widget-selection-rubberband {
  background-color: #484b72;
  border: 2px solid #6265c6;
}
</style>
