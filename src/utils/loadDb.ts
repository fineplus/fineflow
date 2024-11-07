import {BaseDirectory, exists, writeFile, create} from '@tauri-apps/plugin-fs';
import sql from "@tauri-apps/plugin-sql"

export const allDb = {db: null}

export async function loadDb() {
    if (allDb.db) {
        return
    }
    if (!await exists('fineflow.db', {baseDir: BaseDirectory.AppConfig})) {
        const response = await fetch('/fineflow.db');
        const arrayBuffer = await response.arrayBuffer();
        const array = new Uint8Array(arrayBuffer)
        const file = await create('fineflow.db', {baseDir: BaseDirectory.AppConfig});
        await writeFile('fineflow.db', array, {baseDir: BaseDirectory.AppConfig})
    }
    allDb.db = await sql.load('sqlite:fineflow.db')
}

window.loaddb = loadDb

