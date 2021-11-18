//indexedb
//check if the app is online
//delete records when done
//addeventlistener for app coming back online

let db;
let budgetVersion;

const request = indexedDB.open('BudgetDB', budgetVersion || 21);

request.onupgradeneeded = function (evt) {
    const { oldVersion } = evt;
    const newVersion = evt.newVersion || db.version;

    db = evt.target.result;

    if (db.objectStoreNames.length === 0) {
        db.createObjectStore('BudgetStore', { autoIncrement: true });
    }
};

request.onerror = function (evt) {
    console.log(`Request error: ${evt.target.errorCode}`);
};

function checkDatabase() {
    let transaction = db.transaction(['BudgetStore'], 'readwrite');
    const store = transaction.objectStore('BudgetStore');
    const allFetch = store.getAll();

    allFetch.onsuccess = async function () {
        if (allFetch.result.length > 0) {
           const response =  fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(allFetch.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
           });
                    if (response.length !== 0) {
                        transaction = db.transaction(['BudgetStore'], 'readwrite');
                        const currentStore = transaction.objectStore('BudgetStore');
                        currentStore.clear();
                    }

        }
    };
}

request.onsuccess = function (evt) {
    db = evt.target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};

const saveRecord = (record) => {
    const transaction = db.transaction(['BudgetStore'], 'readwrite');
    const store = transaction.objectStore('BudgetStore');
    store.add(record);
};

window.addEventListener('online', checkDatabase);
