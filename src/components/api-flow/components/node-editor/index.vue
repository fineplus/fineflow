<template>
  <div class="bg-red-400 h-full">
    <div class="flex h-full">
      <div v-if="leftBarVisible" class="flex flex-col min-w-[30rem] left-pane ">
        <div class="flex-1 node-param-pane overflow-auto">
          <el-tabs v-model="editorConf.param.active" class="flex flex-col h-full px-2">
            <el-tab-pane label="输入参数" name="input" class="h-full">
              <div class="h-full flex flex-col">
                <div class="h-full">
                  <div v-if="isSeverNode" class="comp-overlay"></div>
                  <input-param-config v-model:inputs="node.input" />
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="输出参数" name="output" class="h-full">
              <div class="h-full flex flex-col">
                <div class="h-full">
                  <div v-if="isSeverNode" class="comp-overlay"></div>
                  <output-param-config v-model:outputs="node.output" />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="flex-1">
          <div class="node-config-item">
            <div class="node-config-item__label ">
              节点名称
            </div>
            <div class="node-config-item__right">
              <el-input style="width: 12rem" size="small" v-model="node.name" placeholder="请输入节点名称"></el-input>
            </div>
          </div>
          <div class="flex">
            <div class="node-config-item flex-1">
              <div class="node-config-item__label ">
                节点高度
              </div>
              <div class="node-config-item__right ">
                <el-input style="width: 4rem" size="small" v-model="node.ui.height"></el-input>
              </div>
            </div>
            <div class="node-config-item flex-1">
              <div class="node-config-item__label ">
                节点宽度
              </div>
              <div class="node-config-item__right">
                <el-input style="width: 4rem" size="small" v-model="node.ui.width"></el-input>
              </div>
            </div>
          </div>
          <div class="flex">
            <div class="node-config-item flex-1">
              <div class="node-config-item__label ">
                标题背景
              </div>
              <div class="node-config-item__right flex-c">
                <el-color-picker v-model="node.ui.titleBg" show-alpha />
              </div>
            </div>
            <div class="node-config-item flex-1">
              <div class="node-config-item__label ">
                标题文本
              </div>
              <div class="node-config-item__right flex-c">
                <el-color-picker v-model="node.ui.titleColor" show-alpha />
              </div>
            </div>
          </div>
          <div class="flex">
            <div class="node-config-item flex-1">
              <div class="node-config-item__label ">
                节点背景
              </div>
              <div class="node-config-item__right flex-c">
                <el-color-picker v-model="node.ui.bg" show-alpha />
              </div>
            </div>
          </div>
          <div class="flex">
            <div class="node-config-item flex-1">
              <div class="node-config-item__label ">
                节点描述
              </div>
              <div class="node-config-item__right flex-c !px-0 m-0 flex-1">
                <el-input class="node-des" v-model="node.des" style="height:4rem;border: none;width: 100%;"
                  type="textarea"></el-input>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 min-w-[20rem] min-h-[20rem] flex flex-col p-2 pt-1" style="background: #31333c">
        <div class="shadow py-1 px-2 mb-2 flex" style="background: #3b3d45;border-radius: 0.5rem">
          <el-button size="small" @click="leftBarVisible = !leftBarVisible">{{ leftBarVisible ? '隐藏参数面版' :
            '显示参数面板' }}</el-button>

          <div class="ml-auto">
            <el-button size="small">执行</el-button>
            <el-button size="small" @click="saveNode">保存</el-button>
            <el-button size="small" @click="emits('cancel')">返回</el-button>
            <el-button size="small" @click="reloadNode">重载</el-button>
          </div>
        </div>
        <div class="font-bold text-center node-preview-title">节点预览</div>
        <div class="flex-1 node-preview-container">
          <div style="width: 100%;height: 100%">
            <div :id="containerId" style="width: 100%;height: 100%"></div>
          </div>
        </div>
      </div>
      <div :class="`${leftBarVisible ? 'flex-1' : 'flex-[2_2_0%]'} flex flex-col w-[30rem] h-full right-pane`">
        <div class="flex-1 px-2 h-full node-code-pane">
          <el-tabs v-model="editorConf.component.topPaneActive" class="flex flex-col h-full">
            <el-tab-pane label="组件" name="component" class="h-full pb-2">
              <code-editor lang="vue" placeholder="模板代码" v-model="node.ui.component"
                :default="vueDefaultCode"></code-editor>
            </el-tab-pane>
            <!-- <el-tab-pane label="模板" name="template" class="h-full pb-2">
              <code-editor lang="vue" placeholder="模板代码" v-model="node.ui.component.template"></code-editor>
            </el-tab-pane>
            <el-tab-pane label="代码" name="code" class="h-full pb-2">
              <code-editor lang="javascript" placeholder="组件代码" v-model="node.ui.component.options"></code-editor>
            </el-tab-pane>
            <el-tab-pane label="样式" name="css" class="h-full pb-2">
              <code-editor lang="css" placeholder="样式代码" v-model="node.ui.component.css"></code-editor>
            </el-tab-pane> -->
            <el-tab-pane label="函数" name="function" class="h-full pb-2">
              <func-editor v-model:function="node.func" :api-node="node" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onActivated, onBeforeMount, onMounted, provide, ref, watch } from "vue";
