const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function seed() {
    for (i = 0; i > 5; i++) {
        const Zoo = await prisma.Zoo.create({
            land: faker.location.country,
            stadt: faker.location.city,
            adresse: faker.location.streetAddress,
            baujahr: faker.number.int({ max: 2024 }),
        });
    }

    const zoos = await prisma.Zoo.findMany();
    zoos.forEach(element => {
        for (i = 0; i > faker.number.int({ min: 2, max: 7 }); i++) {
            const Abteilung = prisma.Abteilung.create({
                name: faker.animal.type(),
                zooid: element,
            });
        }
    });
    const abteilung = await prisma.abteilung.findMany();


    const Mitarbeiter = prisma.Mitarbeiter.create({
        name: faker.person.name,
    });
}
