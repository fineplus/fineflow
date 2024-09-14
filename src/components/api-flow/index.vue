<template>
  <div class="api-flow flex flex-row overflow-hidden">
    <el-drawer class="flow-select-drawer" v-model="flowSelectVisible" direction="ltr">
      <flow-select ref="flowSelectRef" @update:flow="updateFlow" @open-flow="setFlow"/>
    </el-drawer>
    <div>
      <node-select @node-drag-end="onNodeDropIn"/>
    </div>
    <el-drawer v-model="inputParamConfigDrawerVisible" :title="inputParamConfigNode?.name" direction="rtl"
               @close="updateNode">
      <param-input-bar
          @change-visible="({ portKey, visible }) => changeNodePortVisible(inputParamConfigNode.id, portKey, visible)"
          v-if="inputParamConfigNode" :node="inputParamConfigNode" :in-value-map="inputValueMap"/>
    </el-drawer>
    <div class="flex-1 flow-box overflow-auto">
      <div class="justify-center flex">
        <div class="top-tool absolute z-10 flex flex-col justify-center items-center">
          <div class="top-tool-buttons p-2 flex justify-center items-center">
            <div class="mx-2 flex gap-2">
              <el-button :icon="FolderOpened as any" size="small" color="#3b3948" type="primary" :dark='true'
                         @click="showFlowList">{{ $t('words.flow') }}
              </el-button>
              <el-button :icon="FolderOpened as any" size="small" color="#3b3948" type="primary" :dark='true'
                         @click="loadFlowFromFile">{{ $t('words.load') }}
              </el-button>
              <el-button :icon="DocumentChecked as any" size="small" color="#3b3948" type="primary" :dark='true'
                         @click="saveFlow">{{ $t('words.save') }}
              </el-button>
              <el-button :icon="FolderChecked as any" size="small" color="#3b3948" type="primary" :dark='true'
                         @click="saveFlowToJson">{{ $t('words.save_as') }}
              </el-button>
              <div class="mx-2" style="width: 2px;background: rgba(116,116,116,0.41)">&nbsp;</div>

              <div v-if="flowEditorInited" class="flex">
                <el-button size="small" :dark='true' @click="stopFlow" v-if="flowEditor?.store?.flowRunning?.value">
                  <el-icon style="color: red;font-size: 1rem;" class="relative -left-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                      <path fill="currentColor"
                            d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5"/>
                    </svg>
                  </el-icon>
                  {{ $t('words.stop') }}
                </el-button>
                <el-button size="small" :dark='true' @click="runFlow" v-else>
                  <el-icon style="color: #7eee7e;font-size: 1rem;" class="relative -left-1">
                    <CaretRight/>
                  </el-icon>
                  {{ $t('words.run') }}
                </el-button>
                <!-- <el-switch v-model="loop" :size="'small'" class="mx-2" style="width: 100%" active-text="循环"
                  inactive-text="循环" inline-prompt></el-switch> -->
              </div>

              <!--              <VideoPlay class="w-6 text-green-500"/>-->
              <!--              <VideoPause class="w-6 text-red-400"/>-->
            </div>
          </div>
        </div>
      </div>

      <div style="width: 100%;height: 100%;overflow: hidden;" @dragenter.prevent @dragover.prevent>
        <div id="api-flow-container"></div>
      </div>
      <teleport-container/>
      <div class="absolute rounded overflow-hidden shadow-xl float-menu" v-if="floatMenu.visible"
           :style="{ top: floatMenu.top, left: floatMenu.left }">
        <div v-if="floatMenu.type === 'edge'">
          <div>
            {{ $t('words.edge_menu') }}
          </div>
          <div v-if="!floatMenu.disable" @click="() => setEdgeMode(floatMenu.cellId, 'normal')"
               :style="(floatMenu.mode == 'normal' || !floatMenu.mode) ? { color: '#b2b1ff' } : {}">
            {{ $t('words.normal_edge') }}
          </div>
          <div v-if="!floatMenu.disable" @click="() => setEdgeMode(floatMenu.cellId, 'onlySync')"
               :style="(floatMenu.mode == 'onlySync') ? { color: '#b2b1ff' } : {}">
            {{ $t('words.sync_edge') }}
          </div>
          <div v-if="!floatMenu.disable" @click="() => setEdgeMode(floatMenu.cellId, 'useAfterRun')"
               :style="(floatMenu.mode == 'useAfterRun') ? { color: '#b2b1ff' } : {}">
            {{ $t('words.jump_edge') }}
          </div>
          <!-- <div v-if="!floatMenu.disable && !floatMenu.onlySync" @click="() => setEdgeOnlySync(floatMenu.cellId, true)">仅同步
          </div>
          <div v-if="!floatMenu.disable && floatMenu.onlySync" @click="() => setEdgeOnlySync(floatMenu.cellId, false)">
            关闭仅同步</div> -->
          <div v-if="floatMenu.disable" @click="() => setEdgeDisable(floatMenu.cellId, false)">
            {{ $t('words.enable') }}
          </div>
          <div v-else @click="() => setEdgeDisable(floatMenu.cellId, true)">{{ $t('words.disable') }}</div>
          <div @click="removeEdge">
            {{ $t('words.delete') }}
          </div>
          <div @click="floatMenu.visible = false">{{ $t('words.cancel') }}
          </div>
        </div>
        <div v-if="floatMenu.type === 'node'">
          <div>
            {{ $t('words.node_menu') }}
          </div>
          <div @click="runNodeSelf">{{ $t('words.run_self') }}
          </div>
          <div @click="runStartAtNode">{{ $t('words.start_process') }}
          </div>
          <div @click="showNodeEdit">{{ $t('words.edit') }}
          </div>
          <div @click="removeNode">{{ $t('words.delete') }}
          </div>
          <div @click="floatMenu.visible = false">{{ $t('words.cancel') }}
          </div>
        </div>
        <div v-if="floatMenu.type === 'server_node'">
          <div>
            {{ $t('words.node_menu') }}
          </div>
          <div @click="runNodeSelf">{{ $t('words.run_self') }}
          </div>
          <div @click="runStartAtNode">{{ $t('words.start_process') }}
          </div>
          <div @click="showNodeEdit">{{ $t('words.edit') }}
          </div>
          <div @click="removeNode">{{ $t('words.delete') }}
          </div>
          <div @click="floatMenu.visible = false">{{ $t('words.cancel') }}
          </div>
        </div>
      </div>
    </div>
    <el-dialog :append-to-body="true" class="node-editor-dialog" v-model="nodeEditVisible"
               style="width: 100%;height: 100%;margin: 0;padding: 0">
      <node-editor :key="nodeEditorKey" ref="nodeEditor" :node="tempEditNode" @update:node="nodeUpdate"
                   @cancel="nodeEditVisible = false"></node-editor>
    </el-dialog>
    <!--    <el-dialog v-model="flowSelectVisible">-->
    <!--      <flow-select/>-->
    <!--    </el-dialog>-->
    <transition name="fade" mode="out-in">
      <div class="absolute port-tooltip" ref="portToolTipRef"
           :style="{ left: portToolTip.x + 'px', top: portToolTip.y + 'px', transform: portToolTip.type == 'in' ? 'translate(calc(-100% - 1rem), -2rem)' : 'translate(1rem, -2rem)' }"
           v-if="portToolTip.visible && portToolTip.enable">
        <div class="port-tooltip__title">{{ portToolTip.name }}</div>
        <div style="padding: 0.5rem;">
          <div class="mb-1"><span class="port-tooltip__type">{{ $t('portTooltip.key') }}:</span><span>{{
              portToolTip.key
            }}</span></div>
          <div class="mb-1"><span
              class="port-tooltip__type">{{ $t('portTooltip.type') }}:</span><span>{{ portToolTip.valueType }}</span>
          </div>
          <div class="mb-1" v-if="portToolTip.useServer"><span
              class="port-tooltip__type">{{ $t('portTooltip.server_param') }}:</span><span>{{
              $t('portTooltip.true')
            }}</span>
          </div>
          <div v-if="portToolTip.content"><span
              class="port-tooltip__type">{{ $t('portTooltip.description') }}:</span><span>{{
              portToolTip.content
            }}</span></div>
          <div v-if="portToolTip.showValue!==null"><span
              class="port-tooltip__type">当前:</span><span>{{
              portToolTip.showValue
            }}</span></div>
        </div>
      </div>
    </transition>
    <div class="flow-name absolute right-0 bottom-0">
      {{ flowTemp.name || $t('words.unsaved_flow') }}
    </div>
  </div>
