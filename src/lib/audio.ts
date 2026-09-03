// WebAudio 按键音（无需音频资源文件）
let ctx: AudioContext | null = null

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function blip(freq: number, duration: number, gain: number) {
  const ac = ensureCtx()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = 'square'
  osc.frequency.value = freq
  g.gain.setValueAtTime(gain, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)
  osc.connect(g).connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration)
}

export const sfx = {
  key: () => blip(720, 0.05, 0.03),
  error: () => blip(180, 0.16, 0.06),
  done: () => {
    blip(660, 0.08, 0.04)
    setTimeout(() => blip(880, 0.12, 0.04), 90)
  },
}
