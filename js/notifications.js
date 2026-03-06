// ====================================================
// NOTIFICATION SYSTEM - SOUND, VISUAL, PRIORITY
// ====================================================

const notificationSound = (() => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return (frequency = 800, duration = 0.3) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.value = frequency;
            gainNode.gain.value = 0.3;
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + duration);
        };
    } catch (e) {
        return () => {};
    }
})();

let notificationEnabled = true;

export function showNotification(message, level = 'warning', options = {}) {
    if (!notificationEnabled && level !== 'danger') return;
    
    // Find alerts container
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    const div = document.createElement('div');
    div.className = `alert-item ${level === 'danger' ? '' : (level === 'warning' ? 'warning' : 'low')}`;
    div.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <div class="alert-content">
            <div class="alert-title">${message}</div>
            <div class="alert-time">${new Date().toLocaleTimeString()}</div>
        </div>
        <button class="alert-dismiss" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    alertsList.prepend(div);
    if (alertsList.children.length > 10) alertsList.removeChild(alertsList.lastChild);
    
    if (level === 'danger') {
        notificationSound(800, 0.5);
    } else if (level === 'warning') {
        notificationSound(600, 0.2);
    }
    
    // Optional: show browser notification if permitted
    if (Notification.permission === 'granted') {
        new Notification('Smart Health Alert', { body: message });
    }
}

// Request permission on load
if (Notification.permission === 'default') {
    Notification.requestPermission();
}

// Toggle notifications
export function toggleNotifications() {
    notificationEnabled = !notificationEnabled;
    return notificationEnabled;
}

// Make global
window.showNotification = showNotification;
window.toggleNotifications = toggleNotifications;