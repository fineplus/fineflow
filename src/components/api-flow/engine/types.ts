import type {Options as GraphOptions} from "@antv/x6/src/graph/options";
import type {Param} from "./param-types";

`
Work或者Flow 一个工作区
  NodeServer[] 节点服务列表
    Instance 节点服务内的某个实例
      Store 存储各种不可序列化的数据
      Ws 前后端ws连接
  Store
      前端可序列化的数据，各种状态，需与后端同步，使用一个内存数据库？
`;

interface NodeServer {
    key: string;
    //节点服务的地址
    href: string;
    //通过href可以获取这个server所有节点列表，然后存储到node-select里面去选择
    // nodeTree:
}

interface Work {
    workId: string;
    servers: NodeServer;
}

interface Input extends Param {
    key: string;
    default?: any;
    //useServer为true的，表示它的输入参数是从后端的workId下的某个节点的输出，
    useServer?: boolean;
    show?: {
        //false全部隐藏
        all?: boolean
        //输入组件是否显示,没有input的时候会显示名称
        input?: boolean
        //端口是否显示
        port?: boolean
        //名称是否显示
        name?: boolean
        //名称显示的位置,默认内部
        namePosition?: 'outer' | 'inner'
    }
}

interface Output extends Param {
    key: string;
    //useServer为true的，表示它的输入参数是从后端的workId下的某个节点的输出，
    useServer?: boolean;
    //  show?:{
    //   //false全部隐藏
    //   all?:boolean
    //   //输入组件是否显示,没有input的时候会显示名称
    //   input?:boolean
    //   //端口是否显示
    //   port?:boolean
    //   //名称是否显示
    //   name?:boolean
    //   //名称显示的位置,默认内部
    //   namePosition?:'outer'|'inner'
    // }
}

type PortId = `${string}-${"in" | "out"}-${string}`;

interface Func {
    lang: "python" | "javascript";
    code: string;
}

interface NodeUi {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    titleColor?: string;
    titleBg?: string;
    bg?: string;
    // {
    //   template: string;
    //   options: string;
    //   css: string;
    // }
    component?: string;
}

interface Node {
    id?: string;
    name: string;
    key: string;
    //从插件返回的node,他的serverKey就是插件key
    fromPlugin?: boolean;
    githubUrl?: boolean;
    //节点所属server的key，例如python服务，java服务等
    serverKey?: string;
    input: Input[];
    output: Output[];
    func: Func;
    ui?: NodeUi;
    preview?: boolean; //节点预览模式
    des?: string//节点描述
}

interface Flow {
    key?: string;
    name?: string;
    categoryNameFlowId?: number;
    edges: Edge[];
    nodes: Node[];
    store?: {
        nodeUserInputsMap?: { [nodeId: string]: { [key: string]: any } };
    };
}

interface Cell {
    node: string;
    port: string;
}

interface Edge {
    id: string;
    source: Cell;
    target: Cell;
    //states是响应式的,disable是线的禁用，onlySync是线在启用状态下是否仅同步模式,useAfterRun是线在有值的时候，可以触发节点，但节点不需要它的触发也可以运行
    states?: { disable?: boolean, onlySync?: boolean, useAfterRun?: boolean, mode?: "onlySync" | "normal" | "useAfterRun" }
}

type NodeRunState = "running" | "success" | "error" | "none";

interface NodeState {
    runState: NodeRunState;
    error: { message: string };
}

interface NodeInValueMap {
    [key: string]: { value: any; default: any };
}

type FlowGraphOptions = Partial<GraphOptions.Manual>;

interface SystemConfig {
    customPyFuncHref?: string
}

export type {
    Param,
    Input,
    Output,
    Edge,
    Node,
    Flow,
    Cell,
    PortId,
    Func,
    FlowGraphOptions,
    NodeInValueMap,
    NodeState,
    NodeRunState,
    SystemConfig
};


