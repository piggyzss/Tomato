import type { SoundType } from '@/types'

/**
 * 播放指定类型的音效
 */
export function playSoundEffect(type: SoundType): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    switch (type) {
      case 'ding':
        playDing(audioContext)
        break
      case 'ding-dong':
        playDingDong(audioContext)
        break
      case 'chord':
        playChord(audioContext)
        break
      case 'victory':
        playVictory(audioContext)
        break
      case 'soft':
        playSoft(audioContext)
        break
      case 'water-drop':
        playWaterDrop(audioContext)
        break
      case 'knock':
        playKnock(audioContext)
        break
      default:
        playDing(audioContext)
    }
  } catch (error) {
    console.error('播放音效失败:', error)
  }
}

/**
 * 清脆的"叮"声
 */
function playDing(audioContext: AudioContext): void {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 800
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.3)
}

/**
 * 双音"叮咚"
 */
function playDingDong(audioContext: AudioContext): void {
  // 第一个音（高音）
  const osc1 = audioContext.createOscillator()
  const gain1 = audioContext.createGain()
  osc1.connect(gain1)
  gain1.connect(audioContext.destination)
  osc1.frequency.value = 800
  osc1.type = 'sine'
  gain1.gain.setValueAtTime(0.3, audioContext.currentTime)
  gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
  osc1.start(audioContext.currentTime)
  osc1.stop(audioContext.currentTime + 0.15)

  // 第二个音（低音）
  const osc2 = audioContext.createOscillator()
  const gain2 = audioContext.createGain()
  osc2.connect(gain2)
  gain2.connect(audioContext.destination)
  osc2.frequency.value = 600
  osc2.type = 'sine'
  gain2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.15)
  gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
  osc2.start(audioContext.currentTime + 0.15)
  osc2.stop(audioContext.currentTime + 0.3)
}

/**
 * 三音和弦
 */
function playChord(audioContext: AudioContext): void {
  const frequencies = [523.25, 659.25, 783.99] // C-E-G

  frequencies.forEach(freq => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = freq
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  })
}

/**
 * 游戏胜利音效
 */
function playVictory(audioContext: AudioContext): void {
  const notes = [523, 659, 784, 1047] // C-E-G-C

  notes.forEach((freq, i) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = freq
    oscillator.type = 'sine'

    const startTime = audioContext.currentTime + i * 0.1
    gainNode.gain.setValueAtTime(0.2, startTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2)

    oscillator.start(startTime)
    oscillator.stop(startTime + 0.2)
  })
}

/**
 * 柔和通知音效
 */
function playSoft(audioContext: AudioContext): void {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 440 // A4音
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 1)
}

/**
 * 水滴声
 */
function playWaterDrop(audioContext: AudioContext): void {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 1200
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.1)
}

/**
 * 敲击声
 */
function playKnock(audioContext: AudioContext): void {
  // 使用短促的白噪声模拟敲击声
  const bufferSize = audioContext.sampleRate * 0.05
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
  const data = buffer.getChannelData(0)

  // 生成白噪声
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
  }

  const source = audioContext.createBufferSource()
  const gainNode = audioContext.createGain()

  source.buffer = buffer
  source.connect(gainNode)
  gainNode.connect(audioContext.destination)

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)

  source.start(audioContext.currentTime)
}
