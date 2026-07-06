'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  href?: string;
}

export const Logo = ({ size = 'medium', href = '/' }: LogoProps) => {
  const sizeMap = {
    small: 40,
    medium: 60,
    large: 80,
  };

  const width = sizeMap[size as keyof typeof sizeMap] || 60;
  const height = width;

  const logo = (
    <Image
      src="/images/logo.png"
      alt="RiverCity Courier"
      width={width}
      height={height}
      priority
      className="drop-shadow-lg hover:drop-shadow-xl transition-all duration-300"
    />
  );

  if (href) {
    return <Link href={href}>{logo}</Link>;
  }

  return logo;
};