import { FlowEditor } from "@/components/api-flow/engine/editor";
import { copy, generateID } from "@/components/api-flow/common-utils";
import type { Node } from "@/components/api-flow/engine/types";
import { register } from "@antv/x6-vue-shape";
import { vueNodeConfig } from "@/components/api-flow/engine/config";
import VueNode from "@/components/api-flow/components/vue-node/vue-node.vue";
import CodeEditor from "@/components/api-flow/components/node-editor/components/code-editor.vue";
import { Delete, Edit, Plus } from "@element-plus/icons-vue";
import InputParamConfig
  from "@/components/api-flow/components/node-editor/components/node-param-config/input-param-config.vue";
import OutputParamConfig
  from "@/components/api-flow/components/node-editor/components/node-param-config/output-param-config.vue";
import FuncEditor from "@/components/api-flow/components/node-editor/components/func-editor.vue";
import { makeDefaultNode } from "@/components/api-flow/engine/utils";
import { vueDefaultCode } from "./components/config"
//@ts-ignore
register({
  ...vueNodeConfig,
  component: VueNode,
})
const emits = defineEmits(['update:node', 'cancel'])
const nodeParentKey = ref('')
const nodeListManagerVisible = ref(false)
const leftBarVisible = ref(true)
const editorConf = ref({
  component: {
    topPaneVisible: true,
    topPaneActive: 'component',//component template and css and javascript
    bottomPaneVisible: true,
  },
  param: {
    active: 'input',//input output
  }
})


const containerId = ref('node-editor-preview' + generateID())
const node = ref<Node>(makeDefaultNode())

const isSeverNode = computed(() => node.value.serverKey)
onBeforeMount(() => {
  containerId.value = 'node-editor-preview-' + generateID()
})
let editor: FlowEditor
const reloadNode = () => {
  setTimeout(() => {
    try {
      editor?.render.graph.removeNode(node.value.id)
    } catch (e) {
      console.warn(e)
    }
    editor?.addNode(node.value)
    editor?.render.graph.centerContent()
  }, 100)

}

function intoNodeEdit({ node, parentKey }) {
  setNode(node)
  nodeParentKey.value = parentKey
  nodeListManagerVisible.value = false
}


function saveNode() {
  emits('update:node', { ...node.value, preview: undefined })
}


onMounted(() => {
  if (!node.value.func) {
    node.value.func = { code: "", lang: "python" }
  }
  setTimeout(() => {
    editor = new FlowEditor(containerId.value)
  }, 100)


})
provide('flowStorePreview', () => editor?.store)

function setNode(newNode: Node) {

  setTimeout(() => {
    editor?.render.graph.clearCells()
    node.value = copy(newNode)
    if (!node.value.func) {
      node.value.func = { lang: 'python', code: '' }
    }
    node.value.preview = true

    editor?.addNode(node.value)
    editor?.render.graph.centerContent()
  }, 100)

}

defineExpose({ setNode })
</script>
<style scoped lang="scss">
.node-preview-container {
  overflow: hidden;
  background: #31333c radial-gradient(circle, #c1c1c1 0.5px, transparent 0.5px);
  background-size: 10px 10px;
  border: 1px solid rgba(117, 117, 117, 0.41);
}

.left-pane {
  background: rgb(33 34 38);
  border-right: 1px solid rgba(134, 134, 134, 0.74)
}

.right-pane {
  background: rgb(25 27 37);
  border-left: 1px solid rgba(134, 134, 134, 0.74)
}

.node-param-pane {
  border-bottom: 1px solid rgb(93 93 93 / 40%)
}

.node-preview-title {
  background: #3f424e;
  color: #adbad1;
  border-radius: 0.25rem 0.25rem 0 0;
}

.node-config-item {
  background: #2a2b32;
  border-radius: 0.25rem;
  @apply m-2 flex flex-row shadow;
}

.node-config-item__label {
  font-size: 0.9rem;
  border-right: 2px solid #3b3f42;
  @apply px-4 py-2 font-bold opacity-80 flex-c;
}

.node-config-item__right {
  @apply flex-c px-2;
}
</style>
<style>
.comp-overlay {
  z-index: 100;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgb(33 34 38 / 40%);
  /* 半透明黑色遮罩 */
}

.node-code-pane .el-tabs__content {
  @apply flex-1 overflow-auto
}


.node-param-pane .el-tabs__content {
  @apply h-full
}

.node-param-pane .el-table .el-table__cell {
  padding: 4px 0;
  font-size: 13px;
}

.left-drawer {
  width: 20rem !important;
}

.node-des textarea {
  resize: none;
  height: 100%;
  resize: none;
  outline: none;
  padding: 0.5rem;
  box-shadow: none;
  margin: 0;
  border: 2px solid #2e2f36;
  background: #26272d;
  border-left: none;
  border-radius: 0 0.25rem 0.25rem 0;
}
</style>
