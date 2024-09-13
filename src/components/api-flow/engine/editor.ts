import { copy, generateID, merge } from "../common-utils";
import { Graph } from "@antv/x6";
import type { Node as X6Node } from "@antv/x6";
import {
    edgeDisableColor,
    edgeModeColorMap,
    edgeNormalColor,
    edgeOnlySyncColor,
    edgeSuccessColor,
    editEdge,
    editNode,
    FlowGraphDefaultConnectingOptions,
    FlowGraphDefaultOptions,
} from "@/components/api-flow/engine/config";
import {
    parsePortId,
    makePortId,
    findStartNodes,
    centerRouter,
    makeEdgeId,
    makeEdgeIdByPortId,
} from "./utils";
import { api } from "@/utils/api";
import type {
    Edge,
    Node,
    Input,
    Output,
    Flow,
    Cell,
    Param,
    PortId,
    Func,
    FlowGraphOptions,
    NodeInValueMap,
    NodeState,
    NodeRunState,
} from "./types";
import type { Options as GraphOptions } from "@antv/x6/src/graph/options";
import { computed, type ComputedRef, h, reactive, type Ref, render } from "vue";
import { EventEmitter } from "eventemitter3";
import {configStore, flowServerStore, getSystemConfig, systemConfigStore} from "@/components/api-flow/engine/store";
import type { FlowServerModelType } from "@/api/database/db/server";
import { StateSync } from "@/components/api-flow/engine/state-sync";
// import {ElMessage} from "element-plus";
import { Selection } from "@antv/x6-plugin-selection";
import { Keyboard } from "@antv/x6-plugin-keyboard";
import { circle } from "@antv/x6/lib/registry/marker/circle";
import { smoothRounded, smoothRoundedRouter, smoothCenterRouter, smoothCenter } from "./register";
import { makeVue } from "./dynamic";

//节点数据，可以清除的
interface FineNodeStore {
    //节点的用户输入值
    userInputs: { [portKey: string]: any };
    //节点执行后的输出值
    outputs: { [outPortKey: string]: any };
    //signs
    signs: { [portKey: string]: boolean };
    // states: { nodeState: NodeState }
}

//这个是前后端都可以执行的class，由config和store（state）驱动，config保存时必须保存，而store可以保存也可以不保存
class FineNode {
    //节点的配置项
    config: Node;
    //节点的数据
    store: FineNodeStore = {
        userInputs: reactive({}),
        outputs: reactive({}),
        signs: reactive({}),
    };
    useServerKeys: Set<string> = new Set();
    states = reactive({
        nodeState: { runState: "none", error: { message: "" }, selected: false },
    });
    serverStates = reactive({ value: {} });
    //节点当前的输入，组合其他节点的输入和用户输入,它是一个computed的值,所有单独抽离出来放到外面
    inputs: ComputedRef<{ [portKey: string]: any }>;
    // 输入端口的连接信息,computed,使用computed的数据是变化次数不多的数据,并且性能场景要求不高,数据一致性要求高的
    inPortConnects: ComputedRef<{ [inPortKey: string]: PortId }>;
    // 输出端口的连接信息,computed
    outPortConnects: ComputedRef<{ [inPortKey: string]: PortId[] }>;
    flowStore: FlowStore;
    $ref?: any;
    $nodeCompRef?: Ref;
    $x6Node?: X6Node;

    constructor(
        config: Node,
        flowStore: FlowStore,
        userInputs?: { [key: string]: any }
    ) {
        this.flowStore = flowStore;
        this.config = copy(config);
        this.useServerKeys = new Set(
            this.config.input?.filter((item) => item.useServer).map((item) => item.key)
        );
        this._initUserInputs(userInputs);

        const { inputs, inPortConnects, outPortConnects } = this._initComputed();
        this.inputs = inputs;
        this.outPortConnects = outPortConnects;
        this.inPortConnects = inPortConnects;
    }

    clearOutputs() {
        Object.keys(this.store.outputs).forEach((key) => {
            delete this.store.outputs[key];
        });
    }

    setVueRef(ref: any, nodeCompRef: any) {
        this.$ref = ref;
        this.$nodeCompRef = nodeCompRef;
    }

    setX6Node(node: any) {
        this.$x6Node = node;
    }

    async runFunc() {
        const func = this.config.func;
        const inValueMap = this.inputs.value;
        if (!func.code) {
            return;
        }
        if (func.lang === "python") {
            const res = await api.post(systemConfigStore.value.customPyFuncHref || window.apiUrl + "/fineflow/func", {
                params: this.inputs.value,
                code: func.code,
            });
            if (res.data.state) {
                return res.data.data;
            } else {
                throw new Error(res.data.msg)
            }
        } else {
            let evalCopy = eval;
            const jsFunc = evalCopy(`(${func.code})`);
            const res = await jsFunc(inValueMap);
            return res;
        }
    }

    //执行节点组件内部定义的方法
    async runComponentFunc() {
        const inValueMap = this.inputs.value;
        const res = await this.$nodeCompRef?.value?.func(inValueMap);
        return res;
    }

    //后端执行的方法
    async runBackendFunc() {
        const workId = this.flowStore.workId;
        const href = this.config.fromPlugin ? window.apiUrl + "/fineflow/plugins" : this.flowStore.serverMap.value[this.config.serverKey!].href;
        const params = {};
        Object.keys(this.inputs.value).forEach((key) => {
            const value = this.inputs.value[key];
            const useServer = this.useServerKeys.has(key);
            params[key] = { value, useServer };
        });
        const res = await api.post(href + "/run_node", {
            params,
            workId,
            nodeId: this.config.id,
            key: this.config.key,
        });
        const data = res.data;
        if (data.state !== 1) {
            throw Error(data.msg);
        }
        const funcData = data.data;
        return funcData;
    }


