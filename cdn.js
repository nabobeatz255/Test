import{initializeApp}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import{getDatabase,ref,push,update,set,onValue,remove,serverTimestamp,get}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import{getStorage,refasstorageRef,uploadBytes,getDownloadURL}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import{updateProfile}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

constfirebaseConfig={
apiKey:"AIzaSyC_VKdV-KsIzUiOb7jFLsYXdTsuGkLiS-Q",
authDomain:"register-71bde.firebaseapp.com",
projectId:"register-71bde",
storageBucket:"register-71bde.appspot.com",
messagingSenderId:"412548441298",
appId:"1:412548441298:web:e0fb2b6c5fbd4af7d0b90b",
};

constapp=initializeApp(firebaseConfig);
constauth=getAuth();
constdb=getDatabase(app);
conststorage=getStorage(app);

letcurrentUser=null;

//Definethelistofpremiumusers(addUIDsofpremiumusersmanually)
constpremiumUsers=["Sw9hx2GrwMYPkmzimgOMsTEbKK53"];

onAuthStateChanged(auth,async(user)=>{
currentUser=user;
if(currentUser){
loadPosts();
loadLikedPosts();
displayUserDetails();
loadMessages();
loadUserAndTeams();

constisPremiumUser=premiumUsers.includes(currentUser?.uid);

if(isPremiumUser){
awaitenablePremiumFeatures();
}else{
awaitenableFreeUserFeatures();
}
}else{
showToast("Youarenotsignedin.Redirectingtologin...","error");
window.location.href="index.html";
}
});

//Functiontoenablepremiumfeatures
constenablePremiumFeatures=async()=>{
showToast("WelcomePremiumUser!Enjoyexclusivefeatures.","success");

//Showthepremiumbuttonforpremiumusers
constpremiumButton=document.getElementById("premium-post-btn");
if(premiumButton){
premiumButton.classList.remove("hidden");
}

//Showaspecificelementonlyforpremiumusers
constpremiumOnlyElement=document.getElementById("premium-only-element");
if(premiumOnlyElement){
premiumOnlyElement.style.display='block';
}
};

//Functiontoenablefeaturesforfreeusers
constenableFreeUserFeatures=async()=>{
showToast("NewVersion3.0Coming14thFebruary...GetReady","info");

//Showadsforfreeusers
constfreeUserAdsElement=document.getElementById("free-user-ads");
if(freeUserAdsElement){
freeUserAdsElement.style.display='block';
}

//Hidethepremiumbuttonforfreeusers
constpremiumButton=document.getElementById("premium-post-btn");
if(premiumButton){
premiumButton.classList.add("hidden");
}

//Showamessageindicatingthecurrentuserispremium(forfreeusers)
constcurrentUserPremiumMessage=document.getElementById("current-user-premium");
if(currentUserPremiumMessage){
currentUserPremiumMessage.style.display='block';
}
};


document.addEventListener('DOMContentLoaded',()=>{
if(currentUser){
//Fetchcurrentuser'steamandplacethemintheirselectedbox
constuserTeamsRef=ref(db,`teams/${currentUser.uid}`);
get(userTeamsRef).then(snapshot=>{
if(snapshot.exists()){
constteamNumber=snapshot.val().team;
constselectedBox=document.querySelector(`[data-team="${teamNumber}"]`);
if(selectedBox){
constuserPhoto=currentUser.photoURL||"default-profile-pic.jpg";
constuserName=currentUser.displayName||"Anonymous";
selectedBox.querySelector('.plus-box').innerHTML=`<imgsrc="${userPhoto}"alt="${userName}"style="width:60px;height:60px;border-radius:50%;">`;
selectedBox.querySelector('h5').textContent=userName;
}
}
}).catch(error=>{
console.error("Errorloadinguserteam:",error);
});

//Fetchallteamsanddisplayusersintheirrespectiveboxes
constallTeamsRef=ref(db,`teams`);
get(allTeamsRef).then(snapshot=>{
if(snapshot.exists()){
constteamsData=snapshot.val();
Object.keys(teamsData).forEach(teamNumber=>{
constmembers=teamsData[teamNumber].members;
constteamBox=document.querySelector(`[data-team="${teamNumber}"]`);
if(teamBox){
constfirstMember=Object.values(members)[0];//Assumingoneuserperbox
if(firstMember){
teamBox.querySelector('.plus-box').innerHTML=`<imgsrc="${firstMember.photo}"alt="${firstMember.name}"style="width:60px;height:60px;border-radius:50%;">`;
teamBox.querySelector('h5').textContent=firstMember.name;
}
}
});
}
}).catch(error=>{
console.error("Errorloadingteammembers:",error);
});
}
});

