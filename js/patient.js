// ====================================================
// PATIENT DASHBOARD - SIMPLE & CLEAN
// ====================================================

let healthHistory = {
    heart: [],
    spo2: [],
    temp: []
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Patient dashboard initializing...');
    
    // Load patient name
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            firebase.database().ref('users/' + user.uid).once('value').then((snap) => {
                const name = snap.val()?.name || 'Patient';
                document.getElementById('userName').innerText = name;
            });
        } else {
            document.getElementById('userName').innerText = 'Guest';
        }
    });
    
    // Subscribe to MQTT for real-time updates
    subscribeToPatientUpdates();
    
    // Calculate health score every minute
    setInterval(updateHealthScore, 60000);
    updateHealthScore(); // initial
    
    // Export button
    document.getElementById('exportDataBtn')?.addEventListener('click', exportMyData);
});

function subscribeToPatientUpdates() {
    if (!window.mqttClient) {
        // Simulate updates
        setInterval(() => {
            const heart = Math.floor(Math.random() * (80-60+1)) + 60;
            const spo2 = Math.floor(Math.random() * (99-95+1)) + 95;
            const temp = (Math.random() * (37.2-36.4) + 36.4).toFixed(1);
            
            updateVitals({ heart_rate: heart, spo2: spo2, body_temp: temp });
        }, 4000);
        return;
    }
    
    window.mqttClient.subscribe('health/patient/heartrate', (v) => updateVitals({ heart_rate: v }));
    window.mqttClient.subscribe('health/patient/spo2', (v) => updateVitals({ spo2: v }));
    window.mqttClient.subscribe('health/patient/bodytemp', (v) => updateVitals({ body_temp: v }));
}

function updateVitals(data) {
    if (data.heart_rate !== undefined) {
        document.getElementById('heart') && (document.getElementById('heart').innerText = data.heart_rate);
        addToHistory('heart', data.heart_rate);
    }
    if (data.spo2 !== undefined) {
        document.getElementById('spo2') && (document.getElementById('spo2').innerText = data.spo2);
        addToHistory('spo2', data.spo2);
    }
    if (data.body_temp !== undefined) {
        document.getElementById('bodytemp') && (document.getElementById('bodytemp').innerText = data.body_temp);
        addToHistory('temp', parseFloat(data.body_temp));
    }
    
    updateRealtimeCharts(data.heart_rate, data.spo2, data.body_temp);
    updateHealthScore();
}

function addToHistory(param, value) {
    if (!healthHistory[param]) healthHistory[param] = [];
    healthHistory[param].push({ value, time: Date.now() });
    if (healthHistory[param].length > 60) healthHistory[param].shift();
}

function updateHealthScore() {
    // Simple health score based on recent averages
    const avgHeart = healthHistory.heart.length ? healthHistory.heart.slice(-5).reduce((a,b) => a + b.value, 0) / 5 : 70;
    const avgSpo2 = healthHistory.spo2.length ? healthHistory.spo2.slice(-5).reduce((a,b) => a + b.value, 0) / 5 : 98;
    const avgTemp = healthHistory.temp.length ? healthHistory.temp.slice(-5).reduce((a,b) => a + b.value, 0) / 5 : 36.6;
    
    let score = 100;
    if (avgHeart > 100 || avgHeart < 50) score -= 30;
    else if (avgHeart > 90 || avgHeart < 60) score -= 15;
    
    if (avgSpo2 < 90) score -= 30;
    else if (avgSpo2 < 95) score -= 15;
    
    if (avgTemp > 38.5 || avgTemp < 35) score -= 30;
    else if (avgTemp > 37.5 || avgTemp < 36) score -= 15;
    
    score = Math.max(0, Math.min(100, Math.round(score)));
    
    const scoreEl = document.getElementById('healthScore');
    if (scoreEl) {
        scoreEl.innerText = score;
        // Update color
        const circle = document.getElementById('healthScoreCircle');
        if (circle) {
            let color = '#10b981';
            if (score < 60) color = '#ef4444';
            else if (score < 80) color = '#f59e0b';
            circle.style.background = `conic-gradient(${color} ${score*3.6}deg, #e2e8f0 0deg)`;
        }
    }
}

function exportMyData() {
    const csv = 'Timestamp,Heart Rate,SpO2,Temperature\n';
    const maxRows = Math.min(healthHistory.heart.length, healthHistory.spo2.length, healthHistory.temp.length);
    let content = csv;
    for (let i = 0; i < maxRows; i++) {
        const time = new Date(healthHistory.heart[i]?.time).toLocaleString();
        content += `${time},${healthHistory.heart[i]?.value},${healthHistory.spo2[i]?.value},${healthHistory.temp[i]?.value}\n`;
    }
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_health_data.csv';
    a.click();
}