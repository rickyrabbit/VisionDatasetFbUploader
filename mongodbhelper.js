require('dotenv').config();

const mongoose = require("mongoose");

var uri ='mongodb://'+process.env.DB_USER+':'+process.env.DB_PASS+'@cluster0-shard-00-00-cpfag.mongodb.net:27017,cluster0-shard-00-01-cpfag.mongodb.net:27017,cluster0-shard-00-02-cpfag.mongodb.net:27017/'+process.env.DB_NAME+'?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';

mongoose.connect(uri);

const mediaSchema =new mongoose.Schema({
    device: 'string',
    media: 'string',
    mediatipology: 'string',
    inputfilename: 'string',
    extension: 'string',
    uploaded:'string',
    fbsource:'string'
});


const mediainfo = mongoose.model("videos",mediaSchema);

const notUploaded   = { uploaded: 'false' };
const uploaded   = { uploaded: 'true' };
const ext_3gp       = { extension: '3gp' };
const ext_mov       = { extension: 'mov' };
const ext_mp4       = { extension: 'mp4' };

const mediatipology_nat         = { mediatipology: 'nat'        };
const mediatipology_natFBH      = { mediatipology: 'natFBH'     };
const mediatipology_natFBL      = { mediatipology: 'natFBL'     };
const mediatipology_natWA       = { mediatipology: 'natWA'      };
const mediatipology_flat        = { mediatipology: 'flat'       };
const mediatipology_flatWA      = { mediatipology: 'flatWA'     };
const mediatipology_flatYT      = { mediatipology: 'flatYT'     };
const mediatipology_indoor      = { mediatipology: 'indoor'     };
const mediatipology_indoorWA    = { mediatipology: 'indoorWA'   };
const mediatipology_indoorYT    = { mediatipology: 'indoorYT'   };
const mediatipology_outdoor     = { mediatipology: 'outdoor'    };
const mediatipology_outdoorWA   = { mediatipology: 'outdoorWA'  };
const mediatipology_outdoorYT   = { mediatipology: 'outdoorYT'  };
//const mediatipology_  = { mediatipology: '' };
//const mediatipology_  = { mediatipology: '' };
//const mediatipology_  = { mediatipology: '' };
//const mediatipology_  = { mediatipology: '' };


//mediainfo.where('extension').equals("mov");
function dbState(num){
    switch(num){
        case 0:
            return "disconnected";
        case 1:
            return "connected";
        case 2:
            return "connecting";
        case 3:
            return "disconnecting";
    }
}




async function countQuery(q_extension,q_mediaTipology){
    let query = mediainfo.where(notUploaded).where(q_extension);
    if (q_mediaTipology!='allmt') {
        query = query.and(q_mediaTipology);
    }
    const countD = await query.count().exec();
    //console.log(countD);
    return countD;
}

async function attemptCloseDb(){
        //console.log('Nothing to upload!');
        console.log('closing %s database ...',process.env.DB_NAME);
        await mongoose.connection.close();
        console.log('db state:  %s %s',process.env.DB_NAME,dbState(mongoose.connection.readyState));
}

async function findOne(q_extension,q_mediaTipology){
    let query = mediainfo.where(notUploaded).where(q_extension);
    if (q_mediaTipology!='allmt') {
        query = query.and(q_mediaTipology);
    }
    const doc = await query.limit(1).exec();
    return doc;
}

async function updateOne(doc_id,fb_video_id){
    let query   = mediainfo.where({_id:doc_id});
    query       = query.update({ $set:{ fbsource: fb_video_id ,uploaded: 'false'}});
    const response =  await query.exec();
    return response;
}

//const result1   = countQuery(ext_mov,mediatipology_flat)
//const result2    = findOne(ext_mp4,'allmt')
const result3   = updateOne('5acbf856f7e5ff03a71bf819','');

console.log(result3.toString());
//attemptCloseDb()

