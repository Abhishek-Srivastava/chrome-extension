// response.js
document.addEventListener('DOMContentLoaded', function() {
    //Get the response data from local storage
    chrome.storage.local.get('lastResponse', function(result) {
        const responseContent = JSON.stringify(result.lastResponse, null, 2);
        document.getElementById('responseContent').textContent = responseContent;
    });

    // Add event listener to copy button
    document.getElementById('copyButton').addEventListener('click', function() {
        const content = document.getElementById('responseContent').textContent;
        navigator.clipboard.writeText(content).then(() => {
            alert('Response copied to clipboard!');
        }, () => {
            alert('Failed to copy response.');
        });
    });
});
