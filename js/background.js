chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'makeRestCall') {
      // Perform the REST call in the background
      const bearerToken = request.token;
  
      // Assuming you're sending text content from popup.js
      const payload = request.body;
      console.log("payload passed: ", payload)
  
      fetch('http://localhost:5000/api/submit', {
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
        chrome.storage.local.set({ lastResponse: data }, function() {
          // Open the response.html page
          chrome.tabs.create({ url: chrome.runtime.getURL('../html/response.html') });
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  
      sendResponse({ status: 'Request sent to server' });
    }
  });
  
  // Handle button click in the notification
  chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
    if (notificationId === 'restCallSuccess' && buttonIndex === 0) {
      // Retrieve the stored response
      chrome.storage.local.get('lastResponse', function(result) {
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
  