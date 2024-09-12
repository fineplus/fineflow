// 给节点使用的公共工具,统一挂载在fine上


import { cdnStore } from "@/components/api-flow/engine/store";
import { open } from '@tauri-apps/plugin-dialog';

export function loadCDN(name: string, url?: string) {
    console.log('loadCDN')
    return new Promise((resolve, reject) => {
        if (!url) {
            url = cdnStore.libs[name]
        }
        if (!url) {
            console.log(`CDN ${name} 的url 为空`);
            resolve({ state: 0, msg: "url为空" })
            return; // 如果已加载，则直接返回，不再重复加载
        }
        if (cdnStore.loaded[name]) {
            console.log(`CDN ${url} 已经加载，无需重复加载`);
            resolve({ state: 1 })
            return; // 如果已加载，则直接返回，不再重复加载
        }

        // 创建一个 script 元素
        const script = document.createElement('script');
        script.src = url;
        script.onload = (ev) => {
            cdnStore.loaded[name] = true
            console.log(`CDN ${name}  ${url} 已加载`);
            resolve({ ev, state: 1 })

        };
        document.head.appendChild(script);
    })
}

function creatHtmlIframe(el: HTMLElement, html: string) {
    if (!el) {
        return;
    }
    const iframe = document.createElement("iframe");
    // 设置 iframe 的样式和属性
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.addEventListener("load", function () {
        // 获取 iframe 的文档对象
        const iframeDocument =
            iframe.contentDocument || iframe.contentWindow?.document;
        // 写入 HTML 内容到 iframe 中
        iframeDocument?.open();
        iframeDocument?.write(html);
        iframeDocument?.close();
    });
    el.append(iframe);
}
async function filePathGet(multiple: boolean = false, filters = [{
    name: 'Image',
    extensions: ['png', 'jpeg']
}]) {
    const selected = await open({
        multiple: true,
        filters: filters
    });
    return selected

}


export const fineTools = {
    loadCDN,
    creatHtmlIframe,
    filePathGet
}
