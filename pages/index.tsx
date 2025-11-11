import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiShuffle } from 'react-icons/fi';
import styles from '@/styles/HomePage.module.css';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

export default function HomePage() {
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const {
    currentTrack,
    isPlaying,
    isShuffling,
    progressPercent,
    handlePlayPause,
    handlePrevTrack,
    handleNextTrack,
    handleShuffleToggle,
  } = useAudioPlayer();

  const codeLines = useMemo(
    () => [
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
    ],
    []
  );
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
            <div className={styles.audioPlayerWrapper}>
              <div className={styles.audioPlayerHeader}>
                <span className={styles.audioBreadcrumb}>~/now-playing</span>
                <span className={styles.audioStreamStatus}>
                  SYNTH FEED • 128kbps
                  <span className={styles.audioStatusPulse} />
                </span>
              </div>

              <div className={styles.audioPlayerBody}>
                <div className={styles.audioCoverStack}>
                  <span className={styles.audioCoverGlow} aria-hidden />
                  <Image
                    src={currentTrack.cover_art_url}
                    width={220}
                    height={220}
                    alt={`${currentTrack.name} cover art`}
                    className={`${styles.audioCover} ${isPlaying ? styles.audioCoverSpinning : ''}`}
                    priority
                    unoptimized
                  />
                </div>

                <div className={styles.audioTrackMeta}>
                  <span className={styles.audioMetaLabel}>now streaming</span>
                  <h3 className={styles.audioTrackTitle}>{currentTrack.name}</h3>
                  <p className={styles.audioTrackInfo}>
                    {currentTrack.artist}
                    {currentTrack.album ? ` · ${currentTrack.album}` : ''}
                  </p>

                  <div className={styles.audioProgressShell}>
                    <div
                      className={styles.audioProgressFill}
                      style={{ width: `${progressPercent}%` }}
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progressPercent)}
                    />
                  </div>

                  <div className={styles.audioControlsRow}>
                    <button
                      type="button"
                      className={styles.audioControlButton}
                      aria-label="Previous track"
                      onClick={handlePrevTrack}
                    >
                      <FiSkipBack />
                    </button>
                    <button
                      type="button"
                      className={styles.audioControlButton}
                      aria-label={isPlaying ? 'Pause track' : 'Play track'}
                      aria-pressed={isPlaying}
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? <FiPause /> : <FiPlay />}
                    </button>
                    <button
                      type="button"
                      className={styles.audioControlButton}
                      aria-label="Next track"
                      onClick={handleNextTrack}
                    >
                      <FiSkipForward />
                    </button>
                    <button
                      type="button"
                      className={`${styles.audioControlButton} ${isShuffling ? styles.audioControlActive : ''}`}
                      aria-label="Toggle shuffle"
                      aria-pressed={isShuffling}
                      onClick={handleShuffleToggle}
                    >
                      <FiShuffle />
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
                <span className={styles.terminalCommand}>
                  {' open ./public/vidoes/background_video.mp4'}
                </span>
              </div>
              <div className={styles.terminalVideoShell} aria-hidden="true">
                <video
                  className={styles.terminalVideo}
                  src="/vidoes/background_video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  controls={false}
                  tabIndex={-1}
                />
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


