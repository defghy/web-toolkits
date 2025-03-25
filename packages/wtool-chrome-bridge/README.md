# Chrome bridge

A `Proimse` communication method between `runtime envs`, encapsulating `chrome.runtime.sendMessage` and `window.postMessage`


# Runtime Envs
- web: main page
- [content script](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [popup](https://developer.chrome.com/docs/extensions/develop/ui/add-popup)
- [devtool](https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools)
- [extension service worker](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/basics)
- iframe: `<iframe src="...">`
- opener: `window.open()`

![image](./assets/runtime_envs.png)

# Usage

```typescript
const Plat = {
  web: 'testDevtoolsWeb'
};
const api = {
  getPinia: `${Plat.web}/getPiniaInfo`
}

// content script 
// must be required, if you want to request `web`
import { ContentBridge } from '@yuhufe/browser-bridge'
export const contentBridge = new ContentBridge({ platWeb: Plat.web }) 

// web.js
import { WebBridge } from '@yuhufe/browser-bridge'
export const webBridge = new WebBridge({ plat: Plat.web });
webBridge.on(api.getPinia, async function({ key }) {
  console.log(key); // 'board'
  return Promise.resolve({ a: 1 });
});


// devtool.js
import { DevtoolBridge } from '@yuhufe/browser-bridge'
export const devtoolBridge = new DevtoolBridge() // must be required, if you want to request `web`

const piniaInfo = await devtoolBridge.request(api.getPinia, { key: 'board' });
console.log(piniaInfo); // { a: 1 }
```

notice：
- `request` and `on` should use same `path`
- `path` must be start with `${Plat.*}` format，implied who's `server`
- If use `WebBridge`
  - must also use `ContentBridge`，because we need `content script` proxy `web`
  - `WebBridge` may have multiple, should set `plat`

# Install

```
npm install @yuhufe/browser-bridge
```

# Other Case

## iframe

`iframe.contentWindow` and `window.top` can also use bridge for `Promise`

```typescript
import { Plat } from '@yuhufe/browser-bridge'
// because we have only 1 top and multi iframe;
const frameKey = 'iframeTest' // multi iframe, so every iframe has a key
const topKey = Plat.iframeTop // 1 top so key is only one
const api = {
  getInfo: `${frameKey}/getInfo`,
  getTopInfo: `${topKey}/getTopInfo`
}

// top.js
import { IFrameTopBridge, Plat } from '@yuhufe/browser-bridge'
const iframeTestTop = new IFrameTop({ 
  frameKey, 
  frameEl: document.querySelector('iframe') 
})
iframeTestTop.on(api.getTopInfo, async function({ topname }) {
  console.log(topname);
  return { top: 1 };
});
const userInfo = await iframeTestTop.request(api.getInfo, { username: '' });

// iframe.js
import { IFrameBridge } from '@yuhufe/browser-bridge'
const iframeTest = new IFrameBridge({ frameKey })
iframeTest.on(api.getInfo, async function({ username }) {
  return { user: '', age: 0 }
});
const topInfo = await iframeTest.request(api.getTopInfo, { topname: '' });
```