document.querySelectorAll('.grid-modali-item').forEach(item=>{
item.addEventListener('click',()=>handleBoxClick(item));
});

consthandleBoxClick=(box)=>{
constteamNumber=box.dataset.team;

if(!currentUser){
showToast('Pleasewaitamoment...','info');
return;
}

constuserName=currentUser.displayName||"Anonymous";
constuserPhoto=currentUser.photoURL||"default-profile-pic.jpg";

//Checkiftheuserhasalreadyselectedabox
constuserTeamsRef=ref(db,`teams/${currentUser.uid}`);
get(userTeamsRef).then(snapshot=>{
if(snapshot.exists()){
constexistingTeam=snapshot.val().team;
showToast(`Youarealreadyaplayer${existingTeam}.Youcannotjoinanothernumber.`,'warning');
}else{
constteamMembersRef=ref(db,`teams/${teamNumber}/members`);
get(teamMembersRef).then(snapshot=>{
if(snapshot.exists()&&Object.keys(snapshot.val()).length>0){
showToast(`Player${teamNumber}isalreadytaken.`,'warning');
}else{
constteamRef=ref(db,`teams/${teamNumber}/members/${currentUser.uid}`);
//InsidehandleBoxClickfunctionwheretheplayerissuccessfullyadded
set(teamRef,{
name:userName,
photo:userPhoto
}).then(()=>{
showToast(`Welcomeplayer${teamNumber}!`,'success');

//Updatetheboxcontentwithphoto,name,andplayernumber

box.querySelector('.plus-box').innerHTML=`
<imgsrc="${userPhoto}"alt="${userName}"style="width:60px;height:60px;border-radius:50%;">
<divclass="player-number"style="position:absolute;bottom:5px;right:5px;z-index:99999;background:#3aafa9;color:white;padding:2px5px;border-radius:3px;font-size:12px;">
#${teamNumber}
</div>`;

box.querySelector('h5').textContent=userName;
updateUserTeam(currentUser.uid,teamNumber);
}).catch(error=>{
console.error("Errorjoiningteam:",error);
showToast("Failedtojoinasaplayer.Pleasetryagain.",'error');
});
}
}).catch(error=>{
console.error("Errorcheckingteambox:",error);
});
}
}).catch(error=>{
console.error("Errorcheckinguserteam:",error);
});
};


