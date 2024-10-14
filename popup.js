document.addEventListener('DOMContentLoaded', function () {
    // Add an event listener to the button
    document.getElementById('dumpButton').addEventListener('click', function () {
        // Get the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            // Check if the tab is valid
            if (tabs.length > 0) {
                // Execute a script to extract the page source
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    // Inject a function that logs the source code to the webpage's console
                    function: () => {
                        const jsonResponse = { content: document.documentElement.outerHTML };
                        console.log("Webpage source code as JSON:", JSON.stringify(jsonResponse, null, 2));
                    }
                });
            } else {
                console.error("No active tab found.");
            }
        });
    });
});
