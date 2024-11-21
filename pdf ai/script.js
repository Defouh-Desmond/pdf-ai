let pdfText = '';

document.getElementById('pdfInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
            const pagesPromises = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                pagesPromises.push(
                    pdf.getPage(i).then(function(page) {
                        return page.getTextContent().then(function(textContent) {
                            let pageText = textContent.items.map(item => item.str).join(' ');
                            pdfText += ` ${pageText}`;
                        });
                    })
                );
            }

            Promise.all(pagesPromises).then(function() {
                document.getElementById('pdfText').innerHTML = "PDF text loaded. You can now ask questions.";
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
    let utterance = new SpeechSynthesisUtterance(pdfText);
    speechSynthesis.speak(utterance);
});

document.getElementById('askQuestionButton').addEventListener('click', function() {
    const question = document.getElementById('questionInput').value;
    const answer = findAnswer(question, pdfText);
    document.getElementById('answerText').innerText = answer;

    let utterance = new SpeechSynthesisUtterance(answer);
    speechSynthesis.speak(utterance);
});

function findAnswer(question, text) {
    // Simple keyword matching for demo purposes
    const lowerText = text.toLowerCase();
    const lowerQuestion = question.toLowerCase();
    const sentences = lowerText.split('. ');
    const matchingSentences = sentences.filter(sentence => sentence.includes(lowerQuestion));

    if (matchingSentences.length > 0) {
        return matchingSentences.join('. ');
    } else {
        return 'Sorry, I could not find an answer to your question.';
    }
}
