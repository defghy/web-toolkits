import { WebBridge } from './contexts/web'
import { ContentBridge } from './contexts/content'
import { DevtoolBridge } from './contexts/devtool'
import { BackgroundBridge } from './contexts/background'
import { IFrame, IFrameTop } from './contexts/iframe'
import { Plat } from './const'

export const IFrameBridge = IFrame
export const IFrameTopBridge = IFrameTop

export { WebBridge, ContentBridge, DevtoolBridge, BackgroundBridge, Plat, IFrame, IFrameTop }
