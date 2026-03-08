// ==================== MAIN SCRIPT ==================== 
    (function() {
      // Preloader fade out
      window.addEventListener('load', () => {
        document.getElementById('preloader').classList.add('fade-out');
      });

      // Toggle password
      document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
          const target = document.getElementById(this.dataset.target);
          if (target.type === 'password') {
            target.type = 'text';
            this.classList.replace('fa-eye', 'fa-eye-slash');
          } else {
            target.type = 'password';
            this.classList.replace('fa-eye-slash', 'fa-eye');
          }
        });
      });

      // Tab switching
      const loginTab = document.getElementById('loginTab');
      const registerTab = document.getElementById('registerTab');
      const loginForm = document.getElementById('loginForm');
      const registerForm = document.getElementById('registerForm');
      loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
      });
      registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
      });

      // Toast function
      function showToast(msg, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.style.background = type === 'error' ? '#ef4444' : (type === 'success' ? '#10b981' : 'var(--toast-bg)');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      }

      // Profile image preview
      document.getElementById('profileUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(ev) {
            document.getElementById('profilePreview').src = ev.target.result;
          };
          reader.readAsDataURL(file);
        }
      });

      // Password strength
      const regPass = document.getElementById('regPassword');
      const strengthFill = document.getElementById('strengthFill');
      const strengthLabel = document.getElementById('strengthLabel');
      regPass.addEventListener('input', function() {
        const pwd = this.value;
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;
        let width = 0, text = 'Weak', color = '#ef4444';
        if (score <= 2) { width = 30; text = 'Weak'; }
        else if (score <= 4) { width = 70; text = 'Medium'; color = '#f59e0b'; }
        else { width = 100; text = 'Strong'; color = '#10b981'; }
        strengthFill.style.width = width + '%';
        strengthFill.style.background = color;
        strengthLabel.innerText = text;
      });

      // Email hint
      document.getElementById('regEmail').addEventListener('input', function() {
        const email = this.value;
        const hint = document.getElementById('emailHint');
        if (email && !/^\S+@\S+\.\S+$/.test(email)) hint.innerText = '✗ Invalid format';
        else hint.innerText = '';
      });

      // Confirm password hint
      const regConfirm = document.getElementById('regConfirm');
      function checkMatch() {
        const hint = document.getElementById('registerError');
        if (regConfirm.value && regConfirm.value !== regPass.value) {
          document.getElementById('registerError').innerText = 'Passwords do not match';
        } else {
          document.getElementById('registerError').innerText = '';
        }
      }
      regConfirm.addEventListener('input', checkMatch);
      regPass.addEventListener('input', checkMatch);

      // Mock login attempts (rate limiting demo)
      let attempts = 0;
      document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (attempts >= 3) {
          showToast('Too many attempts. Try again later.', 'error');
          return;
        }
        const email = document.getElementById('loginEmail').value;
        const btn = document.getElementById('loginBtn');
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        btn.disabled = true;
        setTimeout(() => {
          attempts++;
          if (email.includes('doctor')) window.location.href = 'doctor.html';
          else if (email.includes('patient')) window.location.href = 'patient.html';
          else if (email.includes('admin')) window.location.href = 'admin.html';
          else {
            showToast('Invalid demo credentials (use doctor@, patient@, admin@)', 'error');
            btn.innerHTML = original;
            btn.disabled = false;
          }
        }, 1200);
      });

      // Register mock
      document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (!document.getElementById('termsCheck').checked) {
          showToast('You must accept terms', 'error'); return;
        }
        const btn = document.getElementById('registerBtn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        btn.disabled = true;
        setTimeout(() => {
          showToast('Account created! Redirecting...', 'success');
          setTimeout(() => {
            const role = document.getElementById('regRole').value;
            if (role === 'doctor') window.location.href = 'doctor.html';
            else if (role === 'patient') window.location.href = 'patient.html';
            else window.location.href = 'admin.html';
          }, 1000);
        }, 1500);
      });

      // Social logins
      document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => showToast('Social login demo - redirect would happen', 'info'));
      });

      // Forgot password
      document.getElementById('forgotPassword').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Password reset email sent (demo)', 'success');
      });

      // AI Assistant
      const aiBtn = document.getElementById('aiBtn');
      const aiPopup = document.getElementById('aiPopup');
      aiBtn.addEventListener('click', () => {
        aiPopup.classList.toggle('show');
      });

      // ReCaptcha fake
      document.querySelector('.fake-recaptcha').addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
        this.style.background = '#10b981';
        this.style.color = 'white';
      });

      // micro-interactions: pulse on login btn
      document.querySelector('.btn-login').classList.add('pulse-once');
    })();