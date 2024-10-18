// Function to read config.json and return the API URL
function getApiUrlFromConfig() {
  return fetch(chrome.runtime.getURL('../data/config.json'))
      .then(response => response.json())
      .then(data => data.apiUrl)
      .catch(error => {
          console.error('Error loading config.json:', error);
          return null;
      });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  if (request.action === 'makeRestCall') {
    // Perform the REST call in the background
    const bearerToken = request.token;

    // Assuming you're sending text content from popup.js
    const payload = request.body;
    console.log("payload passed: ", payload)

    getApiUrlFromConfig().then(apiUrl => {
      if (!apiUrl) {
          console.error('No API URL found. Please check config.json.');
          return;
      }
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`
        },
        body: JSON.stringify(payload),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Data received from server:', data); // Log the data
  
          // Store the response in local storage
          chrome.storage.local.set({ lastResponse: data }, function () {
            // Open the response.html page
            chrome.tabs.create({ url: chrome.runtime.getURL('../html/response.html') });
          });
        })
        .catch((error) => {
          const errorData = { error: error.message || 'An unknown error occurred.' };
          console.log('Error: ', errorData)
          // Store the error message in localStorage to access in response.html
          chrome.storage.local.set({ responseData: errorData }, function () {
            // Open response.html with the error details
            chrome.windows.create({
              url: 'response.html',
              type: 'popup',
              width: 400,
              height: 400
            });
          });
  
        });
    });
  }
});

// Handle button click in the notification
chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
  if (notificationId === 'restCallSuccess' && buttonIndex === 0) {
    // Retrieve the stored response
    chrome.storage.local.get('lastResponse', function (result) {
      const responseText = JSON.stringify(result.lastResponse, null, 2);

      // Copy the response text to clipboard
      navigator.clipboard.writeText(responseText).then(() => {
        console.log('Response copied to clipboard');
      }, () => {
        console.error('Failed to copy response to clipboard');
      });
    });
  }
});
