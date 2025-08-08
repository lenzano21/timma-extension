// Listen for the extension's toolbar icon to be clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    // Send a message to the active tab's content script to open the modal
    chrome.tabs.sendMessage(tab.id, { action: "openModal" }, (response) => {
      if (chrome.runtime.lastError) {
        // This error is expected on pages where the content script can't run.
        // We can ignore it or log a less noisy message.
        console.log("Timma extension icon clicked on a page where content scripts are not active.");
      }
    });
  }
});

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