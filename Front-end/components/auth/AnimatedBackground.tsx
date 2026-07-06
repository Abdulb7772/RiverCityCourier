'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

type AnimatedBackgroundProps = {
  animateTruck?: boolean;
};

const blobs = [
  { className: 'left-[-6rem] top-[-5rem] h-72 w-72 bg-orange-500/25', duration: 10 },
  { className: 'right-[-4rem] top-[8rem] h-64 w-64 bg-amber-400/20', duration: 12 },
  { className: 'bottom-[-6rem] left-[18%] h-80 w-80 bg-orange-300/10', duration: 14 },
];

export const AnimatedBackground = ({ animateTruck = false }: AnimatedBackgroundProps) => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-linear-to-br from-orange-700 via-orange-600 to-orange-800">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        {animateTruck ? (
          <motion.img
            src="/images/background_img.png"
            alt=""
            className="w-[min(92vw,960px)] max-w-none select-none opacity-15 mix-blend-screen drop-shadow-[0_0_30px_rgba(255,255,255,0.08)]"
            initial={{ x: '130vw', opacity: 0, scale: 0.98 }}
            animate={{
              x: ['130vw', '0vw', '0vw', '-130vw'],
              opacity: [0, 1, 1, 0],
              scale: [0.98, 1, 1, 0.98],
            }}
            transition={{
              duration: 5,
              times: [0, 0.35, 0.6, 1],
              ease: 'easeInOut',
            }}
          />
        ) : (
          <Image
            src="/images/background_img.png"
            alt=""
            width={960}
            height={540}
            priority
            unoptimized
            className="w-[min(92vw,960px)] max-w-none select-none opacity-25 mix-blend-screen drop-shadow-[0_0_30px_rgba(255,255,255,0.08)]"
          />
        )}
      </div>

      {blobs.map((blob, index) => (
        <motion.div
          key={blob.className}
          aria-hidden="true"
          className={`absolute rounded-full blur-3xl ${blob.className}`}
          animate={{ y: [0, -24, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: blob.duration, repeat: Infinity, ease: 'easeInOut', delay: index * 0.6 }}
        />
      ))}

      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-slate-950/90 via-slate-950/30 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
    </div>
  );
};
