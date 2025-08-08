// Listen for messages from content scripts (e.g., to send data)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendData") {
    console.log("Received data from form:", request.data);

    // --- Temporarily commented out to focus on UI ---
    // fetch('http://localhost:3000/data', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(request.data),
    // })
    // .then(response => response.text())
    // .then(text => {
    //   console.log('Success:', text);
    //   sendResponse({status: 'success'});
    // })
    // .catch((error) => {
    //   console.error('Error:', error);
    //   sendResponse({status: 'error'});
    // });

    // Immediately send a success response so the modal closes.
    sendResponse({status: 'success'});

    // Return true to indicate you wish to send a response asynchronously (still good practice)
    return true;
  }
});
