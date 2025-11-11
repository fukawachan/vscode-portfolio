import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiShuffle } from 'react-icons/fi';
import styles from '@/styles/HomePage.module.css';
import { useAmplitudePlayer } from '@/contexts/AmplitudePlayerContext';
import type { Track } from '@/contexts/AmplitudePlayerContext';

type MusicBrief = {
  id: number;
  title: string;
  artist: string;
};

type MusicListResponse = {
  musics: MusicBrief[];
};

type MusicInfoResponse = MusicBrief & {
  music_url: string;
  thumbnail_url: string;
};

const ENV_BACKEND_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  ''
).replace(/\/$/, '');

const DEFAULT_BACKEND_BASE_URL = 'http://127.0.0.1:8000';
const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

const resolveBackendBaseUrl = () => {
  if (ENV_BACKEND_BASE_URL) {
    return ENV_BACKEND_BASE_URL;
  }

  if (typeof window !== 'undefined') {
    const { origin, hostname } = window.location;
    if (/localhost|127\.0\.0\.1/i.test(hostname)) {
      return DEFAULT_BACKEND_BASE_URL;
    }
    return origin.replace(/\/$/, '');
  }

  return DEFAULT_BACKEND_BASE_URL;
};

const ensureAbsoluteUrl = (input: string, base: string) => {
  const normalizedBase = base.replace(/\/$/, '');

  if (!input) {
    return normalizedBase;
  }

  if (ABSOLUTE_URL_REGEX.test(input)) {
    return input;
  }

  const normalizedPath = input.startsWith('/') ? input : `/${input}`;
  return `${normalizedBase}${normalizedPath}`;
};

export default function HomePage() {
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const {
    playlist,
    setPlaylist,
    currentSong,
    isPlaying,
    isShuffling,
    setIsShuffling,
    progressPercent,
    fallbackTrack,
  } = useAmplitudePlayer();

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

  useEffect(() => {
    if (playlist.length > 0) {
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const loadPlaylist = async () => {
      try {
        const baseUrl = resolveBackendBaseUrl();
        const listResponse = await fetch(ensureAbsoluteUrl('api/music/list', baseUrl), {
          signal: controller.signal,
        });

        if (!listResponse.ok) {
          throw new Error(`Failed to fetch music list (${listResponse.status})`);
        }

        const listPayload = (await listResponse.json()) as MusicListResponse;
        if (listPayload.musics.length === 0) {
          if (isMounted) {
            setPlaylist([]);
          }
          return;
        }

        const tracks: Track[] = await Promise.all(
          listPayload.musics.map(async ({ id }) => {
            const infoResponse = await fetch(ensureAbsoluteUrl(`api/music/info/${id}`, baseUrl), {
              signal: controller.signal,
            });

            if (!infoResponse.ok) {
              throw new Error(`Failed to fetch music info ${id} (${infoResponse.status})`);
            }

            const infoPayload = (await infoResponse.json()) as MusicInfoResponse;
            return {
              id: infoPayload.id,
              name: infoPayload.title,
              artist: infoPayload.artist,
              url: ensureAbsoluteUrl(infoPayload.music_url, baseUrl),
              cover_art_url: ensureAbsoluteUrl(infoPayload.thumbnail_url, baseUrl),
            };
          })
        );

        if (isMounted) {
          setPlaylist(tracks);
        }
      } catch (error) {
        if (controller.signal.aborted || !isMounted) {
          return;
        }
        console.error('Failed to load music playlist', error);
        setPlaylist([fallbackTrack]);
      }
    };

    loadPlaylist();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fallbackTrack, playlist.length, setPlaylist]);

  useEffect(() => {
    let isMounted = true;

    const rebindAmplitudeControls = async () => {
      try {
        const amplitudeModule = await import('amplitudejs');
        if (!isMounted) {
          return;
        }

        const Amplitude = amplitudeModule.default ?? amplitudeModule;
        const bindNewElements = (Amplitude as { bindNewElements?: () => void }).bindNewElements;

        if (typeof bindNewElements === 'function') {
          bindNewElements();
        }
      } catch (error) {
        console.error('Failed to bind audio player controls', error);
      }
    };

    rebindAmplitudeControls();

    return () => {
      isMounted = false;
    };
  }, [playlist]);

  // audio playback is handled globally by AmplitudePlayerProvider

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
                    src={currentSong.cover_art_url}
                    width={220}
                    height={220}
                    alt={`${currentSong.name} cover art`}
                    className={`${styles.audioCover} ${isPlaying ? styles.audioCoverSpinning : ''}`}
                    priority
                    unoptimized
                  />
                </div>

                <div className={styles.audioTrackMeta}>
                  <span className={styles.audioMetaLabel}>now streaming</span>
                  <h3 className={styles.audioTrackTitle}>{currentSong.name}</h3>
                  <p className={styles.audioTrackInfo}>
                    {currentSong.artist}
                    {currentSong.album ? ` · ${currentSong.album}` : ''}
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
                      className={`${styles.audioControlButton} amplitude-prev`}
                      aria-label="Previous track"
                    >
                      <FiSkipBack />
                    </button>
                    <button
                      type="button"
                      className={`${styles.audioControlButton} amplitude-play-pause`}
                      aria-label={isPlaying ? 'Pause track' : 'Play track'}
                    >
                      {isPlaying ? <FiPause /> : <FiPlay />}
                    </button>
                    <button
                      type="button"
                      className={`${styles.audioControlButton} amplitude-next`}
                      aria-label="Next track"
                    >
                      <FiSkipForward />
                    </button>
                    <button
                      type="button"
                      className={`${styles.audioControlButton} ${isShuffling ? styles.audioControlActive : ''} amplitude-shuffle`}
                      aria-label="Toggle shuffle"
                      aria-pressed={isShuffling}
                      onClick={() => setIsShuffling((prev) => !prev)}
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
