<template>
  <el-input type="textarea" v-model="value" :size="size || 'small'" style="width: 100%" :disabled="disabled"
    :placeholder="placeholder || ''" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { TextParamConfig } from "../../../engine/param-types";
const props = defineProps<{ param: TextParamConfig; modelValue: any, size?: "small" | "default" | 'large', placeholder?: string, disabled?: boolean }>();
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
