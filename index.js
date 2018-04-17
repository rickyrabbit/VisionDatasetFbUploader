require('dotenv').config();

const fs = require('fs');
const path = require('path');

const fbUpload = require('facebook-api-video-upload');
const mongoose = require("mongoose");

const env_debug = true;

/*FACEBOOK*/

const group_VisionDataset_id    =process.env.FB_GROUP_ID;
const page_VisionDataset_id     =process.env.FB_PAGE_ID;
const profile_id                =process.env.FB_PROFILE_ID;

const fbToken                   =process.env.FB_USER_TOKEN;
const fbToken_page              =process.env.FB_PAGE_TOKEN;

const personalPath              =process.env.VISION_PATH;

async function uploadHandler(doc){
    const filename  = doc.inputfilename+'.'+doc.extension;
    if(env_debug){console.log(filename)};
    const filePath  = doc.device+'/'+doc.media+'/'+doc.mediatipology+'/'+filename;
    const path      = personalPath+filePath;
    if(env_debug){console.log('path: %s',path)};
	const args = {
		token: fbToken_page, // with the permission to upload
		id: page_VisionDataset_id, //The id represent {page_id || user_id || event_id || group_id}
		stream: fs.createReadStream(path), //path to the video,
		title: path,
		description: filePath
	};

    //const result = await fbUpload(args);
    const result = fbUpload(args);
	return result;

}

/*FACEBOOK*/
/*MONGODB*/
var uri ='mongodb://'+process.env.DB_USER+':'+process.env.DB_PASS+'@cluster0-shard-00-00-cpfag.mongodb.net:27017,cluster0-shard-00-01-cpfag.mongodb.net:27017,cluster0-shard-00-02-cpfag.mongodb.net:27017/'+process.env.DB_NAME+'?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';

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
const uploaded      = { uploaded: 'true' };
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
    if(env_debug){console.log('countQuery => %s',countD )};
    return countD;
}

async function attemptCloseDb(message){
        //if(env_debug){console.log('Nothing to upload!')};
        if(env_debug){console.log('db %s closing in %s',process.env.DB_NAME,message)};
        await mongoose.connection.close();
        if(env_debug){console.log('db %s %s in %s',process.env.DB_NAME,dbState(mongoose.connection.readyState),message)};
}

async function findOne(q_extension,q_mediaTipology){
    let query = mediainfo.where(notUploaded).where(q_extension);
    if (q_mediaTipology!='allmt') {
        query = query.and(q_mediaTipology);
    }
    const doc = await query.limit(1).exec();
    if(env_debug){console.log('findOne => %s',doc )};
    return doc;
}

async function updateOne(doc_id,fb_video_id){
    let query   = mediainfo.where({_id:doc_id});
    query       = query.update({ $set:{ fbsource: fb_video_id ,uploaded: 'false'}});
    const result =  await query.exec();
    if(env_debug){console.log('updateOne => %s',result )};
    return result;
}

/*MONGODB*/
console.clear();
if(env_debug){console.log('debug')};

let counts=0;
// for loop exists if counts >0
//database is closed here
mongoose.connect(uri);

countQuery(ext_mp4,mediatipology_flat).then((countD) => {
    counts=countD;
    if(env_debug){console.log('counts => %s',counts)};
    attemptCloseDb('countQuery');
});
let dbDoc,resUpload,resUpdate,mDoc,mResUpl,mResUpd;
//for (let index = counts; index >0 ;) {
    //if(env_debug){console.log('index is: %s',index)};
    mongoose.connect(uri);
    dbDoc=findOne(ext_mp4,mediatipology_flat);
    dbDoc.then((doc) => {
        mDoc=doc[0];
        if(env_debug){console.log('Using Object with id : %s',mDoc._id)};
        mResUpl=uploadHandler(mDoc);
        mResUpl.then((result) => {
            resUpload=result;
            if(env_debug){console.log('Success? : %s , Video id: %s',resUpload.success,resUpload.video_id)};
            if(env_debug){console.log('resUpload  %s',resUpload)};
            if(env_debug){console.log('success    %s',resUpload.success)};
            if(resUpload.success==false){
                throw new Error('Upload failed');
            }
            if(resUpload.success==true){
                if(env_debug){console.log('Database Update phase');}
                if(env_debug){console.log('db state:  %s %s',process.env.DB_NAME,dbState(mongoose.connection.readyState))};
                mongoose.connect(uri);
                mResUpd=updateOne(mDoc._id,resUpload.video_id);
                mResUpd.then((result) =>{
                    resUpdate=result;
                    if(env_debug){console.log('ok? : %s , n: %s',resUpdate.ok,resUpdate.n)};
                    if(resUpdate.ok==1 && resUpdate.n==1){
                        if(env_debug){console.log('Update has been done correctly')};
                        //index--;
                        attemptCloseDb('Closing db after check');  
                    }
                    //  
                })
            }
            })
        })
    
    
    

//}