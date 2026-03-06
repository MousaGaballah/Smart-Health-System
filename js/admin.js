// ====================================================
// ADMIN DASHBOARD - USER MANAGEMENT & ANALYTICS
// ====================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin dashboard initializing...');
    
    // Load stats
    loadStats();
    
    // Add user form
    document.getElementById('addUserForm')?.addEventListener('submit', handleAddUser);
    
    // Load users table
    loadUsers();
});

function loadStats() {
    // In a real app, fetch from Firebase
    document.getElementById('totalPatients').innerText = '24';
    document.getElementById('totalDoctors').innerText = '8';
    document.getElementById('criticalCases').innerText = '3';
}

function handleAddUser(e) {
    e.preventDefault();
    const email = document.getElementById('newEmail').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;
    const name = document.getElementById('newName').value;
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const uid = userCredential.user.uid;
            return firebase.database().ref('users/' + uid).set({
                name: name,
                email: email,
                role: role
            });
        })
        .then(() => {
            alert('User created successfully!');
            document.getElementById('addUserForm').reset();
            loadUsers();
        })
        .catch((error) => alert(error.message));
}

function loadUsers() {
    firebase.database().ref('users').once('value', (snapshot) => {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        snapshot.forEach(child => {
            const user = child.val();
            const uid = child.key;
            tbody.innerHTML += `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td><span class="status-badge status-active">Active</span></td>
                    <td><button class="btn-outline" style="padding: 0.3rem 1rem;" onclick="deleteUser('${uid}')">Delete</button></td>
                </tr>
            `;
        });
    });
}

window.deleteUser = (uid) => {
    if (confirm('Delete user?')) {
        firebase.database().ref('users/' + uid).remove()
            .then(() => loadUsers());
    }
};