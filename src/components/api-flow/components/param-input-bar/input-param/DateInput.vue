<template>
  <el-date-picker v-model="value" :size="size" type="date" :placeholder="$t('words.select_date')" format="YYYY/MM/DD"
    value-format="YYYY-MM-DD" :default-value="new Date()" :disabled="disabled" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DateParamConfig } from "../../../engine/param-types";

const props = defineProps<{ param: DateParamConfig; modelValue: any, size?: "small" | "default" | 'large', disabled?: boolean }>();
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
