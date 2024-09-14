<template>
  <div>

    <el-card class="param-card">
      <template #header>
        <div class="card-header">
          <span>{{$t('words.param_configuration')}}</span>
          <!-- <el-tooltip v-if="node.des" placement="top-start" effect="light">
            <template #content> {{ node.des }}</template>
            <svg style="display: inline-block;
    height: 0.9rem;
    margin-top: -3px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-width="2"
                d="M15 17c0-3 4-5 4-9s-3-7-7-7s-7 3-7 7s4 6 4 9v3c0 2 1 3 3 3s3-1 3-3zm-6 1h6" />
            </svg>
          </el-tooltip> -->
        </div>
      </template>
      <div class="flex-c mt-6 opacity-60" v-if="!node.input || node.input?.length == 0">
        {{$t('words.none')}}
      </div>
      <div v-for="param in node.input">
        <div class="param-label">
          <div>{{ param.name }}</div>
          <div class="ml-auto flex flex-row gap-2">
            <el-switch :model-value="!(param.show?.all !== false)" @change="(val) => { changeVisible(param, val) }"
              :size="'small'" style="width: 100%" :active-text="$t('words.hide')" :inactive-text="$t('words.hide')" inline-prompt></el-switch>
            <el-switch :model-value="!(param.show?.input !== false)"
              @change="(val) => { if (!param.show) { param.show = {} }; param.show.input = !val }" :size="'small'"
              style="width: 100%" :active-text="$t('words.hide_input')" :inactive-text="$t('words.hide_input')" inline-prompt></el-switch>
          </div>
        </div>
        <div>
          <input-param v-if="!param.useServer" :param="param" :model-value="inValueMap[param.key]"
            @update:model-value="(newVal) => { inValueMap[param.key] = newVal }" ctx="" />
          <div v-else class="opacity-50">{{ $t('words.server_param') }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import type { Node, NodeInValueMap } from "@/components/api-flow/engine/types";
import InputParam from "@/components/api-flow/components/param-input-bar/input-param/index.vue";
import { InfoFilled } from "@element-plus/icons-vue";
const emit = defineEmits<{
  changeVisible: [value: { portKey: string, visible: boolean }],
}>()
const props = defineProps<{ node: Node, inValueMap: NodeInValueMap }>()
const changeVisible = (param, val: boolean) => {
  if (!param.show) { param.show = {} }; param.show.all = !val
  emit('changeVisible', { portKey: param.key, visible: !val })
}
</script>
<style lang="css">
.param-card .el-card__body {
  margin-top: 0;
  padding-top: 0;
}

.param-card {
  background-color: #1f2028 !important;
  border: 1px solid #101d2900 !important;
  box-shadow: 0px 12px 32px 4px rgb(255 255 255 / 0%), 0px 1px 10px rgb(0 0 0 / 36%) !important;
}

/* .param-card .el-switch--small .el-switch__core .el-switch__inner {
  height: 12px;
  padding: 0 8px 0 calc(14px + 2px);
}

.param-card .el-switch--small.is-checked .el-switch__core .el-switch__inner {
  padding: 0 18px 0 6px;
} */

.node-des-card {
  border-radius: 0.25rem;
  background: #2a2b36;
  margin-bottom: 0.75rem;
  box-shadow: 0px 12px 32px 4px rgb(255 255 255 / 0%), 0px 1px 10px rgb(0 0 0 / 36%) !important;
}

.node-des-text {
  padding: 10px 20px;
  padding-bottom: 10px;
  color: #a2a2bc;
  font-size: 0.9rem;
}
</style>
<style scoped lang="scss">
.param-label {
  font-size: 0.9rem;
  margin: 0.5rem 0;
  display: flex;
  flex-direction: row;
}

.input-item {
  box-shadow: 0px 2px 5px 0px #000000;
  border: 1px solid #36363600;
  border-radius: 0.4rem;
  background: #232327;
  overflow: hidden;
}

.input-item__title {
  background: #3b3b42;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  opacity: 0.8;
  font-weight: bold;
}
</style>