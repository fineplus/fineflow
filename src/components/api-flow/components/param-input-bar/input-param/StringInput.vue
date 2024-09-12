<template>
  <el-input v-model="value" :size="size || 'small'" :type="param.config?.type || 'text'" :placeholder="placeholder || ''"
    :disabled="disabled" />
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import type { StringParamConfig } from "../../../engine/param-types";

const props = defineProps<{
  param: StringParamConfig;
  modelValue: any,
  size?: "small" | "default" | 'large',
  placeholder?: string,
  disabled?: boolean
}>();
onMounted(() => {
  // console.log('param.config?.type', props.param.config?.type)
})
const emit = defineEmits(["update:modelValue", "change"]);
const value = computed({
  get() {
    return props.modelValue;
  },
  set(newVal) {
    emit("update:modelValue", newVal);
    emit("change", newVal);
  }
});
</script>
