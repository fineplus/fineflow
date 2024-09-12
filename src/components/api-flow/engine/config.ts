import { Options as GraphOptions } from "@antv/x6/src/graph/options";

export const edgeNormalColor = '#bdc8d9'
export const edgeOnlySyncColor = '#8fafff'
export const edgeUseAfterRunColor = '#8fafff'
export const edgeDisableColor = '#5f5f5f'
export const edgeSuccessColor = 'rgb(88,246,48)'
export const edgeModeColorMap = { 'normal': edgeNormalColor, "onlySync": edgeOnlySyncColor, "useAfterRun": edgeNormalColor }
// export const editNodeNormalColor = '#6ad5a1'
// export const editNodeNormalColor = '#212226'
// export const editNodeNormalColor = 'rgba(47, 47, 58, 1)'
export const editNodeNormalColor = 'rgba(47, 47, 58, 1)'
export const editEdge = {
    shape: "editEdge",
    zIndex: -1,
    attrs: {
        wrap: {
            strokeWidth: 10
        },
        line: {
            stroke: edgeNormalColor,
            sourceMarker: null,
            //不需要箭头
            targetMarker: null,
            // targetMarker: 'block'
        }
    },
    router: {
        // name: "manhattan"
        name: "normal",

    },
    connector: {
        name: 'smooth',
        args: {},
    },
}

export const editNode = {
    width: 160,
    height: 60,
    inherit: 'rect',
    attrs: {
        body: {
            stroke: null,
            strokeWidth: null,
            refWidth: 1,
            refHeight: 1,
            cursor: "pointer",
            fill: editNodeNormalColor,
            rx: 14,
            ry: 14,
        },
        label: {
            fontSize: 14,
            fill: 'rgba(0,0,0,0.8)'

        }
    }, ports: {
        groups: {
            in: {
                label: {
                    position: {
                        name: 'top', args: {
                            y: -9
                        }
                    },
                },
                position: "top",
                attrs: {
                    text: {
                        fontSize: 8,
                        fill: "white",
                        type: "portText",
                        event: "text:click"
                    },
                    circle: {
                        event: "port:click",
                        r: 6,
                        magnet: true,
                        stroke: '#31a0d0',
                        strokeWidth: 1,
                        fill: '#fff',
                    },
                },
            },
            out: {
                label: {
                    position: {
                        name: 'bottom', args: {
                            y: 9
                        }
                    },

                },
                position: 'bottom',
                attrs: {
                    text: {
                        fontSize: 8,
                        fill: "white",
                        event: "text:click",
                        type: "portText"
                    },
                    circle: {
                        event: "port:click",
                        r: 6,
                        magnet: true,
                        stroke: '#31a0d0',
                        strokeWidth: 1,
                        fill: '#fff',
                    },
                },
            },
        },
    },
    markup: [
        {
            tagName: 'rect',
            selector: 'body',
        }, {
            tagName: 'text',
            selector: 'label',
        },
    ]
}


export const vueNodeConfig = {
    shape: 'custom-vue-node',
    width: 100,
    height: 100,
    // portMarkup: [Markup.getForeignObjectMarkup()],
    ports: {
        groups: {
            in: {
                label: {
                    position: {
                        name: 'left', args: {
                            // y: -9
                        }
                    },
                },
                // markup: [
                //     {
                //         tagName: 'path',
                //         selector: 'portBody',
                //         attrs:{
                //             d:'M 50 50 A 50 50 0 0 1 100 50',
                //             fill:null,
                //             stroke:'black',
                //             width:20
                //         }
                //     },
                // ],
                position: { name: 'absolute', args: { x: 0 } },
                attrs: {
                    // portBody: {
                    //     magnet: 'passive',
                    // },
                    text: {
                        fontSize: 10,
                        display: 'none',
                        fill: "rgb(240,248,255)",
                        type: "portText",
                        event: "text:click"
                    },
                    circle: {
                        event: "port:click",
                        r: 4,
                        magnet: true,
                        stroke: 'rgba(136,203,230,0.5)',
                        strokeWidth: 0.5,
                        fill: 'rgb(214,217,227)',
                    },
                },
            },
            out: {
                label: {
                    position: {
                        name: 'right', args: {
                            // x: 6,
                            // y: 9
                        }
                    },

                },
                position: { name: 'absolute', args: { x: "100%" } },
                attrs: {
                    text: {
                        fontSize: 10,
                        fill: "rgb(240,248,255)",
                        event: "text:click",
                        type: "portText"
                    },
                    circle: {
                        event: "port:click",
                        r: 4,
                        magnet: true,
                        stroke: 'rgba(136,203,230,0.5)',
                        strokeWidth: 0.5,
                        fill: 'rgb(214,217,227)',
                    },
                },
            },
        },
    }
}
export const FlowGraphDefaultOptions: Partial<GraphOptions.Manual> = {
    autoResize: true,
    grid: { size: 2, visible: false },
    interacting: {
        vertexMovable: true,
        vertexAddable: true,
        vertexDeletable: true,
        useEdgeTools: true,
        nodeMovable: true //node是否可以拖拽
    },
    panning: true,
    mousewheel: true,
}

export const FlowGraphDefaultConnectingOptions = {
    router: {
        name: 'manhattan',
        args: {
            padding: 20
        }
    },
    connector: {
        name: 'rounded',
        args: {
            radius: 8
        }
    },

    anchor: 'center',
    connectionPoint: 'anchor',
    allowBlank: false,
    allowNode: false,
    allowLoop: false,
}


export interface WobbleArgs {
    spread?: number
    raw?: boolean
}

