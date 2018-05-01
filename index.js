/**
 * This project needs dotenv module to initialize
 * facebook tokens and mongoDB credentials to access the database
 * Data is stored in .env file in project folder
 */
require('dotenv').config();

/**
 * fs and path module are needed to handle file system and resolve video/images paths
 */
const fs = require('fs');
const path = require('path'); 

/**
 * facebook-api-video upload is a npm module that handles video uploading with Graph API calls
*/

const fbUpload = require('facebook-api-video-upload');

/**
 * mongoose is a npm module that handles CRUD operations with a MongoDB database entity
 */
const mongoose = require("mongoose");

const env_debug = true; //flag used to debug

/** FACEBOOK
 *  All Facebook constants are initialized and stored in the .env file
*/

const group_VisionDataset_id    =process.env.FB_GROUP_ID;
const page_VisionDataset_id     =process.env.FB_PAGE_ID;
const profile_id                =process.env.FB_PROFILE_ID;

const fbToken                   =process.env.FB_USER_TOKEN;
const fbToken_page              =process.env.FB_PAGE_TOKEN;

/**
 * @param {const} personalPath          Holds the path to Vision dataset on the machine
 */
const personalPath              =process.env.VISION_PATH;   


/**
 * @function uploadHandler              Async function that uploads a video stored on the machine based on the database query
 * 
 * @param {JSON Object} doc             Holds the data queried on the database
 * @param {const} filename              Name with extension of the video file to upload
 * @param {const} filePath              Path to video file to upload
 * @param {const} path                  User specific path to the video to upload 
 * @param {const} args                  Facebook settings for a single video upload
 * 
 * @return {Promise}                    Promise that contains the upload success state and facebook video id in case of a successful upload 
 */
async function uploadHandler(doc){
    const filename  = doc.inputfilename+'.'+doc.extension;
    console.log(`Using Object with filename: ${filename}`);
    const filePath  = doc.device+'/'+doc.media+'/'+doc.mediatipology+'/'+filename;
    const path      = personalPath+filePath;
    if(env_debug){console.log(`path: ${path}`)};
	const args = {
		token: fbToken_page,                //  Facebook token with upload permissions
		id: page_VisionDataset_id,          //  The id represent {page_id || user_id || event_id || group_id}
		stream: fs.createReadStream(path),  //  Path to the video,
		title: path,                        //  Video title on Facebook
		description: filePath               //  Video description on Facebook
	};

    //const result = await fbUpload(args);
    const result = await fbUpload(args);
	return result;
}

/**MONGODB
 * 
 * @param {string} uri                  Uri that ensures database shell conncetion
 * @param {mongoose.Schema} mediaSchema Schema of typical database object(document in mongoDB)
 * @param {mongoose.model}  mediainfo   Model of typical document in "videos" collection
*/
//TODO check if version of MongoDB cluster updated to 3.6 @high 
//see https://docs.atlas.mongodb.com/driver-connection/#node-js-driver-example
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


// List of tipologies of media present in the database
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

/**
 * @function dbState                Function that query the state of the database 
 * @return                          State of the database
 */
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

/**
 * @function countQuery             Async function that counts the number of documents in the query
 * @param {String} q_extension      Query filtered with this extension
 * @param {String} q_mediaTipology  Query filtered with this mediatipology if it isn't 'allmt'
 * 
 * @returns                         Number of documents
 */
async function countQuery(q_extension,q_mediaTipology){
    let query = mediainfo.where(notUploaded).where(q_extension);
    if (q_mediaTipology!='allmt') {
        query = query.and(q_mediaTipology);
    }
    const countD =await query.count().exec();
    //const countD = await query.count().exec();  //Await resolves the promise
    //if(env_debug){console.log(`countQuery => ${countD}`)};
    return countD;
}

/**
 * @function attemptCloseDb         Function that tries to close the db and logs it with a message
 * @param {String} message          Message to be reported to the console
 */
async function attemptCloseDb(message){
        //if(env_debug){console.log('Nothing to upload!')};
        if(env_debug){console.log(`db ${process.env.DB_NAME} closing ${message}`)};
        await mongoose.connection.close();  //awaits the closing of the database
        if(env_debug){console.log(`db ${process.env.DB_NAME} ${dbState(mongoose.connection.readyState)} ${message}`)};
}

/**
 * @function findOne                Async function that finds one document with selected filters
 * @param {String} q_extension      Query filtered with this extension
 * @param {String} q_mediaTipology  Query filtered with this mediatipology
 * 
 * @return {JSON Object}            Queried document with this filters
 */
