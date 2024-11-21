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
                            let pageText = '';

                            textContent.items.forEach(function(item) {
                                pageText += item.str + ' ';
                                if (item.hasEOL) {
                                    pageText += '<br>';
                                }
                            });

                            pdfText += `<p>${pageText}</p>`;
                        });
                    })
                );
            }

            Promise.all(pagesPromises).then(function() {
                document.getElementById('pdfText').innerHTML = pdfText;
            });
        });
    };

    fileReader.readAsArrayBuffer(file);
});