functionloadUserAndTeams(){
constuserTeamsRef=ref(db,`teams/${currentUser.uid}`);
get(userTeamsRef).then(snapshot=>{
if(snapshot.exists()){
constteamNumber=snapshot.val().team;
constselectedBox=document.querySelector(`[data-team="${teamNumber}"]`);
if(selectedBox){
constuserPhoto=currentUser.photoURL||"default-profile-pic.jpg";
constuserName=currentUser.displayName||"Anonymous";
selectedBox.querySelector('.plus-box').innerHTML=`
<imgsrc="${userPhoto}"alt="${userName}"style="width:60px;height:60px;border-radius:50%;">
<divclass="player-number"style="position:absolute;bottom:5px;right:5px;z-index:99999;background:#3aafa9;color:white;padding:2px5px;border-radius:3px;font-size:12px;">
#${teamNumber}
</div>`;
selectedBox.querySelector('h5').textContent=userName;
}
}
}).catch(error=>{
console.error("Errorloadinguserteam:",error);
});

constallTeamsRef=ref(db,`teams`);
get(allTeamsRef).then(snapshot=>{
if(snapshot.exists()){
constteamsData=snapshot.val();
Object.keys(teamsData).forEach(teamNumber=>{
constmembers=teamsData[teamNumber]?.members;
constteamBox=document.querySelector(`[data-team="${teamNumber}"]`);
if(teamBox&&members){
constfirstMember=Object.values(members)[0];
if(firstMember){
teamBox.querySelector('.plus-box').innerHTML=`
<imgsrc="${firstMember.photo}"alt="${firstMember.name}"style="width:60px;height:60px;border-radius:50%;">
<divclass="player-number"style="position:absolute;bottom:5px;right:5px;z-index:99999;background:#3aafa9;color:white;padding:2px5px;border-radius:3px;font-size:12px;">
#${teamNumber}
</div>`;
teamBox.querySelector('h5').textContent=firstMember.name;
}
}
});
}
}).catch(error=>{
console.error("Errorloadingteammembers:",error);
});
}



constupdateUserTeam=(userId,teamNumber)=>{
constuserTeamsRef=ref(db,`teams/${userId}`);
set(userTeamsRef,{
team:teamNumber
});
};







//Toastfunctiontodisplaynotifications
constshowToast=(message,type='info')=>{
consttoast=document.createElement('div');
toast.classList.add('toast',type);
toast.textContent=message;

//Appendtothebody
document.body.appendChild(toast);

//Removetoastafter3seconds
setTimeout(()=>{
toast.remove();
},3000);
};

//CSSStylesforToastnotifications
conststyle=document.createElement('style');
style.textContent=`
.toast{
position:fixed;
top:0;
left:50%;
padding:13px;/*Paddingforspacing*/
transform:translateX(-50%);
width:100vw;/*Fullwidthoftheviewport*/
height:60px;
color:white;
display:flex;/*Useflexboxforcentering*/
align-items:center;/*Centervertically*/
justify-content:center;/*Centerhorizontally*/
text-align:center;
font-size:14px;
opacity:0;
z-index:999999;
animation:slideFromTop0.5sease-outforwards;
border-left:3pxsolid;
}

.toast.success{
border-left-color:green;
border-left-width:7px;/*Adjustthewidthasneeded*/
border-left-style:solid;/*Ensuretheborderisvisible*/
background-color:white;
color:green;
}


.toast.error{
border-left-color:#f44336;
background-color:white;
border-left-width:7px;/*Adjustthewidthasneeded*/
border-left-style:solid;/*Ensuretheborderisvisible*/
color:#f44336;
}

.toast.info{
border-left-color:blue;
border-left-width:7px;/*Adjustthewidthasneeded*/
border-left-style:solid;/*Ensuretheborderisvisible*/
background-color:white;
color:blue;
}

.toast.warning{
border-left-color:#FF9800;
border-left-width:7px;/*Adjustthewidthasneeded*/
border-left-style:solid;/*Ensuretheborderisvisible*/
background-color:white;
color:#FF9800;
}

/*Slidefromtopanimation*/
@keyframesslideFromTop{
from{
opacity:0;
transform:translateX(-50%)translateY(-30px);
}
to{
opacity:1;
transform:translateX(-50%)translateY(0);
}
}

`;
document.head.appendChild(style);

constformatTimestamp=(timestamp)=>{
constnow=newDate();
consttimeDiff=now-newDate(timestamp);
constseconds=Math.floor(timeDiff/1000);
constminutes=Math.floor(seconds/60);
consthours=Math.floor(minutes/60);
constdays=Math.floor(hours/24);
constmonths=Math.floor(days/30);
constyears=Math.floor(months/12);

if(seconds<60)return`Justnow`;
if(minutes<60)return`${minutes}mago`;
if(hours<24)return`${hours}hrago`;
if(days<30)return`${days}dago`;
if(months<12)return`${months}moago`;
return`${years}yr`;
};

