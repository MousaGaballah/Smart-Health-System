// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDy29ivSun9rqvqTlYhgBI8PBGJhnLJSc0",
    authDomain: "smart-health-monitoring-f97fb.firebaseapp.com",
    databaseURL: "https://smart-health-monitoring-f97fb-default-rtdb.firebaseio.com",
    projectId: "smart-health-monitoring-f97fb",
    storageBucket: "smart-health-monitoring-f97fb.firebasestorage.app",
    messagingSenderId: "756575586382",
    appId: "1:756575586382:web:020a0bfb90f2117126db1f",
    measurementId: "G-7BP1801HHC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// (Optional) Function to save MQTT data into Firebase
function saveSensorData(topic, value) {
    if (!db) return;
    const path = `/SensorReadings/${Date.now()}`;
    db.ref(path).set({
        topic: topic,
        value: value,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}

// Export objects for use in other files
window.db = db;
window.auth = auth;
window.saveSensorData = saveSensorData;