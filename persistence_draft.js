// --- Data Persistence Layer ---
const DEFAULT_SCHEDULE = [
    // ... insert existing schedule data here ...
    // (I will retain the existing hardcoded data as the DEFAULT)
];

const DEFAULT_SCORES = [
    // ... insert existing scores data here ...
];

let appData = {
    schedule: [],
    scores: []
};

function loadData() {
    const stored = localStorage.getItem('pec_data');
    if (stored) {
        appData = JSON.parse(stored);
    } else {
        // Initialize with Defaults
        appData.schedule = scheduleData; // Retain existing variable name structure for now
        appData.scores = scores;         // Retain existing variable name structure
        saveData();
    }
}

function saveData() {
    localStorage.setItem('pec_data', JSON.stringify(appData));
}

function resetData() {
    localStorage.removeItem('pec_data');
    location.reload();
}