constloadPosts=()=>{
constallPostsContainer=document.getElementById("allposts");
constmyPostsContainer=document.getElementById("myposts");

//Onlyproceedifthecontainersarepresent
if(!allPostsContainer||!myPostsContainer)return;

//Clearthecontainersbeforeaddingnewposts
allPostsContainer.innerHTML="";
myPostsContainer.innerHTML="";

constpostsRef=ref(db,"posts");
onValue(postsRef,(snapshot)=>{
constposts=[];
snapshot.forEach((childSnapshot)=>{
constpost=childSnapshot.val();
constpostId=childSnapshot.key;
posts.push({postId,...post});
});

//Sortpostsbytimestampfromnewtoold
posts.sort((a,b)=>b.timestamp-a.timestamp);

//Filterpostsformypostsandallposts
constmyPosts=posts.filter(post=>post.authorName===currentUser.displayName);
constallPosts=posts;

//Displaymyposts(withedit/deleteoptions)
myPosts.forEach(post=>displayPost(post,myPostsContainer,true));//Showdeletebuttonformyposts

//Displayallposts(withoutedit/deleteoptions)
allPosts.forEach(post=>displayPost(post,allPostsContainer,false));//Nodeletebuttonforothers'posts
});
};

constloadLikedPosts=()=>{
constlikedPostsContainer=document.getElementById("likedposts");
if(!likedPostsContainer)return;

likedPostsContainer.innerHTML="";

constpostsRef=ref(db,"posts");
onValue(postsRef,(snapshot)=>{
constposts=[];
snapshot.forEach((childSnapshot)=>{
constpost=childSnapshot.val();
constpostId=childSnapshot.key;
posts.push({postId,...post});
});

posts.sort((a,b)=>b.timestamp-a.timestamp);

//Filterlikedposts(excludepostsbythecurrentuser)
constlikedPosts=posts.filter(post=>post.likes&&post.likes[currentUser.uid]&&post.authorName!==currentUser.displayName);
likedPosts.forEach(post=>displayPost(post,likedPostsContainer,false));//Nodeletebuttonforlikedposts
});
};

constdisplayPost=(post,container,isMyPost)=>{
constexistingPost=container.querySelector(`[data-post-id="${post.postId}"]`);
if(existingPost)return;

constcommentCount=post.comments?Object.keys(post.comments).length:0;

constpostElement=document.createElement("div");
postElement.className="instagram-post-2";
postElement.setAttribute("data-post-id",post.postId);

constshareUrl=`${window.location.origin}/dashboard.html?postId=${post.postId}`;

postElement.innerHTML=`
<divclass="post-header">
<divclass="profile-picture">
<imgsrc="${post.authorPhoto}"alt="Userprofilepicture">
</div>
<divclass="profile-details">
<divclass="profile-name">${post.authorName}</div>
<divclass="post-time-2">${formatTimestamp(post.timestamp)}•<spanclass="like-count">${Object.keys(post.likes||{}).length}likes</span></div>
</div>
<divclass="post-options">
<iclass="ri-more-fill"></i>
<divclass="options-menu">
<ul>
${isMyPost?`<liclass="edit-btn"data-id="${post.postId}">EditThePost</li>`:""}
<liclass="toggle-comments"data-id="${post.postId}">ViewPost</li>
<liclass="like-btn"data-id="${post.postId}">Like${post.authorName}'sPost</li>
<liclass="share-btn"data-id="${post.postId}"data-url="${shareUrl}">Share${post.authorName}'sPost</li>
<li><spanclass="comment-count">Currentcomments${commentCount}</span></li>
${isMyPost?`<liclass="delete-post-btn"data-id="${post.postId}">DeleteMyPost</li>`:""}
</ul>
</div>
</div>
</div>
<divclass="post-imagetoggle-comments">
<imgsrc="${post.imageUrl}"alt="Postcontent">
</div>
<divclass="caption">
<spanclass="username">${post.authorName}</span>${post.content}
</div>
`;

container.appendChild(postElement);

postElement.querySelector(".like-btn").addEventListener("click",()=>likePost(post.postId));
postElement.querySelector(".toggle-comments").addEventListener("click",()=>showCommentsPopup(post));
postElement.querySelector(".share-btn").addEventListener("click",()=>{
navigator.clipboard.writeText(shareUrl).then(()=>{
showToast("Linkcopiedtoclipboard!","success");
}).catch((err)=>{
console.error("Failedtocopylink:",err);
showToast("Failedtocopylink","error");
});
});

//Addeventlistenerforopeningthepostinanewtab
postElement.querySelector(".post-imageimg").addEventListener("click",()=>{
showToast("Pleasewaitforthesharedpost...","info");//Toastmessage
window.open(shareUrl,"_blank");//Openthesharedpostinanewtab
});

if(isMyPost){
postElement.querySelector(".delete-post-btn").addEventListener("click",()=>deletePost(post.postId));
postElement.querySelector(".edit-btn").addEventListener("click",()=>editPost(post));
}
};