</template>
<script setup lang="ts">
import {nextTick, onMounted, provide, reactive, ref} from "vue";
import {FlowEditor} from "@/components/api-flow/engine/editor";
import {DocumentChecked, FolderOpened, CaretRight, FolderChecked} from "@element-plus/icons-vue";
import {getTeleport, register} from "@antv/x6-vue-shape";
import VueNode from "@/components/api-flow/components/vue-node/vue-node.vue";
import {
  edgeDisableColor,
  edgeModeColorMap,
  edgeNormalColor,
  edgeOnlySyncColor,
  editNode,
  vueNodeConfig
} from "@/components/api-flow/engine/config";
import type {Flow, Node} from "@/components/api-flow/engine/types";
import ParamInputBar from "@/components/api-flow/components/param-input-bar/index.vue";
import type {Edge as X6Edge, Node as X6Node} from "@antv/x6"
import NodeEditor from "@/components/api-flow/components/node-editor/index.vue"
import type {NodeInValueMap} from "@/components/api-flow/engine/types";
import NodeSelect from "@/components/api-flow/components/node-select/index.vue"
import FlowSelect from "@/components/api-flow/components/flow-select/index.vue"
import {copy, generateID, loadJsonFile, saveJsonToFile} from "@/components/api-flow/common-utils";
import {makePortId, parsePortId, sleep} from "@/components/api-flow/engine/utils";
import {ElMessage} from "element-plus";
import {useI18n} from 'vue-i18n';
import {locales} from "@/locale";

