// script.js file

function domReady(fn) {
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        setTimeout(fn, 1000);
    } else {
        document.getElementById('openUploadModal').addEventListener('click', fn);
    }

}

domReady(function () {

    // If found you qr code
    function onScanSuccess(decodeText, decodeResult) {
        try {

        // alert("You Qr is : " + decodeText, decodeResult);

        document.getElementById('addSecret').input = decodeText;
        console.log('done scanning', decodeResult, decodeText)
        const url = new URL(decodeText);
        console.log("url", url)

        // Extract the query string
        const queryString = url.search;

        // Create a URLSearchParams object
        const urlParams = new URLSearchParams(queryString);

        // Get specific parameter values
        console.log(urlParams)
        const secretFromQr = urlParams.get('secret');
        const issuer = urlParams.get('issuer');
        const labels = url.pathname.split('/');
        const labelFromQr = `${labels[labels.length - 1]} - ${issuer}`;
        console.log('secretFromQr', secretFromQr)
        if(secretFromQr) {
            document.getElementById('addSecret').value = secretFromQr;
            document.getElementById('addName').value = labelFromQr;
            document.getElementById('addSecret').disabled = true;
            document.getElementById("html5-qrcode-button-camera-stop").click();
            document.getElementById("closeUploadModal").click();
        }
        } catch (e) {
            console.log('error', e)
        }

    }

    let htmlscanner = new Html5QrcodeScanner(
        "my-qr-reader",
        { fps: 10, qrbos: 250 },false
    );

    htmlscanner.render(onScanSuccess);
});