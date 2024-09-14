<script setup lang="ts">
import inputParamComp from "@/components/api-flow/components/param-input-bar/input-param/index.vue"
import { Delete, Edit, Plus } from "@element-plus/icons-vue";
import type { Node, Input, Param } from "@/components/api-flow/engine/types";
import {computed, onBeforeMount, onMounted, ref, watch} from "vue";
import { generateID } from "@/components/api-flow/common-utils";
import {useI18n} from "vue-i18n";
const t=useI18n().t
const emit = defineEmits(['update:inputs'])
const props = defineProps<{ inputs: Input[] }>()
const addDialogVisible = ref(false)


const editParam = ref<Input>({ key: "", config: { type: 'string' }, name: "" })
console.log('t(\'nodeEditor.long_text\')',t('nodeEditor.long_text'),t)
const paramConfigMap: { [key: string]: { [key: string]: Param } } = ref({
})
onBeforeMount(()=>{
  paramConfigMap.value ={
    string: {
      type: {
        name: t('nodeEditor.long_text'),
        config: {
          type: 'enum',
          config: { options: [{ name: t('nodeEditor.single_line_text'), value: 'text' }, { name: t('nodeEditor.multi_line_text'), value: 'textarea' }] }
        }
      }
    },
    integer: {},
    boolean: {},
    enum: { options: { name: t('nodeEditor.enum_options'), config: { type: 'option' } } },
    custom: { name: { name: t('nodeEditor.type_name'), config: { type: 'string' } } }
  }
})

function showEditDialog(row: Input) {
  editParam.value = row
  addDialogVisible.value = true
}


function addNewParam() {
  props.inputs.push({ key: generateID(), name: "name", config: { type: 'string', config: {} } })
}

function getEditParamConfigValue(key) {
  if (!editParam.value.config.config) {
    editParam.value.config.config = {}
  }
  return editParam.value.config.config![key]
}

function setEditParamConfigValue(key, newValue) {
  if (!editParam.value.config.config) {
    editParam.value.config.config = {}
  }
  editParam.value.config.config![key] = newValue
}

</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex-1 overflow-auto">
      <el-table :data="inputs"
        style="--el-table-header-bg-color: #32333b9e;height: 100%;--el-table-tr-bg-color:rgba(0,0,0,0)">
        <el-table-column :label="$t('words.key')" align="center" prop="key">
          <template #default="scope">
            <el-input size="small" v-model="scope.row.key" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('words.name')" align="center" prop="name">
          <template #default="scope">
            <el-input size="small" v-model="scope.row.name" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('words.type')" align="center" prop="type">
          <template #default="scope">
            <input-param-comp ctx=""
              :param="{ name: $t('words.type'), config: { type: 'enum', config: { options: ['string', 'integer', 'float', 'enum', 'boolean', 'custom', 'any'] } } }"
              @update:model-value="(newVal) => { if (!scope.row.config) { scope.row.config = {} }; scope.row.config.type = newVal }"
              :model-value="scope.row.config?.type" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('nodeEditor.actions')" align="center">
          <template #default="scope">
            <div class="flex justify-center items-center">
              <el-button size="small" :icon="Edit as any" circle @click="() => showEditDialog(scope.row)" />
              <el-popconfirm :title="$t('nodeEditor.confirm_delete')" @confirm="() => { props.inputs.splice(props.inputs.indexOf(scope.row), 1) }">
                <template #reference>
                  <el-button size="small" :icon="Delete as any" circle />
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="flex-c p-2">
      <el-button size="small" :icon="Plus as any" @click="addNewParam" />
    </div>
    <el-dialog :append-to-body="true" :title="editParam.name ? (editParam.name + '-'+$t('nodeEditor.edit_param_with_name')) : $t('nodeEditor.edit_param_with_name')"
      v-model="addDialogVisible" style="width: 27rem;border-radius: 0.75rem">
      <el-form class="mx-12 mt-2" label-position="left" label-width="70px">
        <el-form-item :label="item.name" v-for="(item, key) in paramConfigMap[editParam.config.type]">
          <input-param-comp ctx="" :param="item" :model-value="getEditParamConfigValue(key)"
            @update:model-value="(newVal) => setEditParamConfigValue(key, newVal)" />
        </el-form-item>
        <el-form-item :label="$t('nodeEditor.default_value')">
          <input-param-comp ctx="" :param="editParam" @update:model-value="(newVal) => { editParam.default = newVal }"
            :model-value="editParam.default"></input-param-comp>
        </el-form-item>
        <el-form-item :label="$t('nodeEditor.description')">
          <input-param-comp ctx="" :param="{ name: $t('nodeEditor.description'), config: { type: 'string', config: { type: 'textarea' } } }"
            @update:model-value="(newVal) => { editParam.des = newVal }" :model-value="editParam.des"></input-param-comp>
        </el-form-item>
        <el-form-item :label="$t('words.hide')">
          <input-param-comp :placeholder="$t('words.hide')" ctx="" :param="{ name: $t('words.hide'), config: { type: 'boolean', config: {  } } }"
                            @update:model-value="(newVal) => { if(!editParam.show){editParam.show={};}editParam.show.all = !newVal }" :model-value="(editParam.show!==undefined)&&editParam.show.all===false"></input-param-comp>
        </el-form-item>
        <el-form-item :label="$t('nodeEditor.hide_input')">
          <input-param-comp :placeholder="$t('nodeEditor.hide_input')" ctx="" :param="{ name: $t('nodeEditor.hide_input'), config: { type: 'boolean', config: { } } }"
                            @update:model-value="(newVal) => { if(!editParam.show){editParam.show={};}editParam.show.input = !newVal }" :model-value="(editParam.show!==undefined)&&editParam.show.input===false"></input-param-comp>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex">
          <el-button class="ml-auto" type="primary" size="small" @click="addDialogVisible = false">{{$t('words.confirm')}}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss"></style>