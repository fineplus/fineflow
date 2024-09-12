import {BaseDirectory, exists, writeFile, create} from '@tauri-apps/plugin-fs';
import sql from "@tauri-apps/plugin-sql"

async function loadBinaryFile() {
    const response = await fetch('/fineflow.db');
    const arrayBuffer = await response.arrayBuffer();
    // 将 arrayBuffer 转换为 Uint8Array
    return new Uint8Array(arrayBuffer);
}

export const allDb = {db: null}

export async function loadDb() {
        if (!await exists('fineflow.db', {baseDir: BaseDirectory.AppConfig})) {
            const response = await fetch('/fineflow.db');
            const arrayBuffer = await response.arrayBuffer();
            const array = new Uint8Array(arrayBuffer)
            const file = await create('fineflow.db', {baseDir: BaseDirectory.AppConfig});
            await writeFile('fineflow.db', array,{baseDir: BaseDirectory.AppConfig})
        }
        allDb.db = await sql.load('sqlite:fineflow.db')
}

window.loaddb = loadDb

