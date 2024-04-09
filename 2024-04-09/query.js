const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log('here is my query:');
// TODO
//
async function query() {
    console.log('querying...');
    let playLists = await prisma.watchlist.findMany({
        select:{name:true },
        where:{ benutzerId: 8 },
    });

    for(let playList of playLists){
        console.log(playList.name);
    }
    
    console.log("\n");
    
    let watchlist = await prisma.watchlist.findMany({
        select:{Track:true },
        where:{ benutzerId: 4 },
    });

    for(let tracks of watchlist){
        for( let i = 0; i < tracks.Track.length; i++){
            console.log(tracks.Track[i].name);
        }
    }
}

query().then(() => {
console.log('done')});
