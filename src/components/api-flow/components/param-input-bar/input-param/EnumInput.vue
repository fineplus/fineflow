<template>
  <el-select v-model="value" filterable :size="size || 'small'" clearable :placeholder="placeholder || ' '"
    :disabled="disabled">
    <el-option v-for="item in options" :value="item.value" :key="item.name" :label="item.name"></el-option>
  </el-select>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { EnumParamConfig } from "../../../engine/param-types";
const props = defineProps<{ param: EnumParamConfig; modelValue: any, size?: "small" | "default" | 'large', placeholder?: string, disabled?: boolean }>();
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
const options = computed(() => {
  const options = props.param.config?.options;
  if (options instanceof Array && options.length) {
    if (typeof options[0] === "object") {
      return options;
    } else {
      return options.map((item: any) => {
        return { name: item, value: item };
      });
    }
  }
  return [];
});
</script>
