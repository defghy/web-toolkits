import { Ref } from 'vue'
import type Konva from 'konva'
export const useCenterAndFitImg = ({
  wrapperRef,
  getStage,
  backImgInfo,
}: {
  wrapperRef: Ref<HTMLElement>
  getStage: () => Konva.Stage
  backImgInfo
}) => {
  const centerAndFitImg = async () => {
    if (!backImgInfo.value) {
      return
    }
    //缩放比例
    const { width: wrapWidth, height: wrapHeight } = wrapperRef.value.getBoundingClientRect()
    //背景图有缩放
    const imgWidth = backImgInfo.value.width * backImgInfo.value.scale
    const imgHeight = backImgInfo.value.height * backImgInfo.value.scale
    const scaleX = wrapWidth / imgWidth
    const scaleY = wrapHeight / imgHeight
    //宽高较小值
    const scale = Math.min(scaleX, scaleY)
    const stage = getStage()
    stage?.scale({ x: scale, y: scale })
    //居中
    const scaledWidth = imgWidth * scale
    const scaledHeight = imgHeight * scale
    const offsetX = (wrapWidth - scaledWidth) / 2 - backImgInfo.value.x * scale
    const offsetY = (wrapHeight - scaledHeight) / 2 - backImgInfo.value.y * scale
    stage?.position({ x: offsetX, y: offsetY })
  }
  return {
    centerAndFitImg,
  }
}