    async runNodeCore(): Promise<string[]> {
        let res: { [x: string]: any };
        if (this.config.serverKey) {
            res = await this.runBackendFunc();
        } else if (this.$nodeCompRef?.value?.func) {
            res = await this.runComponentFunc();
        } else {
            res = await this.runFunc();
        }
        this.config.output?.forEach((item) => {
            this.store.outputs[item.key] = res[item.key];
        });
        return Object.keys(res) || [];
    }

    async runNode(): Promise<string[]> {
        const checkStop = () => {
            return new Promise((resolve, reject) => {
                if (this.flowStore.flowRunning.value) {
                    const it = setInterval(() => {
                        if (!this.flowStore.flowRunning.value) {
                            clearInterval(it);
                            reject("提前终止流程");
                        }
                    }, 200);
                }
            });
        };
        return Promise.race<any>([checkStop(), this.runNodeCore()]);
    }

    private _initComputed() {
        const inPortConnects = computed<any>(() => {
            let nodeId = this.config.id;
            const temp = {};
            this.config.input?.forEach((item) => {
                let relation =
                    this.flowStore.targetRelationMap[makePortId(nodeId, "in", item.key)];
                if (relation) {
                    temp[item.key] = relation;
                }
            });
            return temp;
        });

        const outPortConnects = computed<any>(() => {
            let nodeId = this.config.id;
            const temp = {};
            this.config.output?.forEach((item) => {
                let relation =
                    this.flowStore.sourceRelationMap[makePortId(nodeId, "out", item.key)];
                if (relation && relation.length !== 0) {
                    temp[item.key] = relation;
                }
            });
            return temp;
        });
        const inputs = computed(() => {
            let nodeId = this.config.id;
            //根据连接关系,从其他节点获取输入值
            const temp = {};
            this.config.input?.forEach((item) => {
                const thisPortId = makePortId(nodeId, "in", item.key)
                let portId =
                    this.flowStore.targetRelationMap[thisPortId];
                if (portId) {
                    //如果线被禁用了,不传递值
                    const edgeStates = this.flowStore.edgeMap[makeEdgeIdByPortId(portId, thisPortId)]?.states
                    const edgeDisable = edgeStates?.disable
                    const edgeMode = edgeStates?.mode
                    if (edgeDisable) {
                        temp[item.key] = this.store.userInputs[item.key];
                    }
                    //如果线是仅同步值或者useAfterRun，则传递线值，线值为undefined则传递节点本身用户输入参数的值
                    else if (edgeMode == 'onlySync' || edgeMode == 'useAfterRun') {
                        const { nodeId, portKey } = parsePortId(portId);
                        let sourceNode: FineNode = this.flowStore.fineNodeMap[nodeId];
                        const sOut = sourceNode.store.outputs[portKey]
                        temp[item.key] = sOut !== undefined ? sOut : this.store.userInputs[item.key];
                    } else {
                        const { nodeId, portKey } = parsePortId(portId);
                        let sourceNode: FineNode = this.flowStore.fineNodeMap[nodeId];
                        temp[item.key] = sourceNode.store.outputs[portKey];
                    }
                } else {
                    temp[item.key] = this.store.userInputs[item.key];
                }
            });
            return temp;
        });
        return { inputs, inPortConnects, outPortConnects };
    }

    //初始化用户输入,这个值
    private _initUserInputs(userInputs?: { [key: string]: any }) {
        if (userInputs) {
            Object.keys(userInputs).forEach(
                (key) => (this.store.userInputs[key] = userInputs[key])
            );
        } else {
            this.config.input?.forEach((item) => {
                this.store.userInputs[item.key] = item.default;
            });
        }
    }
}

class FlowRender {
    store: FlowStore;
    graph: Graph;
    parent: FlowEditor;
    selection: Selection;
    cache: { select: { edges: Edge[]; nodes: Node[]; mode?: "copy" | "cut" } } = {
        select: { edges: [], nodes: [] },
    };
    defaultOptions: Partial<GraphOptions.Manual> = {
        ...FlowGraphDefaultOptions,
        connecting: {
            // createEdge(...args) {
            //   return this.createEdge({
            //     shape: "editEdge",
            //     router: "center"
            //   });
            // },
            snap: {
                radius: 10,
            },
            allowMulti: "withPort",
            ...FlowGraphDefaultConnectingOptions,
        },
    };
    options: FlowGraphOptions;

    constructor(
        store: FlowStore,
        parent: FlowEditor,
        options?: FlowGraphOptions
    ) {
        this.store = store;
        this.parent = parent;
        this.options = merge(
            {
                ...options,
                connecting: {
                    validateConnection: (args: any) => this.validateConnection(args),
                    createEdge: (...args) => {
                        return this.graph.createEdge({
                            shape: "editEdge",
                            ...configStore.value.useCenterRouter ? {
                                connector: {
                                    name: 'rounded',
                                    args: {},
                                },
                                router: 'center'
                            } : {
                                // connector: {
                                //   name: 'rounded',
                                //   args: {},
                                // }
                            }

                        })
                    },
                },
                // onPortRendered: (args) => {
                //     console.log(args)
                //     const selectors = args.contentSelectors
                //     const container = selectors && selectors.foContent
                //     console.log(container,'container')
                //
                //     // if (container) {
                //     //     const vnode = h('div', 'hello')
                //     //     render(vnode, container)
                //     // }
                // },
            },
            this.defaultOptions
        );
        this.graph = this.initGraph();
    }

