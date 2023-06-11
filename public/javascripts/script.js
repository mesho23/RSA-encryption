users = []
 generateRSAKeyPair().then(async (keyPair)=>{

  const privateKeyPEM = await forge.pki.privateKeyToPem(keyPair.privateKey);
  const publicKeyPem =await  forge.pki.publicKeyToPem(keyPair.publicKey)


  const socket = io({query:{publicKey:publicKeyPem}});

socket.on('connect', () => {
  $(".id").text(socket.id);
});
var container = document.getElementById("messages")
var q=0;


socket.on("receive", async (encryptedData,iteration) => {
  
  
  

  img = document.createElement("img");
  
  let offset = 0;
  
  decryptedData=""
 
  const chunkSize = encryptedData.length/iteration; // 1MB (adjust as needed)
  
   
    
   
 let i =0;
    while (offset < encryptedData.length) {
      const chunk = encryptedData.slice(offset, offset + chunkSize);
 
      const decryptedChunk = decryptChunk(chunk, privateKeyPEM);
      decryptedData += decryptedChunk;
      offset += chunkSize;
      i++;
    }
    var container = document.getElementById("messages");
    var paragraphqq = document.createElement('p');
    var q = 0;
    q++;
    paragraphqq.id = q + 'mmyParagraph';

    // Apply CSS styles using the style property
    paragraphqq.style.color = 'brown';
    paragraphqq.style.marginRight = '0px';
    paragraphqq.style.marginLeft = '65%';
    paragraphqq.style.textAlign = 'right';

    // Create a label element and set its text content to decryptedData
    var msg = document.createElement("label");
    msg.innerText = decryptedData;

    // Append the message label to the paragraph
    paragraphqq.appendChild(msg);

    // Append the paragraph to the container
    container.appendChild(paragraphqq);
    dialog(paragraphqq , encryptedData);

    
});

  

  
        

// Rest of your client-side code...





  // listen when user sends a file 
$(".messageBtn").on("click", function () {

  receiver = $(".receiver").val()
 
  
  if(receiver){
      socket.emit("getPublicKey",receiver)
    
      
    }
     else alert("receiver id can not be  empty")

     

     
});

socket.on("enc", async(userToSendPubKey,receiver)=>{
   
  //const buffer = Buffer.from(fileData); // Convert ArrayBuffer to Buffer
 
  message = $("#mytext").val();;
  
  

  
  let offset = 0;
  encryptedData=""
  
  const chunkSize = 62; // 1MB (adjust as needed)
   
    
   let i =0;

    while (offset < message.length) {
      const chunk = message.slice(offset, offset + chunkSize);
   
    
      const encryptedChunk = encryptChunk(chunk, userToSendPubKey);
      encryptedData += encryptedChunk;
      offset += chunkSize;
      i++;
    }
     if(i==0) i=1;
    
    

     offset = 0;
     
     var container = document.getElementById("messages");
      var paragraph = document.createElement('p');
      var q = 0; // Make sure to declare and initialize the variable q before using it
      q++;
      paragraph.id = q + 'myParagraph';
      paragraph.style.color = 'green';
      paragraph.style.marginLeft = '0px';
      paragraph.style.marginRight = '65%';
      paragraph.style.textAlign = 'left';
    
      // Create a label element and set its text content to decryptedData
      var msgu = document.createElement("label");
      msgu.innerText = $("#mytext").val();
      
      paragraph.appendChild(msgu);

      // Append the paragraph to the container
      container.appendChild(paragraph);
      dialog(paragraph , encryptedData);
 
    socket.emit('send_rec', receiver,encryptedData,i);
  });
socket.on("new_user",(id)=>{
  
  $(".IDs").append(`<p id='${id}'>${id} </p>`)
  users.push(id)
 
})

socket.on("joined_user",(socket)=>{
  socket.forEach(id => {
    $(".IDs").append(`<p id='${id}'>${id} </p>`)
  });
  
  
  
})
socket.on("user_left",(id)=>{
  users.forEach(element => {
    if(id == element){
      $(`#${id}`).remove()
    }
  });
})


 })
function generateRSAKeyPair() {
  return new Promise((resolve, reject) => {
    forge.pki.rsa.generateKeyPair({ bits: 1024 }, (err, keyPair) => {
      if (err) {
        reject(err);
      } else {
        resolve(keyPair);
      }
    });
  });
}

function convertKeyToPEM(key) {
  const pemKey = forge.pki.privateKeyToPem(key);
  return pemKey;
}


function decryptChunk(encryptedChunk, privateKeyPEM) {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPEM);
  const decryptedChunk = privateKey.decrypt(encryptedChunk, 'RSA-OAEP', {
    md: forge.md.sha256.create()
  });
  return decryptedChunk;
}




function encryptChunk(chunk, publicKeyPem) {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encryptedChunk = publicKey.encrypt(chunk, 'RSA-OAEP', {
    md: forge.md.sha256.create()
  });
  return encryptedChunk;
}

function dialog(text, encryptedDataT) {
  dialogOverlay = document.createElement('div');
  dialogOverlay.className = 'dialog-overlay';

  const dialogBox = document.createElement('div');
  dialogBox.className = 'dialog-box';

  const dialogTitle = document.createElement('h2');
  dialogTitle.textContent = 'encryption message';

  const dialogContent = document.createElement('p');
  dialogContent.textContent = encryptedDataT;

  const closeButton = document.createElement('button');
  closeButton.className = 'close-dialog-btn';
  closeButton.textContent = 'Close';
  // Append the elements to the DOM
  dialogBox.appendChild(dialogTitle);
  dialogBox.appendChild(dialogContent);
  dialogBox.appendChild(closeButton);
  dialogOverlay.appendChild(dialogBox);
  document.body.appendChild(dialogOverlay);
  // Apply CSS styles
  const style = document.createElement('style');
  document.head.appendChild(style);
  text.addEventListener('click', () => {
    dialogOverlay.style.display = 'flex';
  });

  

  
}
$(document).on("click",".close-dialog-btn",function(){
  
  $(this).parent().parent().css({
    "display":"none",
  });
})


// footer 
$('.footerBtn').click(function() {
  $('#mydialog')[0].showModal(); // Show the dialog
});

