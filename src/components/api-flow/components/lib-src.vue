<template>

</template>
<script setup lang="ts">
import {onBeforeMount, onMounted} from "vue";
import {loadCDN} from "@/components/api-flow/engine/fine-tools";

const props = defineProps<{ src: string, type: 'script' | 'css', name: string }>()
onBeforeMount(async () => {
  if (props.type == 'script') {
    await loadCDN(props.src, props.name)
  }
})
//加载外部资源的组件
</script>
