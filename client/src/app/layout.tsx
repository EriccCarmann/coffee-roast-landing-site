import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../styles/global.css';

// Server-side defaults (what search engines and link previews see: Russian).
// After load, I18nProvider updates <title> and the description to the chosen language.
export const metadata: Metadata = {
  title: 'Обжарка «Кварта» — свежий кофе из Минска',
  description:
    'Малые партии, обжарка три раза в неделю, доставка в течение 1–3 дней после обжарки. Дата обжарки — на каждой пачке.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Lora:wght@700&subset=cyrillic&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
