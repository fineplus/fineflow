import { computed, ref, type Ref } from "vue";
import type { Node } from "@/components/api-flow/engine/types";

export function useNodeResize(
  x6Node,
  node: Ref<Node>,
  height: Ref<number>,
  inputsHeight: Ref<number>,
  onResize?: () => any
) {
  const resizeInfo: { able: boolean; onmouseup: any } = {
    able: false,
    onmouseup: null,
  };
  const resizeToolSize = ref(16);
  const stopResize = (e) => {
    resizeInfo.onmouseup?.(e);
    resizeInfo.onmouseup = null;
  };

  let startResize = (downE: MouseEvent) => {
    const startX = downE.screenX;
    const startY = downE.screenY;
    const size = x6Node.getSize();
    const startWidth = Number(size.width);
    const startHeight = Number(size.height);
    const scale =
      x6Node._model.graph.getGraphArea().width /
      x6Node._model.graph.options.width;
    resizeToolSize.value = 180 * scale;

    resizeInfo.able = true;
    const onmousemove = (e) => {
      if (e.buttons !== 1) {
        onmouseup(e);
        return;
      }
      const newWidth = Math.max(
        (e.screenX - startX) * scale + startWidth,
        inputsHeight.value,
        66
      );
      const newHeight = Math.max(
        (e.screenY - startY) * scale + startHeight,
        inputsHeight.value,
        66
      );
      if (!node.value.ui) {
        //@ts-ignore
        node.value.ui = { width: newWidth, height: newHeight };
      }
      node.value.ui.width = newWidth;
      node.value.ui.height = newHeight;
      height.value = newHeight;
      x6Node.setSize;
      x6Node.setSize(newWidth, newHeight);
      onResize?.()
    };
    const onmouseup = (e) => {
      resizeInfo.able = false;
      window.removeEventListener("mousemove", onmousemove, true);
      window.removeEventListener("mouseup", onmouseup, true);
      resizeInfo.onmouseup = null;
      resizeToolSize.value = 16;
    };
    resizeInfo.onmouseup = onmouseup;
    window.addEventListener("mousemove", onmousemove, true);
    window.addEventListener("mouseup", onmouseup, true);
  };
  const resizeToolSizeStyle = computed(() => {
    return {
      width: resizeToolSize.value + "px",
      height: resizeToolSize.value + "px",
      bottom: -resizeToolSize.value / 2 + "px",
      right: -resizeToolSize.value / 2 + "px",
    };
  });
  return {
    resizeInfo,
    resizeToolSize,
    onmousemove,
    onmouseup,
    startResize,
    stopResize,
    resizeToolSizeStyle,
  };
}
