const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function seed() {
    for (let i = 0; i < 5; i++) {
        const zoo = await prisma.zoo.create({
            data: {
                land: faker.location.country(),
                stadt: faker.location.city(),
                adresse: faker.address.streetAddress(),
                baujahr: faker.datatype.number({ max: 2024 }),
            },
        });

        for (let j = 0; j < faker.datatype.number({ min: 2, max: 7 }); j++) {
            await prisma.abteilung.create({
                data: {
                    name: faker.animal.type(),
                    zooid: zoo.id,
                },
            });
        }
    }
}
seed()
    .then ((rw) => console.log('seeding done', rw));
    

