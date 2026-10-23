/* Small, dependency-free UI effects: leaf burst, soft chime, share/copy, file download. */

const BURST = ['🍃', '🌿', '✨', '💚', '🌱']

export function leafBurst(origin?: HTMLElement | null, reduceMotion = false): void {
  if (reduceMotion || typeof document === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const rect = origin?.getBoundingClientRect()
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
  const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
  const layer = document.createElement('div')
  layer.className = 'fx-layer'
  layer.setAttribute('aria-hidden', 'true')
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('span')
    s.className = 'fx-leaf'
    s.textContent = BURST[i % BURST.length]
    const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4
    const dist = 50 + Math.random() * 70
    s.style.left = `${x}px`
    s.style.top = `${y}px`
    s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`)
    s.style.setProperty('--dy', `${Math.sin(angle) * dist - 30}px`)
    s.style.setProperty('--rot', `${Math.round(Math.random() * 360 - 180)}deg`)
    s.style.animationDelay = `${Math.random() * 60}ms`
    layer.appendChild(s)
  }
  document.body.appendChild(layer)
  window.setTimeout(() => layer.remove(), 1100)
}

let audioCtx: AudioContext | null = null

export function chime(enabled: boolean): void {
  if (!enabled) return
  try {
    const Ctor = window.AudioContext
    if (!Ctor) return
    audioCtx = audioCtx ?? new Ctor()
    const ctx = audioCtx
    const now = ctx.currentTime
    ;[660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, now + i * 0.09)
      gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.09 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.35)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + i * 0.09)
      osc.stop(now + i * 0.09 + 0.4)
    })
  } catch {
    /* audio not available */
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}

/** Web Share API when available, otherwise copy to clipboard. Returns what happened. */
export async function shareOrCopy(title: string, text: string, url: string): Promise<'shared' | 'copied' | 'failed' | 'cancelled'> {
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
  if (typeof nav.share === 'function' && window.matchMedia?.('(pointer: coarse)').matches) {
    try {
      await nav.share({ title, text, url })
      return 'shared'
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
    }
  }
  return (await copyText(`${text} ${url}`)) ? 'copied' : 'failed'
}

export function downloadFile(name: string, content: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function appUrl(hash = ''): string {
  const { origin, pathname } = window.location
  const base = origin.startsWith('http') && !origin.includes('localhost') ? `${origin}${pathname}` : 'https://jaineil32624.github.io/EcoPulse/'
  return hash ? `${base}#${hash}` : base
}
