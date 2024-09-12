//前后端状态同步，使用webscoket

import type {FlowServerModelType} from "@/api/database/db/server";
import type {FlowStore} from "@/components/api-flow/engine/editor";


interface GetAllStateEvent {
    event: 'get_all_state'
    data: { [nodeId: string]: any }
}

interface UpdateNodeStateEvent {
    event: 'update_node_state'
    data: { node_id: string, path: string, value: any }
}

type EventData = GetAllStateEvent | UpdateNodeStateEvent

function setValueFromPath(path, value, data) {
    if (path.includes('.')) {
        let pathData = data
        let keys = path.split(".")
        const findKeys = keys.slice(0, -1)
        const setKey = keys[keys.length - 1]
        findKeys.forEach(key => {
            if (!pathData[key]) {
                pathData[key] = {}
            }
            pathData = pathData[key]
        })
        pathData[setKey] = value
    } else {
        data[path] = value
    }
}

export class StateSync {
    socketMap = {}
    workId: string
    flowStore: FlowStore

    constructor(workId: string, flowStore: FlowStore) {
        this.workId = workId
        this.flowStore = flowStore
    }

    addSocket(flowServer: FlowServerModelType) {

        if (this.socketMap[flowServer.key]) {
            return
        }
        this.socketMap[flowServer.key] = flowServer
        this.connectSocket(flowServer.key, flowServer.href, {})

    }

    connectSocket(key: string, href: string, intervalGlb?: any) {
        try {
            const url = new URL(href)
            const socket = new WebSocket('ws://' + url.host + url.pathname + '/ws/' + this.workId,);

            socket.onopen = () => {
                (intervalGlb && intervalGlb.interval !== null) && clearInterval(intervalGlb.interval)
                intervalGlb.interval = null
                // try {
                //     window.getNodeTreeFromServer(key, href)
                // }catch (e) {
                //     console.warn(e)
                // }
                socket.onclose = () => {
                    intervalGlb.interval = setInterval(() => {
                        console.log('正在执行重连', 'ws://' + url.host + url.pathname + '/ws/' + this.workId)
                        this.connectSocket(key, href, intervalGlb)
                    }, 5000)
                }

                socket.onmessage = (event) => {
                    try {
                        const data: EventData = JSON.parse(event.data)
                        if (data.event == 'get_all_state') {
                            Object.keys(data.data).forEach(nodeId => {
                                let node = this.flowStore.fineNodeMap[nodeId]
                                if (node) {
                                    node.serverStates.value = data.data[nodeId]
                                }
                            })
                        } else if (data.event == 'update_node_state') {
                            const {node_id, path, value} = data.data
                            let node = this.flowStore.fineNodeMap[node_id]
                            if (node) {
                                if (!path || path == '.') {
                                    if (typeof value !== "object") {
                                        return
                                    }
                                    node.serverStates.value = value
                                } else {
                                    setValueFromPath(path, value, node.serverStates.value)
                                }
                            }
                        }
                    } catch
                        (e) {
                        console.log(e)
                    }
                };
                socket.send(JSON.stringify({event: 'get_all_state'}));

            };


        } catch (e) {
            // intervalGlb.interval = setInterval(() => {
            //     console.log('正在执行重连', 'ws://' + url.host + url.pathname + '/ws/' + this.workId)
            //     this.connectSocket(key, href, intervalGlb)
            // }, 5000)
            console.warn(e)
        }
    }

}