consturlParams=newURLSearchParams(window.location.search);
constpostIdFromUrl=urlParams.get('postId');

if(postIdFromUrl){
constpostsRef=ref(db,`posts/${postIdFromUrl}`);
get(postsRef).then(snapshot=>{
if(snapshot.exists()){
constpost=snapshot.val();
post.postId=postIdFromUrl;
showCommentsPopup(post);
}else{
showToast("Pole!PostHiyoInawezekanaImefutwaAuHaipo.","error");
}
}).catch(error=>{
console.error("Errorloadingpost:",error);
showToast("Errorloadingpost.","error");
});
}


constshowCommentsPopup=(post)=>{
constpopup=document.createElement('div');
popup.className='comments-popup';

popup.innerHTML=`
<divclass="comments-popup-content">
<divclass="post-header">
<divclass="profile-details">
<divclass="profile-name">${post.authorName}'spost</div>
<divclass="post-time-2">Posted${formatTimestamp(post.timestamp)}•<spanclass="like-count">${Object.keys(post.likes||{}).length}likes</span></div>
</div>
<spanclass="close-popup"><iclass="ri-close-line"></i></span>
</div>
<divclass="post-image2">
<imgsrc="${post.imageUrl}"alt="Postcontent">
</div>
<divclass="caption">
<spanclass="username">${post.authorName}</span>${post.content}
</div>
<divclass="comments-list">${renderComments(post.comments)}</div>
<divclass="comment-input-container">
<inputclass="comment-input"placeholder="Writeacomment...">
<buttonclass="submit-comment"data-post-id="${post.postId}">Send</button>
</div>
</div>
`;

document.body.appendChild(popup);

popup.querySelector('.close-popup').addEventListener('click',()=>popup.remove());
popup.querySelector('.submit-comment').addEventListener('click',()=>{
constcommentInput=popup.querySelector('.comment-input');
constcommentText=commentInput.value.trim();
if(commentText!==""){
submitComment(post.postId,commentText);
commentInput.value="";
}
});
};


constrenderComments=(comments)=>{
if(!comments)return"";
returnObject.keys(comments).map(commentId=>{
constcomment=comments[commentId];
return`
<divclass="comment">
<spanclass="comment-username">${comment.username}</span><br><spanclass="comment-sms">${comment.message}</span>
</div>
`;
}).join("");
};

constlikePost=async(postId)=>{
constpostRef=ref(db,`posts/${postId}/likes/${currentUser.uid}`);
constsnapshot=awaitget(postRef);
if(snapshot.exists()){
awaitremove(postRef);//Removelike
showToast("unliked",'info');
}else{
awaitset(postRef,true);//Addlike
showToast("youlikedthepost",'success');
}
loadPosts();//Reloadtoreflectthechanges
};

constsubmitComment=async(postId,commentText)=>{
constcommentData={
username:currentUser.displayName,
message:commentText,
};

constcommentId=push(ref(db,`posts/${postId}/comments`)).key;
awaitset(ref(db,`posts/${postId}/comments/${commentId}`),commentData);
showToast("commentadded",'success');
loadPosts();//Reloadpoststoshowthenewcomment
};

