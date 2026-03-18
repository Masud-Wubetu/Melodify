require('dotenv').config();
const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('Seeding database...');

    // 1. Clean up existing data (optional, but good for repeatable seeds)
    // We delete in reverse order of dependencies
    await prisma.playlist.deleteMany();
    await prisma.song.deleteMany();
    await prisma.album.deleteMany();
    await prisma.artist.deleteMany();
    await prisma.user.deleteMany();

    console.log('Database cleaned up.');

    // 2. Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@melodify.com',
            password: hashedPassword,
            isAdmin: true,
            profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        },
    });

    const user1 = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPassword,
            profilePicture: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: hashedPassword,
            profilePicture: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        },
    });

    console.log('Users created.');

    // 3. Create Artists
    const artists = [
        {
            name: 'The Midnight Echo',
            bio: 'Synthwave legends from the future of 1984.',
            image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            genres: ['Synthwave', 'Electronic', 'Retrowave'],
            followersCount: 1250,
        },
        {
            name: 'Luna Ray',
            bio: 'Ethereal vocals meeting atmospheric production.',
            image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            genres: ['Indie Pop', 'Dream Pop'],
            followersCount: 890,
        },
        {
            name: 'Neon Streets',
            bio: 'Hyper-vibrant pop beats for nighttime driving.',
            image: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            genres: ['Pop', 'Electronic'],
            followersCount: 2100,
        },
        {
            name: 'Urban Pulse',
            bio: 'Hard-hitting bass and soulful urban rhythms.',
            image: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            genres: ['Hip Hop', 'R&B'],
            followersCount: 3400,
        },
        {
            name: 'Acoustic Soul',
            bio: 'Pure, raw emotion with just a guitar and a voice.',
            image: 'https://images.pexels.com/photos/164853/pexels-photo-164853.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            genres: ['Acoustic', 'Folk'],
            followersCount: 560,
        },
    ];

    const createdArtists = [];
    for (const artist of artists) {
        const a = await prisma.artist.create({ data: artist });
        createdArtists.push(a);
    }

    console.log('Artists created.');

    // 4. Create Albums and Songs
    const audioSample = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Small sample MP3

    for (let i = 0; i < createdArtists.length; i++) {
        const artist = createdArtists[i];

        // Create 2 albums per artist
        for (let j = 1; j <= 2; j++) {
            const album = await prisma.album.create({
                data: {
                    title: `${artist.name} Album ${j}`,
                    description: `A masterpiece by ${artist.name}. Volume ${j}.`,
                    coverImage: `https://picsum.photos/seed/${artist.id}${j}/400/400`,
                    genre: artist.genres[0],
                    artistId: artist.id,
                    isExplicit: Math.random() > 0.8,
                },
            });

            // Create 5 songs per album
            for (let k = 1; k <= 5; k++) {
                await prisma.song.create({
                    data: {
                        title: `Track ${k}: ${album.title} vibes`,
                        duration: 225,
                        audioUrl: audioSample,
                        coverImage: album.coverImage,
                        genre: album.genre,
                        artistId: artist.id,
                        albumId: album.id,
                        plays: Math.floor(Math.random() * 10000),
                        likesCount: Math.floor(Math.random() * 500),
                        isExplicit: album.isExplicit,
                    },
                });
            }
        }
    }

    console.log('Albums and Songs created.');

    // 5. Create Playlists
    const allSongs = await prisma.song.findMany();

    const playlists = [
        {
            name: 'Chill Evening',
            description: 'The perfect companion for a quiet night.',
            coverImage: 'https://images.pexels.com/photos/2111016/pexels-photo-2111016.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            isPublic: true,
            creatorId: admin.id,
        },
        {
            name: 'Workout Beats',
            description: 'Explosive energy for your sessions.',
            coverImage: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            isPublic: true,
            creatorId: user1.id,
        },
        {
            name: 'Drive into the Night',
            description: 'Synthwave and neon lights.',
            coverImage: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            isPublic: true,
            creatorId: user2.id,
        },
    ];

    for (const playlist of playlists) {
        // Pick 8 random songs for each playlist
        const randomSongs = allSongs.sort(() => 0.5 - Math.random()).slice(0, 8);

        await prisma.playlist.create({
            data: {
                ...playlist,
                songs: {
                    connect: randomSongs.map(s => ({ id: s.id })),
                },
            },
        });
    }

    console.log('Playlists created.');
    console.log('Seeding finished successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
