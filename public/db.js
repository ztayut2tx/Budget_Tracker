let db;

const request = indexedDB.open("NewBudget", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true});
};

request.onsuccess = function (event) {
    db = event.target.result;
    if(navigator.onLine) {
        checkDB();
    }
};

request.onError = function (event) {
    console.log("Error!" + event.target.errorCode);
};