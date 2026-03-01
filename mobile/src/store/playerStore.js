import { create } from 'zustand';
import { Audio } from 'expo-av';

export const usePlayerStore = create((set, get) => ({
    currentSong: null,
    queue: [],
    isPlaying: false,
    position: 0,
    duration: 0,
    sound: null,
    isShuffle: false,
    repeatMode: 'none', // 'none', 'all', 'one'

    toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
    cycleRepeatMode: () => {
        const { repeatMode } = get();
        if (repeatMode === 'none') set({ repeatMode: 'all' });
        else if (repeatMode === 'all') set({ repeatMode: 'one' });
        else set({ repeatMode: 'none' });
    },

    // Initialize play
    playSong: async (song, queue = []) => {
        const { sound, pauseSong } = get();

        // Stop current if playing
        if (sound) {
            await sound.unloadAsync();
        }

        set({
            currentSong: song,
            queue: queue.length > 0 ? queue : [song], // If no queue provided, just queue the single song
            isPlaying: true,
            position: 0,
            duration: song.duration * 1000 || 0, // Fallback duration if needed
        });

        try {
            // Load and play new audio setup
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: song.audioUrl },
                { shouldPlay: true },
                get().onPlaybackStatusUpdate
            );

            set({ sound: newSound });
        } catch (error) {
            console.error("Error playing sound", error);
            set({ isPlaying: false });
        }
    },

    pauseSong: async () => {
        const { sound } = get();
        if (sound) {
            await sound.pauseAsync();
            set({ isPlaying: false });
        }
    },

    resumeSong: async () => {
        const { sound } = get();
        if (sound) {
            await sound.playAsync();
            set({ isPlaying: true });
        }
    },

    seekTo: async (positionMillis) => {
        const { sound } = get();
        if (sound) {
            await sound.setPositionAsync(positionMillis);
            set({ position: positionMillis });
        }
    },

    setQueue: (queue) => set({ queue }),

    nextSong: async () => {
        const { queue, currentSong, playSong, isShuffle, repeatMode } = get();

        if (repeatMode === 'one') {
            await playSong(currentSong, queue);
            return;
        }

        const currentIndex = queue.findIndex(s => s._id === currentSong?._id);
        let nextIndex;

        if (isShuffle) {
            nextIndex = Math.floor(Math.random() * queue.length);
        } else {
            nextIndex = currentIndex + 1;
        }

        if (nextIndex >= 0 && nextIndex < queue.length) {
            const next = queue[nextIndex];
            await playSong(next, queue);
        } else if (repeatMode === 'all' && queue.length > 0) {
            await playSong(queue[0], queue);
        } else {
            // Reached end of queue
            const { sound } = get();
            if (sound) await sound.stopAsync();
            set({ isPlaying: false, position: 0 });
        }
    },

    prevSong: async () => {
        const { queue, currentSong, playSong, position, isShuffle } = get();

        // If we are more than 3 seconds in, just restart the song
        if (position > 3000) {
            get().seekTo(0);
            return;
        }

        const currentIndex = queue.findIndex(s => s._id === currentSong?._id);
        let prevIndex;

        if (isShuffle) {
            prevIndex = Math.floor(Math.random() * queue.length);
        } else {
            prevIndex = currentIndex - 1;
        }

        if (prevIndex >= 0) {
            const prev = queue[prevIndex];
            await playSong(prev, queue);
        } else {
            // At first song, just restart it
            get().seekTo(0);
        }
    },

    onPlaybackStatusUpdate: (status) => {
        if (status.isLoaded) {
            set({
                position: status.positionMillis,
                duration: status.durationMillis,
                isPlaying: status.isPlaying
            });

            if (status.didJustFinish) {
                // Auto play next song
                get().nextSong();
            }
        } else if (status.error) {
            console.error(`FATAL PLAYER ERROR: ${status.error}`);
        }
    },

    // Cleanup when closing player
    cleanup: async () => {
        const { sound } = get();
        if (sound) {
            await sound.unloadAsync();
        }
        set({ sound: null, currentSong: null, isPlaying: false, position: 0 });
    }
}));