    initSelection() {
        const selection = new Selection({
            multiple: true,
            rubberband: true,
            enabled: true,
            movable: true,
            modifiers: ["ctrl"],
            multipleSelectionModifiers: ["ctrl"],
            // showNodeSelectionBox: true,
            // showEdgeSelectionBox: true,
        });
        this.selection = selection;
        selection.on("node:selected", ({ node }) => {
            //@ts-ignore
            if (node.fineNode) {
                //@ts-ignore
                (node.fineNode as FineNode).states.nodeState.selected = true;
            }
        });
        selection.on("node:unselected", ({ node }) => {
            //@ts-ignore
            if (node.fineNode) {
                //@ts-ignore
                (node.fineNode as FineNode).states.nodeState.selected = false;
            }
        });
    }

    initKeyBoard(graph: Graph) {
        graph.use(
            new Keyboard({
                enabled: true,
                global: true,
            })
        );
        graph.bindKey("ctrl+b", () => {
            graph.zoomToFit({ maxScale: 1 })
            graph.centerContent()
        })
        graph.bindKey("ctrl+c", () => {
            this.savePosition();
            const cells = graph.getSelectedCells();
            const cache = this.cache.select;
            const cellsId = cells.map((item) => item.id);
            const edges = this.store.flow.edges.filter(
                (edge) =>
                    cellsId.indexOf(edge.source.node) !== -1 &&
                    cellsId.indexOf(edge.target.node) !== -1
            );
            cache.mode = "copy";
            cache.edges = edges;
            //@ts-ignore
            // cache.nodes = cells.map((item) => this.store.nodeMap[item.id]);
            cache.nodes = cells.map((item) => item.store.data.store.getNodeConf());
            return false;
        });

        graph.bindKey("ctrl+a", () => {
            this.savePosition();
            const cells = graph.getNodes();
            graph.select(cells);
            const cache = this.cache.select;
            const cellsId = cells.map((item) => item.id);
            const edges = this.store.flow.edges.filter(
                (edge) =>
                    cellsId.indexOf(edge.source.node) !== -1 &&
                    cellsId.indexOf(edge.target.node) !== -1
            );
            cache.edges = edges;
            //@ts-ignore
            cache.nodes = cells.map((item) => this.store.nodeMap[item.id]);
            return false;
        });

        graph.bindKey("ctrl+x", () => {
            this.savePosition();
            const cells = graph.getSelectedCells();
            const cache = this.cache.select;
            const cellsId = cells.map((item) => item.id);
            const edges = this.store.flow.edges.filter(
                (edge) =>
                    cellsId.indexOf(edge.source.node) !== -1 &&
                    cellsId.indexOf(edge.target.node) !== -1
            );
            cache.edges = edges;
            //@ts-ignore
            cache.nodes = cells.map((item) => this.store.nodeMap[item.id]);
            //删除选中的节点
            cells.forEach((item) => this.parent.removeNode(item.id));
            this.graph.cleanSelection();
            cache.mode = "cut";
            return false;
        });

        graph.bindKey("delete", () => {
            const cells = graph.getSelectedCells();
            cells.forEach((item) => {
                if (item.shape == 'editEdge') {
                    this.parent.removeEdge(item.id)
                } else {
                    this.parent.removeNode(item.id)
                }
            });
            this.graph.cleanSelection();
            this.cache.select.edges = [];
            this.cache.select.nodes = [];
            return false;
        });

        graph.bindKey("ctrl+v", () => {
            const offsetX = 30;
            const offsetY = 30;
            graph.cleanSelection();
            const cache = this.cache.select;
            const nodes = copy(cache.nodes);
            const edges = copy(cache.edges);
            if (cache.mode == "copy") {
                const idMap = {};
                nodes.forEach((node) => {
                    const newId = generateID();
                    idMap[node.id] = newId;
                    node.ui.x += offsetX;
                    node.ui.y += offsetY;
                    node.id = newId;
                });
                edges.forEach((edge) => {
                    delete edge.id;
                    edge.source.node = idMap[edge.source.node];
                    edge.target.node = idMap[edge.target.node];
                });
                const newNodes = nodes.map((node) => this.parent.addNode(node));
                const x6Nodes = newNodes.map((item) => item[0]);
                const fineNodes = newNodes.map((item) => item[1]);
                fineNodes.forEach((item) => (item.states.nodeState.selected = true));
                edges.forEach((edge) => this.parent.addEdge(edge));
                this.graph.select(x6Nodes);
            }

            if (cache.mode == "cut") {
                // cut模式，id不变，粘贴后粘贴板清空
                const newNodes = nodes.map((node) => this.parent.addNode(node));
                const x6Nodes = newNodes.map((item) => item[0]);
                const fineNodes = newNodes.map((item) => item[1]);
                fineNodes.forEach((item) => (item.states.nodeState.selected = true));
                edges.forEach((edge) => this.parent.addEdge(edge));
                this.graph.select(x6Nodes);
                cache.nodes = [];
                cache.edges = [];
                cache.mode = null;
            }

            return false;
        });
    }

    initGraph() {
        this.initSelection();
        //@ts-ignore
        const graph = new Graph(this.options);


        this.initKeyBoard(graph);
        this.initRegister()
        this.initShapes();
        graph.use(this.selection);
        graph.on("edge:connected", ({ isNew, edge }) => {
            // console.log('????????')
            // if (isNew) {
            //@ts-ignore
            const edgeId = makeEdgeIdByPortId(edge.source.port, edge.target.port);
            const outPortInfo = parsePortId((edge.source as any).port);
            const inPortInfo = parsePortId((edge.target as any).port);
            const newEdge = {
                id: edgeId,
                source: { node: outPortInfo.nodeId, port: outPortInfo.portKey },
                target: { node: inPortInfo.nodeId, port: inPortInfo.portKey },
            };
            this.store.removeEdge(edge.id);
            this.graph.removeEdge(edge.id);
            this.addEdge(newEdge);
            this.store.addEdge(newEdge);
            // }
        });
        graph.on("node:moved", ({ e, node, view }) => {
            //@ts-ignore
            const nodeConf: Node = node.store.data.store.getNodeConf();
            const position = node.getPosition();
            nodeConf.ui.x = position.x;
            nodeConf.ui.y = position.y;
        });

        //增加edge的拖拽更换连接
        graph.on('edge:mouseenter', ({ cell }) => {
            cell.addTools([
                {
                    name: 'source-arrowhead',
                    args: {
                        attrs: {
                            d: "M13 -10 a 10 10 0 1 0 0 20 a 10 10 0 1 0 0 -20",
                            fill: "rgba(0,0,0,0)",
                            stroke: null,
                        },
                    },
                },
                {
                    name: 'target-arrowhead',
                    args: {
                        attrs: {
                            d: "M-13 -10 a 10 10 0 1 0 0 20 a 10 10 0 1 0 0 -20",
                            fill: "rgba(0,0,0,0)",
                            stroke: null,
                        },
                    },
                },
            ])
        })

        graph.on('edge:mouseleave', ({ cell }) => {
            cell.removeTools()
        })
        graph.centerContent();
        return graph;
    }