const t = useI18n()
provide('flowStore', () => flowEditor?.store)
const nodeEditVisible = ref(false)
const inputParamConfigDrawerVisible = ref(false)
const inputParamConfigNode = ref<Node | null>(null)
const inputValueMap = ref<NodeInValueMap>({})
const tempEditNode = ref<Node | null>(null)
const flowSelectVisible = ref(false)
const flowSelectRef = ref()
const floatMenu = ref({
  type: 'edge',
  disable: false,
  cellId: '',
  top: '0px',
  left: '0px',
  visible: false,
  onlySync: false,
  mode: null
})
const loop = ref(false)

const portToolTip = ref({
  x: 0,
  y: 0,
  content: '',
  visible: true,
  type: 'in',
  name: '',
  key: "",
  valueType: '',
  useServer: false,
  enable: true,
  showValue: null
})
const portToolTipRef = ref()
let flowEditor: FlowEditor
//@ts-ignore
register({
  ...vueNodeConfig,
  component: VueNode,
})
const nodeEditorKey = ref('nodeEditorKey' + generateID())
const flowTemp = ref<Flow>({key: '', name: '', nodes: [], edges: []})
const nodeEditor = ref()
const TeleportContainer = getTeleport()
const flowEditorInited = ref(false)


function setFlow({flow}: { flow: Flow }) {
  flowTemp.value = flow
  flowEditor.loadFromJson(flow)
  flowSelectVisible.value = false
}

async function runFlow() {

  if (loop.value) {
    await flowEditor?.runFlowLoopBySignal((nodeId) => {
    })
  } else {
    await flowEditor?.runFlowBySignal((nodeId) => {
    })
  }

}

function runStartAtNode() {
  flowEditor?.runStartAtNode(floatMenu.value.cellId, (nodeId) => {
  })
}

function runNodeSelf() {
  flowEditor?.runNodeSelf(floatMenu.value.cellId, (nodeId) => {
  })
}

function stopFlow() {
  flowEditor?.runner?.stop()
}

function showFlowList() {
  flowSelectVisible.value = true
}

function removeEdge() {
  flowEditor.removeEdge(floatMenu.value.cellId);
  floatMenu.value.type = '';
  floatMenu.value.visible = false;
}

function nodeUpdate(node: Node) {
  const connectedEdges = flowEditor.store.flow.edges.filter(edge => edge.source.node == node.id || edge.target.node == node.id)
  flowEditor.removeNode(node.id!)
  flowEditor.addNode(node)
  connectedEdges.forEach(edge => {
    if (edge.source.node == node.id) {
      if (node.output?.find(item => item.key == edge.source.port || edge.source.port == 'NODE_OUT')) {
        flowEditor.addEdge(edge)
      }
    } else if (edge.target.node == node.id) {
      if (node.input?.find(item => item.key == edge.target.port || edge.target.port == 'NODE_IN')) {
        flowEditor.addEdge(edge)
      }
    }

  })
  nodeEditVisible.value = false
}

