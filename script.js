const importFile = document.getElementById('importFile');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const clearButton = document.getElementById('clearButton');
const resultText = document.getElementById('resultText');
const scannedBarcodeText = document.getElementById('scannedBarcodeText');

let database = {};

importFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            database = {};  // Reset database

            json.slice(1).forEach(row => {
                const [barcode, stock, price] = row;
                if (database[barcode]) {
                    if (database[barcode].price === price) {
                        database[barcode].stock += stock;
                    } else {
                        database[barcode].error = true;
                    }
                } else {
                    database[barcode] = { price, stock, error: false };
                }
            });
            resultText.textContent = "Excel data imported successfully.";
        };
        reader.readAsArrayBuffer(file);
    }
});

searchButton.addEventListener('click', () => {
    searchBarcode();
});

clearButton.addEventListener('click', () => {
    searchInput.value = '';
    scannedBarcodeText.textContent = '';
    resultText.textContent = 'Results will be displayed here';
});

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        searchBarcode();
        event.preventDefault(); // Prevent the form from submitting
    }
});

function searchBarcode() {
    const barcode = searchInput.value.trim();
    if (barcode) {
        scannedBarcodeText.textContent = `Scanned Barcode: ${barcode}`;
        const item = database[barcode];
        if (item) {
            if (item.error) {
                resultText.textContent = "Error: Multiple prices found for the same barcode.";
            } else {
                resultText.textContent = `Price: ${item.price}, Stock: ${item.stock}`;
            }
        } else {
            resultText.textContent = "Item not found in database.";
        }
    } else {
        resultText.textContent = "Please enter a barcode.";
    }
    searchInput.value = ''; // Clear the search input after searching
}
