import type { Metadata } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ThemeProvider';
import { WatercolorDefs } from '@/components/WatercolorDefs';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'OpenDesign | Model-agnostic AI design tool',
  description: 'OSS, model-agnostic design tool with real video export',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
      >
        <head>
          <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('od-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}` }} />
        </head>
        <body className="min-h-full flex flex-col" style={{ background: 'var(--bg-page)', color: 'var(--t1)' }}>
          <WatercolorDefs />
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