function removeNode() {
  flowEditor.removeNode(floatMenu.value.cellId);
  floatMenu.value.type = '';
  floatMenu.value.visible = false;
}


function updateNode() {
  const id = inputParamConfigNode.value?.id
  id && flowEditor?.updateNode(id)
}

function showNodeEdit() {
  floatMenu.value.type = '';
  floatMenu.value.visible = false;
  nodeEditorKey.value = 'nodeEditorKey' + generateID()
  nodeEditVisible.value = true
  nextTick(() => {
    nodeEditor.value.setNode(tempEditNode.value)
  })
}

function addNode(node: Node) {
  flowEditor?.addNode(node)
}

function saveFlow() {
  const newData = flowEditor.saveToJson()
  newData.key = flowTemp.value.key
  newData.name = flowTemp.value.name
  if (newData.key) {
    flowSelectRef.value.flowUpdate(newData)
  } else {
    flowSelectVisible.value = true
    nextTick(() => {
      setTimeout(() => {
        flowSelectRef.value.showNewEditFlowAdd(newData)
      }, 400)
    })

  }
}

function saveFlowToJson() {
  const data = flowEditor.saveToJson()
  saveJsonToFile(data, data.name)
}

function updateFlow({name, key}) {
  flowTemp.value.key = key
  flowTemp.value.name = name
  flowEditor.store.flow.key = key
  flowEditor.store.flow.name = name
  flowSelectVisible.value = false
}

function loadFlow() {
  const flowCache = window.localStorage.getItem('flow')
  if (flowCache) {
    flowEditor.loadFromJson(JSON.parse(flowCache))
  }
}

function loadFlowFromFile() {
  loadJsonFile().then(res => {
    if (res) {
      flowEditor.loadFromJson(res)
      flowTemp.value.key = null
      flowTemp.value.name = null
    } else {
      ElMessage.warning(t('loadFlowFromFile.error'))
    }
  })
}

function changeNodePortVisible(nodeId: string, portKey: string, visible: boolean) {
  const fineNode = flowEditor.store.fineNodeMap[nodeId]
  const portId = makePortId(nodeId, 'in', portKey)
  const x6Node = fineNode.$x6Node
  const hasPort = x6Node.hasPort(portId)
  //显示并有端口则不处理
  if (visible) {
    if (!hasPort) {
      x6Node.addPort({id: portId, group: 'in'})
    }
  } else {
    if (hasPort) {
      const connectedEdge = flowEditor.store.flow.edges.find(item => item.target.node == nodeId && item.target.port == portKey)
      if (connectedEdge) {
        flowEditor.removeEdge(connectedEdge.id)
      }
      x6Node.removePort(portId)
    }
  }


}

function onNodeDropIn({node, e}: { node: Node, e: MouseEvent }) {
  //等待画布获取鼠标位置
  const {x, y} = flowEditor?.render.graph.pageToLocal(e.x, e.y)
  addNode({...node, ui: {...node.ui, x: x - 20, y: y - 15}})

}

function setEdgeDisable(edgeId: string, value: boolean) {
  const edge = flowEditor.store.edgeMap[edgeId]
  if (!edge.states) {
    edge.states = reactive({})
  }
  edge.states.disable = value
  const mode = edge.states?.mode || 'normal'
  const edgeEnableColor = edgeModeColorMap[mode]
  flowEditor.render.graph.getCellById(edgeId)?.setAttrs({line: {stroke: value ? edgeDisableColor : edgeEnableColor}})
}

function setEdgeMode(edgeId: string, mode?: "onlySync" | "normal" | "useAfterRun") {
  const edge = flowEditor.store.edgeMap[edgeId]
  if (!edge.states) {
    edge.states = reactive({})
  }
  edge.states.mode = mode || "normal"
  const edgeEnableColor = edgeModeColorMap[edge.states.mode]
  const edgeItem = flowEditor.render.graph.getCellById(edgeId)
  console.log(edgeItem, "edgeItem")
  edgeItem?.setAttrs({line: {stroke: edgeEnableColor, targetMarker: mode == 'useAfterRun' ? "block" : ""}})
}

