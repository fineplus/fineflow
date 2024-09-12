import {defineComponent} from "vue";
import type {Component} from "vue";
import {generateID} from "../common-utils";
import {loadCDN} from "@/components/api-flow/engine/fine-tools";

export interface DynamicComponentConfig {
    template: string;
    options: string;
    css: string;
}

export const myComp: DynamicComponentConfig = {
    template: `
<div style="width: 40rem" class="xxx">{{msg}}</div><div>{{data&&data.node.name}}</div>
`,
    options: `
{
    props:['data'],
    data(){
        return {msg:'你哈哈哈哈'}
    },
    
}
`,
    css: `
    .xxx{
        color:red
    }
    `,
};

function getTemplateStr(tag: "template" | "style" | 'script', content: string) {
    const startTag = `<${tag}>`
    const endTag = `</${tag}>`
    const firstIndex = content.indexOf(startTag)
    const lastIndex = content.lastIndexOf(endTag)
    if (firstIndex !== -1 && lastIndex !== -1) {
        const res = content.slice(firstIndex + startTag.length, lastIndex)
        const charArr = content.split('')
        charArr.splice(firstIndex, lastIndex - firstIndex + endTag.length)
        content = charArr.join('')
        return {res, content}
    } else {
        return {res: "", content}
    }

}

//提取动态组件vue模板的内容
//使用贪婪匹配
export function extractVueContents(content: string) {
    // 提取 <template> 内容
    // const templateMatch = content.match(/<template.*?>([\s\S]*?)<\/template>/);
    // const templateMatch = content.match(/<template>([\s\S]*)<\/template>/);
    // const templateContent = templateMatch ? templateMatch[1] : '';

    // // 提取 <script> 内容
    // // const scriptMatch = content.match(/<script.*?>([\s\S]*?)<\/script>/);
    // const scriptMatch = content.match(/<script>([\s\S]*?(?:(?!<\/script>)[\s\S])*?)<\/script>/);
    // let scriptContent = scriptMatch ? scriptMatch[1] : '';
    // scriptContent = scriptContent.replace(/export\s+default\s+/g, '');
    // // 提取 <style> 内容
    // // const styleMatch = content.match(/<style.*?>([\s\S]*?)<\/style>/);
    // const styleMatch = content.match(/<style>([\s\S]*)<\/style>/);
    // const styleContent = styleMatch ? styleMatch[1] : '';

    let res = getTemplateStr('script', content)
    const scriptContent = res.res.replace(/export\s+default\s+/g, '');
    res = getTemplateStr('template', res.content)
    const templateContent = res.res
    res = getTemplateStr('style', res.content)
    const styleContent = res.res
    return {
        template: templateContent,
        script: scriptContent,
        style: styleContent
    };
}

export function makeVue(template: string, script: string, style: string) {
    return `<template>
${template}
</template>

<script>
${script}
</script>

<style>
${style}
</style>
`
}

//完全动态组件，可以从服务获取的那种
class DynamicComponent {
    template: string;
    parentId: string;
    optionsStr: string;
    cssStr: string;
    component?: Component;

    constructor(template: string, optionsStr: string, cssStr: string = "") {
        this.template = template;
        this.optionsStr = optionsStr;
        this.cssStr = cssStr;

    }


    scopedStyle(className: string) {
        if (this.cssStr) {
            const scope = `.${className}`;
            const regex = /(^|\})\s*([^{]+)/g;
            // 为class加前缀，做类似scope的效果
            return this.cssStr.trim().replace(regex, (m, g1, g2) => {
                if (g2.startsWith('#parent-node')) {
                    //父类id pid
                    let g2v = g2.replace('parent-node', className + '-pid')
                    return g1 ? `${g1} ${g2v}` : `${g2v}`;
                }
                return g1 ? `${g1} ${scope} ${g2}` : `${scope} ${g2}`;
            });
        }
        return "";
    }

    async loadLib(libConfig: any[]) {
        if (libConfig instanceof Array) {
            for (let item of libConfig) {
                if (typeof item == 'string') {
                    await loadCDN(item)
                } else {
                    await loadCDN(item.name, item.src)
                }
            }

        }
    }

    async createComponent() {
        //这个可以改为缓存
        const className = generateID();
        this.parentId = className + '-pid'
        const scopedCss = this.scopedStyle(className);
        let evalCopy = eval;
        try {
            const options = this.optionsStr.trim() ? evalCopy(`(${this.optionsStr})`) : {};
            options.template = `<div class="${className} h-full w-full"><component is="style">${scopedCss}</component>${this.template}</div>`;
            await this.loadLib(options.lib)
            return defineComponent(options);
        } catch (e) {
            console.warn(e);
            console.log("挂载动态组件失败");
        }
    }


}

export {DynamicComponent};
