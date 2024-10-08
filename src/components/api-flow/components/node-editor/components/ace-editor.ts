//@ts-nocheck
import { capitalize, defineComponent, markRaw, h } from 'vue';
import ResizeObserver from 'resize-observer-polyfill';
import { Ace } from "ace-builds";

import ace from "ace-builds";
import modeJavascript from 'ace-builds/src-noconflict/mode-javascript';
import modeHtml from 'ace-builds/src-noconflict/mode-html';
import modePython from 'ace-builds/src-noconflict/mode-python';
import dracula from 'ace-builds/src-noconflict/theme-dracula';
ace.config.setModuleUrl('ace/mode/javascript', modeJavascript)
ace.config.setModuleUrl('ace/mode/python', modePython)
ace.config.setModuleUrl('ace/mode/html', modeHtml)
ace.config.setModuleUrl("ace/theme/dracula", dracula);
// var ace: Ace
// if (process.env.USE_CDN) {
//     ace = window.ace
//     ace.config.setModuleUrl('ace/mode/javascript', 'https://cdn.bootcdn.net/ajax/libs/ace/1.24.2/mode-javascript.min.js')
//     ace.config.setModuleUrl('ace/mode/python', 'https://cdn.bootcdn.net/ajax/libs/ace/1.24.2/mode-python.min.js')
//     ace.config.setModuleUrl('ace/mode/html', 'https://cdn.bootcdn.net/ajax/libs/ace/1.24.2/mode-html.min.js')
//     ace.config.setModuleUrl("ace/theme/dracula", 'https://cdn.bootcdn.net/ajax/libs/ace/1.24.2/theme-dracula.min.js');
// }
// else {
//     ace = () => import("ace-builds")
//     let modeJavascript = () => import("ace-builds/src-noconflict/mode-javascript")
//     let modeHtml = () => import("ace-builds/src-noconflict/mode-html")
//     let modePython = () => import("ace-builds/src-noconflict/mode-python")
//     let dracula = () => import("ace-builds/src-noconflict/theme-dracula")
//     ace.config.setModuleUrl('ace/mode/javascript', modeJavascript)
//     ace.config.setModuleUrl('ace/mode/python', modePython)
//     ace.config.setModuleUrl('ace/mode/html', modeHtml)
//     ace.config.setModuleUrl("ace/theme/dracula", dracula);
// }
// const ace = await @import("ace-builds");
// ace.config.setModuleUrl('ace/mode/javascript', 'https://cdn.bootcdn.net/ajax/libs/ace/1.24.2/mode-javascript.min.js')
// ace.config.setModuleUrl('ace/mode/python', 'https://cdn.bootcdn.net/ajax/libs/ace/1.24.2/mode-python.min.js')
// ace.config.setModuleUrl('ace/mode/html', 'https://cdn.bootcdn.net/ajax/libs/ace/1.24.2/mode-html.min.js')
// ace.config.setModuleUrl("ace/theme/dracula", 'https://cdn.bootcdn.net/ajax/libs/ace/1.24.2/theme-dracula.min.js');
// ace.config.setModuleUrl('ace/mode/javascript', '/lib/ace/1.24.2/mode-javascript.min.js')
// ace.config.setModuleUrl('ace/mode/python', '/lib/ace/1.24.2/mode-python.min.js')
// ace.config.setModuleUrl('ace/mode/html', '/lib/ace/1.24.2/mode-html.min.js')
// ace.config.setModuleUrl("ace/theme/dracula", '/lib/ace/1.24.2/theme-dracula.min.js');

const Events = [
    'blur',
    'input',
    'change',
    'changeSelectionStyle',
    'changeSession',
    'copy',
    'focus',
    'paste',
];

export const VAceEditor = defineComponent({
    name: 'VAceEditor',
    props: {
        value: {
            type: String,
            required: true,
        },
        lang: {
            type: String,
            default: 'text',
        },
        theme: {
            type: String,
            default: 'chrome',
        },
        options: Object,
        placeholder: String,
        readonly: Boolean,
        wrap: Boolean,
        printMargin: {
            type: [Boolean, Number],
            default: true,
        },
        minLines: Number,
        maxLines: Number,
    },
    emits: ['update:value', 'init', ...Events],
    render(this) {
        return h('div');
    },
    mounted(this) {
        const editor = this._editor = markRaw(ace.edit(this.$el, {
            placeholder: this.placeholder,
            readOnly: this.readonly,
            value: this.value,
            mode: 'ace/mode/' + this.lang,
            theme: 'ace/theme/' + this.theme,
            wrap: this.wrap,
            printMargin: this.printMargin,
            useWorker: false,
            minLines: this.minLines,
            maxLines: this.maxLines,
            fontSize: '14px',
            printMarginColumn: false,
            autoScrollEditorIntoView: false,
            showGutter: false,
            ...this.options,
        }));
        editor.renderer.$gutterLayer.pointerEvents = "none"
        this._contentBackup = this.value;
        this._isSettingContent = false;
        editor.on('change', () => {
            // ref: https://github.com/CarterLi/vue3-ace-editor/issues/11
            if (this._isSettingContent) return;
            const content = editor.getValue();
            this._contentBackup = content;
            this.$emit('update:value', content);
        });
        Events.forEach(x => {
            const eventName = 'on' + capitalize(x);
            if (typeof this.$.vnode.props![eventName] === 'function') {
                editor.on(x as any, this.$emit.bind(this, x));
            }
        });
        this._ro = new ResizeObserver(() => editor.resize());
        this._ro.observe(this.$el);
        this.$emit('init', editor);
    },
    beforeUnmount(this) {
        this._ro?.disconnect();
        this._editor?.destroy();
    },
    methods: {
        focus(this) {
            this._editor.focus();
        },
        blur(this) {
            this._editor.blur();
        },
        selectAll(this) {
            this._editor.selectAll();
        },
        getAceInstance(this) {
            return this._editor;
        },
    },
    watch: {
        value(this, val: string) {
            if (this._contentBackup !== val) {
                try {
                    this._isSettingContent = true;
                    this._editor.setValue(val, 1);
                } finally {
                    this._isSettingContent = false;
                }
                this._contentBackup = val;
            }
        },
        theme(this, val: string) {
            this._editor.setTheme('ace/theme/' + val);
        },
        options(this, val: Partial<Ace.EditorOptions>) {
            this._editor.setOptions(val);
        },
        readonly(this, val: boolean) {
            this._editor.setReadOnly(val);
        },
        placeholder(this, val: string) {
            this._editor.setOption('placeholder', val);
        },
        wrap(this, val: boolean) {
            this._editor.setWrapBehavioursEnabled(val);
        },
        printMargin(this, val: boolean | number) {
            this._editor.setOption('printMargin', val);
        },
        lang(this, val: string) {
            this._editor.setOption('mode', 'ace/mode/' + val);
        },
        minLines(this, val: number) {
            this._editor.setOption('minLines', val);
        },
        maxLines(this, val: number) {
            this._editor.setOption('maxLines', val);
        },
    }
});
