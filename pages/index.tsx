import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiShuffle } from 'react-icons/fi';
import styles from '@/styles/HomePage.module.css';

type Track = {
  name: string;
  artist: string;
  album: string;
  url: string;
  cover_art_url: string;
};

type AmplitudeClient = {
  init: (config: { songs: Track[]; callbacks?: Record<string, () => void>; [key: string]: unknown }) => void;
  destroy?: () => void;
  stop?: () => void;
  getActiveSongMetadata?: () => Partial<Track>;
};

export default function HomePage() {
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const playlist = useMemo<Track[]>(
    () => [
      {
        name: 'Neon Skyline',
        artist: 'Syn City FM',
        album: 'Terminal Dreams',
        url: 'https://cdn.pixabay.com/download/audio/2024/05/25/audio_a0f651350a.mp3?filename=the-grid-2077-198564.mp3',
        cover_art_url: '/themes/dracula.png',
      },
      {
        name: 'Binary Sunset',
        artist: 'Analog Heart',
        album: 'Waveforms',
        url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_18d61bdd73.mp3?filename=the-futuristic-13463.mp3',
        cover_art_url: '/themes/night-owl.png',
      },
      {
        name: 'Circuit Bloom',
        artist: 'Data Garden',
        album: 'LoFi Terminal',
        url: 'https://cdn.pixabay.com/download/audio/2023/02/14/audio_b3c79e7d90.mp3?filename=downtown-14675.mp3',
        cover_art_url: '/themes/nord.png',
      },
    ],
    []
  );
  const fallbackTrack = useMemo<Track>(
    () =>
      playlist[0] ?? {
        name: 'Boot Sequence',
        artist: 'System BIOS',
        album: 'Init Sequence',
        url: '',
        cover_art_url: '/themes/ayu.png',
      },
    [playlist]
  );
  const [currentSong, setCurrentSong] = useState<Track>(() => fallbackTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

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
    let amplitudeInstance: AmplitudeClient | null = null;
    let isMounted = true;

    const mapMetadata = (meta?: Partial<Track>): Track => ({
      name: meta?.name ?? fallbackTrack.name,
      artist: meta?.artist ?? fallbackTrack.artist,
      album: meta?.album ?? fallbackTrack.album,
      url: meta?.url ?? fallbackTrack.url,
      cover_art_url: meta?.cover_art_url ?? fallbackTrack.cover_art_url,
    });

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

      Amplitude.init({
        songs: playlist,
        continue_next: true,
        autoplay: false,
        callbacks: {
          play: () => updatePlaying(true),
          pause: () => updatePlaying(false),
          stop: () => updatePlaying(false),
          song_change: syncMetadata,
        },
      });

      syncMetadata();
    };

    initAmplitude();

    return () => {
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
                    className={styles.audioCover}
                    priority
                  />
                  <button
                    type="button"
                    className={`${styles.audioPlayButton} amplitude-play-pause`}
                    data-amplitude-song-index="0"
                    aria-label={isPlaying ? 'Pause track' : 'Play track'}
                  >
                    {isPlaying ? <FiPause /> : <FiPlay />}
                  </button>
                </div>

                <div className={styles.audioTrackMeta}>
                  <span className={styles.audioMetaLabel}>now streaming</span>
                  <h3 className={styles.audioTrackTitle}>{currentSong.name}</h3>
                  <p className={styles.audioTrackInfo}>
                    {currentSong.artist} · {currentSong.album}
                  </p>

                  <div className={styles.audioProgressShell}>
                    <div
                      className={`${styles.audioProgressFill} amplitude-song-played-progress`}
                      data-amplitude-song-played-progress
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
