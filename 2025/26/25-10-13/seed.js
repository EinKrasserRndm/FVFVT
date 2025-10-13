const { PrismaClient } = require('./client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  // Create genres
  const genreNames = ['Pop', 'Rock', 'Jazz', 'Hip-Hop', 'Classical', 'Electronic', 'Country', 'Reggae', 'Metal', 'Folk'];
  const genres = [];
  for (const name of genreNames) {
    const genre = await prisma.genre.create({ data: { name } });
    genres.push(genre);
  }

  // Create artists
  const artists = [];
  for (let i = 0; i < 50; i++) {
    const artist = await prisma.artist.create({
      data: {
        name: faker.person.fullName(),
      },
    });
    artists.push(artist);
  }

  // Create albums
  const albums = [];
  for (let i = 0; i < 100; i++) {
    const album = await prisma.album.create({
      data: {
        name: faker.music.album(),
        erscheinungsjahr: faker.number.int({ min: 1970, max: 2025 }),
        artists: {
          connect: [
            { id: artists[faker.number.int({ min: 0, max: artists.length - 1 })].id }
          ]
        }
      },
    });
    albums.push(album);
  }

  // Create songs
  for (let i = 0; i < 1000; i++) {
    await prisma.song.create({
      data: {
        name: faker.music.songName(),
        duration: faker.number.int({ min: 120, max: 420 }),
        album: {
          connect: { id: albums[faker.number.int({ min: 0, max: albums.length - 1 })].id }
        },
        artists: {
          connect: [
            { id: artists[faker.number.int({ min: 0, max: artists.length - 1 })].id }
          ]
        },
        genres: {
          connect: [
            { id: genres[faker.number.int({ min: 0, max: genres.length - 1 })].id }
          ]
        }
      }
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());