    initShapes() {
        try {
            Graph.registerEdge("editEdge", editEdge, true);
            Graph.registerNode("editNode", editNode, true);
            Graph.registerRouter("center", centerRouter);
        } catch (e) {
        }
    }

    initRegister() {
        try {
            Graph.registerRouter('smoothRoundedRouter', smoothRoundedRouter)
            Graph.registerConnector('smoothRounded', smoothRounded)
            Graph.registerRouter('smoothCenterRouter', smoothCenterRouter)
            Graph.registerConnector('smoothCenter', smoothCenter)
        } catch (e) {
        }
    }

    edgeToGraphEdge(edge: Edge) {

        const sourcePortId = makePortId(edge.source.node, "out", edge.source.port);
        const targetPortId = makePortId(edge.target.node, "in", edge.target.port);
        const edgeId = makeEdgeIdByPortId(sourcePortId, targetPortId);
        const mode = edge.states?.mode || "normal"
        const color = edge.states?.disable ? edgeDisableColor : edgeModeColorMap[mode]
        return {
            shape: "editEdge",
            id: edgeId,
            attrs: { line: { stroke: color, targetMarker: mode == 'useAfterRun' ? "block" : "" } },
            source: {
                cell: edge.source.node,
                port: sourcePortId,
            },
            ...configStore.value.useCenterRouter ? {
                connector: {
                    name: 'smoothCenter',
                    args: {},
                },
                router: 'smoothCenterRouter'
            } : {
                connector: {
                    name: 'smoothRounded',
                    args: {},
                },
                router: 'smoothRoundedRouter',
            },

            // connector: {
            //   name: 'rounded',
            //   args: {},
            // },
            // router: 'center',
            target: {
                cell: edge.target.node,
                port: targetPortId,
            },
        };
    }

    nodeToGraphNode(node: Node) {
        const inPorts: any = [{
            group: "in",
            id: makePortId(node.id, "in", "NODE_IN"),
            paramKey: "NODE_IN",
            attrs: {
                text: {
                    portGroup: "in",
                    text: "",
                },
                path: {
                    d: 'M 0 -4 H 4 v 8  H 0 Z',
                    magnet: true,
                    fill: '#56566a',
                },
                circle: null
            },
            markup: [
                {
                    tagName: 'path',
                    selector: 'path',
                },
            ],
            // args: {y: -13.5},
            args: { y: 13.5 },
        }]
        node.input?.filter(item => item.show?.all !== false).map((item) => {
            return {
                group: "in",
                id: makePortId(node.id, "in", item.key),
                paramKey: item.key,
                attrs: {
                    text: {

                        portGroup: "in",
                        text: item.name,
                    },
                    circle: item.useServer ? { fill: "#7b78ff" } : {},
                },
            };
        }).forEach(item => inPorts.push(item));
        const outPorts: any = [{
            group: "out",
            id: makePortId(node.id, "out", "NODE_OUT"),
            paramKey: "NODE_OUT",
            attrs: {
                text: {
                    portGroup: "out",
                    text: "",
                },
                path: {
                    d: 'M -4 -4 H 0 v 8  H -4 Z',
                    magnet: true,
                    fill: '#56566a',
                },
                circle: null
            },
            markup: [
                {
                    tagName: 'path',
                    selector: 'path',
                },
            ],
            // args: {y: -13.5}
            args: { y: 13.5 }
        }]
        node.output?.map((item) => {
            return {
                group: "out",
                paramKey: item.key,
                id: makePortId(node.id, "out", item.key),
                attrs: {
                    text: {
                        portGroup: "out",
                        text: item.name,
                    },
                    circle: item.useServer ? { fill: "#7b78ff" } : {},
                },
            };
        }).forEach(item => outPorts.push(item));
        const nodeConf = {
            x: node.ui?.x,
            y: node.ui?.y,
            height: Math.max(
                node.ui?.height || 50,
                Math.max(inPorts.length, outPorts.length, 3) * 22
            ),
            width: Number(node.ui?.width || 140),
            label: node.name,
            id: node.id,
            shape: "custom-vue-node",
            store: {
                getNodeConf: () => {
                    return node;
                },
            },
            ports: [...inPorts, ...outPorts],
        };
        return nodeConf;
    }

    validateEdge({ edge }) {
        // console.log(edge);
        return false;
    }

