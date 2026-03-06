// ====================================================
// DOCTOR DASHBOARD - PROFESSIONAL VERSION
// Handles patient selection, real-time updates, trends, predictions
// ====================================================

let currentPatientId = 'p1';
let patientsList = [];
let mqttListeners = [];
let healthHistory = {
    heart: [],
    spo2: [],
    temp: []
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Doctor dashboard initializing...');
    
    // Load patients (from Firebase or mock)
    loadPatientsList();
    
    // Setup patient selector
    const patientSelect = document.getElementById('patientSelect');
    if (patientSelect) {
        patientSelect.addEventListener('change', (e) => {
            currentPatientId = e.target.value;
            loadPatientData(currentPatientId);
            updatePatientSpecificCharts(currentPatientId);
        });
    }
    
    // Subscribe to MQTT
    subscribeToPatientData();
    
    // Load recent alerts
    loadRecentAlerts();
    
    // Enable drag & drop for cards (widgets)
    enableDragAndDrop();
    
    // Export buttons
    document.getElementById('exportDataBtn')?.addEventListener('click', exportPatientData);
});

// ---------- Load Patients List ----------
function loadPatientsList() {
    if (firebase.apps.length) {
        firebase.database().ref('users').orderByChild('role').equalTo('patient').once('value')
            .then((snapshot) => {
                const patients = [];
                snapshot.forEach((child) => {
                    patients.push({
                        id: child.key,
                        name: child.val().name || 'Unknown',
                        email: child.val().email
                    });
                });
                if (patients.length > 0) {
                    patientsList = patients;
                    populatePatientSelect(patients);
                    currentPatientId = patients[0].id;
                    document.getElementById('patientSelect').value = currentPatientId;
                    loadPatientData(currentPatientId);
                } else {
                    useMockPatients();
                }
            })
            .catch((error) => {
                console.warn('Firebase error, using mock patients:', error);
                useMockPatients();
            });
    } else {
        useMockPatients();
    }
}

function useMockPatients() {
    patientsList = [
        { id: 'p1', name: 'John Doe' },
        { id: 'p2', name: 'Jane Smith' },
        { id: 'p3', name: 'Robert Johnson' }
    ];
    populatePatientSelect(patientsList);
    currentPatientId = patientsList[0].id;
    document.getElementById('patientSelect').value = currentPatientId;
    loadPatientData(currentPatientId);
}

function populatePatientSelect(patients) {
    const select = document.getElementById('patientSelect');
    if (!select) return;
    select.innerHTML = '';
    patients.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.name;
        select.appendChild(option);
    });
}

// ---------- Load Patient Data ----------
function loadPatientData(patientId) {
    console.log('Loading data for patient:', patientId);
    showLoadingState(true);
    
    setTimeout(() => {
        // Mock data for different patients
        if (patientId === 'p1') {
            updateVitalsFromPatient({
                heart_rate: 72,
                spo2: 98,
                body_temp: 36.6,
                room_temp: 23,
                humidity: 50,
                position: 'sitting'
            });
        } else if (patientId === 'p2') {
            updateVitalsFromPatient({
                heart_rate: 85,
                spo2: 96,
                body_temp: 37.1,
                room_temp: 24,
                humidity: 55,
                position: 'lying'
            });
        } else {
            updateVitalsFromPatient({
                heart_rate: 65,
                spo2: 99,
                body_temp: 36.4,
                room_temp: 22,
                humidity: 48,
                position: 'walking'
            });
        }
        showLoadingState(false);
    }, 500);
}

function showLoadingState(loading) {
    const container = document.getElementById('doctorVitals');
    if (container) {
        container.style.opacity = loading ? '0.5' : '1';
    }
}

// Update UI from data object
function updateVitalsFromPatient(data) {
    if (data.heart_rate !== undefined) {
        document.getElementById('heartValue') && (document.getElementById('heartValue').innerHTML = data.heart_rate + ' <span>bpm</span>');
        updateHeartIndicator(data.heart_rate);
        addToHistory('heart', data.heart_rate);
    }
    if (data.spo2 !== undefined) {
        document.getElementById('spo2Value') && (document.getElementById('spo2Value').innerHTML = data.spo2 + ' <span>%</span>');
        updateSpo2Indicator(data.spo2);
        addToHistory('spo2', data.spo2);
    }
    if (data.body_temp !== undefined) {
        document.getElementById('tempValue') && (document.getElementById('tempValue').innerHTML = data.body_temp + ' <span>°C</span>');
        updateTempIndicator(data.body_temp);
        addToHistory('temp', data.body_temp);
    }
    if (data.room_temp !== undefined) {
        document.getElementById('roomTempValue') && (document.getElementById('roomTempValue').innerHTML = data.room_temp + ' <span>°C</span>');
    }
    if (data.humidity !== undefined) {
        document.getElementById('humidityValue') && (document.getElementById('humidityValue').innerHTML = data.humidity + ' <span>%</span>');
    }
    if (data.position !== undefined) {
        document.getElementById('positionValue') && (document.getElementById('positionValue').innerText = data.position);
        updatePositionIndicator(data.position);
    }
    
    // Update trend predictions
    updatePredictions();
}

