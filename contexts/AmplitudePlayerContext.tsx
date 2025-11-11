import {
  createContext,
  type Dispatch,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SetStateAction,
} from 'react';

export type Track = {
  id?: number;
  name: string;
  artist: string;
  album?: string;
  url: string;
  cover_art_url: string;
};

type AmplitudeClient = {
  init: (config: { songs: Track[]; callbacks?: Record<string, () => void>; [key: string]: unknown }) => void;
  destroy?: () => void;
  stop?: () => void;
  getActiveSongMetadata?: () => Partial<Track>;
  getSongPlayedPercentage?: () => number;
};

type AmplitudePlayerContextValue = {
  playlist: Track[];
  setPlaylist: Dispatch<SetStateAction<Track[]>>;
  currentSong: Track;
  isPlaying: boolean;
  isShuffling: boolean;
  setIsShuffling: Dispatch<SetStateAction<boolean>>;
  progressPercent: number;
  fallbackTrack: Track;
};

const FALLBACK_TRACK: Track = {
  name: 'Neon Skyline',
  artist: 'Syn City FM',
  album: 'Terminal Dreams',
  url: 'https://cdn.pixabay.com/download/audio/2024/05/25/audio_a0f651350a.mp3?filename=the-grid-2077-198564.mp3',
  cover_art_url: '/themes/dracula.png',
};

const AmplitudePlayerContext = createContext<AmplitudePlayerContextValue | undefined>(undefined);

export const AmplitudePlayerProvider = ({ children }: { children: ReactNode }) => {
  const fallbackTrack = FALLBACK_TRACK;
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentSong, setCurrentSong] = useState<Track>(fallbackTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const amplitudeRef = useRef<AmplitudeClient | null>(null);

  useEffect(() => {
    let isMounted = true;

    const cleanupInstance = () => {
      amplitudeRef.current?.stop?.();
      amplitudeRef.current?.destroy?.();
      amplitudeRef.current = null;
    };

    if (playlist.length === 0) {
      cleanupInstance();
      setIsPlaying(false);
      setCurrentSong(fallbackTrack);
      setProgressPercent(0);

      return () => {
        isMounted = false;
      };
    }

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

    const syncMetadata = () => {
      if (!isMounted) {
        return;
      }
      const meta = amplitudeRef.current?.getActiveSongMetadata?.();
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
      const percent = Number(amplitudeRef.current?.getSongPlayedPercentage?.());
      if (Number.isFinite(percent)) {
        setProgressPercent(clampProgress(percent));
      }
    };

    const initAmplitude = async () => {
      try {
        const amplitudeModule = await import('amplitudejs');
        if (!isMounted) {
          return;
        }

        const Amplitude = (amplitudeModule.default ?? amplitudeModule) as AmplitudeClient;
        amplitudeRef.current = Amplitude;

        updatePlaying(false);
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
            song_change: () => {
              resetProgress();
              syncMetadata();
            },
            timeupdate: handleTimeUpdate,
          },
        });

        syncMetadata();
      } catch (error) {
        console.error('Failed to initialize audio player', error);
        cleanupInstance();
      }
    };

    initAmplitude();

    return () => {
      isMounted = false;
      cleanupInstance();
    };
  }, [playlist, fallbackTrack]);

  const value = useMemo(
    () => ({
      playlist,
      setPlaylist,
      currentSong,
      isPlaying,
      isShuffling,
      setIsShuffling,
      progressPercent,
      fallbackTrack,
    }),
    [playlist, currentSong, isPlaying, isShuffling, progressPercent, fallbackTrack]
  );

  return <AmplitudePlayerContext.Provider value={value}>{children}</AmplitudePlayerContext.Provider>;
};

export const useAmplitudePlayer = () => {
  const context = useContext(AmplitudePlayerContext);
  if (!context) {
    throw new Error('useAmplitudePlayer must be used within AmplitudePlayerProvider');
  }
  return context;
};