function setEdgeOnlySync(edgeId: string, value: boolean) {
  const edge = flowEditor.store.edgeMap[edgeId]
  if (!edge.states) {
    edge.states = reactive({})
  }
  edge.states.mode = value ? "onlySync" : 'normal'
  const edgeEnableColor = edgeModeColorMap[edge.states.mode]
  flowEditor.render.graph.getCellById(edgeId)?.setAttrs({line: {stroke: edgeEnableColor}})
}

onMounted(async () => {
  flowEditor = new FlowEditor('api-flow-container')
  flowEditorInited.value = true
  flowEditor.render.graph.on('node:dblclick', ({node, e}: { node: X6Node, e: any }) => {
    if (!(e.target.getAttribute('sign') == 'node-clicked')) {
      return false
    }
    // @ts-ignore
    inputParamConfigNode.value = node.store.data.store.getNodeConf()
    inputValueMap.value = flowEditor.store.fineNodeMap[node.id].store.userInputs
    // console.log('inputValueMap.value', inputValueMap.value)
    inputParamConfigDrawerVisible.value = true
  })
  flowEditor.render.graph.on('node:contextmenu', ({e, node}: { node: X6Node, e: any }) => {
    // @ts-ignore
    let nodeConf = node.store.data.store.getNodeConf()
    //服务端节点不能编辑
    if (nodeConf.serverKey) {
      floatMenu.value.type = 'server_node'
    } else {
      floatMenu.value.type = 'node'
    }
    tempEditNode.value = nodeConf
    floatMenu.value.cellId = node.id
    floatMenu.value.left = e.pageX + 'px'
    floatMenu.value.top = e.pageY + 'px'
    floatMenu.value.visible = true
  })

  flowEditor.render.graph.on('edge:contextmenu', ({e, edge}: { edge: X6Edge, e: any }) => {
    // @ts-ignore
    floatMenu.value.type = 'edge'
    floatMenu.value.cellId = edge.id
    floatMenu.value.left = e.pageX + 'px'
    floatMenu.value.top = e.pageY + 'px'
    floatMenu.value.visible = true
    floatMenu.value.disable = flowEditor.store.edgeMap[edge.id].states?.disable
    floatMenu.value.mode = flowEditor.store.edgeMap[edge.id].states?.mode
  })

  flowEditor.render.graph.on('blank:click', () => {

    floatMenu.value.visible = false
    floatMenu.value.type = ""
  })


  flowEditor.render.graph.on('node:port:mouseenter', ({e, cell, view, node, port}) => {
    // console.log(port)
    // @ts-ignore
    let nodeConf: Node = node.store.data.store.getNodeConf()
    // @ts-ignore
    const portInfo = parsePortId(port!)
    //专用端口暂时没有信息写
    if (portInfo.portKey == "NODE_IN" || portInfo.portKey == "NODE_OUT") {
      return
    }
    const portFind = nodeConf[{
      in: 'input',
      out: 'output'
    }[portInfo.portType]].find(item => item.key == portInfo.portKey)
    const des = portFind?.des
    const name = portFind.name
    const valueType = portFind.config?.type
    portToolTip.value.content = des || ''
    portToolTip.value.type = portInfo.portType
    portToolTip.value.key = portInfo.portKey
    portToolTip.value.useServer = portFind.useServer
    portToolTip.value.valueType = valueType || ''
    portToolTip.value.name = name || ''
    portToolTip.value.x = e.pageX
    portToolTip.value.y = e.pageY
    portToolTip.value.showValue = null
    if (e.ctrlKey) {
      let content = null
      if (portInfo.portType == 'out') {
        content = node.fineNode?.store.outputs[portInfo.portKey]
      }
      if (portInfo.portType == 'in') {
        content = node.fineNode?.inputs.value[portInfo.portKey]
      }
      if (typeof content !== 'string') {
        content = JSON.stringify(content) + ''
      }

      portToolTip.value.showValue = content.length > 100 ? content.slice(0, 100) + '...' : content
    }
    portToolTip.value.visible = true

  })

  flowEditor.render.graph.on('node:port:mouseleave', (args) => {
    portToolTip.value.visible = false
    portToolTip.value.content = ''
  })

  // flowEditor.render.graph.getConnectedEdges()

  window.addEventListener('click', () => {
    floatMenu.value.visible = false
  })
  window.addEventListener('mousedown', (e) => {
    portToolTip.value.visible = false
  }, true)

  window.addEventListener('mouseup', () => {
    portToolTip.value.enable = false
    setTimeout(() => {
      portToolTip.value.enable = true
    }, 1000)
  }, true)
})
</script>

