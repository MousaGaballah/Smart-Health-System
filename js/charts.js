// ====================================================
// ADVANCED CHARTS - REAL-TIME, HISTORY, PREDICTIONS
// ====================================================

let heartChart, spo2Chart, tempChart;
let heartHistory = [], spo2History = [], tempHistory = [], timeLabels = [];
let historyCharts = {};

export function initRealtimeCharts() {
    const ctxHeart = document.getElementById('heartChart')?.getContext('2d');
    const ctxSpo2 = document.getElementById('spo2Chart')?.getContext('2d');
    const ctxTemp = document.getElementById('tempChart')?.getContext('2d');
    
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
            y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
        },
        plugins: { legend: { display: false } }
    };
    
    if (ctxHeart) {
        heartChart = new Chart(ctxHeart, {
            type: 'line',
            data: { labels: [], datasets: [{
                label: 'Heart Rate',
                data: [],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.1)',
                tension: 0.3,
                fill: true
            }] },
            options: { ...commonOptions, scales: { ...commonOptions.scales, y: { min: 40, max: 120 } } }
        });
    }
    if (ctxSpo2) {
        spo2Chart = new Chart(ctxSpo2, {
            type: 'line',
            data: { labels: [], datasets: [{
                label: 'SpO2',
                data: [],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.1)',
                tension: 0.3,
                fill: true
            }] },
            options: { ...commonOptions, scales: { ...commonOptions.scales, y: { min: 85, max: 100 } } }
        });
    }
    if (ctxTemp) {
        tempChart = new Chart(ctxTemp, {
            type: 'line',
            data: { labels: [], datasets: [{
                label: 'Body Temp',
                data: [],
                borderColor: '#f56565',
                backgroundColor: 'rgba(245,101,101,0.1)',
                tension: 0.3,
                fill: true
            }] },
            options: { ...commonOptions, scales: { ...commonOptions.scales, y: { min: 35, max: 39 } } }
        });
    }
}

export function updateRealtimeCharts(heart, spo2, temp) {
    const now = new Date().toLocaleTimeString();
    if (heart !== undefined) {
        heartHistory.push(heart);
        if (heartHistory.length > 20) heartHistory.shift();
    }
    if (spo2 !== undefined) {
        spo2History.push(spo2);
        if (spo2History.length > 20) spo2History.shift();
    }
    if (temp !== undefined) {
        tempHistory.push(parseFloat(temp));
        if (tempHistory.length > 20) tempHistory.shift();
    }
    timeLabels.push(now);
    if (timeLabels.length > 20) timeLabels.shift();
    
    if (heartChart) {
        heartChart.data.labels = timeLabels;
        heartChart.data.datasets[0].data = heartHistory;
        heartChart.update();
    }
    if (spo2Chart) {
        spo2Chart.data.labels = timeLabels;
        spo2Chart.data.datasets[0].data = spo2History;
        spo2Chart.update();
    }
    if (tempChart) {
        tempChart.data.labels = timeLabels;
        tempChart.data.datasets[0].data = tempHistory;
        tempChart.update();
    }
}

export function initHistoryCharts(patientId = 'p1') {
    // ApexCharts for history (24h)
    const heartOptions = {
        chart: { type: 'area', height: 250, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
        series: [{ name: 'Heart Rate', data: patientId === 'p1' ? [72,75,71,73,74,72,70,73,75,74,73,72] : [85,84,86,83,85,84,82,83,85,84,86,85] }],
        xaxis: { categories: ['00','02','04','06','08','10','12','14','16','18','20','22'] },
        colors: ['#3b82f6'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
        title: { text: 'Heart Rate History' }
    };
    const heartChart = new ApexCharts(document.querySelector("#heartHistoryChart"), heartOptions);
    heartChart.render();
    historyCharts.heart = heartChart;
    
    const spo2Options = { ...heartOptions, series: [{ name: 'SpO2', data: patientId === 'p1' ? [98,97,98,99,98,97,98,98,97,98,99,98] : [96,95,96,95,96,95,94,95,96,95,96,95] }], colors: ['#10b981'], title: { text: 'SpO2 History' } };
    const spo2Chart = new ApexCharts(document.querySelector("#spo2HistoryChart"), spo2Options);
    spo2Chart.render();
    historyCharts.spo2 = spo2Chart;
    
    const tempOptions = { ...heartOptions, series: [{ name: 'Temperature', data: patientId === 'p1' ? [36.6,36.7,36.5,36.6,36.7,36.6,36.5,36.6,36.7,36.6,36.5,36.6] : [37.1,37.0,37.2,37.1,37.0,37.1,37.2,37.1,37.0,37.1,37.2,37.1] }], colors: ['#f56565'], title: { text: 'Temperature History' } };
    const tempChart = new ApexCharts(document.querySelector("#tempHistoryChart"), tempOptions);
    tempChart.render();
    historyCharts.temp = tempChart;
}

export function updateHistoryCharts(patientId) {
    // Update ApexCharts data
    if (historyCharts.heart) {
        historyCharts.heart.updateSeries([{ data: patientId === 'p1' ? [72,75,71,73,74,72,70,73,75,74,73,72] : [85,84,86,83,85,84,82,83,85,84,86,85] }]);
    }
    if (historyCharts.spo2) {
        historyCharts.spo2.updateSeries([{ data: patientId === 'p1' ? [98,97,98,99,98,97,98,98,97,98,99,98] : [96,95,96,95,96,95,94,95,96,95,96,95] }]);
    }
    if (historyCharts.temp) {
        historyCharts.temp.updateSeries([{ data: patientId === 'p1' ? [36.6,36.7,36.5,36.6,36.7,36.6,36.5,36.6,36.7,36.6,36.5,36.6] : [37.1,37.0,37.2,37.1,37.0,37.1,37.2,37.1,37.0,37.1,37.2,37.1] }]);
    }
}

// Make functions global for HTML access
window.initRealtimeCharts = initRealtimeCharts;
window.updateRealtimeCharts = updateRealtimeCharts;
window.initHistoryCharts = initHistoryCharts;
window.updateHistoryCharts = updateHistoryCharts;