    validateConnection({ sourceCell, targetCell, sourcePort, targetPort, edge, edgeView }) {
        //如果正在拖拽边的端口到另一个端口的错误
        let dragEdge = null
        if (edge.getTools()?.items.find(item => ['source-arrowhead', 'target-arrowhead'].indexOf(item.name) != -1)) {
            dragEdge = edge.id
        }
        if (sourceCell && targetCell && sourcePort && targetPort) {
            const outPort = sourceCell.getPort(sourcePort);
            const inPort = targetCell.getPort(targetPort);
            if (inPort.group == "in" && outPort.group == "out") {
                const s = parsePortId(outPort.id);
                const t = parsePortId(inPort.id);
                const newEdge = {
                    id: makeEdgeIdByPortId(outPort.id, inPort.id),
                    source: { node: s.nodeId, port: s.portKey },
                    target: { node: t.nodeId, port: t.portKey },
                };
                //这一串看怎么抽离
                if (this.store.validateConnection(newEdge, dragEdge)) {
                    return true;
                }
            }
        }
        return false;
    }

    addNode(node: Node) {
        const stores = this.nodeToGraphNode(node);
        //@ts-ignore
        stores.store.getFlowStore = () => {
            return this.store;
        };
        // //@ts-ignore
        // stores.store.getNodeConf = () => {
        //   return node;
        // };
        const newNode = this.graph.addNode(stores, { flowStore: this.store });
        return newNode;
    }

    removeNode(nodeId: string) {
        this.graph.removeNode(nodeId);
    }

    addEdge(edge: Edge) {
        const newEdge = this.graph.addEdge(this.edgeToGraphEdge(edge));
        //这种线在顶层
        // const isSysNodeOutToNodeIn = edge.source.port == "NODE_OUT" && edge.target.port == "NODE_IN"
        // if (isSysNodeOutToNodeIn) {
        //   newEdge.toFront()
        // }
        return newEdge
    }

    removeEdge(edgeId: string) {
        this.graph.removeEdge(edgeId);
    }

    loadFromJson(flow: Flow) {
        this.graph.clearCells();
        flow.nodes.forEach((node) => this.addNode(node));
        flow.edges.forEach((edge) => this.addEdge(edge));
    }

    savePosition() {
        this.graph.getNodes().forEach((x6Node) => {
            const position = x6Node.getPosition();
            const size = x6Node.getSize();
            const node = this.store.nodeMap[x6Node.id];
            node.ui.x = position.x;
            node.ui.y = position.y;
            node.ui.width = Number(size.width);
            node.ui.height = Number(size.height);
        });
    }

    updateNode(nodeId: string, event?: string) {
        this.graph
            .getCellById(nodeId)
            .setData({ time: Date.now() + Math.random() * 1000, event });
    }

    setEdgeState(edgeId: string, state: "success" | "none") {
        if (state == "success") {
            this.graph
                .getCellById(edgeId)
                .setAttrs({ line: { stroke: edgeSuccessColor } });
        }
        if (state == "none") {
            this.graph
                .getCellById(edgeId)
                .setAttrs({ line: { stroke: edgeNormalColor } });
        }
    }

    clearEdgesState() {
        this.graph.getEdges().map((edge) => {
            const states = this.store.edgeMap[edge.id].states
            const mode = states?.mode || "normal"
            const edgeEnableColor = edgeModeColorMap[mode]
            const disable = this.store.edgeMap[edge.id].states?.disable === true
            edge.setAttrs({ line: { stroke: disable ? edgeDisableColor : edgeEnableColor, targetMarker: mode == 'useAfterRun' ? "block" : "" } });
        });
    }
}

// 兼容一下in和input
function preProcessNode(node: Node) {
    //@ts-ignore
    if (node.in && (!node.input || node.input.length == 0)) {
        //@ts-ignore
        node.input = node.in
    }
    //out和output兼容一下
    //@ts-ignore
    if (node.out && (!node.output || node.output.length == 0)) {
        //@ts-ignore
        node.output = node.out
    }
    //兼容一下之前的组件编写方式u
    if (node.ui.component && typeof node.ui.component !== 'string') {
        //@ts-ignore
        node.ui.component = makeVue(node.ui.component.template, node.ui.component.options, node.ui.component.css)
    }
}

class FlowEditor {
    render: FlowRender;
    runner: FlowRunner;
    store: FlowStore;

    constructor(elId: string) {
        const el = document.getElementById(elId);
        if (!el) {
            throw Error(elId + "-dom元素未查询到");
        }
        this.store = new FlowStore();
        this.render = new FlowRender(this.store, this, { container: el });
        this.runner = new FlowRunner(this.store);
        this.runner.onSetNodeState = (nodeId, state, message) => {
            this.store.setNodeRunState(nodeId, state, message);
            this.render.updateNode(nodeId);
        };
        this.runner.onSetEdgeState = (edgeId, state) => {
            this.render.setEdgeState(edgeId, state);
        };
        //增加配置获取功能
        getSystemConfig()

        console.log(this.render.graph);
    }

    async runFlowBySignal(handel: (nodeId: string) => any) {
        if (this.store.flowRunning.value) {
            return "正在执行"
        }
        //清除之前的运行状态
        this.store.flow.nodes.forEach((node) => {
            this.store.setNodeRunState(node.id, "none", "");
            this.render.updateNode(node.id);
        });
        this.render.clearEdgesState();
        this.store.flowRunning.value = true;
        try {
            await this.runner.run(handel);
        } catch (e) {
            this.store.flowRunning.value = false;
            throw e;
        }
        this.store.flowRunning.value = false;
    }

    async runFlowLoopBySignal(handel: (nodeId: string) => any) {
        if (this.store.flowRunning.value) {
            return "正在执行"
        }
        //清除之前的运行状态
        this.store.flow.nodes.forEach((node) => {
            this.store.setNodeRunState(node.id, "none", "");
            this.render.updateNode(node.id);
        });
        this.render.clearEdgesState();
        this.store.flowRunning.value = true;
        try {
            while (this.store.flowRunning.value) {
                await this.runner.run(handel);
            }
        } catch (e) {
            this.store.flowRunning.value = false;
            throw e;
        }
        this.store.flowRunning.value = false;
    }

