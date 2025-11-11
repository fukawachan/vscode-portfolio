import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiShuffle } from 'react-icons/fi';
import styles from '@/styles/HomePage.module.css';

type Track = {
  id?: number;
  name: string;
  artist: string;
  album?: string;
  url: string;
  cover_art_url: string;
};

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

type AmplitudeClient = {
  init: (config: { songs: Track[]; callbacks?: Record<string, () => void>; [key: string]: unknown }) => void;
  destroy?: () => void;
  stop?: () => void;
  getActiveSongMetadata?: () => Partial<Track>;
  getSongPlayedPercentage?: () => number;
};

export default function HomePage() {
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const fallbackTrack = useMemo<Track>(
    () => ({
      name: 'Neon Skyline',
      artist: 'Syn City FM',
      album: 'Terminal Dreams',
      url: 'https://cdn.pixabay.com/download/audio/2024/05/25/audio_a0f651350a.mp3?filename=the-grid-2077-198564.mp3',
      cover_art_url: '/themes/dracula.png',
    }),
    []
  );
  const [currentSong, setCurrentSong] = useState<Track>(() => fallbackTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

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
            setCurrentSong(fallbackTrack);
            setIsPlaying(false);
          }
          return;
        }

        const tracks = await Promise.all(
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
          setCurrentSong(tracks[0] ?? fallbackTrack);
          setIsPlaying(false);
        }
      } catch (error) {
        if (controller.signal.aborted || !isMounted) {
          return;
        }
        console.error('Failed to load music playlist', error);
        setPlaylist([fallbackTrack]);
        setCurrentSong(fallbackTrack);
        setIsPlaying(false);
      }
    };

    loadPlaylist();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fallbackTrack]);

  useEffect(() => {
    if (playlist.length === 0) {
      setCurrentSong(fallbackTrack);
      setProgressPercent(0);
      return;
    }

    let amplitudeInstance: AmplitudeClient | null = null;
    let isMounted = true;
    const baseTrack = playlist[0] ?? fallbackTrack;

    const mapMetadata = (meta?: Partial<Track>): Track => ({
      name: meta?.name ?? baseTrack.name,
      artist: meta?.artist ?? baseTrack.artist,
      album: meta?.album ?? baseTrack.album,
      url: meta?.url ?? baseTrack.url,
      cover_art_url: meta?.cover_art_url ?? baseTrack.cover_art_url,
    });

    const clampProgress = (value: number) => Math.min(100, Math.max(0, value));

    const resetProgress = () => {
      if (!isMounted) {
        return;
      }
      setProgressPercent(0);
    };

    const initAmplitude = async () => {
      const amplitudeModule = await import('amplitudejs');
      if (!isMounted) {
        return;
      }

      const Amplitude = (amplitudeModule.default ?? amplitudeModule) as AmplitudeClient;
      amplitudeInstance = Amplitude;

      const syncMetadata = () => {
        if (!isMounted) {
          return;
        }

        const meta = Amplitude.getActiveSongMetadata?.();
        setCurrentSong(mapMetadata(meta));
      };

      const updatePlaying = (playing: boolean) => {
        if (!isMounted) {
          return;
        }
        setIsPlaying(playing);
      };

      const handleTimeUpdate = () => {
        if (!isMounted) {
          return;
        }
        const percent = Number(Amplitude.getSongPlayedPercentage?.());
        if (!Number.isFinite(percent)) {
          return;
        }
        setProgressPercent(clampProgress(percent));
      };

      const handleSongChange = () => {
        resetProgress();
        syncMetadata();
      };

      setIsPlaying(false);
      setCurrentSong(baseTrack);
      resetProgress();
      Amplitude.init({
        songs: playlist,
        continue_next: true,
        autoplay: false,
        callbacks: {
          play: () => updatePlaying(true),
          pause: () => updatePlaying(false),
          stop: () => {
            updatePlaying(false);
            resetProgress();
          },
          song_change: handleSongChange,
          timeupdate: handleTimeUpdate,
        },
      });

      syncMetadata();
    };

    initAmplitude();

    return () => {
      resetProgress();
      isMounted = false;
      amplitudeInstance?.stop?.();
      amplitudeInstance?.destroy?.();
    };
  }, [fallbackTrack, playlist]);

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
                      data-amplitude-song-index="0"
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
