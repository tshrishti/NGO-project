// Short "alarm" chime via the Web Audio API — no audio file needed.
// Browsers may block audio before the user interacts with the page; we
// swallow errors so a blocked sound never breaks the alert.
let ctx
export function playAlarm() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    const notes = [880, 1175] // two quick rising beeps
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = now + i * 0.18
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.18)
    })
  } catch {
    /* audio blocked/unsupported — ignore */
  }
}
