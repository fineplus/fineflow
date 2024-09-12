import {dayjs} from "element-plus";

function copy<T extends any>(obj: T): T {
    if (obj) {
        return JSON.parse(JSON.stringify(obj));
    } else {
        return obj;
    }
}

function isObject(obj: any) {
    return Object.prototype.toString.call(obj) === "[object Object]";
}

function isArray(arr: any) {
    return Array.isArray(arr);
}

function generateUUID() {
    let d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
        d += performance.now(); //use high-precision timer if available
    }
    let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
    );
    return uuid;
}

function generateID() {
    // decimalTo62
    let decimal = Date.now() + Math.ceil(Math.random() * 10000);
    const characters =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";

    do {
        result = characters[decimal % 62] + result;
        decimal = Math.floor(decimal / 62);
    } while (decimal > 0);

    return result;
}

function merge<T>(target, ...arg): T {
    return arg.reduce((acc, cur) => {
        return Object.keys(cur).reduce((subAcc, key) => {
            const srcVal = cur[key];
            if (isObject(srcVal)) {
                subAcc[key] = merge(subAcc[key] ? subAcc[key] : {}, srcVal);
            } else if (isArray(srcVal)) {
                // series: []，下层数组直接赋值
                subAcc[key] = srcVal.map((item, idx) => {
                    if (isObject(item)) {
                        const curAccVal = subAcc[key] ? subAcc[key] : [];
                        return merge(curAccVal[idx] ? curAccVal[idx] : {}, item);
                    } else {
                        return item;
                    }
                });
            } else {
                subAcc[key] = srcVal;
            }
            return subAcc;
        }, acc);
    }, target);
}

async function saveJsonToFile(data, name = "") {
    const jsonString = JSON.stringify(data, null, 2); // 使用缩进和格式化
    const blob = new Blob([jsonString], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const currentDateTime = dayjs().format("YYYY-MM-DD-HH-mm-ss");
    const filename = `${name || ""}${currentDateTime}.json`;
    if (window.__TAURI__) {
        // 打开文件对话框，让用户选择保存路径
        const savePath = await window.__TAURI__.dialog.save({
            defaultPath: `${name || ""}${currentDateTime}`,
            filters: [{
                name: "json",
                extensions: ['json']
            }]
        })
        await window.__TAURI__.fs.writeTextFile(savePath, jsonString);
    } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename
        a.click();
        URL.revokeObjectURL(url);
    }
}

async function loadJsonFile(): Promise<null | any> {
    return new Promise((resolve, reject) => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.addEventListener("change", function (event) {
            handleFileSelect(event);
        });
        fileInput.click();

        function handleFileSelect(event) {
            const file = event.target.files[0]; // 获取选择的文件

            if (!file) {
                resolve(null);
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                const fileContent = event.target.result; // 获取文件内容
                try {
                    const jsonData = JSON.parse(fileContent as string); // 尝试解析 JSON 数据
                    resolve(jsonData);
                } catch (error) {
                    console.warn("无法解析为有效的 JSON", error);
                    resolve(null);
                }
            };
            reader.readAsText(file); // 以文本形式读取文件
        }
    });
}

export {copy, merge, generateUUID, generateID, saveJsonToFile, loadJsonFile};
