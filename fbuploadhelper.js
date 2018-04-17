require('dotenv').config();

const fs = require('fs');
const path = require('path');
const fbUpload = require('facebook-api-video-upload');

console.log('Console works');
let videouploaded=0,
	session_starttime=0,
	session_videouploaded=0;
const session_maxcalls=200;

const group_VisionDataset_id    =process.env.FB_GROUP_ID;
const page_VisionDataset_id     =process.env.FB_PAGE_ID;
const profile_id                =process.env.FB_PROFILE_ID;

const fbToken                   =process.env.FB_USER_TOKEN;
const fbToken_page              =process.env.FB_PAGE_TOKEN;

/*
fbUpload(args).then((res) => {
	//let provaJson = JSON.parse(res);
	//console.log('res instanceof String? ',res instanceof String);
	console.log('res normale: ',res.success+' '+res.video_id);

	//console.log('trying toString()? ',res.toString());
	//res:  { success: true, video_id: '1838312909759132' }
}).catch((e) => {
	console.error(e);
});

async function uploadHandler(doc){
	const filename = doc.inputfilename+'.'+doc.extension;
	const path = path.join('.','dataset',doc.device,doc.media,doc.mediatipology,filename);

	const args = {
		token: fbToken_page, // with the permission to upload
		id: page_VisionDataset_id, //The id represent {page_id || user_id || event_id || group_id}
		stream: fs.createReadStream(path), //path to the video,
		title: path,
		description: path
	};

	const prom = await fbUpload(args);
	prom.then((res) => {
		if(res.success=='false'){
			throw new Error('Upload failed');
		}
		return res;
	}).catch((e) => {
		console.error(e);
	});

}
*/

async function uploadHandler(){
	const path = 'E:/VISION/dataset/D01_Samsung_GalaxyS3Mini/videos/flat/D01_V_flat_move_0001.mp4';

	const args = {
		token: fbToken_page, // with the permission to upload
		id: page_VisionDataset_id, //The id represent {page_id || user_id || event_id || group_id}
		stream: fs.createReadStream(path), //path to the video,
		title: path,
		description: path
	};

	const prom = await fbUpload(args);
	prom.then((res) => {
		if(res.success=='false'){
			throw new Error('Upload failed');
		}
		return res;
	}).catch((e) => {
		console.error(e);
	});

}

let u=uploadHandler();
console.log(u);