    async runStartAtNode(nodeId: string, handel: (nodeId: string) => any) {
        if (this.store.flowRunning.value) {
            return "执行中";
        }
        //清除之前的运行状态
        // this.store.flow.nodes.forEach(node => {
        //     this.store.setNodeRunState(node.id, 'none', '')
        //     this.render.updateNode(node.id)
        // })
        // this.render.clearEdgesState()
        this.store.flowRunning.value = true;
        try {
            await this.runner.runStartAtNode(nodeId, handel);
        } catch (e) {
            this.store.flowRunning.value = false;
            throw e;
        }
        this.store.flowRunning.value = false;
    }

    async runNodeSelf(nodeId: string, handel: (nodeId: string) => any) {
        if (this.store.flowRunning.value) {
            return "执行中";
        }
        //清除之前的运行状态
        // this.store.flow.nodes.forEach(node => {
        //     this.store.setNodeRunState(node.id, 'none', '')
        //     this.render.updateNode(node.id)
        // })
        // this.render.clearEdgesState()
        this.store.flowRunning.value = true;
        try {
            await this.runner.runNodeSelf(nodeId, handel);
        } catch (e) {
            this.store.flowRunning.value = false;
            throw e;
        }
        this.store.flowRunning.value = false;
    }

    addNode(node: Node) {
        preProcessNode(node)
        if (!node.id) {
            node.id = generateID();
        }
        const fineNode = this.store.addNode(node);
        let x6Node: any = this.render.addNode(node);
        x6Node.flowStore = this.store;
        return [x6Node, fineNode];
    }

    removeNode(nodeId: string) {
        this.store.removeNode(nodeId);
        this.render.removeNode(nodeId);
    }

    addEdge(edge: Edge) {
        if (!edge.id) {
            edge.id = makeEdgeId(edge);
        }
        if (!this.store.validateConnection(edge)) {
            return false;
        }
        this.store.addEdge(edge);
        const newEdge = this.render.addEdge(edge);
        return newEdge;
    }

    removeEdge(edgeId: string) {
        this.store.removeEdge(edgeId);
        this.render.removeEdge(edgeId);
    }

    loadFromJson(flow: Flow) {
        //todo:这里应该还是使用editor的addNode和addEdge
        flow.nodes.forEach(node => preProcessNode(node))
        this.store.loadFromJson(flow);
        this.render.loadFromJson(flow);
    }

    saveToJson() {
        this.render.savePosition();
        const flow = copy(this.store.flow);
        const store = { nodeUserInputsMap: {} };
        Object.keys(this.store.fineNodeMap).forEach(
            (key) =>
            (store.nodeUserInputsMap[key] = copy(
                this.store.fineNodeMap[key].store.userInputs
            ))
        );
        flow.store = store;
        return flow;
    }

    updateNode(nodeId: string) {
        this.render.updateNode(nodeId);
    }
}

interface Server extends FlowServerModelType {
}

class FlowStore {
    stateSync: StateSync;
    workId: string;
    //后端服务列表
    serverMap = flowServerStore;
    fineNodeMap: { [nodeId: string]: FineNode } = {};
    flow: Flow = { key: "", name: "", nodes: [], edges: [] };
    nodeMap: { [nodeId: string]: Node } = {};
    sourceRelationMap: { [portId: PortId]: PortId[] } = reactive({});
    targetRelationMap: { [portId: PortId]: PortId } = reactive({});
    flowRunning: { value: boolean } = reactive({ value: false });
    nodeInputSignalMap: { [nodeId: string]: { [portId: PortId]: boolean } } = {};
    //使用edgeMap来提升性能
    edgeMap: { [edgeId: string]: Edge } = {}

    constructor(flow?: Flow) {
        this.workId = generateID();
        this.stateSync = new StateSync(this.workId, this);
        flow && this.loadFromJson(flow);
        // if (servers) {
        //     servers.forEach(item => {
        //         this.serverMap.value[item.key] = item
        //     })
        // }
    }

    addServer(server: Server) {
        this.serverMap.value[server.key] = server;
    }

    removeServer(serverKey) {
        delete this.serverMap.value[serverKey];
    }

    addNode(node: Node, userInputs?: { [key: string]: any }) {
        if (this.nodeMap[node.id]) {
            return;
        }
        //添加节点的时候，判断它是否是后端节点，是的话添加它的socket服务
        if (node.serverKey && flowServerStore.value[node.serverKey]) {
            if (node.fromPlugin === true) {
                //插件里面的使用另一个统一的socket地址
                this.stateSync.addSocket({
                    name: "plugins",
                    key: "plugins",
                    href: `http://${window.location.host}/fineflow/plugins`,
                    enable: true
                });
            } else {
                this.stateSync.addSocket(flowServerStore.value[node.serverKey]);

            }
        }
        this.flow.nodes.push(node);
        this.nodeMap[node.id] = node;
        const fineNode = new FineNode(node, this, userInputs);
        this.fineNodeMap[node.id] = fineNode;
        return fineNode;
    }

    removeNode(nodeId: string) {
        const index = this.flow.nodes.findIndex((item) => nodeId == item.id);
        if (index !== -1) {
            this.flow.nodes.splice(index, 1);
        }
        delete this.nodeMap[nodeId];
        delete this.fineNodeMap[nodeId];
        this.flow.edges
            .filter(
                (item) => item.target.node == nodeId || item.source.node == nodeId
            )
            .forEach((edge) => {
                this.removeEdge(edge.id);
            });
    }

