import {sapi} from "./common"
import {components} from "./schema";

type st = components['schemas']
const spost = sapi.post
export {sapi, spost}
export type {st}
