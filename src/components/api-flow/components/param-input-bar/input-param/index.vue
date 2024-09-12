<template>
  <component v-if="componentUser?.component" :is="componentUser?.component"
    v-bind="{ ...componentUser?.props, param: param.config, ctx }" v-model="value" :placeholder="placeholder || ''"
    style="width: 100%" :disabled="disabled"></component>
  <component :placeholder="placeholder || ''" v-else :is="
      components[param.config.type]
        ? components[param.config.type]
        : StringInput
    " :size="size" :param="param.config" style="width: 100%" v-model="value" :disabled="disabled"></component>
</template>

<script setup lang="ts">

import StringInput from "./StringInput.vue"
import { computed } from "vue";
import type { Param } from "../../../engine/param-types";
import { components } from "./components";

const props = defineProps<{ param: Param; modelValue: any; ctx: any, size?: "small" | "default" | 'large', placeholder?: string, disabled?: boolean }>();
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
const componentUser = computed(
  () => props.param?.config?.component?.inputParam
);

</script>
