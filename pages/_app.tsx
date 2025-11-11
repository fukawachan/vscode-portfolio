import { useEffect } from 'react';
import type { AppProps } from 'next/app';

import Layout from '@/components/Layout';
import Head from '@/components/Head';
import { AmplitudePlayerProvider } from '@/contexts/AmplitudePlayerContext';

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
    <AmplitudePlayerProvider>
      <Layout>
        <Head title={'Lovely Songs for Lovely People'} />
        <Component {...pageProps} />
      </Layout>
    </AmplitudePlayerProvider>
  );
}

export default MyApp;