    addEdge(edge: Edge) {
        // if (!this.validateConnection(edge)) {
        //   return;
        // }
        if (this.flow.edges.find((item) => item.id == edge.id)) {
            return;
        }
        const outPortKey = makePortId(edge.source.node, "out", edge.source.port);
        const inPortKey = makePortId(edge.target.node, "in", edge.target.port);
        edge.id = makeEdgeIdByPortId(outPortKey, inPortKey);
        this.flow.edges.push(edge);
        if (!this.sourceRelationMap[outPortKey]) {
            this.sourceRelationMap[outPortKey] = [inPortKey];
        } else {
            this.sourceRelationMap[outPortKey].push(inPortKey);
        }
        this.targetRelationMap[inPortKey] = outPortKey;
        if (edge.states) {
            edge.states = reactive(edge.states)
        } else {
            edge.states = reactive({})
        }
        this.edgeMap[edge.id] = edge
    }

    removeEdge(edgeId: string) {
        const edge = this.flow.edges.find((item) => item.id == edgeId);
        if (!edge) {
            return;
        }
        const edgeIndex = this.flow.edges.findIndex((item) => item.id == edgeId);
        this.flow.edges.splice(edgeIndex, 1);
        const outPortKey = makePortId(edge.source.node, "out", edge.source.port);
        const inPortKey = makePortId(edge.target.node, "in", edge.target.port);
        const sourceRelation = this.sourceRelationMap[outPortKey];
        if (sourceRelation) {
            const index = sourceRelation.indexOf(inPortKey);
            if (index !== -1) {
                sourceRelation.splice(index, 1);
            }
        }
        delete this.targetRelationMap[inPortKey];
        delete this.edgeMap[edge.id]
    }

    loadFromJson(flow: Flow) {
        this.nodeMap = {};
        this.fineNodeMap = {};
        this.targetRelationMap = reactive({});
        this.sourceRelationMap = reactive({});
        this.flow = { key: flow.key, name: flow.name, nodes: [], edges: [] };
        flow.nodes.forEach((node) =>
            this.addNode(node, flow.store?.nodeUserInputsMap?.[node.id])
        );
        flow.edges.forEach((edge) => this.addEdge(edge));
    }

    clearFlowOutputValue() {
        Object.values(this.fineNodeMap).forEach((item) => {
            item.clearOutputs();
        });
    }

    validateConnection(edge: Edge, draggedEdge = null) {
        if (this.flow.edges.find((item) => item.id == edge.id)) {
            return false;
        }
        const sNodeId = edge.source.node;
        const sNodePort = edge.source.port;
        const tNodeId = edge.target.node;
        const tNodePort = edge.target.port;
        const sNode = this.nodeMap[sNodeId]
        const tNode = this.nodeMap[tNodeId]


        const sNodePortInfo = sNode.output?.find(
            (item) => item.key == sNodePort
        );
        const tNodePortInfo = tNode.input?.find(
            (item) => item.key == tNodePort
        );
        if (
            sNodePortInfo?.config.type !== "any" &&
            tNodePortInfo?.config.type !== "any" &&
            sNodePortInfo?.config.type !== tNodePortInfo?.config.type
        ) {
            // ElMessage.warning('参数类型不同')
            return false;
        }
        //@ts-ignore
        if (!!sNodePortInfo?.useServer != !!tNodePortInfo?.useServer) {
            // ElMessage.warning('服务端参数不能与非服务端参数连接')
            return false;
        }
        if (sNodePortInfo?.useServer && tNodePortInfo?.useServer) {
            //当都不是插件节点，节点的serverKey也不同的时候，不能连接
            if (!((sNode.fromPlugin && tNode.fromPlugin) || (sNode.serverKey == tNode.serverKey))) {
                return false
            }
        }
        const tPortKey = makePortId(tNodeId, "in", tNodePort)
        const hasConnectPort = this.targetRelationMap[tPortKey]
        if (hasConnectPort) {
            //如果是拖拽已连接的边，则不检查这个
            if (`${hasConnectPort}__${tPortKey}` != draggedEdge) {
                return false;
            }
        }
        if ((sNodePort == 'NODE_OUT' && tNodePort !== "NODE_IN") || (sNodePort !== 'NODE_OUT' && tNodePort == "NODE_IN")) {
            return false
        }
        return true;
    }

