const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllZooNames() {
    const zoos = await prisma.zoo.findMany({
        select: {
            id: true,
            land: true,
            stadt: true,
            adresse: true,
            baujahr: true,
            name: true,
        },
    });
    return zoos.map(zoo => zoo.name);
}
async function getZooById(zooId) {
    const zoo = await prisma.zoo.findUnique({
        where: { id: zooId },
    });
    return zoo;
}
async function getAbteilungenByZooId(zooId) {
    const abteilungen = await prisma.abteilung.findMany({
        where: { zooid: zooId },
    });
    return abteilungen;
}
async function getAbteilungenAndTierCountByZooId(zooId) {
    const abteilungen = await prisma.abteilung.findMany({
        where: { zooid: zooId },
        include: {
            tiere: true,
        },
    });

    return abteilungen.map(abteilung => ({
        name: abteilung.name,
        tierCount: abteilung.tiere.length,
    }));
}
async function getMitarbeiterByZooId(zooId) {
    const mitarbeiter = await prisma.mitarbeiter.findMany({
        where: {
            abteilungen: {
                some: {
                    zooid: zooId,
                },
            },
        },
    });
    return mitarbeiter;
}
async function getMitarbeiterAndAbteilungenByZooId(zooId) {
    const mitarbeiter = await prisma.mitarbeiter.findMany({
        where: {
            abteilungen: {
                some: {
                    zooid: zooId,
                },
            },
        },
        include: {
            abteilungen: true,
        },
    });

    return mitarbeiter.map(mitarbeiter => ({
        name: mitarbeiter.name,
        abteilungen: mitarbeiter.abteilungen.map(abteilung => abteilung.name),
    }));
}
(async () => {
    const zooId = '1';

    console.log('Namen aller Zoos:', await getAllZooNames());
    console.log('Details eines Zoos:', await getZooById(zooId));
    console.log('Abteilungen eines Zoos:', await getAbteilungenByZooId(zooId));
    console.log('Abteilungen und Anzahl der Tiere:', await getAbteilungenAndTierCountByZooId(zooId));
    console.log('Mitarbeiter eines Zoos:', await getMitarbeiterByZooId(zooId));
    console.log('Mitarbeiter und Abteilungen eines Zoos:', await getMitarbeiterAndAbteilungenByZooId(zooId));
})();