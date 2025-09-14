// Application Data and State Management
class BOTXApplication {
    constructor() {
        this.currentView = 'wearable';
        this.isEmergencyMode = false;
        this.isDemoMode = true;
        this.sosTimer = null;
        this.sosHoldTime = 0;
        this.updateIntervals = new Map();
        this.charts = new Map();
        
        // Application data from JSON
        this.devices = [
            {
                id: "BOTX-001",
                user: "Officer Sarah Chen",
                location: {lat: 28.6139, lon: 77.2090, name: "Patrol Zone Alpha"},
                status: "active",
                battery: 78,
                heartRate: 72,
                stressLevel: 15,
                lastUpdate: "2025-01-13T11:05:00Z"
            },
            {
                id: "BOTX-002", 
                user: "Lt. Priya Sharma",
                location: {lat: 28.6169, lon: 77.2120, name: "Border Checkpoint"},
                status: "active",
                battery: 65,
                heartRate: 68,
                stressLevel: 8,
                lastUpdate: "2025-01-13T11:04:30Z"
            },
            {
                id: "BOTX-003",
                user: "Sgt. Meera Patel",
                location: {lat: 28.6089, lon: 77.2050, name: "Command Post"},
                status: "emergency",
                battery: 45,
                heartRate: 110,
                stressLevel: 85,
                lastUpdate: "2025-01-13T11:03:15Z"
            }
        ];

        this.alerts = [
            {
                id: "ALERT-001",
                deviceId: "BOTX-003",
                type: "AI_DETECTED",
                severity: "HIGH",
                timestamp: "2025-01-13T11:03:15Z",
                description: "Voice stress and elevated heart rate detected",
                location: {lat: 28.6089, lon: 77.2050},
                status: "active"
            },
            {
                id: "ALERT-002",
                deviceId: "BOTX-001", 
                type: "GEOFENCE_EXIT",
                severity: "MEDIUM",
                timestamp: "2025-01-13T10:45:22Z",
                description: "Device left designated patrol zone",
                location: {lat: 28.6139, lon: 77.2090},
                status: "acknowledged"
            }
        ];

        this.aiModels = {
            speechEmotion: {
                name: "Voice Stress Recognition",
                accuracy: 94.2,
                status: "active",
                lastTrained: "2025-01-10"
            },
            gestureDetection: {
                name: "Emergency Gesture AI",
                accuracy: 91.8,
                status: "active", 
                lastTrained: "2025-01-08"
            },
            sensorFusion: {
                name: "Location Estimation",
                accuracy: 96.5,
                status: "active",
                lastTrained: "2025-01-12"
            }
        };

        this.responseTeams = [
            {
                id: "TEAM-01",
                name: "Quick Response Alpha",
                status: "available",
                location: {lat: 28.6100, lon: 77.2080},
                eta: "3-5 minutes"
            },
            {
                id: "TEAM-02", 
                name: "Medical Support",
                status: "en_route",
                location: {lat: 28.6120, lon: 77.2095},
                eta: "8 minutes"
            }
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentTime();
        this.setupWearableInterface();
        this.populateDashboard();
        this.populateAIPanel();
        this.populateEmergencyInterface();
        this.startSimulation();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // SOS Button
        const sosButton = document.getElementById('sos-button');
        sosButton.addEventListener('mousedown', () => this.startSOSHold());
        sosButton.addEventListener('mouseup', () => this.stopSOSHold());
        sosButton.addEventListener('mouseleave', () => this.stopSOSHold());
        sosButton.addEventListener('touchstart', () => this.startSOSHold());
        sosButton.addEventListener('touchend', () => this.stopSOSHold());

        // Control buttons
        document.getElementById('simulate-emergency').addEventListener('click', () => this.simulateEmergency());
        document.getElementById('reset-device').addEventListener('click', () => this.resetToNormal());
        document.getElementById('toggle-mode').addEventListener('click', () => this.toggleDemoMode());

        // Modal handlers
        document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('acknowledge-alert').addEventListener('click', () => this.acknowledgeAlert());
        document.getElementById('deploy-response').addEventListener('click', () => this.deployResponse());
    }

    switchView(view) {
        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });

