document.addEventListener('DOMContentLoaded', function () {

     // Toggle settings visibility
     document.getElementById('toggleSettings').addEventListener('click', function () {
        const settingsFields = document.getElementById('settingsFields');
        if (settingsFields.style.display === 'none') {
            settingsFields.style.display = 'block';
            this.innerHTML = 'Settings &#9650;'; // Change the arrow to point up
        } else {
            settingsFields.style.display = 'none';
            this.innerHTML = 'Settings &#9660;'; // Change the arrow to point down
        }
    });

    // Update temperature slider
    const temperatureSlider = document.getElementById('temperature');
    const tempValueDisplay = document.getElementById('tempValue');
    temperatureSlider.addEventListener('input', function () {
        tempValueDisplay.textContent = temperatureSlider.value;
    });

    // Update cache temperature slider
    const cacheTempSlider = document.getElementById('cache_temperature_threshold');
    const cacheTempValueDisplay = document.getElementById('cacheTempValue');
    cacheTempSlider.addEventListener('input', function () {
        cacheTempValueDisplay.textContent = cacheTempSlider.value;
    });

    // Load model data from a static file (models.json)
    fetch(chrome.runtime.getURL('data/config.json'))
        .then(response => response.json())
        .then(data => {
            const modelSelect = document.getElementById('model');
            modelSelect.innerHTML = ''; // Clear loading option
            data.models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.deployment_id;
                option.textContent = model.model_name;
                modelSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading models:', error);
        });

    // Function to get the source code of the active tab
    function getSourceCodeOfActiveTab(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript(
                {
                    target: { tabId: tabs[0].id },
                    func: extractCleanTextFromPage // Gets full page source
                },
                (results) => {
                    if (results && results[0] && results[0].result) {
                        callback(results[0].result);
                    } else {
                        callback('');
                    }
                }
            );
        });
    }

    // Handle form submission and REST call
    document.getElementById('submitButton').addEventListener('click', function () {
        // Collect form data
        const temperature = document.getElementById('temperature').value;
        const summaryType = document.getElementById('summary_type').value;
        const summaryFormat = document.getElementById('summary_format').value;
        const model = document.getElementById('model').value;
        const cacheTempThreshold = document.getElementById('cache_temperature_threshold').value;
        const processImage = document.getElementById('process_image').checked;
        const overrideCache = document.getElementById('override_cache').checked;
        const bearerToken = document.getElementById('bearer_token').value;
        payload = {}
        getSourceCodeOfActiveTab(function (sourceCode) {
            // Prepare the data payload
            content = {
                "content": JSON.stringify(sourceCode)
            }
            payload = {
                document: content,
                temperature: parseInt(temperature, 10),
                summary_type: summaryType,
                summary_format: summaryFormat,
                model: model,
                cache_temperature_threshold: parseInt(cacheTempThreshold, 10),
                process_image: processImage,
                override_cache: overrideCache
            };
            // Make the REST call (using fetch API)
            console.log('Payload to send:', payload);
            // Send a message to the background script to perform the REST call
            chrome.runtime.sendMessage({
                action: 'makeRestCall',
                token: bearerToken,
                body: payload,
            });
            window.close();
                console.log('Message sent to background script');
        })
    });

    // Function to clean and extract the text (injected into the tab)
    function extractCleanTextFromPage() {
        const clonedBody = document.body.cloneNode(true);

        // Remove unnecessary tags like <script>, <style>, etc.
        const irrelevantTags = clonedBody.querySelectorAll(
            'script, style, noscript, iframe, canvas, svg, link, meta, head');
        irrelevantTags.forEach(tag => tag.remove());

        // Extract the text content
        let cleanText = clonedBody.innerText.trim();

        // Remove extra newlines (replace multiple newlines with a single space)
        cleanText = cleanText.replace(/\n+/g, ' ');
        // Remove extra newlines (replace multiple newlines with a single space)
        cleanText = cleanText.replace(/\t+/g, ' ');
        return cleanText;
    }
});
