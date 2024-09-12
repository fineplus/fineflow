<template>
  <el-date-picker v-model="value" :size="size" type="datetime" placeholder="选择时间" value-format="YYYY-MM-DD HH:mm:ss"
    :default-value="new Date()" :disabled="disabled" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DatetimeParamConfig } from "../../../engine/param-types";
const props = defineProps<{ param: DatetimeParamConfig; modelValue: any, size?: "small" | "default" | 'large', disabled?: boolean }>();
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
