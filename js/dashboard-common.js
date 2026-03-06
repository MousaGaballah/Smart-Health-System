// ====================================================
// COMMON DASHBOARD FUNCTIONS
// ====================================================

// Update UI with new data (used by all dashboards)
function updateCommonVitals(data) {
    if (data.heart_rate !== undefined) {
        const el = document.getElementById('heartValue') || document.getElementById('heart');
        if (el) {
            el.innerHTML = data.heart_rate + ' <span>bpm</span>';
            updateRealtimeCharts(data.heart_rate, null, null);
        }
    }
    if (data.spo2 !== undefined) {
        const el = document.getElementById('spo2Value') || document.getElementById('spo2');
        if (el) {
            el.innerHTML = data.spo2 + ' <span>%</span>';
            updateRealtimeCharts(null, data.spo2, null);
        }
    }
    if (data.body_temp !== undefined) {
        const el = document.getElementById('tempValue') || document.getElementById('bodytemp');
        if (el) {
            el.innerHTML = data.body_temp + ' <span>°C</span>';
            updateRealtimeCharts(null, null, data.body_temp);
        }
    }
}

// Subscribe to MQTT topics (called by each page)
function subscribeToCommonTopics() {
    window.mqttClient?.subscribe('health/patient/heartrate', (v) => updateCommonVitals({ heart_rate: v }));
    window.mqttClient?.subscribe('health/patient/spo2', (v) => updateCommonVitals({ spo2: v }));
    window.mqttClient?.subscribe('health/patient/bodytemp', (v) => updateCommonVitals({ body_temp: v }));
}

// Initialize charts on common pages
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initRealtimeCharts === 'function') initRealtimeCharts();
    subscribeToCommonTopics();
});