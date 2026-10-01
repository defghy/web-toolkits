// 轻量消息提示：不依赖任何 UI 库，避免为库引入额外样式依赖
type MsgStatus = 'success' | 'error' | 'warning' | 'info'

const STATUS_COLOR: Record<MsgStatus, string> = {
  success: '#52c41a',
  error: '#ff4d4f',
  warning: '#faad14',
  info: '#1677ff',
}

const getContainer = function () {
  const id = 'wtool-bezier-message-container'
  let container = document.getElementById(id)
  if (!container) {
    container = document.createElement('div')
    container.id = id
    container.style.cssText = [
      'position:fixed',
      'top:16px',
      'left:50%',
      'transform:translateX(-50%)',
      'z-index:9999',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'gap:8px',
      'pointer-events:none',
    ].join(';')
    document.body.appendChild(container)
  }
  return container
}

const show = function (status: MsgStatus, msg: string, duration = 2000) {
  if (typeof document === 'undefined' || !document.body) {
    console.warn(`[wtool-bezier] ${msg}`)
    return
  }

  const el = document.createElement('div')
  el.textContent = msg
  el.style.cssText = [
    'padding:6px 14px',
    'border-radius:4px',
    'font-size:13px',
    'line-height:1.5',
    'color:#fff',
    'white-space:nowrap',
    'background:' + STATUS_COLOR[status],
    'box-shadow:0 2px 8px rgba(0,0,0,0.25)',
    'transition:opacity .2s, transform .2s',
    'opacity:0',
    'transform:translateY(-6px)',
  ].join(';')

  const container = getContainer()
  container.appendChild(el)
  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  })

  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(-6px)'
    setTimeout(() => el.remove(), 220)
  }, duration)
}

export const $tinymsg = {
  success: (msg: string) => show('success', msg),
  error: (msg: string) => show('error', msg),
  warning: (msg: string) => show('warning', msg),
  info: (msg: string) => show('info', msg),
}