    setNodeRunState(nodeId: string, state: NodeRunState, message?: string) {
        let nodeState = this.fineNodeMap[nodeId].states.nodeState;
        nodeState.runState = state;
        if (state == "error" && message) {
            nodeState.error.message = message;
        }
    }
}

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class FlowRunner {
    store: FlowStore;
    onSetNodeState = (
        nodeId: string,
        state: NodeRunState,
        message?: string
    ): any => {
    };

    onSetEdgeState = (edgeId: string, state: "success" | "none"): any => {
    };

    constructor(store: FlowStore) {
        this.store = store;
    }

    async stop() {
        this.store.flowRunning.value = false;
    }

    async run(handel: (nodeId: string) => any) {
        const checkStop = () => {
            return new Promise((resolve, reject) => {
                if (this.store.flowRunning.value) {
                    const it = setInterval(() => {
                        if (!this.store.flowRunning.value) {
                            clearInterval(it);
                            reject("提前终止流程");
                        }
                    }, 500);
                }
            });
        };
        return Promise.race([checkStop(), this.runFlowBySignal(handel)]);
    }

    //从某个节点开始执行
    async runStartAtNode(nodeId: string, handel: (nodeId: string) => any) {
        const checkStop = () => {
            return new Promise((resolve, reject) => {
                if (this.store.flowRunning.value) {
                    const it = setInterval(() => {
                        if (!this.store.flowRunning.value) {
                            clearInterval(it);
                            reject("提前终止流程");
                        }
                    }, 500);
                }
            });
        };
        return Promise.race([
            checkStop(),
            this.runNodeBySignal(nodeId, handel, false),
        ]);
    }

    //执行节点自己
    async runNodeSelf(nodeId: string, handel: (nodeId: string) => any) {
        const checkStop = () => {
            return new Promise((resolve, reject) => {
                if (this.store.flowRunning.value) {
                    const it = setInterval(() => {
                        if (!this.store.flowRunning.value) {
                            clearInterval(it);
                            reject("提前终止流程");
                        }
                    }, 500);
                }
            });
        };
        return Promise.race([
            checkStop(),
            this.runNodeBySignal(nodeId, handel, false, false),
        ]);
    }

    async runFlowBySignal(handel: (nodeId: string) => any) {
        this.store.clearFlowOutputValue();
        //通过信号的方式来执行流程
        //nodeInputSignalMap存储每个节点的连线的输入端点是否被触发,只需要连接上线的端口即可,禁用的线不算内,onlySync,useAfterRun 都不是该节点执行的必要条件，所以不算在线里面
        let remainedEdges: Edge[] = copy(this.store.flow.edges.filter(edge => !(edge.states?.disable === true || edge.states?.mode === "onlySync" || edge.states?.mode === "useAfterRun")));
        this.store.nodeInputSignalMap = {};
        remainedEdges.forEach((edge) => {
            if (!this.store.nodeInputSignalMap[edge.target.node]) {
                this.store.nodeInputSignalMap[edge.target.node] = {};
            }
            this.store.nodeInputSignalMap[edge.target.node][edge.target.port] = false;
        });
        // return
        //先寻找输入连线数量为0的节点作为起始节点列表
        const startNodes = findStartNodes(remainedEdges);
        for (let nodeId of startNodes) {
            await this.runNodeBySignal(nodeId, handel);
        }
    }

    async runNodeBySignal(
        nodeId: string,
        handel: (nodeId: string) => any,
        runOnBeforeSignaled = true,
        runAfterNodes = true
    ) {
        if (!this.store.flowRunning.value) {
            return false;
        }
        // console.log('执行节点', nodeId)
        //防止死循环
        await sleep(10);

        const nodeInputSignalMap = this.store.nodeInputSignalMap;
        const fineNod = this.store.fineNodeMap[nodeId];
        const nodeSignalMap = nodeInputSignalMap[nodeId];
        //如果输入的连线没有被触发完全，则不执行后续动作,如果runOnBeforeSignaled为false则不关心前置节点的执行情况
        if (runOnBeforeSignaled) {
            if (nodeSignalMap && Object.values(nodeSignalMap).indexOf(false) !== -1) {
                return false;
            }
        }

        this.onSetNodeState(nodeId, "running");
        let resKeys: string[] = [];
        try {
            // await sleep(50)
            resKeys = await fineNod.runNode();
            //将NODE_IN节点参数的值加上
            resKeys.push("NODE_IN")
        } catch (e) {
            this.onSetNodeState(nodeId, "error", String(e));
            console.warn(e);
            return;
        }
        this.onSetNodeState(nodeId, "success");
        handel(nodeId);
        //把执行完成的该节点的输入突触置零
        // todo 单次执行流程时并不需要清除突触，因为若节点在闭合回路第二次执行该节点时，对应的意义是触发加赋值，第一次执行的意义是初始化
        // if (nodeSignalMap) {
        //   Object.keys(nodeSignalMap).forEach((key) => {
        //     nodeSignalMap[key] = false;
        //   });
        // }
        //寻找后续节点
        const nextPortsList = this.findNodeNextConnectPortsListFromResKeys(
            nodeId,
            resKeys
        );
        const nextNodes = new Set<string>();

        //触发信号，置位后续节点输入突触为true
        nextPortsList.forEach((item) => {
            const [sourcePortId, targetPortId] = item;
            const portInfo = parsePortId(targetPortId);
            let signalMap = nodeInputSignalMap[portInfo.nodeId];
            if (!signalMap) {
                signalMap = {};
                nodeInputSignalMap[portInfo.nodeId] = signalMap;
            }
            //如果线被设为禁止了,或者仅同步模式，不触发后续,但useAfterRun是要触发的
            const edgeId = makeEdgeIdByPortId(sourcePortId, targetPortId)
            const edgeStates = this.store.edgeMap[edgeId].states
            if (!(edgeStates?.disable === true) && !(edgeStates.mode === 'onlySync')) {
                signalMap[portInfo.portKey] = true;
                this.onSetEdgeState(
                    edgeId,
                    "success"
                );
                nextNodes.add(portInfo.nodeId);
            }

        });
        if (runAfterNodes) {
            //执行后续节点
            //挨个执行
            // for (let nextNodeId of nextNodes) {
            //     await this.runNodeBySignal(nextNodeId, handel)
            // }
            //这里得用同时执行
            if (nextNodes.size !== 0) {
                await Promise.all(
                    [...nextNodes.values()].map((nextNodeId) =>
                        this.runNodeBySignal(nextNodeId, handel)
                    )
                );
            }
        }
    }

    //寻找节点输出端口连接的其他节点的输入端口的portId,但是是从节点输出参数字典的key列表来看后续的连接,返回是一对一对的，两个端口
    findNodeNextConnectPortsListFromResKeys(
        nodeId: string,
        resKeys: string[]
    ): [PortId, PortId][] {
        //从性能考虑使用sourceRelationMap来查询而不是使用edges来查询
        const connectPortsList: [PortId, PortId][] = [];
        const outPorts = this.store.nodeMap[nodeId].output
            .filter((item) => resKeys.indexOf(item.key) !== -1)
        //@ts-ignore
        outPorts.push({ key: "NODE_OUT" })
        outPorts
            .forEach((port) => {
                const portId = makePortId(nodeId, "out", port.key);
                const nextInPortIdList: PortId[] = this.store.sourceRelationMap[portId];
                if (nextInPortIdList) {
                    //@ts-ignore
                    connectPortsList.push(
                        //@ts-ignore
                        ...nextInPortIdList.map((item) => {
                            return [portId, item];
                        })
                    );
                }
            });
        return connectPortsList;
    }
}

export { FlowEditor, FlowStore, FineNode };