// History management
function addToHistory(param, value) {
    if (!healthHistory[param]) healthHistory[param] = [];
    healthHistory[param].push({ value, time: Date.now() });
    if (healthHistory[param].length > 60) healthHistory[param].shift(); // keep last 60 readings
    
    // Update mini trend chart if exists
    updateMiniTrend(param);
}

function updateMiniTrend(param) {
    // This could draw a small sparkline using canvas; for brevity, we rely on ApexCharts for history charts.
}

// Prediction (simple moving average)
function predictNext(param) {
    const history = healthHistory[param];
    if (!history || history.length < 5) return null;
    const recent = history.slice(-5).map(p => p.value);
    const avg = recent.reduce((a,b) => a + b, 0) / recent.length;
    const trend = recent[recent.length-1] - recent[0];
    return avg + (trend / 5); // crude prediction
}

function updatePredictions() {
    const heartPred = predictNext('heart');
    const spo2Pred = predictNext('spo2');
    const tempPred = predictNext('temp');
    
    // Display predictions somewhere, e.g., in a small tooltip or extra element
    const predEl = document.getElementById('predictions');
    if (predEl) {
        predEl.innerHTML = `
            <div>Heart next: ${heartPred ? heartPred.toFixed(0) : '--'} bpm</div>
            <div>SpO2 next: ${spo2Pred ? spo2Pred.toFixed(0) : '--'} %</div>
            <div>Temp next: ${tempPred ? tempPred.toFixed(1) : '--'} °C</div>
        `;
    }
}

// Indicators
function updateHeartIndicator(value) {
    const el = document.getElementById('heartIndicator');
    if (!el) return;
    if (value > 100 || value < 50) {
        el.className = 'card-indicator indicator-danger';
        el.innerText = 'Critical';
    } else if (value > 90 || value < 60) {
        el.className = 'card-indicator indicator-warning';
        el.innerText = 'Warning';
    } else {
        el.className = 'card-indicator indicator-normal';
        el.innerText = 'Normal';
    }
}

function updateSpo2Indicator(value) {
    const el = document.getElementById('spo2Indicator');
    if (!el) return;
    if (value < 90) {
        el.className = 'card-indicator indicator-danger';
        el.innerText = 'Critical';
    } else if (value < 95) {
        el.className = 'card-indicator indicator-warning';
        el.innerText = 'Warning';
    } else {
        el.className = 'card-indicator indicator-normal';
        el.innerText = 'Normal';
    }
}

function updateTempIndicator(value) {
    const el = document.getElementById('tempIndicator');
    if (!el) return;
    if (value > 38.5 || value < 35.0) {
        el.className = 'card-indicator indicator-danger';
        el.innerText = 'Critical';
    } else if (value > 37.5 || value < 36.0) {
        el.className = 'card-indicator indicator-warning';
        el.innerText = 'Warning';
    } else {
        el.className = 'card-indicator indicator-normal';
        el.innerText = 'Normal';
    }
}

function updatePositionIndicator(pos) {
    const el = document.getElementById('positionIndicator');
    if (!el) return;
    if (pos === 'fall') {
        el.className = 'card-indicator indicator-danger';
        el.innerText = 'FALL!';
    } else {
        el.className = 'card-indicator indicator-normal';
        el.innerText = 'Normal';
    }
}

