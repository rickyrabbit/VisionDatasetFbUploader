/**
 * This project needs dotenv module to initialize
 * facebook tokens and mongoDB credentials to access the database
 * Data is stored in .env file in project folder
 */
require('dotenv').config();

/**
 * functions and object
 */
const dbhandler = require('./visiondbhandler.js')
/**
 * mongoose is a npm module that handles CRUD operations with a MongoDB database entity
 */
const mongoose = require("mongoose");

const env_debug = true; //flag used to debug

const jsonfile = require("promise-jsonfile");


/*
jsonfile.readFile(file, function(err, obj) {
  mydata =obj.videos.data;
  mongoose.connect(uri);
  console.log(dbState+" dopo connect");
  //console.log(data);
  
})



function processUpdate(data){
    var updateQuery;

    if(data.length == 0){   //no more updates
        console.log(results);
        return;
    }


}

async function updateAll(d){
    for (let i in d) {
        //console.log(data[i].id);
        //console.log(data[i].source);
        response= await updateOne(d[i].id,d[i].source);
        response.then((result) =>{
           resUpdate=result;
           console.log(`Update was ${resUpdate.ok==1 ? "":"un"}successful`);
           if(env_debug){                        
               console.log(`Number of updated docs: ${resUpdate.n}`);
           }
           if(resUpdate.ok==1 && resUpdate.n==1){
               if(env_debug){
                   setTimeout(function(){
                       console.log('DB update done correctly');
                       },300);                
               }
           }
        }).catch((err) => {
           if(env_debug){console.log('Error during DB update')};
           process.exit(1);
       });
     }
}
*/



/**MONGODB
 * 
 * @param {string} uri                  Uri that ensures database shell conncetion
 * @param {mongoose.Schema} mediaSchema Schema of typical database object(document in mongoDB)
 * @param {mongoose.model}  mediainfo   Model of typical document in "videos" collection
*/
//TODO check if version of MongoDB cluster updated to 3.6 @high 
//see https://docs.atlas.mongodb.com/driver-connection/#node-js-driver-example
var uri =dbhandler.uri_test;  //TEST

const mediaSchema   =dbhandler.mediaSchema;
const mediainfo     =dbhandler.mediainfo_test;

const uploaded      =dbhandler.uploaded;
const ext           =dbhandler.extension;
const fbsrcexists   =dbhandler.hasfbsrc;

// List of tipologies of media present in the database
const mediatipology =dbhandler.mediatipology;

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
    let query = mediainfo.where(fbsrcexists.false).where(q_extension);
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
        if(env_debug){console.log(`db ${process.env.DB_NAME_TEST} closing ${message}`)};
        await mongoose.connection.close();  //awaits the closing of the database
        if(env_debug){console.log(`db ${process.env.DB_NAME_TEST} ${dbState(mongoose.connection.readyState)} ${message}`)};
}



/**
 * @function updateOne              Async function that updates one selected document in the database with his facebook id
 * 
 * @param {String} src_num          Video Source unique number 
 * @param {String} src_videourl     Facebook video source
 * @return {JSON Object}            Status regarding update operation
 */
async function updateOne(src_num,src_videourl){

    let query   = mediainfo.where({fbsource:src_num});
    query       = query.update({ $set:{ fbvideourl: src_videourl,fbsrcexists: 'true'}});
    const result =  await query.exec();
    return result;
}

async function findOne(src_num){
    let query = mediainfo.where({fbsource:src_num});
    const doc = await query.limit(1).exec();
    //if(env_debug){console.log(`findOne => ${doc}`)};
    return doc;
}


console.clear();
if(env_debug){console.log('debug mode ON')};

var file = 'C:/Users/Ricky/Desktop/tesi/SocialNetworkIdentification/jsonCollection/jsonFBsources/og.json';
let processed,mydata,response,resUpdate,res,results;

mongoose.connect(uri);
jsonfile.read(file).then(jsonData => {
    // DEBUG
    console.clear();
    if(env_debug){console.log('debug mode ON')};
    // DEBUG
    mydata=jsonData.videos.data;
    
    //console.log(uploaded.notDone);
    count(mydata).then((result) => {
        console.log(result);
    }).catch((err) => {
        
    });

    //console.log(jsonData.videos.data);

}).catch(err => {
    throw err;
});

async function count(stackA){
    if(typeof stackA !== 'undefined' && stackA.length > 0){
        //console.log(uri);
        temp=stackA.pop();
        console.log(temp.id+"\n"+temp.source);
        let id = `{ fbsource: '${temp.id}' }`;
        let src= `{ fbvideourl: '${temp.source}' }`;
        console.log(id);
        console.log(src);
        
        resUpdate=findOne(id);
        //resUpdate=updateOne(id,src);
        resUpdate.then((result) => {
            response=result;
            console.log(response);
            if(env_debug){
                console.log(`DEBUG response.n is : ${response.n}`);
                attemptCloseDb('');
            }
            else{
                console.log(`response is : ${response.n}`);
                attemptCloseDb('');
                process.exit(1);
            }
            //count(stackA);
        
        }).catch((err) => {
            console.log(err.message);
                process.exit(1);
        });/**/
        
    }
    else{
        console.log("Done updating");
        return;
    }
}
