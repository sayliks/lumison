import { Song } from "../types";

export const buildSongIdIndexMap = (songs: Song[]) => {
    const map = new Map<string, number>();

    songs.forEach((song, index) => {
        map.set(song.id, index);
    });

    return map;
};