<style>
@import "./css-vars.css";

/* 全局样式 */
html.dark {
  --el-bg-color: #18191e;
  --el-color-primary-dark-2: #514d9a;
  --el-color-primary: #605cb9;
  --el-color-primary-light-3: #736ee0;
  --el-color-primary-light-9: #2b2b3c8c;
  --el-color-primary-light-7: #40386d;
}
</style>
<style scoped lang="scss">
.port-tooltip {
  width: 10rem;
  word-break: break-all;
  background: #3c3c48;
  //padding: 0.6rem;
  border: 1px solid #3a3e49;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  box-shadow: 1px 1px 3px 1px rgba(13, 13, 13, 0.2784313725);
  color: #e3e3e3;
  overflow: hidden;
}

.port-tooltip__title {
  color: #cecede;
  border-radius: 0.5rem 0 0;
  overflow: hidden;
  font-weight: bolder;
  padding: 0.2rem 0.5rem;
  background: #2a2a33;
}

.port-tooltip__type {
  color: #f6f6f6;
  font-weight: bold;
  margin-right: 0.2rem;
}

.api-flow {
  background: #31333c radial-gradient(circle, #c1c1c185 0.5px, transparent 0.5px);
  //background: #484e59 radial-gradient(circle, #c1c1c1 0.5px, transparent 0.5px);
  background-size: 10px 10px;
  height: 100%;
}

.top-tool-buttons {
  box-shadow: 1px 2px 2px 1px #0c0c0c78;
  background: rgb(42 42 51 / 84%);
  border-radius: 0.25rem;
  margin-top: 1px;
}

.top-tool {
  width: fit-content;
  margin: auto;
  //left: 0;
  //right: 0;
}

.float-menu {
  background: #383746;
  border: 2px solid rgb(112 104 104 / 19%);

  //每个第一级div下的第一个div是标题
  div > div:first-of-type {
    font-size: 0.8rem;
    min-width: 8rem;
    background: #272733;
    color: rgb(206 207 222 / 86%);
    @apply px-3 py-1 font-bold select-none;
  }

  //每个第一级div下的除了第一个div的div是选项
  div > div:not(:first-child) {
    font-size: 0.8rem;
    color: #c6c6d1;
    opacity: 0.9;
    cursor: pointer;
    @apply px-3 py-1 font-bold;

    &:hover {
      background: #4c4b60;
      color: white;
    }
  }

  //每个第一级div下的除了第一个div和最后一个div的div都有下边框
  div > div:not(:first-child):not(:last-child) {
    border-bottom: 1px solid rgba(125, 122, 122, 0.36);
  }
}


#api-flow-container {
  height: 100%;
}

.flow-box {
  border: 4px solid #2e313c;
}
</style>
<style lang="scss">
.node-editor-dialog {
  .el-dialog__header {
    display: none
  }

  .el-dialog__body {
    padding: 0;
    height: 100%;
  }
}


.top-tool .el-button .el-icon {
  margin-left: -4px;
}


.flow-select-drawer {
  width: 13.5rem !important;

  .el-drawer__header {
    display: none;
  }

  .el-drawer__body {
    padding: 0;
  }
}
</style>
<style lang="scss">
/* CSS 过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.flow-name {
  font-size: 0.8rem;
  color: #bebbcd;
  border-radius: 0.2rem;
  background: #41414e;
  padding: 0.2rem 0.8rem;
}

/*边的hover颜色*/
#api-flow-container .x6-edge > :first-child {
  &:hover {
    + path {
      stroke: #c092ff;
    }
  }
}

// .top-tool .el-switch--small .el-switch__core .el-switch__inner {
//   height: 12px;
//   padding: 0 8px 0 calc(14px + 2px);
// }

// .top-tool .el-switch--small.is-checked .el-switch__core .el-switch__inner {
//   padding: 0 18px 0 6px;
// }
</style>
<script></script>