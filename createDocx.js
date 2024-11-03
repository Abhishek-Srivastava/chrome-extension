import { Document, Packer, Paragraph, TextRun, Media } from './docx.min.js';

// Set up the DOCX generator function
chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: fetchContentAndImages
        },
        async (injectionResults) => {
            if (injectionResults && injectionResults[0]?.result) {
                const { sourceCode, images } = injectionResults[0].result;

                // Download each image, retrieve ArrayBuffers, and generate the DOCX
                const docxBytes = await createDocxWithDownloadedImages(sourceCode, images);

                // Trigger download of the DOCX file
                const blob = new Blob([docxBytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                const url = URL.createObjectURL(blob);

                chrome.downloads.download({
                    url: url,
                    filename: 'page_content_with_images.docx'
                }, () => {
                    URL.revokeObjectURL(url); // Clean up
                });
            }
        }
    );
});

// Fetch HTML source and image URLs from the active page
function fetchContentAndImages() {
    const sourceCode = document.documentElement.innerText; // Clean HTML to text
    const images = Array.from(document.images).map(img => img.src); // Collect image URLs
    return { sourceCode, images };
}

// Create a DOCX document with the downloaded images
async function createDocxWithDownloadedImages(sourceCode, imageUrls) {
    const doc = new Document();

    // Add the source code as plain text
    doc.addSection({
        children: [new Paragraph({
            children: [new TextRun(sourceCode)]
        })]
    });

    // Download each image, convert to ArrayBuffer, and add to DOCX
    for (const imageUrl of imageUrls) {
        try {
            const imageBlobUrl = await downloadImage(imageUrl);
            const imgBytes = await fetch(imageBlobUrl).then(res => res.arrayBuffer());
            const docImage = Media.addImage(doc, imgBytes, 300, 150); // Adjust dimensions as needed

            // Embed the image in a new section in the DOCX
            doc.addSection({
                children: [new Paragraph(docImage)]
            });
        } catch (error) {
            console.error(`Failed to download or embed image from ${imageUrl}:`, error);
        }
    }

    // Return the finalized DOCX as a Buffer
    return await Packer.toBuffer(doc);
}

// Download an image using Chrome Downloads API and return a blob URL
async function downloadImage(url) {
    return new Promise((resolve, reject) => {
        chrome.downloads.download({ url, conflictAction: 'uniquify' }, async (downloadId) => {
            if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);

            // Wait until the download completes and retrieve the local path
            chrome.downloads.onChanged.addListener(function onChanged(delta) {
                if (delta.id === downloadId && delta.state?.current === "complete") {
                    chrome.downloads.search({ id: downloadId }, (results) => {
                        if (results && results[0]) {
                            resolve(results[0].url);
                            chrome.downloads.onChanged.removeListener(onChanged); // Clean up listener
                        } else {
                            reject(new Error("Failed to retrieve downloaded file"));
                        }
                    });
                }
            });
        });
    });
}
