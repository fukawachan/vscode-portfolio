import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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

export type Track = {
  id?: number;
  name: string;
  artist: string;
  album?: string;
  url: string;
  cover_art_url: string;
};

type AudioPlayerContextValue = {
  playlist: Track[];
  currentTrack: Track;
  currentIndex: number;
  isPlaying: boolean;
  isShuffling: boolean;
  progressPercent: number;
  handlePlayPause: () => void;
  handlePrevTrack: () => void;
  handleNextTrack: () => void;
  handleShuffleToggle: () => void;
};

const ENV_BACKEND_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
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

const FALLBACK_TRACK: Track = {
  name: 'Neon Skyline',
  artist: 'Syn City FM',
  album: 'Terminal Dreams',
  url: 'https://cdn.pixabay.com/download/audio/2024/05/25/audio_a0f651350a.mp3?filename=the-grid-2077-198564.mp3',
  cover_art_url: '/themes/dracula.png',
};

const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = useMemo(() => playlist[currentIndex] ?? FALLBACK_TRACK, [playlist, currentIndex]);

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
            setCurrentIndex(0);
            setProgressPercent(0);
            setIsPlaying(false);
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
          setCurrentIndex(0);
          setProgressPercent(0);
          setIsPlaying(false);
        }
      } catch (error) {
        if (controller.signal.aborted || !isMounted) {
          return;
        }
        console.error('Failed to load music playlist', error);
        setPlaylist([FALLBACK_TRACK]);
        setCurrentIndex(0);
        setProgressPercent(0);
        setIsPlaying(false);
      }
    };

    loadPlaylist();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.src = currentTrack.url;
    audio.currentTime = 0;
    setProgressPercent(0);

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Unable to start playback', error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack.url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Unable to start playback', error);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const handleNextTrack = useCallback(() => {
    if (playlist.length === 0) {
      return;
    }

    setCurrentIndex((prev) => {
      if (isShuffling && playlist.length > 1) {
        let randomIndex = prev;
        while (randomIndex === prev) {
          randomIndex = Math.floor(Math.random() * playlist.length);
        }
        return randomIndex;
      }

      return (prev + 1) % playlist.length;
    });
  }, [isShuffling, playlist.length]);

  const handlePrevTrack = useCallback(() => {
    if (playlist.length === 0) {
      return;
    }

    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  }, [playlist.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => {
      if (!audio.duration || Number.isNaN(audio.duration)) {
        setProgressPercent(0);
        return;
      }

      setProgressPercent((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setProgressPercent(0);
      handleNextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [handleNextTrack]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleShuffleToggle = useCallback(() => {
    setIsShuffling((prev) => !prev);
  }, []);

  const contextValue = useMemo(
    () => ({
      playlist,
      currentTrack,
      currentIndex,
      isPlaying,
      isShuffling,
      progressPercent,
      handlePlayPause,
      handlePrevTrack,
      handleNextTrack,
      handleShuffleToggle,
    }),
    [
      playlist,
      currentTrack,
      currentIndex,
      isPlaying,
      isShuffling,
      progressPercent,
      handlePlayPause,
      handlePrevTrack,
      handleNextTrack,
      handleShuffleToggle,
    ]
  );

  return <AudioPlayerContext.Provider value={contextValue}>{children}</AudioPlayerContext.Provider>;
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
