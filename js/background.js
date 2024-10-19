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
          sendResponse({ success: true, data: data });
        })
        .catch((error) => {
          const errorData = { error: error.message || 'An unknown error occurred.' };
          console.log('Error: ', errorData)
          sendResponse({ success: false, data: errorData });
        });
      return true;
    }).catch(error => {
      sendResponse({ success: false, data: error.message });
    });
    return true;
  }
});