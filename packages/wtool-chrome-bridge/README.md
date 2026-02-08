# Chrome bridge

A `Proimse` communication method between `runtime envs`, such as 
- `chrome.runtime.sendMessage`
- `(window | vscode | vscode.panel.webview |worker).postMessage`
- `Electron.WebContents.send`

# Install

```
npm install @yuhufe/browser-bridge
```

# Runtime Envs
- web: main page
- [content script](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [popup](https://developer.chrome.com/docs/extensions/develop/ui/add-popup)
- [devtool](https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools)
- [extension service worker](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/basics)
- iframe: `<iframe src="...">`
- opener: `window.open()`

![image](./assets/runtime_envs.png)

# API

```typescript
interface BridgeOptions {
  trace?: boolean // trace api route； for debug
  noResponse?: boolean // just send, no need response
  timeout?: number // api timeout milliseconds
  chunk?: { size?: number } // large data(request params && response data) cannot send by once postMessage, need split into chunk
}

// on listen api
function on(path: string, async (params: any): Promise<any>): void

// send trigger api; no response
function send(path: string, params: any, options?: BridgeOptions): void

// request trigger api; has response
async function request(path: string, params: any, options?: BridgeOptions): Promise<any>
```

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

## typescript

API typescript definition

```typescript
export const Plat = {
  host: 'host',
  client: 'client',
} as const

export const SandboxAPI = {
  host: {
    clientReady: `${Plat.host}/clientReady`,
  },
  client: {
    getData: `${Plat.client}/getData`,
  },
} as const

export interface SandboxFuncs {
  [SandboxAPI.host.clientReady]: () => any
  [SandboxAPI.client.getData]: (args: {
    needUbf?: boolean
    needSnap?: boolean
  }) => Promise<{ ubf?: any; snap?: any }>
}

// host.ts
import { IFrameTopBridge } from '@yuhufe/browser-bridge'
const hostBridge = new IFrameTopBridge<SandboxFuncs>({ plat: Plat.host, frameKey: Plat.client, frameEl })
// request params and return's ts types
const { snap } = await hostBridge?.request(SandboxAPI.client.makeLevelDataByAI, { needUbf: true, needSnap: false })

// client.ts
import { IFrameBridge } from '@yuhufe/browser-bridge'
const clientBridge = new IFrameBridge<SandboxFuncs>({ frameKey: Plat.client })
// on handler's ts types
clientBridge?.on(SandboxAPI.client.makeLevelDataByAI, makeLevelAIData)
```

# Details
- (中文说明)[https://segmentfault.com/a/1190000046415823]
- (English Doc)[https://defghy.github.io/docs/bridge]

# Publish

```
npm run build
npm publish --otp=123456
```
