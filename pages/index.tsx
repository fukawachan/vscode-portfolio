import { useState, useEffect } from 'react';

import styles from '@/styles/HomePage.module.css';

export default function HomePage() {
  const [activeLineIndex, setActiveLineIndex] = useState(0);

  const codeLines = [
    { code: 'const HomePage = () => {', type: 'function' },
    {
      code: '  const [isLoaded, setIsLoaded] = useState(true);',
      type: 'variable',
    },
    { code: '  const developerInfo = {', type: 'variable' },
    { code: "    name: '复川',", type: 'array-item' },
    { code: "    role: '赛博调酒师',", type: 'array-item' },
    { code: "    bio: 'A believing heart is your magic'", type: 'array-item' },
    { code: '  };', type: 'array-end' },
    { code: '', type: 'blank' },
    { code: '  useEffect(() => {', type: 'nested-function' },
    {
      code: '    document.title = `${developerInfo.name} | Portfolio`;',
      type: 'return',
    },
    { code: '    setIsLoaded(true);', type: 'function-call' },
    { code: '  }, []);', type: 'close' },
    { code: '};', type: 'close-function' },
    { code: '', type: 'blank' },
    { code: 'export default HomePage;', type: 'function-call' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLineIndex((prev) => (prev + 1) % codeLines.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [codeLines.length]);

  return (
    <div className={styles.heroLayout}>
      {/* WebTUI Code Text Background - Split Layout */}
      <div className={styles.codeBackgroundContainer}>
        {/* Left Code Panel */}
        <pre className={`${styles.codeBackground} ${styles.leftPanel}`}>
          {codeLines.map((line, index) => (
            <div
              key={index}
              className={`${styles.codeLine} ${styles[line.type]} ${
                index === activeLineIndex ? styles.highlightedLine : ''
              }`}
            >
              {line.code || '\n'}
            </div>
          ))}
        </pre>

        {/* Right Code Panel - Split Layout */}
        <div className={`${styles.codeBackground} ${styles.rightPanelContainer}`}>
          {/* Upper Section - Original Style */}
          <div className={styles.rightPanelUpper}>
            {/* Empty content area - placeholder for future content */}
          </div>

          {/* Separator - Terminal Title Bar */}
          <div className={styles.terminalSeparator}>
            <span className={styles.terminalTitle}>
              <span className={styles.terminalIcon}>●</span> Terminal - bash
            </span>
            <span className={styles.terminalControls}>
              <span>─</span>
              <span>□</span>
              <span>✕</span>
            </span>
          </div>

          {/* Lower Section - Terminal Output Style */}
          <div className={styles.rightPanelLower}>
            <div className={styles.terminalContent}>
              <div className={styles.terminalLine}>
                <span className={styles.terminalPrompt}>user@portfolio:~$</span>
                <span className={styles.terminalCommand}> whoami</span>
              </div>
              <div className={styles.terminalOutput}>
                Name: 复川
                <br />
                Role: 赛博调酒师
                <br />
                Bio: A believing heart is your magic
              </div>
              <div className={styles.terminalLine}>
                <span className={styles.terminalPrompt}>user@portfolio:~$</span>
                <span className={styles.terminalCommand}> ls -la projects/</span>
              </div>
              <div className={styles.terminalOutput}>
                drwxr-xr-x 12 user staff 384 Nov 11 10:30 .
                <br />
                -rw-r--r-- 1 user staff 2.4K Nov 10 15:20 portfolio.tsx
                <br />
                -rw-r--r-- 1 user staff 1.8K Nov 09 14:15 blog.md
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: { title: 'Home' },
  };
}