constdeletePost=async(postId)=>{
constpostRef=ref(db,`posts/${postId}`);
awaitremove(postRef);//Deletethepost
loadPosts();//Reloadpoststoremovethedeletedpost
showToast("postimefutwa",'success');
};

consteditPost=(post)=>{
constnewContent=prompt("Edityourpostcontent:",post.content);
if(newContent!==null){
constpostRef=ref(db,`posts/${post.postId}`);
update(postRef,{content:newContent});
showToast("postimeupdatiwa",'success');
loadPosts();//Reloadpoststoshowupdatedcontent
}
};

constcreateNewPost=async()=>{
constcaption=document.getElementById("new-post-caption")?.value;
constfileInput=document.getElementById("new-post-image");
constfile=fileInput?.files[0];

if(!caption&&!file){
showToast("tafadhariwekacaptionnaimage.",'warning');
return;
}

try{
letimageUrl="";
showToast("Uploadingpostyako...Tafadharisubiri",'info');

if(file){
//UploadimagetoFirebaseStorage
conststorageReference=storageRef(storage,`post_images/${currentUser.uid}/${file.name}`);
awaituploadBytes(storageReference,file);
imageUrl=awaitgetDownloadURL(storageReference);
showToast("ukaguziwapostumekamilika",'info');
}

constpostId=push(ref(db,"posts")).key;
awaitset(ref(db,`posts/${postId}`),{
authorName:currentUser.displayName||"Anonymous",
authorPhoto:currentUser.photoURL||"default.jpg",
content:caption,
imageUrl,
timestamp:serverTimestamp(),
likes:{},
comments:{},
});

showToast("Postyakoimetengenezwatayari...reloading!",'success');
window.location.reload();//Reloadthepageaftersuccessfulupload
}catch(error){
console.error("Errorcreatingpost:",error);
showToast("Errorcreatingpost",'error');
}
};

constupdateUserProfile=async()=>{
constnewUsername=document.getElementById('username')?.value.trim();
constprofilePictureInput=document.getElementById('profile-picture-input');
constnewProfilePicture=profilePictureInput?.files[0];

//Checkifbothusernameandprofilepictureareempty
if(!newUsername&&!newProfilePicture){
showToast("Pleaseprovideanewusernameorprofilepicture.",'warning');
return;
}

try{
//Getthecurrentlyauthenticateduser
constuser=auth.currentUser;
console.log("Authenticateduser:",user);

if(!user){
showToast("Usernotauthenticated.Pleaselogin.",'error');
return;//Exitiftheuserisnotauthenticated
}

//Updatetheusernameifprovided
if(newUsername&&newUsername!==user.displayName){
try{
console.log("Updatingusernameto:",newUsername);
//UsingupdateProfilefromfirebase/auth
awaitupdateProfile(user,{
displayName:newUsername,
});
showToast("Usernameupdatedsuccessfully!",'success');
}catch(profileError){
console.error("Errorupdatingusername:",profileError);
showToast("Errorupdatingusername.Pleasetryagain.",'error');
}
}

//Uploadnewprofilepictureifprovided
if(newProfilePicture){
console.log("Newprofilepicture:",newProfilePicture);

conststorageReference=storageRef(storage,`profile_pictures/${user.uid}/${newProfilePicture.name}`);
console.log("Storagereference:",storageReference);

try{
//UploadthepicturetoFirebaseStorage
awaituploadBytes(storageReference,newProfilePicture);
console.log("Profilepictureuploadedsuccessfully.");

//GetthedownloadURLfortheuploadedpicture
constnewProfilePictureUrl=awaitgetDownloadURL(storageReference);
console.log("NewprofilepictureURL:",newProfilePictureUrl);

//Updatetheuser'sprofilewiththenewpicture
awaitupdateProfile(user,{
photoURL:newProfilePictureUrl,
});
showToast("Profilepictureupdatedsuccessfully!",'success');
}catch(uploadError){
console.error("Erroruploadingprofilepicture:",uploadError);
showToast("Erroruploadingprofilepicture.Pleasetryagain.",'error');
}
}

//Reloadthepagetoreflectupdateddetails
window.location.reload();

}catch(error){
console.error("Errorupdatingprofile:",error);
showToast("Errorupdatingprofile.Pleasetryagain.",'error');
}
};
//Addeventlistenertotheupdateprofilebutton
document.getElementById('update-profile-button')?.addEventListener('click',updateUserProfile);