        // Update views
        document.querySelectorAll('.view').forEach(viewEl => {
            viewEl.classList.toggle('active', viewEl.id === `${view}-view`);
        });

        this.currentView = view;

        // Initialize charts if switching to AI panel
        if (view === 'ai-panel') {
            setTimeout(() => this.initializeCharts(), 100);
        }
    }

    updateCurrentTime() {
        const timeElement = document.getElementById('current-time');
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    setupWearableInterface() {
        const currentDevice = this.devices[0]; // Sarah Chen's device
        this.updateWearableDisplay(currentDevice);
    }

    updateWearableDisplay(device) {
        document.getElementById('heart-rate').textContent = device.heartRate;
        document.getElementById('stress-level').textContent = device.stressLevel;
        document.getElementById('location').textContent = device.location.name;
        document.getElementById('battery').textContent = `${device.battery}%`;
        document.getElementById('ai-confidence').textContent = this.aiModels.speechEmotion.accuracy.toFixed(0);

        // Update emergency status
        const statusElement = document.getElementById('emergency-status');
        const indicator = statusElement.querySelector('.status-indicator');
        
        if (device.status === 'emergency' || this.isEmergencyMode) {
            indicator.className = 'status-indicator emergency';
            indicator.innerHTML = '<div class="status-dot"></div><span>EMERGENCY DETECTED</span>';
        } else {
            indicator.className = 'status-indicator normal';
            indicator.innerHTML = '<div class="status-dot"></div><span>Normal Operation</span>';
        }
    }

    startSOSHold() {
        this.sosHoldTime = 0;
        const sosButton = document.getElementById('sos-button');
        sosButton.classList.add('active');
        
        this.sosTimer = setInterval(() => {
            this.sosHoldTime += 100;
            if (this.sosHoldTime >= 3000) {
                this.triggerManualSOS();
                this.stopSOSHold();
            }
        }, 100);
    }

    stopSOSHold() {
        if (this.sosTimer) {
            clearInterval(this.sosTimer);
            this.sosTimer = null;
        }
        this.sosHoldTime = 0;
        document.getElementById('sos-button').classList.remove('active');
    }

    triggerManualSOS() {
        this.isEmergencyMode = true;
        const currentDevice = this.devices[0];
        currentDevice.status = 'emergency';
        currentDevice.heartRate = 95;
        currentDevice.stressLevel = 75;
        
        this.updateWearableDisplay(currentDevice);
        this.showAlert({
            id: "ALERT-MANUAL",
            deviceId: currentDevice.id,
            type: "MANUAL_SOS",
            severity: "HIGH",
            timestamp: new Date().toISOString(),
            description: "Manual SOS activation",
            location: currentDevice.location,
            status: "active"
        });
        
        this.addCommunicationLog("Emergency alert sent - Manual SOS", currentDevice.id, true);
    }

    simulateEmergency() {
        if (!this.isEmergencyMode) {
            this.triggerManualSOS();
        }
    }

    resetToNormal() {
        this.isEmergencyMode = false;
        const currentDevice = this.devices[0];
        currentDevice.status = 'active';
        currentDevice.heartRate = 72;
        currentDevice.stressLevel = 15;
        
        this.updateWearableDisplay(currentDevice);
        this.closeModal();
    }

    toggleDemoMode() {
        this.isDemoMode = !this.isDemoMode;
        const button = document.getElementById('toggle-mode');
        button.textContent = this.isDemoMode ? 'Disable Demo' : 'Enable Demo';
    }

    populateDashboard() {
        this.updateDashboardStats();
        this.populateDeviceMap();
        this.populateAlertsList();
        this.populateDevicesList();
        this.updateCommunicationLog();
    }

    updateDashboardStats() {
        document.getElementById('active-devices').textContent = this.devices.filter(d => d.status === 'active').length + 1;
        document.getElementById('active-alerts').textContent = this.alerts.filter(a => a.status === 'active').length;
        document.getElementById('response-teams').textContent = this.responseTeams.length;
    }

    populateDeviceMap() {
        const mapDevices = document.getElementById('map-devices');
        mapDevices.innerHTML = '';

        this.devices.forEach((device, index) => {
            const marker = document.createElement('div');
            marker.className = `device-marker ${device.status}`;
            marker.style.left = `${20 + index * 25}%`;
            marker.style.top = `${30 + index * 15}%`;
            marker.title = `${device.user} - ${device.status}`;
            mapDevices.appendChild(marker);
        });

        // Add response teams
        this.responseTeams.forEach((team, index) => {
            const marker = document.createElement('div');
            marker.className = 'device-marker team';
            marker.style.left = `${60 + index * 15}%`;
            marker.style.top = `${70 - index * 10}%`;
            marker.title = `${team.name} - ${team.status}`;
            mapDevices.appendChild(marker);
        });
    }

    populateAlertsList() {
        const alertsList = document.getElementById('alerts-list');
        alertsList.innerHTML = '';

        this.alerts.forEach(alert => {
            const alertItem = document.createElement('div');
            alertItem.className = `alert-item ${alert.severity.toLowerCase()}`;
            alertItem.innerHTML = `
                <div class="alert-header">
                    <span class="alert-title">${alert.type.replace('_', ' ')}</span>
                    <span class="alert-time">${new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="alert-description">${alert.description}</div>
                <div class="alert-location">Device: ${alert.deviceId}</div>
            `;
            alertItem.addEventListener('click', () => this.showAlert(alert));
            alertsList.appendChild(alertItem);
        });
    }

    populateDevicesList() {
        const devicesList = document.getElementById('devices-list');
        devicesList.innerHTML = '';

        this.devices.forEach(device => {
            const deviceItem = document.createElement('div');
            deviceItem.className = 'device-item';
            
            const batteryLevel = device.battery > 60 ? 'high' : device.battery > 30 ? 'medium' : 'low';
            
            deviceItem.innerHTML = `
                <div class="device-info">
                    <div class="device-name">${device.user}</div>
                    <div class="device-status">${device.id} - ${device.status}</div>
                </div>
                <div class="device-battery">
                    ${device.battery}%
                    <div class="battery-bar">
                        <div class="battery-fill ${batteryLevel}" style="width: ${device.battery}%"></div>
                    </div>
                </div>
            `;
            devicesList.appendChild(deviceItem);
        });
    }

    updateCommunicationLog() {
        const commLog = document.getElementById('comm-log');
        // Keep existing messages and add new ones dynamically
    }

    addCommunicationLog(message, deviceId, isEmergency = false) {
        const commLog = document.getElementById('comm-log');
        const messageElement = document.createElement('div');
        messageElement.className = `comm-message ${isEmergency ? 'emergency' : ''}`;
        
        const now = new Date();
        messageElement.innerHTML = `
            <span class="comm-time">${now.toLocaleTimeString('en-US', {hour12: false})}</span>
            <span class="comm-device">${deviceId}</span>
            <span class="comm-text">${message}</span>
        `;
        
        commLog.insertBefore(messageElement, commLog.firstChild);
        
        // Keep only last 10 messages
        while (commLog.children.length > 10) {
            commLog.removeChild(commLog.lastChild);
        }
    }

    populateAIPanel() {
        this.populateMLModelsList();
    }

    populateMLModelsList() {
        const modelsList = document.getElementById('models-list');
        modelsList.innerHTML = '';

        Object.values(this.aiModels).forEach(model => {
            const modelItem = document.createElement('div');
            modelItem.className = 'model-item';
            modelItem.innerHTML = `
                <div class="model-header">
                    <span class="model-name">${model.name}</span>
                    <span class="model-accuracy">${model.accuracy}%</span>
                </div>
                <div class="model-details">
                    Status: ${model.status} | Last trained: ${model.lastTrained}
                </div>
            `;
            modelsList.appendChild(modelItem);
        });
    }

    initializeCharts() {
        this.initializeVoiceWaveform();
        this.initializeAccelerometerChart();
        this.initializeLocationChart();
    }

    initializeVoiceWaveform() {
        const canvas = document.getElementById('voice-waveform');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Generate sample waveform data
        const waveformData = Array.from({length: 100}, (_, i) => {
            const base = Math.sin(i * 0.1) * 0.5;
            const stress = this.isEmergencyMode ? Math.random() * 0.8 : Math.random() * 0.3;
            return base + stress;
        });

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 100}, (_, i) => i),
                datasets: [{
                    label: 'Voice Amplitude',
                    data: waveformData,
                    borderColor: this.isEmergencyMode ? '#ef4444' : '#10b981',
                    backgroundColor: this.isEmergencyMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: { 
                        display: false,
                        min: -1,
                        max: 1
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });

        this.charts.set('voice-waveform', chart);
    }

    initializeAccelerometerChart() {
        const canvas = document.getElementById('accelerometer-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Generate sample accelerometer data
        const accelData = {
            x: Array.from({length: 50}, () => (Math.random() - 0.5) * 2),
            y: Array.from({length: 50}, () => (Math.random() - 0.5) * 2),
            z: Array.from({length: 50}, () => (Math.random() - 0.5) * 2)
        };

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 50}, (_, i) => i),
                datasets: [
                    {
                        label: 'X-axis',
                        data: accelData.x,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        pointRadius: 0
                    },
                    {
                        label: 'Y-axis',
                        data: accelData.y,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        pointRadius: 0
                    },
                    {
                        label: 'Z-axis',
                        data: accelData.z,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: true,
                        position: 'top',
                        labels: { 
                            usePointStyle: true,
                            boxWidth: 6
                        }
                    }
                },
                scales: {
                    x: { display: false },
                    y: { 
                        min: -2,
                        max: 2,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });

        this.charts.set('accelerometer-chart', chart);
    }

    initializeLocationChart() {
        const canvas = document.getElementById('location-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Generate sample location precision data
        const locationData = Array.from({length: 20}, () => Math.random() * 5 + 1);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 20}, (_, i) => `T-${19-i}`),
                datasets: [{
                    label: 'Location Precision (meters)',
                    data: locationData,
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'].map((color, i) => 
                        locationData.map((_, j) => j % 5 === i ? color : '#1FB8CD')[0]
                    ),
                    borderColor: '#1FB8CD',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { 
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    },
                    y: { 
                        beginAtZero: true,
                        max: 6,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });

        this.charts.set('location-chart', chart);
    }

    populateEmergencyInterface() {
        this.populateResponseTeamsList();
        this.updateEmergencyTimer();
    }

    populateResponseTeamsList() {
        const teamsList = document.getElementById('response-teams-list');
        teamsList.innerHTML = '';

        this.responseTeams.forEach(team => {
            const teamItem = document.createElement('div');
            teamItem.className = 'team-item';
            teamItem.innerHTML = `
                <div class="team-header">
                    <span class="team-name">${team.name}</span>
                    <span class="team-status ${team.status}">${team.status.replace('_', ' ')}</span>
                </div>
                <div class="team-eta">ETA: ${team.eta}</div>
            `;
            teamsList.appendChild(teamItem);
        });
    }

    updateEmergencyTimer() {
        const timerElement = document.getElementById('response-timer');
        if (!timerElement) return;

        let seconds = 135; // 2:15
        setInterval(() => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            timerElement.textContent = `Response Time: ${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            seconds++;
        }, 1000);
    }

    startSimulation() {
        if (!this.isDemoMode) return;

        // Update sensor data every 2 seconds
        this.updateIntervals.set('sensors', setInterval(() => {
            this.updateSensorData();
        }, 2000));

        // Update time every second
        this.updateIntervals.set('time', setInterval(() => {
            this.updateCurrentTime();
        }, 1000));

        // Add communication logs periodically
        this.updateIntervals.set('comm', setInterval(() => {
            this.addRandomCommunication();
        }, 10000));

        // Update charts if in AI panel
        this.updateIntervals.set('charts', setInterval(() => {
            if (this.currentView === 'ai-panel') {
                this.updateCharts();
            }
        }, 1500));
    }

    updateSensorData() {
        if (this.isDemoMode && this.currentView === 'wearable') {
            const device = this.devices[0];
            
            if (!this.isEmergencyMode) {
                // Simulate normal variations
                device.heartRate += Math.random() * 6 - 3;
                device.heartRate = Math.max(60, Math.min(85, device.heartRate));
                
                device.stressLevel += Math.random() * 10 - 5;
                device.stressLevel = Math.max(5, Math.min(25, device.stressLevel));
            }
            
            device.battery = Math.max(40, device.battery - 0.1);
            
            this.updateWearableDisplay(device);
        }
    }

    addRandomCommunication() {
        const messages = [
            "Status update - All systems normal",
            "Patrol checkpoint reached",
            "Communication test successful",
            "Battery level nominal",
            "Position report - On route"
        ];
        
        const randomDevice = this.devices[Math.floor(Math.random() * this.devices.length)];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        this.addCommunicationLog(randomMessage, randomDevice.id);
    }

    updateCharts() {
        // Update voice waveform
        const voiceChart = this.charts.get('voice-waveform');
        if (voiceChart) {
            const newData = Array.from({length: 100}, (_, i) => {
                const base = Math.sin(i * 0.1 + Date.now() * 0.001) * 0.5;
                const stress = this.isEmergencyMode ? Math.random() * 0.8 : Math.random() * 0.3;
                return base + stress;
            });
            voiceChart.data.datasets[0].data = newData;
            voiceChart.data.datasets[0].borderColor = this.isEmergencyMode ? '#ef4444' : '#10b981';
            voiceChart.update('none');
        }

        // Update stress and confidence values
        if (this.isEmergencyMode) {
            document.getElementById('voice-stress').textContent = '85%';
            document.getElementById('voice-confidence').textContent = '96%';
            document.getElementById('gesture-pattern').textContent = 'Distress Detected';
            document.getElementById('gesture-confidence').textContent = '89%';
        } else {
            document.getElementById('voice-stress').textContent = `${Math.floor(Math.random() * 20 + 10)}%`;
            document.getElementById('voice-confidence').textContent = `${Math.floor(Math.random() * 10 + 90)}%`;
            document.getElementById('gesture-pattern').textContent = 'Normal Movement';
            document.getElementById('gesture-confidence').textContent = `${Math.floor(Math.random() * 10 + 85)}%`;
        }
    }

    showAlert(alert) {
        const modal = document.getElementById('alert-modal');
        const alertDetails = document.getElementById('modal-alert-details');
        
        alertDetails.innerHTML = `
            <div class="info-item">
                <span class="label">Alert Type:</span>
                <span class="value">${alert.type.replace('_', ' ')}</span>
            </div>
            <div class="info-item">
                <span class="label">Device:</span>
                <span class="value">${alert.deviceId}</span>
            </div>
            <div class="info-item">
                <span class="label">Severity:</span>
                <span class="value status--${alert.severity.toLowerCase()}">${alert.severity}</span>
            </div>
            <div class="info-item">
                <span class="label">Description:</span>
                <span class="value">${alert.description}</span>
            </div>
            <div class="info-item">
                <span class="label">Time:</span>
                <span class="value">${new Date(alert.timestamp).toLocaleString()}</span>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('alert-modal').classList.add('hidden');
    }

    acknowledgeAlert() {
        this.addCommunicationLog("Alert acknowledged by command center", "COMMAND", false);
        this.closeModal();
    }

    deployResponse() {
        this.addCommunicationLog("Response teams deployed to location", "COMMAND", true);
        this.responseTeams[0].status = 'en_route';
        this.populateResponseTeamsList();
        this.closeModal();
        
        // Switch to emergency view
        this.switchView('emergency');
    }

    destroy() {
        // Clean up intervals and charts
        this.updateIntervals.forEach(interval => clearInterval(interval));
        this.updateIntervals.clear();
        
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new BOTXApplication();
    
    // Expose app instance globally for debugging
    window.botxApp = app;
    
    // Auto-simulate emergency after 10 seconds for demo
    setTimeout(() => {
        if (app.isDemoMode && !app.isEmergencyMode) {
            app.simulateEmergency();
        }
    }, 10000);
});