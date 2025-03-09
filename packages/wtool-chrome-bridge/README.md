# Chrome bridge

支持`Promise`的`运行环境(content script, popup, devtool, web, iframe, service-worker)`的通信方式，封装了`chrome.runtime.sendMessage`与`window.postMessage`

# Usage

```typescript
// content script 
// must be required, if you want to request `web`
import { ContentBridge } from '@yuhufe/browser-bridge'
export const contentBridge = new ContentBridge() 

// web
import { WebBridge, Plat } from '@yuhufe/browser-bridge'
export const webBridge = new WebBridge();
webBridge.on(`${Plat.web}/getPiniaInfo`, async function({ key }) {
  console.log(key); // 'board'
  return Promise.resolve({ a: 1 });
});


// devtool.js
import { DevtoolBridge, Plat } from '@yuhufe/browser-bridge'
export const devtoolBridge = new DevtoolBridge() // must be required, if you want to request `web`

const piniaInfo = await devtoolBridge.request(`${Plat.web}/getPiniaInfo`, { key: 'board' });
console.log(piniaInfo); // { a: 1 }
```

注意：
- 每个bridge在当前执行环境只能`new`1次，否则会重复监听事件
- 如果需要和`web`环境进行通信，必须初始化`ContentBridge`，因为需要通过`content script`和`web`通信

# Install

```
npm install @yuhufe/browser-bridge
```

# 运行环境
- web: tab页面
- [content script](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [popup](https://developer.chrome.com/docs/extensions/develop/ui/add-popup)
- [devtool](https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools)
- [extension service worker](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/basics)
- iframe

![image](./assets/runtime_envs.png)
