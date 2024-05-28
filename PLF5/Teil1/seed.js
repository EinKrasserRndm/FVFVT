const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    console.log('Start seeding');

    console.log('Seeding Zoos');
    for (let i = 0; i < 5; i++) {
        await prisma.zoo.create({
            data: {
                land: faker.location.country(),
                stadt: faker.location.city(),
                adresse: faker.address.streetAddress(),
                baujahr: faker.datatype.number({ min: 1400, max: 2024 }),
            },
        });
    }

    console.log('Seeding Abteilungen');
    const zoos = await prisma.zoo.findMany();
    for (const current of zoos) {
        for (let i = 0; i < faker.number.int({ min: 2, max: 7 }); i++) {
            await prisma.abteilung.create({
                data: {
                    name: faker.animal.type(),
                    zoo: { connect: { id: current.id } },
                },
            });
        }
    }

    console.log('Seeding Tiere');
    const abteilungArr = await prisma.abteilung.findMany();
    for (const aktuell of abteilungArr) {
        const tierData = [];
        for (let i = 0; i < faker.number.int({ min: 5, max: 20 }); i++) {
            const tierName = faker.animal[aktuell.name.toLowerCase()] ? faker.animal[aktuell.name.toLowerCase()]() : 'unknown'; 
            tierData.push({
                name: faker.person.firstName(),
                art: tierName,
                abtid: aktuell.id,
            });
        }
        await prisma.tier.createMany({
            data: tierData,
        });
    }

    console.log('Seeding Mitarbeiter');
    const mitarbeiterIds = [];
    for (let i = 0; i < 100; i++) {
        const newMitarbeiter = await prisma.mitarbeiter.create({
            data: {
                name: faker.person.firstName(),
            },
        });
        mitarbeiterIds.push(newMitarbeiter.id);
    }

    console.log('Connecting Mitarbeiter with Abteilungen');
    const abteilungenByZoo = {};
    for (const zoo of zoos) {
        abteilungenByZoo[zoo.id] = await prisma.abteilung.findMany({
            where: {
                zooid: zoo.id,
            },
        });
    }

    const updates = [];
    for (const mitarbeiterId of mitarbeiterIds) {
        const randomZoo = zoos[faker.number.int({ min: 0, max: zoos.length - 1 })];
        const abteilungenZoo = abteilungenByZoo[randomZoo.id];

        if (abteilungenZoo.length === 0) continue;

        for (let j = 0; j < faker.number.int({ min: 1, max: 3 }); j++) {
            const randomAbteilung = abteilungenZoo[faker.number.int({ min: 0, max: abteilungenZoo.length - 1 })];
            updates.push(prisma.mitarbeiter.update({
                data: {
                    abteilung: {
                        connect: { id: randomAbteilung.id },
                    },
                },
                where: {
                    id: mitarbeiterId,
                },
            }));
        }
    }

    await Promise.all(updates);
}

seed()
    .then(() => {
        console.log('Seeding done');
        prisma.$disconnect();
    })
    .catch((error) => {
        console.error('Seeding error:', error);
        prisma.$disconnect();
    });