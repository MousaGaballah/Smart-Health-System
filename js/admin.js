// Integrated JavaScript with fixed theme toggle and simulated user management for admin dashboard.
(function() {
    "use strict";

    // ==================== GLOBAL VARIABLES ====================
    let usersData = [
        { name: 'Dr. Emily Davis', email: 'emily.davis@hospital.com', role: 'doctor', status: 'active' },
        { name: 'John Doe', email: 'john.doe@example.com', role: 'patient', status: 'active' },
        { name: 'Jane Smith', email: 'jane.smith@example.com', role: 'patient', status: 'active' },
        { name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' },
        { name: 'Dr. Michael Chen', email: 'michael.chen@hospital.com', role: 'doctor', status: 'inactive' }
    ];

    // ==================== SIDEBAR COLLAPSE ====================
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('collapseSidebar');
    collapseBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const icon = collapseBtn.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
        } else {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
        }
    });

    // ==================== SIDEBAR ACTIVE STATE & PAGE NAVIGATION ====================
    const menuItems = document.querySelectorAll('.menu-item');
    const pages = document.querySelectorAll('.page-section');

    function showPage(pageId) {
        pages.forEach(p => p.classList.remove('active'));
        const activePage = document.getElementById(pageId + 'Page');
        if (activePage) activePage.classList.add('active');
    }

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            const page = this.dataset.page;
            showPage(page);
        });
    });
    // ==================== STATS UPDATE (simulated + animated) ====================
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.innerText = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function updateStats() {
        const newPatients = Math.floor(Math.random() * 10 + 20);
        const newDoctors = Math.floor(Math.random() * 5 + 5);
        const newCritical = Math.floor(Math.random() * 5 + 1);
        const newOccupancy = Math.floor(Math.random() * 20 + 70) + '%';

        const totalPatientsEl = document.getElementById('totalPatients');
        const totalDoctorsEl = document.getElementById('totalDoctors');
        const criticalCasesEl = document.getElementById('criticalCases');
        const bedOccupancyEl = document.getElementById('bedOccupancy');

        animateValue(totalPatientsEl, parseInt(totalPatientsEl.innerText), newPatients, 1000);
        animateValue(totalDoctorsEl, parseInt(totalDoctorsEl.innerText), newDoctors, 1000);
        animateValue(criticalCasesEl, parseInt(criticalCasesEl.innerText), newCritical, 1000);
        bedOccupancyEl.innerText = newOccupancy; // percentage not numeric
    }
    setInterval(updateStats, 10000);

    // ==================== NOTIFICATION SYSTEM ====================
    function showNotification(msg, type = 'info') {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.innerText = msg;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2000);
    }

    // ==================== USERS TABLE RENDERING ====================
    const tbody = document.getElementById('usersTableBody');

    function renderUsers() {
        tbody.innerHTML = '';
        usersData.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><b>${user.name}</b></td>
                <td>${user.email}</td>
                <td>${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
                <td><span class="status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}">${user.status}</span></td>
                <td>
                    <button class="action-btn" onclick="editUser(${index})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="action-btn delete" onclick="deleteUser(${index})"><i class="fas fa-trash"></i> Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        // Also update patients and doctors tables
        renderPatientsAndDoctors();
    }

    // Make functions global for onclick
    window.editUser = function(index) {
        const user = usersData[index];
        const newName = prompt('Edit name:', user.name);
        if (newName) {
            usersData[index].name = newName;
            renderUsers();
            showNotification('User updated successfully');
        }
    };

    window.deleteUser = function(index) {
        if (confirm('Are you sure you want to delete this user?')) {
            usersData.splice(index, 1);
            renderUsers();
            showNotification('User deleted');
        }
    };

    // ==================== ADD USER FORM HANDLER ====================
    document.getElementById('addUserForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('newName').value;
        const email = document.getElementById('newEmail').value;
        const password = document.getElementById('newPassword').value;
        const role = document.getElementById('newRole').value;

        usersData.push({
            name: name,
            email: email,
            role: role,
            status: 'active'
        });
        renderUsers();
        showNotification(`User ${name} created successfully (demo mode).`);
        e.target.reset();
    });

    // ==================== SEARCH FUNCTIONALITY ====================
    document.getElementById('globalSearch').addEventListener('input', function() {
        const value = this.value.toLowerCase();
        document.querySelectorAll('#usersTable tbody tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(value) ? '' : 'none';
        });
    });

    // ==================== FILTER & DATE RANGE FUNCTIONALITY ====================
    const filterBtn = document.getElementById('filterBtn');
    const filterDropdown = document.getElementById('filterDropdown');
    const closeFilter = document.getElementById('closeFilter');
    const dateBadge = document.querySelector('.date-badge');
    const dateDropdown = document.getElementById('dateDropdown');
    const dateSpan = dateBadge.querySelector('span');
    const filterRole = document.getElementById('filterRole');
    const filterStatus = document.getElementById('filterStatus');
    const filterStartDate = document.getElementById('filterStartDate');
    const filterEndDate = document.getElementById('filterEndDate');
    const applyFilter = document.getElementById('applyFilter');
    const resetFilter = document.getElementById('resetFilter');

    // Toggle filter dropdown
    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        filterDropdown.classList.toggle('active');
        dateDropdown.classList.remove('active');
    });

    // Close filter dropdown
    closeFilter.addEventListener('click', () => {
        filterDropdown.classList.remove('active');
    });

    // Toggle date dropdown
    dateBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        dateDropdown.classList.toggle('active');
        filterDropdown.classList.remove('active');
    });

    // Click outside to close dropdowns
    document.addEventListener('click', (e) => {
        if (!filterDropdown.contains(e.target) && !filterBtn.contains(e.target)) {
            filterDropdown.classList.remove('active');
        }
        if (!dateDropdown.contains(e.target) && !dateBadge.contains(e.target)) {
            dateDropdown.classList.remove('active');
        }
    });

    // Date range selection
    document.querySelectorAll('.date-dropdown li').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.date-dropdown li').forEach(li => li.classList.remove('active'));
            this.classList.add('active');
            const range = this.dataset.range;
            if (range === 'custom') {
                dateSpan.innerText = 'Custom range';
            } else {
                dateSpan.innerText = `Last ${range} days`;
            }
            applyDateFilter(range);
            dateDropdown.classList.remove('active');
        });
    });

    // Apply filter button
    applyFilter.addEventListener('click', () => {
        const role = filterRole.value;
        const status = filterStatus.value;
        const startDate = filterStartDate.value;
        const endDate = filterEndDate.value;

        filterTables(role, status, startDate, endDate);
        filterDropdown.classList.remove('active');
    });

    // Reset filter button
    resetFilter.addEventListener('click', () => {
        filterRole.value = 'all';
        filterStatus.value = 'all';
        filterStartDate.value = '';
        filterEndDate.value = '';
        resetTableFilters();
        filterDropdown.classList.remove('active');
    });

    // function applyDateFilter(range) {
    //     showNotification(`Date range changed to ${dateSpan.innerText}`);
    //     // يمكن إضافة منطق لتصفية الجداول حسب التاريخ هنا
    // }

    function filterTables(role, status, startDate, endDate) {
        const userRows = document.querySelectorAll('#usersTable tbody tr');
        const patientRows = document.querySelectorAll('#patientsTable tbody tr');
        const doctorRows = document.querySelectorAll('#doctorsTable tbody tr');

        userRows.forEach(row => {
            let show = true;
            const rowRole = row.querySelector('td:nth-child(3)').innerText.toLowerCase();
            const rowStatus = row.querySelector('td:nth-child(4) .status-badge').innerText.toLowerCase();
            if (role !== 'all' && rowRole !== role) show = false;
            if (status !== 'all' && rowStatus !== status) show = false;
            row.style.display = show ? '' : 'none';
        });

        patientRows.forEach(row => {
            let show = true;
            const rowStatus = row.querySelector('td:nth-child(3) .status-badge').innerText.toLowerCase();
            if (status !== 'all' && rowStatus !== status) show = false;
            // يمكن إضافة فلتر إضافي حسب الحاجة
            row.style.display = show ? '' : 'none';
        });

        doctorRows.forEach(row => {
            let show = true;
            const rowStatus = row.querySelector('td:nth-child(3) .status-badge').innerText.toLowerCase();
            if (status !== 'all' && rowStatus !== status) show = false;
            row.style.display = show ? '' : 'none';
        });

        showNotification('Filters applied');
    }

    function resetTableFilters() {
        const allRows = document.querySelectorAll('#usersTable tbody tr, #patientsTable tbody tr, #doctorsTable tbody tr');
        allRows.forEach(row => row.style.display = '');
        showNotification('Filters reset');
    }

    // ==================== EXPORT BUTTON (simulate PDF) ====================
    document.getElementById('exportBtn').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text("User Management Report", 14, 22);

        // Table data
        const headers = [["Name", "Email", "Role", "Status"]];
        const data = usersData.map(u => [u.name, u.email, u.role.charAt(0).toUpperCase() + u.role.slice(1), u.status]);

        doc.autoTable({
            startY: 30,
            head: headers,
            body: data,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] },
            styles: { fontSize: 12 }
        });

        doc.save("user_management.pdf");
    });

    // ==================== PATIENTS & DOCTORS TABLES ====================
    function renderPatientsAndDoctors() {
        const patientsTbody = document.getElementById('patientsTableBody');
        const doctorsTbody = document.getElementById('doctorsTableBody');
        if (patientsTbody) {
            patientsTbody.innerHTML = usersData.filter(u => u.role === 'patient').map(u => `
                <tr>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td><span class="status-badge ${u.status === 'active' ? 'status-active' : 'status-inactive'}">${u.status}</span></td>
                    <td>${new Date().toLocaleDateString()}</td>
                </tr>
            `).join('');
        }
        if (doctorsTbody) {
            doctorsTbody.innerHTML = usersData.filter(u => u.role === 'doctor').map(u => `
                <tr>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td><span class="status-badge ${u.status === 'active' ? 'status-active' : 'status-inactive'}">${u.status}</span></td>
                    <td>${Math.floor(Math.random() * 10)}</td>
                </tr>
            `).join('');
        }
    }

    // ==================== REPORTS CHART ====================
    const ctx = document.getElementById('monthlyReportChart')?.getContext('2d');

    if (ctx) {
        // Gradient color
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(37,99,235,0.5)');
        gradient.addColorStop(1, 'rgba(37,99,235,0.02)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Patients Admitted',
                    data: [12, 19, 15, 17, 24, 23],
                    borderColor: '#2563eb',
                    backgroundColor: gradient,
                    fill: true,
                    borderWidth: 3,
                    tension: 0.4,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#2563eb',
                    pointBorderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: { size: 14, weight: '600' }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#111',
                        titleColor: '#fff',
                        bodyColor: '#ddd',
                        padding: 10,
                        borderColor: '#2563eb',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(150,150,150,0.1)', borderDash: [5,5] },
                        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }
                    }
                }
            }
        });
    }

    // ==================== EXPORT REPORT ====================
    document.getElementById('exportReportBtn')?.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const canvas = document.getElementById('monthlyReportChart');
        const imgData = canvas.toDataURL("image/png", 1.0);
        const pdf = new jsPDF('landscape');
        pdf.setFontSize(18);
        pdf.text("Monthly Patients Report", 14, 15);
        pdf.addImage(imgData, 'PNG', 10, 25, 270, 120);
        pdf.save("report-chart.pdf");
    });

    // ==================== SETTINGS PAGE ====================
    document.getElementById('saveSettings')?.addEventListener('click', () => {
        const hospital = document.getElementById('hospitalName').value;
        const email = document.getElementById('notificationEmail').value;
        const lang = document.getElementById('language').value;
        showNotification(`Settings saved: ${hospital}, ${email}, ${lang}`);
    });

    // ==================== INITIAL RENDER ====================
    renderUsers();
    // Show dashboard by default
    showPage('dashboard');

    // ==================== LOGOUT BUTTON (simulated) ====================
    const footer = document.querySelector('.sidebar-footer');
    const logoutBtn = document.createElement('a');
    logoutBtn.href = 'javascript:void(0)';
    logoutBtn.className = 'menu-item';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Logout</span>';
    logoutBtn.addEventListener('click', () => {
        if (confirm('Logout?')) window.location.href = 'index.html';
    });
    footer.appendChild(logoutBtn);

    // Override showPage to close dropdowns when changing page
    const originalShowPage = showPage;
    showPage = function(pageId) {
        originalShowPage(pageId);
        if (filterDropdown) filterDropdown.classList.remove('active');
        if (dateDropdown) dateDropdown.classList.remove('active');
    };
})();