// ---------- MQTT Subscription ----------
function subscribeToPatientData() {
    if (!window.mqttClient) {
        // Simulate MQTT updates every 3 seconds
        setInterval(() => {
            if (currentPatientId) {
                const currentHeart = parseInt(document.getElementById('heartValue')?.innerText) || 70;
                const newHeart = currentHeart + Math.floor(Math.random() * 5) - 2;
                const newSpo2 = Math.min(100, Math.max(90, (parseInt(document.getElementById('spo2Value')?.innerText) || 97) + Math.floor(Math.random() * 3) - 1));
                const newTemp = (parseFloat(document.getElementById('tempValue')?.innerText) || 36.6) + (Math.random() * 0.4 - 0.2);
                
                updateVitalsFromPatient({
                    heart_rate: newHeart,
                    spo2: newSpo2,
                    body_temp: Math.round(newTemp * 10) / 10,
                    position: Math.random() < 0.1 ? ['sitting','standing','lying','walking','fall'][Math.floor(Math.random()*5)] : undefined
                });
            }
        }, 3000);
        return;
    }
    
    // Unsubscribe previous
    mqttListeners.forEach(unsub => unsub());
    mqttListeners = [];
    
    const topics = ['health/patient/heartrate','health/patient/spo2','health/patient/bodytemp','health/room/temp','health/room/humidity','health/patient/position'];
    topics.forEach(topic => {
        const unsub = window.mqttClient.subscribe(topic, (value) => {
            if (currentPatientId === 'p1') { // demo: only update for default patient
                const update = {};
                switch(topic) {
                    case 'health/patient/heartrate': update.heart_rate = value; break;
                    case 'health/patient/spo2': update.spo2 = value; break;
                    case 'health/patient/bodytemp': update.body_temp = value; break;
                    case 'health/room/temp': update.room_temp = value; break;
                    case 'health/room/humidity': update.humidity = value; break;
                    case 'health/patient/position': update.position = value; break;
                }
                updateVitalsFromPatient(update);
            }
        });
        mqttListeners.push(unsub);
    });
}

// ---------- Alerts ----------
function loadRecentAlerts() {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    // Mock alerts
    const mockAlerts = [
        { message: 'Heart rate elevated (102 bpm)', time: new Date(Date.now() - 2*60000), level: 'danger' },
        { message: 'SpO2 dropped to 91%', time: new Date(Date.now() - 15*60000), level: 'warning' },
        { message: 'Fall detected!', time: new Date(Date.now() - 35*60000), level: 'danger' }
    ];
    
    mockAlerts.forEach(alert => addAlertToList(alert));
    
    // Subscribe to new alerts from MQTT
    window.mqttClient?.subscribe('alert', (alert) => {
        addAlertToList(alert);
        if (alert.level === 'danger') playAlertSound();
    });
}

function addAlertToList(alert) {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    const div = document.createElement('div');
    div.className = `alert-item ${alert.level === 'danger' ? '' : (alert.level === 'warning' ? 'warning' : 'low')}`;
    div.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <div class="alert-content">
            <div class="alert-title">${alert.message}</div>
            <div class="alert-time">${new Date(alert.time || Date.now()).toLocaleTimeString()}</div>
        </div>
        <button class="alert-dismiss" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    alertsList.prepend(div);
    if (alertsList.children.length > 10) alertsList.removeChild(alertsList.lastChild);
}

function playAlertSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
}

// ---------- Export Data ----------
function exportPatientData() {
    const data = {
        patient: patientsList.find(p => p.id === currentPatientId)?.name || 'Unknown',
        heart_rate: document.getElementById('heartValue')?.innerText,
        spo2: document.getElementById('spo2Value')?.innerText,
        temperature: document.getElementById('tempValue')?.innerText,
        history: healthHistory
    };
    
    const csv = 'Parameter,Value\n' +
        `Heart Rate,${data.heart_rate}\n` +
        `SpO2,${data.spo2}\n` +
        `Temperature,${data.temperature}\n`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient_${currentPatientId}_data.csv`;
    a.click();
}

// ---------- Drag & Drop Widgets ----------
function enableDragAndDrop() {
    const cards = document.querySelectorAll('.card');
    const container = document.querySelector('.cards-grid');
    
    cards.forEach(card => {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id);
            card.classList.add('dragging');
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
    });
    
    container.addEventListener('dragover', (e) => e.preventDefault());
    container.addEventListener('drop', (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(id);
        if (draggedElement && e.target.closest('.card')) {
            const targetCard = e.target.closest('.card');
            container.insertBefore(draggedElement, targetCard.nextSibling);
        }
    });
}

// ---------- Patient Specific Charts ----------
function updatePatientSpecificCharts(patientId) {
    // For demo, just update history charts with mock data
    if (window.updateHistoryCharts) {
        window.updateHistoryCharts(patientId);
    }
}