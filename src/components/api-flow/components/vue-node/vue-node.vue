<template>
  <div class="node-graph" :id="pid" :style="{ background: node?.ui?.bg,...boxShadowStyle }">
    <div ref="nodeTopRef" class="node-top" sign="node-clicked" :style="{ background: node?.ui?.titleBg }">
      <div :style="{ color: node?.ui?.titleColor }" sign="node-clicked">
        {{ node?.name }}
      </div>
      <div class="flex-1 flex" sign="node-clicked">
        <el-tooltip class="box-item" effect="dark" :content="message" placement="top-start">
          <div class="state-circle" :style='{ background: stateColor }'></div>
        </el-tooltip>
      </div>
    </div>
    <div :style="{ height: `${height}px`} " class="node-content" ref="contentRef">
      <div class="node-param-body" ref="nodeParamBody">
        <div v-for="item in node?.input?.filter(item => item.show?.all !== false && item.key !== 'NODE_IN')"
             :sign="item.key" ref="inputRefs" class="input-param-item ">
          <div style="width: 100%" @mousedown.stop @dragstart.stop>
            <input-param-comp
                v-if="(!inPortConnects[item.key]) && (!item.useServer) && (!(item.show?.input == false))"
                :placeholder="item.name" size="small" :ctx="''" :model-value="inputs[item.key]"
                @update:model-value="(newVal) => { userInputs[item.key] = newVal; }" :param="item"></input-param-comp>
            <div v-else>
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
      <component class="node-component" ref="nodeCompRef" :is="components.dynamicComp" :data="{ node }"
                 :state="nodeState"
                 :inputs="inputs" :user-inputs="userInputs" v-if="showDynamicComponent"
                 @update:input="(key, value) => userInputs[key] = value" :outputs="outputs"
                 :server-states="fineNode.serverStates" @mousedown.stop @dragstart.stop/>
    </div>
    <div class="resize-tool " :style="resizeToolSizeStyle" @dragstart.stop @mousemove.stop @mousedown.stop="startResize"
         @mouseleave.stop="stopResize">
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, getCurrentInstance, inject, onMounted, ref, watch} from 'vue'
import type {Node} from "@/components/api-flow/engine/types";
import {DynamicComponent, extractVueContents, makeVue} from "@/components/api-flow/engine/dynamic";
import InputParamComp from "@/components/api-flow/components/param-input-bar/input-param/index.vue"
import type {FlowStore} from "@/components/api-flow/engine/editor";
import {makePortId} from "@/components/api-flow/engine/utils";
import {FineNode} from "@/components/api-flow/engine/editor";
import {useNodeResize} from "@/components/api-flow/components/vue-node/useNodeResize";

const getNode: any = inject('getNode')
const showDynamicComponent = ref(false)
const components = {dynamicComp: null}
const height = ref(66)
const inputsHeight = ref(0)
// const bodyHeight = ref(20)
const contentRef = ref()
const inputRefs = ref([])
const nodeParamBody = ref()
const nodeCompRef = ref()
const nodeTopRef = ref()
const pid = ref('')
//初始化fineNode的各种数据
let x6Node = getNode()
const flowStore: FlowStore = x6Node.store.data.store.getFlowStore()
const fineNode: FineNode = flowStore.fineNodeMap[x6Node.id]
const {inputs, inPortConnects} = fineNode
const {outputs, userInputs} = fineNode.store
const nodeState = fineNode.states.nodeState
const instance = getCurrentInstance();
const node = ref<Node>({} as unknown as Node)
node.value = x6Node.store.data.store.getNodeConf()
fineNode.setVueRef(instance, nodeCompRef)
fineNode.setX6Node(x6Node)
x6Node.fineNode = fineNode

const {stopResize, startResize, resizeToolSizeStyle} = useNodeResize(x6Node, node, height, inputsHeight, setPortPosition)


async function createComp() {
  const size = x6Node.getSize()
  const componentCode = node.value.ui.component
  const nodeHeight = size.height
  let dynamicComponent: DynamicComponent
  //todo：这里是在做一个兼容
  if (componentCode) {
    const {template, script, style} = extractVueContents(componentCode)
    dynamicComponent = new DynamicComponent(template, script, style)
    dynamicComponent.component=await dynamicComponent.createComponent()
    components.dynamicComp = dynamicComponent.component as any
    showDynamicComponent.value = true
    pid.value = dynamicComponent.parentId
    height.value = Math.max(nodeHeight, node.value.ui.height || 0)
  } else {
    height.value = nodeHeight
  }
}

function initWatchBodySize() {
  //监听元素尺寸变化来修正port的位置
  let observer = new ResizeObserver(() => {
    setPortPosition()
  });
  observer.observe(nodeParamBody.value, {box: "border-box"});
}


onMounted(() => {
  initWatchBodySize()
  createComp()
})

watch(() => inputRefs.value.length, () => {
  setPortPosition()
}, {immediate: true})

watch(() => node.value.input?.filter(item => item.show?.all !== false).length, () => {
  setPortPosition()
},)

function setPortPosition() {
  setLeftPortPosition()
  setRightPortPosition()
}

function setLeftPortPosition() {
  const topHeight = nodeTopRef.value?.clientHeight || 0
  let startHeight = 6 + topHeight
  // let temp = 0
  let inputsHeightTemp = 0
  const ports = x6Node.ports.items.map(item => item.id)
  inputRefs.value.forEach((item: HTMLElement, index) => {
    const h = item.clientHeight
    //@ts-ignore
    const portKey = item.getAttribute('sign')
    const portId = makePortId(x6Node.id, 'in', portKey)
    if (ports.includes(portId)) {
      x6Node.setPortProp(portId, {args: {y: startHeight + h / 2}})
      startHeight = startHeight + h
      inputsHeightTemp += h
    }
  })
  inputsHeight.value = inputsHeightTemp
  height.value = Math.max(inputsHeight.value+10, height.value, 66)

}


function setRightPortPosition() {
  const ports = x6Node.ports.items.filter(item =>
      item.group == 'out' && item.paramKey !== 'NODE_OUT'
  )
  const topHeight = nodeTopRef.value?.clientHeight || 0
  const portLen = ports.length
  let offset = height.value / (portLen + 1)
  ports.forEach((item, index) => {
    x6Node.setPortProp(item.id, {args: {y: offset * (index + 1) + topHeight}})
  })
}


const message = computed(() => {
  return nodeState.runState == 'error' ? nodeState.error.message : nodeState.runState
})

const stateColor = computed(() => {
  return {success: "#2af22a", none: "#b1b8d182", error: "#ff2d2d", running: "#8282ff"}[nodeState.runState]
})

const boxShadowStyle = computed(() => {
  return {boxShadow: nodeState.selected ? 'var(--f-node-select_shadow)' : 'var(--f-node-unselect_shadow)'}
})

defineExpose({setPortPosition})
</script>
