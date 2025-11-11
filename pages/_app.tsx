import { useEffect } from 'react';
import type { AppProps } from 'next/app';

import Layout from '@/components/Layout';
import Head from '@/components/Head';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';

import '@/styles/globals.css';
import '@/styles/themes.css';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const resolvedTheme = storedTheme || 'dracula';

    document.documentElement.setAttribute('data-theme', resolvedTheme);

    if (!storedTheme) {
      localStorage.setItem('theme', resolvedTheme);
    }
  }, []);

  return (
    <AudioPlayerProvider>
      <Layout>
        <Head title={'Lovely Songs for Lovely People'} />
        <Component {...pageProps} />
      </Layout>
    </AudioPlayerProvider>
  );
}

export default MyApp;
