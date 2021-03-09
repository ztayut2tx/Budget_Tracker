let db;
//Creates our database "NewBudget"
const request = indexedDB.open("NewBudget", 1);

//Below we create our object store staging area
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true});
};

//And then our status verification
request.onsuccess = function (event) {
    db = event.target.result;
    if(navigator.onLine) {
        checkDatabase();
    }
};

request.onError = function (event) {
    console.log("Error!" + event.target.errorCode);
};

//function to save the user inputed data to the database
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
};

//function that stages user inputed data for online status and checks for any other staged records
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if(getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
               method: "POST",
               body: JSON.stringify(getAll.result),
               headers: {
                   Accept: "application/json, text/plain, */*",
                   "Content-Type": "application/json"
               } 
            })
                .then(response => response.json()).then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
} 

window.addEventListener("online", checkDatabase);