export const playSound = (soundName: string) => {
  const audio = new Audio('https://res.cloudinary.com/dq3fftsfa/video/upload/v1748721550/mouse-single-button-click-swoop-1-00-00_h3k66g.mp3');
  audio.volume = 0.5; // Set volume to 50%
  audio.play().catch(err => {
    // Silently handle autoplay restrictions
    console.debug('Audio playback failed:', err);
  });
};