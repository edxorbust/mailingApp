document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);
  document.querySelector("#compose-form").addEventListener("submit", sendEmail);
  
  

  // By default, load the inbox
  load_mailbox("inbox");
});



function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#emailSingle-view").innerHTML = "";
  document.querySelector("#emailSingle-view").style.display = "none";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function unArchive(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  .then(()=>{
    load_mailbox("inbox");
  })
}


function archive(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  .then(()=>{
    load_mailbox("archive");
  })
}

function reply(id){
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#emailSingle-view").innerHTML = "";
  document.querySelector("#emailSingle-view").style.display = "none";

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector("#compose-recipients").value = `${email['sender']}`;
    const subject = email["subject"]
    if (!subject.includes("Re:")){
      document.querySelector("#compose-subject").value = `Re: ${subject}`;
    }
    else{
      document.querySelector("#compose-subject").value = subject;
    }
    document.querySelector("#compose-body").value = `On ${email['timestamp']} ${email['sender']} wrote: ${email['body']}`;
  });
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#emailSingle-view").innerHTML = "";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#emailSingle-view").style.display = "none";
  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;
  //query latest emails
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      // Print emails
      console.log(emails);
      // ... do something else with emails ...
      emails.forEach((emailSingle) => {
        const element = document.createElement("div");
        element.setAttribute("class", "border border-dark pl-3 container");
        element.setAttribute("id", "emailElement");
        element.innerHTML = `<a class='font-weight-bold'>${emailSingle["sender"]}</a> <a class='pl-3'>${emailSingle["subject"]}</a>  <a class='text-timestamp'>${emailSingle["timestamp"]}</a>`;
        if (!emailSingle["read"]) {
          element.style.backgroundColor = "white";
        } else {
          element.style.backgroundColor = "#ECECEC";
        }
        element.addEventListener("click", function () {
          fetch(`/emails/${emailSingle["id"]}`)
            .then((response) => response.json())
            .then((email) => {
              // Print email
              console.log(email);
              document.querySelector("#emails-view").style.display = "none";
              document.querySelector("#emailSingle-view").style.display =
                "block";

              const emailBlock = document.createElement("div");
              emailBlock.innerHTML = `<div class="container">
              
              <label class="font-weight-bold">From: </label><label class="pl-2"> ${email["sender"]}</label>
              <br/>
              <label class="font-weight-bold">To: </label><label class="pl-2"> ${email["recipients"]}</label>
              <br/>
              <label class="font-weight-bold">Subject: </label><label class="pl-2"> ${email["subject"]}</label>
              <br/>
              <label class="font-weight-bold">Timestamp: </label><label class="pl-2"> ${email["timestamp"]}</label>
              <br/>
              <button class="btn btn-sm btn-outline-primary" onclick="reply(${email['id']})" >Reply</button>
              <button class="btn btn-sm btn-outline-primary mt-2" id="archiveButton" style="display:none" onclick="archive(${email['id']})" >Archive</button>
              <button class="btn btn-sm btn-outline-primary mt-2" id="unarchiveButton" style="display:none" onclick="unArchive(${email['id']})" >Unarchive</button>
              <hr>
              <p>${email["body"]}</p>
              
              </div>`;
              
              document.querySelector("#emailSingle-view").append(emailBlock);
              if(mailbox === 'inbox'){
                document.querySelector("#archiveButton").style.display = "block"
              }
              else if(mailbox === 'archive'){
                document.querySelector("#unarchiveButton").style.display = "block"
              }

              fetch(`/emails/${emailSingle["id"]}`, {
                method: "PUT",
                body: JSON.stringify({
                  read: true,
                }),
              });
              
            });
            
        });
        document.querySelector("#emails-view").append(element);
      });
    });
    
}

function sendEmail(event) {
  event.preventDefault();
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      // Print result
      console.log(result);
      load_mailbox("sent");
    });
}
