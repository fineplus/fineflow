<template>
  <el-switch v-model="value" :size="size || 'small'" style="width: 100%" :disabled="disabled" :active-text="placeholder"
    :inactive-text="placeholder" inline-prompt></el-switch>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { BooleanParamConfig } from "../../../engine/param-types";

const props = defineProps<{
  param: BooleanParamConfig;
  modelValue: any,
  size?: "small" | "default" | 'large',
  placeholder?: string,
  disabled?: boolean
}>();
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
