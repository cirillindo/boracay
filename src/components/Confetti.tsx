import React, { useCallback, useRef, useEffect } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';

interface ConfettiProps {
  fire: boolean;
  onComplete?: () => void;
}

const Confetti: React.FC<ConfettiProps> = ({ fire, onComplete }) => {
  const refAnimationInstance = useRef<any>(null);

  const getInstance = useCallback((instance: any) => {
    refAnimationInstance.current = instance;
  }, []);

  const makeShot = useCallback((particleRatio: number, opts: any) => {
    refAnimationInstance.current &&
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
  }, []);

  const fireConfetti = useCallback(() => {
    makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    makeShot(0.2, {
      spread: 60,
    });

    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    });

    // Fire additional bursts with delay for fireworks effect
    setTimeout(() => {
      makeShot(0.3, {
        spread: 80,
        startVelocity: 60,
        origin: { x: 0.2, y: 0.6 },
      });
    }, 300);

    setTimeout(() => {
      makeShot(0.3, {
        spread: 80,
        startVelocity: 60,
        origin: { x: 0.8, y: 0.6 },
      });
    }, 600);

    setTimeout(() => {
      makeShot(0.4, {
        spread: 100,
        startVelocity: 70,
        origin: { x: 0.5, y: 0.5 },
      });
      onComplete?.();
    }, 900);
  }, [makeShot, onComplete]);

  useEffect(() => {
    if (fire) {
      fireConfetti();
    }
  }, [fire, fireConfetti]);

  return (
    <ReactCanvasConfetti
      refConfetti={getInstance}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    />
  );
};

export default Confetti;