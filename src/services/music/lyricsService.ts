import {
  getPlaylistDetail,
  getSongDetail,
  searchSongs as searchNeteaseSongs,
  type NeteaseTrack,
} from "./neteaseApi";

const METING_API = "https://api.qijieya.cn/meting/";

interface NeteaseApiArtist {
  name?: string;
}

interface NeteaseApiAlbum {
  name?: string;
  picUrl?: string;
}

interface NeteaseApiSong {
  id: number;
  name?: string;
  ar?: NeteaseApiArtist[];
  al?: NeteaseApiAlbum;
  dt?: number;
}

export interface NeteaseTrackInfo {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl?: string;
  duration?: number;
  isNetease: true;
  neteaseId: string;
}

type SearchOptions = {
  limit?: number;
  offset?: number;
};

const formatArtists = (artists?: NeteaseApiArtist[]) =>
  (artists ?? [])
    .map((artist) => artist.name?.trim())
    .filter(Boolean)
    .join("/") || "";

const mapNeteaseSongToTrack = (song: NeteaseApiSong): NeteaseTrackInfo => ({
  id: song.id.toString(),
  title: song.name?.trim() ?? "",
  artist: formatArtists(song.ar),
  album: song.al?.name?.trim() ?? "",
  coverUrl: song.al?.picUrl?.replaceAll("http:", "https:")?.replace(/\?param=\d+y\d+$/, "") + "?param=500y500",
  duration: song.dt,
  isNetease: true,
  neteaseId: song.id.toString(),
});

const mapNeteaseApiTrackToSong = (track: NeteaseTrack): NeteaseApiSong => ({
  id: track.id,
  name: track.name,
  ar: track.artists,
  al: {
    name: track.album?.name,
    picUrl: track.album?.picUrl,
  },
  dt: track.duration,
});

export const getNeteaseAudioUrl = (id: string) => {
  return `${METING_API}?type=url&id=${id}`;
};

// Implements the search logic from the user provided code snippet
export const searchNetEase = async (
  keyword: string,
  options: SearchOptions = {},
): Promise<NeteaseTrackInfo[]> => {
  const { limit = 20, offset = 0 } = options;

  try {
    const { songs } = await searchNeteaseSongs(
      keyword,
      { limit, offset },
      { timeout: 5000, retries: 0 },
    );

    if (songs.length === 0) {
      console.warn(`No search results for: ${keyword}`);
      return [];
    }

    const tracks = songs.map((song) => mapNeteaseSongToTrack(mapNeteaseApiTrackToSong(song)));

    // Enrich missing cover URLs via /song/detail in the background
    const missingCoverIds = tracks
      .filter((t) => !t.coverUrl)
      .map((t) => Number(t.neteaseId));

    if (missingCoverIds.length > 0) {
      getSongDetail(missingCoverIds)
        .then((details) => {
          const coverMap = new Map(
            details.map((d) => [d.id, d.album?.picUrl?.replaceAll("http:", "https:")])
          );
          tracks.forEach((t) => {
            const url = coverMap.get(Number(t.neteaseId));
            if (url) t.coverUrl = url;
          });
        })
        .catch(() => { /* non-critical */ });
    }

    return tracks;
  } catch (error) {
    console.error("NetEase search error", error);
    return [];
  }
};

export const fetchNeteasePlaylist = async (
  playlistId: string,
): Promise<NeteaseTrackInfo[]> => {
  try {
    const { tracks } = await getPlaylistDetail(Number(playlistId));
    return tracks.map((song) => mapNeteaseSongToTrack(mapNeteaseApiTrackToSong(song)));
  } catch (e) {
    console.error("Playlist fetch error", e);
    return [];
  }
};

export const fetchNeteaseSong = async (
  songId: string,
): Promise<NeteaseTrackInfo | null> => {
  try {
    const tracks = await getSongDetail(Number(songId));
    const track = tracks[0];
    if (track) {
      return mapNeteaseSongToTrack(mapNeteaseApiTrackToSong(track));
    }
    return null;
  } catch (e) {
    console.error("Song fetch error", e);
    return null;
  }
};
