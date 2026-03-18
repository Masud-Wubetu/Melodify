require('dotenv').config();
const prisma = require('./src/lib/prisma');

async function check() {
  const songs = await prisma.song.count();
  const artists = await prisma.artist.count();
  const albums = await prisma.album.count();
  const users = await prisma.user.count();
  const playlists = await prisma.playlist.count();

  console.log({
    songs,
    artists,
    albums,
    users,
    playlists
  });
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