//Updateprofilepicturepreviewwhenfileisselected
document.getElementById('profile-picture-input')?.addEventListener('change',(event)=>{
constfile=event.target.files[0];
if(file){
constreader=newFileReader();
reader.onload=()=>{
document.getElementById('profile-picture').src=reader.result;
};
reader.readAsDataURL(file);
}
});

//Displayuserdetails
constdisplayUserDetails=()=>{
constuser=auth.currentUser;
if(!user)return;

constuserName=user.displayName||"Anonymous";
constuserEmail=user.email||"Noemailavailable";
constuserProfilePic=user.photoURL||"default-profile-pic.jpg";//Defaultprofilepictureifnoneexists

document.querySelectorAll('.user-name').forEach(element=>{
element.innerHTML=userName;//Setusername
});

document.querySelectorAll('.user-email').forEach(element=>{
element.textContent=userEmail;//Setuseremail
});

document.querySelectorAll('.profile-picture').forEach(element=>{
element.src=userProfilePic;//Setuserprofilepicture
});
};

//Initializetheprofilewithuserdetails
onAuthStateChanged(auth,(user)=>{
if(user){
displayUserDetails();//Displayuserdetailswhenloggedin
}
});
document.getElementById("create-post-button")?.addEventListener("click",createNewPost);

constloadMessages=()=>{
constmessagesRef=ref(db,"messages");
constchatBox=document.getElementById("chat-box");

//Listenfornewmessagesinreal-time
onValue(messagesRef,(snapshot)=>{
constmessages=[];
snapshot.forEach((childSnapshot)=>{
constmessage=childSnapshot.val();
messages.push(message);
});

//Clearchatboxbeforedisplayingnewmessages
chatBox.innerHTML='';

//Displayallmessages
messages.forEach(message=>{
constmessageElement=document.createElement('div');
messageElement.classList.add('message',message.senderId===currentUser.uid?'right':'left');

//Createtheprofilepictureelement
constprofilePicture=message.senderPhotoURL||'default-profile-picture.jpg';//Useadefaultpictureifnoneisavailable

messageElement.innerHTML=`

<divclass="post-headergetNow">
<divclass="profile-picture">
<imgsrc="${profilePicture}"alt="${message.senderName}'sprofilepicture">
</div>
<divclass="profile-details">
<divclass="profile-name">${message.senderName}</div>
<divclass="post-time-3">${message.text}</span></div>
</div>
</div>
`;
chatBox.appendChild(messageElement);
});

//Scrolltothebottomtoshowthelatestmessage
chatBox.scrollTop=chatBox.scrollHeight;
});
};
constsendMessage=async()=>{
constmessageInput=document.getElementById("chat-message-input");
constmessageText=messageInput.value.trim();

if(!messageText){
showToast("Pleaseenteramessage.",'warning');
return;
}

constmessagesRef=ref(db,"messages");
constnewMessageRef=push(messagesRef);
awaitset(newMessageRef,{
senderId:currentUser.uid,
senderName:currentUser.displayName||"Anonymous",
senderPhotoURL:currentUser.photoURL||'default-profile-picture.jpg',//IncludephotoURLhere
text:messageText,
timestamp:serverTimestamp(),
});

//Cleartheinputfieldaftersendingthemessage
messageInput.value='';
showToast("Messagesent!",'success');
};
document.getElementById('send-message-button')?.addEventListener('click',sendMessage);
