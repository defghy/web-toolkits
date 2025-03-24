import { WebBridge } from './contexts/web'
import { ContentBridge } from './contexts/content'
import { DevtoolBridge } from './contexts/devtool'
import { BackgroundBridge } from './contexts/background'
import { IFrame, IFrameTop } from './contexts/iframe'
import { BaseBridge } from './base'
import { Plat, MsgDef } from './const'

export const IFrameBridge = IFrame
export const IFrameTopBridge = IFrameTop

export { BaseBridge, WebBridge, ContentBridge, DevtoolBridge, BackgroundBridge, Plat, MsgDef, IFrame, IFrameTop }
