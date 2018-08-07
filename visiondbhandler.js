require('dotenv').config();

const mongoose = require("mongoose");


const Uri_prop = {
    "user": process.env.DB_USER,
    "password":process.env.DB_PASS,
    "dbname":process.env.DB_NAME,
    "cluster":[process.env.DB_CLUSTER_0,process.env.DB_CLUSTER_1,process.env.DB_CLUSTER_2]
}

const Uri_prop_test = {
    "user": process.env.DB_USER,
    "password":process.env.DB_PASS,
    "dbname":process.env.DB_NAME_TEST,
    "cluster":[process.env.DB_CLUSTER_0,process.env.DB_CLUSTER_1,process.env.DB_CLUSTER_2]
}

function mongooseUri(uri){

    return `mongodb://${uri.user}:${uri.password}@${uri.cluster[0]},${uri.cluster[1]},${uri.cluster[2]}/${uri.dbname}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`
}

var uri =mongooseUri(Uri_prop);
var uri_test =mongooseUri(Uri_prop_test);
mongoose.connect(uri);

const mediaSchema =new mongoose.Schema({
    device: 'string',
    media: 'string',
    mediatipology: 'string',
    inputfilename: 'string',
    extension: 'string',
    uploaded:'string',
    fbsource:'string',
    fbvideourl:'string',
    fbvideores:'string',
    use:'string',
    fbsrcexists:'string'
});

var mediaSchema_void = function(){
    let t=mediainfo.schema.obj;
    for (let i in t) {
        t[i]='';
    }
    return t;
};

const mediainfo = mongoose.model("videos",mediaSchema);
const mediainfo_test = mongoose.model("prova",mediaSchema);

const uploaded={
    "notDone":{ uploaded: 'false' },
    "done":{ uploaded: 'true' }
};

const hasfbsrc={
    "false":{ fbsrcexists: 'false' },
    "true":{ fbsrcexists: 'true' }
};

const extension={
    "e3gp":{extension:'3gp'},
    "mov":{extension:'mov'},
    "mp4":{extension:'mp4'}
    }

const use={
    "test":{use:'test'},
    "training":{use:'training'}
}

const mediatipology={
"nat" :{ mediatipology: 'nat'        },
"natFBH" :{ mediatipology: 'natFBH'     },
"natFBL" :{ mediatipology: 'natFBL'     },
"natWA" :{ mediatipology: 'natWA'      },
"flat" :{ mediatipology: 'flat'       },
"flatWA" :{ mediatipology: 'flatWA'     },
"flatYT" :{ mediatipology: 'flatYT'     },
"indoor" :{ mediatipology: 'indoor'     },
"indoorWA" :{ mediatipology: 'indoorWA'   },
"indoorYT" :{ mediatipology: 'indoorYT'   },
"outdoor" :{ mediatipology: 'outdoor'    },
"outdoorWA" :{ mediatipology: 'outdoorWA'  },
"outdoorYT" :{ mediatipology: 'outdoorYT'  }
}

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


function assembleDoc(retrieved,umerge) {
    let final=mediaSchema_void();
    for (let j in object) {
        if (object.hasOwnProperty(j)) {
            const element = object[j];
            
        }
    }    
}

async function countQuery(query){
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



async function findOne(query){
    const doc = await query.limit(1).exec();
    return doc;
}

async function updateOne(query){
    const response =  await query.exec();
    return response;
}




/* MODULE EXPORTS  */

/*db*/
module.exports.uri = uri;
module.exports.uri_test = uri_test;
module.exports.mediaSchema = mediaSchema;
module.exports.mediaSchema_void = mediaSchema_void;
module.exports.mediainfo = mediainfo;
module.exports.mediainfo_test = mediainfo_test;

/*properties*/
module.exports.uploaded = uploaded;
module.exports.extension = extension;
module.exports.use = use;
module.exports.hasfbsrc = hasfbsrc;
module.exports.mediatipology = mediatipology;

/*db functions*/
module.exports.dbState = dbState;
module.exports.countQuery = countQuery;
module.exports.attemptCloseDb = attemptCloseDb;
module.exports.findOne = findOne;
module.exports.updateOne = updateOne;