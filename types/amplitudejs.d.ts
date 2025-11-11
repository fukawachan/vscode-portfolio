declare module 'amplitudejs' {
  export type AmplitudeTrack = {
    id?: number;
    name: string;
    artist: string;
    album?: string;
    url: string;
    cover_art_url: string;
    [key: string]: unknown;
  };

  export type AmplitudeCallbacks = {
    play?: () => void;
    pause?: () => void;
    stop?: () => void;
    song_change?: () => void;
    timeupdate?: () => void;
    [event: string]: (() => void) | undefined;
  };

  export type AmplitudeConfig = {
    songs: AmplitudeTrack[];
    callbacks?: AmplitudeCallbacks;
    [key: string]: unknown;
  };

  export interface AmplitudeClient {
    init: (config: AmplitudeConfig) => void;
    destroy?: () => void;
    stop?: () => void;
    getActiveSongMetadata?: () => Partial<AmplitudeTrack>;
    getSongPlayedPercentage?: () => number;
  }

  const Amplitude: AmplitudeClient;
  export default Amplitude;
}
