<template>
  <el-input-number :controls="false" v-model="value" :size="size || 'small'" :placeholder="placeholder || ''"
    :disabled="disabled" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { IntegerParamConfig } from "../../../engine/param-types";
const props = defineProps<{ param: IntegerParamConfig; modelValue: any, size?: "small" | "default" | 'large', placeholder?: string, disabled?: boolean }>();
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
