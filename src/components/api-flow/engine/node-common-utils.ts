//节点公用的一些方法

//创建html构成的Iframe
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

export { creatHtmlIframe };