async function findOne(q_extension,q_mediaTipology){
    let query = mediainfo.where(notUploaded).where(q_extension);
    if (q_mediaTipology!='allmt') {
        query = query.and(q_mediaTipology);
    }
    const doc = await query.limit(1).exec();
    if(env_debug){console.log(`findOne => ${doc}`)};
    return doc;
}

/**
 * @function updateOne              Async function that updates one selected document in the database with his facebook id
 * 
 * @param {String} doc_id           Document unique id 
 * @param {String} fb_video_id      Facebook video id 
 * @return {JSON Object}            Status regarding update operation
 */
async function updateOne(doc_id,fb_video_id){
    let query   = mediainfo.where({_id:doc_id});
    query       = query.update({ $set:{ fbsource: fb_video_id ,uploaded: 'true'}});//TODO correct uploaded field
    const result =  await query.exec();
    return result;
}

//Actual program execution

console.clear();
if(env_debug){console.log('debug mode ON')};

let videoArgs ={
    extension:ext_mov,
    mediatip:mediatipology_outdoor,
}

const wait_t=5000;
const wait_fbApiCall=45000;


count();

//let counts=0;
// for loop cycles if counts >0
// database is closed here
//mongoose.connect(uri);

let dbDoc,resUpload,resUpdate,mDoc,mResUpl,mResUpd;

function count(){
    mongoose.connect(uri);
    countQuery(videoArgs.extension,videoArgs.mediatip).then((countD) => {
    if(countD==0){process.exit(1);}
    counts=countD;
    console.log("--------------------------------------------------------------");
    console.log(`${counts} files with ${videoArgs.extension.extension} extension and ${videoArgs.mediatip.mediatipology} media tipology`);
    attemptCloseDb('(countQuery)');
    console.log(`Wait ${wait_fbApiCall/1000}s`);
    setTimeout(function(){
        console.log(`Executing uploadUpdate()`);
        uploadUpdate();
        },wait_fbApiCall);
    });
}


//for (let i=counts;i>0;i--) {
    //console.log(i);
    //let status=uploadUpdate();
    //if(status){index--;}
//}  
/*
uploadUpdate().then((res) => {
    console.log("result is %s",res)});
*/

//TODO implement for cycle @critical
//for (index = counts; index >0 ;) {
    //if(env_debug){console.log('index is: %s',index)};
function uploadUpdate(){
    mongoose.connect(uri);
    dbDoc=findOne(videoArgs.extension,videoArgs.mediatip);
    dbDoc.then((doc) => {
        //console.log(`There are ${index} remaining videos to upload`);
        mDoc=doc[0];
        console.log(`Using Object with id : ${mDoc._id}`);
        mResUpl=uploadHandler(mDoc);
        console.log("Uploading video to Facebook...");
        mResUpl.then((result) => {
            resUpload=result;
            if(env_debug){
                console.log(`Video id: ${resUpload.video_id}`);
                console.log(`Success : ${resUpload.success}`);
            }
            else{
                console.log(`Facebook video upload was ${resUpload.success==true ? "":"un"}successful`);
            }

            if(resUpload.success!=true){
                throw new Error('Upload failed');
            }
            if(resUpload.success==true){
                //if(env_debug){
                //    console.log('Database Update phase');
                //    console.log(`db state: ${process.env.DB_NAME} ${dbState(mongoose.connection.readyState)}`);
                //}
                mongoose.connect(uri);
                mResUpd=updateOne(mDoc._id,resUpload.video_id);
                console.log("Updating DB document...");
                mResUpd.then((result) =>{
                    resUpdate=result;
                    console.log(`Update was ${resUpdate.ok==1 ? "":"un"}successful`);
                    if(env_debug){                        
                        console.log(`Number of updated docs: ${resUpdate.n}`);
                    }
                    if(resUpdate.ok==1 && resUpdate.n==1){
                        if(env_debug){console.log('DB update done correctly')};                        
                        //console.log(`Index value : ${index--}`);
                        attemptCloseDb('(resUpdate check)');
                        //count();
                        console.log(`Wait ${wait_t/1000}s`);
                        setTimeout(function(){
                            console.log(`Executing count()`);
                            count();
                            },wait_t);

                    }
                });
            }
            })
        })
        .catch(error => {
            process.exit(1);
        });
        

}

    //console.log("siamo già qui");
    
//}//for loop parenthesis //