"use client";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.3
) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export function playDing() {
  playTone(880, 0.3, "sine", 0.2);
  setTimeout(() => playTone(1100, 0.4, "sine", 0.15), 100);
}

export function playPop() {
  playTone(600, 0.1, "sine", 0.2);
}

export function playCorrect() {
  playTone(523, 0.15, "sine", 0.2);
  setTimeout(() => playTone(659, 0.15, "sine", 0.2), 150);
  setTimeout(() => playTone(784, 0.3, "sine", 0.2), 300);
}

export function playWrong() {
  playTone(300, 0.15, "sine", 0.15);
  setTimeout(() => playTone(250, 0.3, "sine", 0.15), 150);
}

export function playApplause() {
  // Simulate applause with noise bursts
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      playTone(200 + Math.random() * 800, 0.1, "triangle", 0.05);
    }, i * 80);
  }
  // Victory chime
  setTimeout(() => playTone(523, 0.15, "sine", 0.2), 0);
  setTimeout(() => playTone(659, 0.15, "sine", 0.2), 200);
  setTimeout(() => playTone(784, 0.15, "sine", 0.2), 400);
  setTimeout(() => playTone(1047, 0.4, "sine", 0.25), 600);
}

export function playCelebration() {
  const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
  notes.forEach((note, i) => {
    setTimeout(() => playTone(note, 0.2, "sine", 0.15), i * 100);
  });
}
