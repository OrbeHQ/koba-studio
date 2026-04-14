// Audio utility — preloaded sounds for instant playback

let tapAudio: HTMLAudioElement | null = null;
let hoverAudio: HTMLAudioElement | null = null;

function ensureLoaded() {
  if (!tapAudio) {
    tapAudio = new Audio('/Select%20Sound.wav');
    tapAudio.volume = 0.4;
    tapAudio.preload = 'auto';
  }
  if (!hoverAudio) {
    hoverAudio = new Audio('/Tap%2004.wav');
    hoverAudio.volume = 0.25;
    hoverAudio.preload = 'auto';
  }
}

// Pre-load on module import
if (typeof window !== 'undefined') {
  ensureLoaded();
}

export function playTapSound() {
  ensureLoaded();
  if (tapAudio) {
    tapAudio.currentTime = 0;
    tapAudio.play().catch(() => {});
  }
}

export function playHoverSound() {
  ensureLoaded();
  if (hoverAudio) {
    hoverAudio.currentTime = 0;
    hoverAudio.play().catch(() => {});
  }
}
