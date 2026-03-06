// ====================================================
// MQTT CLIENT SIMULATION (replace with real MQTT if needed)
// ====================================================

class MQTTClient {
    constructor() {
        this.listeners = {};
        this.interval = null;
        this.connected = false;
    }
    
    connect() {
        console.log('MQTT connecting...');
        this.connected = true;
        this.startMock();
    }
    
    subscribe(topic, callback) {
        if (!this.listeners[topic]) this.listeners[topic] = [];
        this.listeners[topic].push(callback);
        // Return unsubscribe function
        return () => {
            this.listeners[topic] = this.listeners[topic].filter(cb => cb !== callback);
        };
    }
    
    startMock() {
        this.interval = setInterval(() => {
            if (!this.connected) return;
            
            const heartRate = Math.floor(Math.random() * (80 - 60 + 1)) + 60;
            const spo2 = Math.floor(Math.random() * (99 - 95 + 1)) + 95;
            const bodyTemp = (Math.random() * (37.2 - 36.4) + 36.4).toFixed(1);
            const roomTemp = Math.floor(Math.random() * (25 - 22 + 1)) + 22;
            const humidity = Math.floor(Math.random() * (60 - 45 + 1)) + 45;
            const position = Math.random() > 0.95 ? 'fall' : 'normal';
            
            this._publish('health/patient/heartrate', heartRate);
            this._publish('health/patient/spo2', spo2);
            this._publish('health/patient/bodytemp', bodyTemp);
            this._publish('health/room/temp', roomTemp);
            this._publish('health/room/humidity', humidity);
            this._publish('health/patient/position', position);
            
            // Generate alerts
            if (heartRate > 100 || heartRate < 50) {
                this._publish('alert', { message: `Abnormal heart rate: ${heartRate} bpm`, level: 'danger' });
            }
            if (spo2 < 92) {
                this._publish('alert', { message: `Low SpO2: ${spo2}%`, level: 'danger' });
            }
            if (position === 'fall') {
                this._publish('alert', { message: 'Fall detected!', level: 'danger' });
            }
            if (heartRate > 90 || heartRate < 60) {
                this._publish('alert', { message: `Heart rate warning: ${heartRate}`, level: 'warning' });
            }
        }, 3000);
    }
    
    _publish(topic, data) {
        if (this.listeners[topic]) {
            this.listeners[topic].forEach(cb => cb(data));
        }
        if (this.listeners['#']) {
            this.listeners['#'].forEach(cb => cb(topic, data));
        }
    }
    
    stop() {
        this.connected = false;
        if (this.interval) clearInterval(this.interval);
    }
}

window.mqttClient = new MQTTClient();
window.mqttClient.connect();