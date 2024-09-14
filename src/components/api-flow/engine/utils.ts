import type {Flow, Node, PortId} from "./types";
import type {Edge} from "./types";
import {Point} from "@antv/x6";
import {generateID} from "@/components/api-flow/common-utils";

export function makePortId(nodeId: string, portType: 'in' | 'out', portKey: string): PortId {
    return `${nodeId}-${portType}-${portKey}`
}

export function makeEdgeId(edge: Edge) {
    return makePortId(edge.source.node, 'out', edge.source.port) + '__' + makePortId(edge.target.node, 'in', edge.target.port)
}

export function makeEdgeIdByPortId(sourcePortId: string, targetPortId: string) {
    return sourcePortId + '__' + targetPortId
}

export function parsePortId(key: PortId) {
    const strList = key.split('-')
    return {
        nodeId: strList[strList.length - 3],
        portType: strList[strList.length - 2],
        portKey: strList[strList.length - 1]
    }
}

export const findStartNodes = (edges: Edge[]): string[] => {
    const connectDic = {}
    edges.forEach(
        edge => {
            if (connectDic[edge.source.node] == undefined) {
                connectDic[edge.source.node] = {in: 0, out: 0}
            }
            connectDic[edge.source.node].out++

            if (connectDic[edge.target.node] == undefined) {
                connectDic[edge.target.node] = {in: 0, out: 0}
            }
            connectDic[edge.target.node].in++
        }
    )
    const startNodeIdList = Object.keys(connectDic).filter(
        (key) => connectDic[key].in == 0
    )
    return startNodeIdList
}

export function centerRouter(vertices, args, view) {
    const sourceCorner = view.sourceBBox.getCenter()
    const targetCorner = view.targetBBox.getCenter()
    return [{
        x: (sourceCorner.x + targetCorner.x) / 2,
        y: sourceCorner.y
    }, {
        x: (sourceCorner.x + targetCorner.x) / 2,
        y: (sourceCorner.y + targetCorner.y) / 2
    }, {x: (sourceCorner.x + targetCorner.x) / 2, y: targetCorner.y}]
}

export function makeDefaultNode(): Node {
    return {
        func: {code: "", lang: "javascript"}, input: [], output: [],
        id: "",
        name: "",
        key: generateID(),
        ui: {
            // component: {
            //     options: "",
            //     css: "",
            //     template: ""
            // }
            component: ""
        }
    }
}

export function makeDefaultFlow(): Flow {
    return {
        key: generateID(),
        store: {},
        nodes: [],
        edges: []
    }
}

export function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export async function fileDownload(url: string, filename: string) {
    // if (window.__TAURI__) {
    //     // 打开文件对话框，让用户选择保存路径
    //     const savePath = await window.__TAURI__.dialog.open({directory: true})
    //     // 使用Tauri API下载文件到用户选择的路径中
    //     window.__TAURI__.tauri.download({
    //         url: window.apiUrl+'/fineflow/export/nodes', // 文件的URL
    //         filename: 'flows.json', // 文件名
    //         saveAs: savePath // 指定下载路径为用户选择的路径
    //     });
    //
    // } else {
        const link = document.createElement('a');
        link.href = url
        // 将<a>元素添加到文档中，并模拟点击
        document.body.appendChild(link);
        link.click();
        // 清理操作
        document.body.removeChild(link);
    // }
}