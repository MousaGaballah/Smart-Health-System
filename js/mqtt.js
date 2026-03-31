// mqtt.js – Real MQTT Client with WebSocket
class MQTTClient {
    constructor() {
        this.client = null;
        this.listeners = {};
        this.connected = false;
        this.reconnectAttempts = 0;
        // Variables to store the latest readings
        this.currentHeart = null;
        this.currentSpo2 = null;
        this.currentTemp = null;
    }

    connect() {
        const brokerUrl = "ws://192.168.1.231:9001";
        const options = {
            username: "",
            password: "",
            clientId: "web_" + Math.random().toString(16).substr(2, 8),
            reconnectPeriod: 5000
        };
        
        this.client = mqtt.connect(brokerUrl, options);
        
        this.client.on('connect', () => {
            console.log('MQTT connected');
            this.connected = true;
            this.reconnectAttempts = 0;
            // Subscribe to topics after connecting
            this.subscribeToTopics();
        });
        
        this.client.on('message', (topic, message) => {
            const data = message.toString();
            console.log(`MQTT message on ${topic}: ${data}`);
            
            if (this.listeners[topic]) {
                this.listeners[topic].forEach(cb => cb(data));
            }
            if (this.listeners['#']) {
                this.listeners['#'].forEach(cb => cb(topic, data));
            }
        });
        
        this.client.on('error', (err) => {
            console.error('MQTT error:', err);
        });
        
        this.client.on('reconnect', () => {
            console.log('MQTT reconnecting...');
        });
    }
    
    subscribe(topic, callback) {
        if (!this.client) {
            console.warn('MQTT client not connected');
            return () => {};
        }
        this.client.subscribe(topic, (err) => {
            if (err) console.error(`Subscribe error to ${topic}:`, err);
            else console.log(`Subscribed to ${topic}`);
        });
        if (!this.listeners[topic]) this.listeners[topic] = [];
        this.listeners[topic].push(callback);
        
        return () => {
            this.listeners[topic] = this.listeners[topic].filter(cb => cb !== callback);
        };
    }

    subscribeToTopics() {
        // Subscribe to patient data topics
        this.subscribe('health/patient/heartrate', (data) => {
            const heart = parseInt(data);
            if (!isNaN(heart)) {
                this.currentHeart = heart;
                // Update UI
                const heartElem = document.getElementById('heartValue');
                if (heartElem) heartElem.innerHTML = heart + ' <span>bpm</span>';
                // Update chart if function is available
                if (typeof updateCharts === 'function') {
                    updateCharts(heart, this.currentSpo2, this.currentTemp);
                }
                // Save to Firebase
                if (window.db) {
                    window.db.ref('SensorReadings/heartrate').push({
                        value: heart,
                        timestamp: firebase.database.ServerValue.TIMESTAMP
                    });
                }
            }
        });

        this.subscribe('health/patient/spo2', (data) => {
            const spo2 = parseInt(data);
            if (!isNaN(spo2)) {
                this.currentSpo2 = spo2;
                const spo2Elem = document.getElementById('spo2Value');
                if (spo2Elem) spo2Elem.innerHTML = spo2 + ' <span>%</span>';
                if (typeof updateCharts === 'function') {
                    updateCharts(this.currentHeart, spo2, this.currentTemp);
                }
            }
        });

        this.subscribe('health/patient/bodytemp', (data) => {
            const temp = parseFloat(data);
            if (!isNaN(temp)) {
                this.currentTemp = temp;
                const tempElem = document.getElementById('tempValue');
                if (tempElem) tempElem.innerHTML = temp.toFixed(1) + ' <span>°C</span>';
                if (typeof updateCharts === 'function') {
                    updateCharts(this.currentHeart, this.currentSpo2, temp);
                }
            }
        });

        // Other topics can be added in the same way
        this.subscribe('health/room/temp', (data) => {
            const roomTemp = parseFloat(data);
            const elem = document.getElementById('roomTempValue');
            if (elem && !isNaN(roomTemp)) elem.innerHTML = roomTemp.toFixed(1) + ' <span>°C</span>';
        });
        this.subscribe('health/room/humidity', (data) => {
            const humidity = parseInt(data);
            const elem = document.getElementById('humidityValue');
            if (elem && !isNaN(humidity)) elem.innerHTML = humidity + ' <span>%</span>';
        });
        this.subscribe('health/patient/position', (data) => {
            const elem = document.getElementById('positionValue');
            if (elem) elem.innerText = data;
        });
        this.subscribe('alert', (data) => {
            console.warn('Alert:', data);
            // Display notification or update alerts UI
            const alertsList = document.getElementById('alertsList');
            if (alertsList) {
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert-item';
                alertDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i><div class="alert-content"><div class="alert-title">${data}</div><div class="alert-time">${new Date().toLocaleTimeString()}</div></div>`;
                alertsList.prepend(alertDiv);
                if (alertsList.children.length > 10) alertsList.removeChild(alertsList.lastChild);
            }
            // Play sound if needed
            if (typeof alertSound === 'function') alertSound('danger');
        });
    }
}

// Create the global object and start connection
window.mqttClient = new MQTTClient();
window.mqttClient.connect();