'use client';

import Image from 'next/image';
import Link from 'next/link';

/**
 * size: 'sm' | 'md' | 'lg' | 'xl'
 * showText: show hackathon name beside logo
 * href: wrap in link (optional)
 */
export default function Logo({ size = 'md', showText = true, href, className = '' }) {
  const dims = {
    sm: { img: 28, title: '13px', sub: '10px' },
    md: { img: 36, title: '14px', sub: '11px' },
    lg: { img: 52, title: '18px', sub: '12px' },
    xl: { img: 80, title: '24px', sub: '13px' }
  }[size];

  const content = (
    <div className={`flex items-center gap-3 ${className}`} style={{ userSelect: 'none' }}>
      <div style={{ width: dims.img, height: dims.img, position: 'relative', flexShrink: 0 }}>
        <Image
          src="/logo.png"
          alt="NIT-CoDeX Hackathon 2026"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      {showText && (
        <div>
          <p style={{
            fontFamily: 'Clash Grotesk, sans-serif',
            fontSize: dims.title,
            fontWeight: 600,
            color: 'var(--cream)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            NIT-CoDeX
          </p>
          <p style={{
            fontFamily: 'Clash Grotesk, sans-serif',
            fontSize: dims.sub,
            fontWeight: 400,
            color: 'var(--cream-35)',
            letterSpacing: '0.01em',
            lineHeight: 1.2
          }}>
            Hackathon 2026
          </p>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>;
  }
  return content;
}
