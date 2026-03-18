import { create } from 'zustand';

export const usePlayerStore = create((set, get) => ({
    currentSong: null,
    isPlaying: false,
    queue: [],
    currentIndex: -1,
    volume: 0.5,

    setSong: (song, queue = []) => {
        set({
            currentSong: song,
            isPlaying: true,
            queue: queue.length > 0 ? queue : [song],
            currentIndex: queue.length > 0 ? queue.findIndex(s => s.id === song.id) : 0
        });
    },

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    setIsPlaying: (isPlaying) => set({ isPlaying }),

    nextSong: () => {
        const { queue, currentIndex } = get();
        if (currentIndex < queue.length - 1) {
            const nextIndex = currentIndex + 1;
            set({
                currentSong: queue[nextIndex],
                currentIndex: nextIndex,
                isPlaying: true
            });
        }
    },

    previousSong: () => {
        const { queue, currentIndex } = get();
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            set({
                currentSong: queue[prevIndex],
                currentIndex: prevIndex,
                isPlaying: true
            });
        }
    },

    setVolume: (volume) => set({ volume })
}));
