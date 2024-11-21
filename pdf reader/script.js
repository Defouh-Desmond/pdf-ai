document.getElementById('pdfInput').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        return;
    }

    var fileReader = new FileReader();
    fileReader.onload = function() {
        var typedarray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
            var pdfText = '';
            var pagesPromises = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                pagesPromises.push(
                    pdf.getPage(i).then(function(page) {
                        return page.getTextContent().then(function(textContent) {
                            let pageText = textContent.items.map(item => item.str).join(' ');

                            // Ensure each page starts on a new paragraph
                            pdfText += `<p>${pageText}</p>`;
                        });
                    })
                );
            }

            Promise.all(pagesPromises).then(function() {
                document.getElementById('pdfText').innerHTML = pdfText;
            }).catch(function(error) {
                console.error('Error processing pages:', error);
                alert('There was an error processing the PDF.');
            });
        }).catch(function(error) {
            console.error('Error loading PDF:', error);
            alert('There was an error loading the PDF.');
        });
    };

    fileReader.readAsArrayBuffer(file);
});

document.getElementById('readTextButton').addEventListener('click', function() {
    var text = document.getElementById('pdfText').innerText;
    var utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
});
