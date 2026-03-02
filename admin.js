document.addEventListener('DOMContentLoaded', () => {
    const ordersBody = document.getElementById('ordersBody');
    const emptyState = document.getElementById('emptyState');
    const clearDataBtn = document.getElementById('clearDataBtn');

    // Theme Toggle Logic (Shared)
    const themeToggleBtn = document.getElementById('themeToggle');
    const iconSun = themeToggleBtn ? themeToggleBtn.querySelector('.fa-sun') : null;
    const iconMoon = themeToggleBtn ? themeToggleBtn.querySelector('.fa-moon') : null;

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        if (iconSun && iconMoon) {
            iconSun.style.display = 'block';
            iconMoon.style.display = 'none';
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            let theme = 'dark';
            if (document.body.classList.contains('light-theme')) {
                theme = 'light';
                iconSun.style.display = 'block';
                iconMoon.style.display = 'none';
            } else {
                iconSun.style.display = 'none';
                iconMoon.style.display = 'block';
            }
            localStorage.setItem('theme', theme);
        });
    }

    // Authentications & Security Logic
    const loginOverlay = document.getElementById('loginOverlay');
    const dashboardContent = document.getElementById('dashboardContent');
    const loginForm = document.getElementById('loginForm');
    const adminPasswordInput = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');

    const checkAuth = () => {
        const isAuthenticated = sessionStorage.getItem('admin_authenticated');
        if (isAuthenticated === 'true') {
            loginOverlay.classList.add('hidden');
            dashboardContent.classList.add('visible');
            loadOrders();
        } else {
            loginOverlay.classList.remove('hidden');
            dashboardContent.classList.remove('visible');
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const enteredPwd = adminPasswordInput.value;
            const storedPwd = localStorage.getItem('admin_pass') || '111111';

            if (enteredPwd === storedPwd) {
                sessionStorage.setItem('admin_authenticated', 'true');
                loginError.style.display = 'none';
                checkAuth();
            } else {
                loginError.style.display = 'block';
                adminPasswordInput.value = '';
                adminPasswordInput.focus();
            }
        });
    }

    // Settings Modal
    const settingsModal = document.getElementById('settingsModal');
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettings');
    const changePasswordForm = document.getElementById('changePasswordForm');

    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('active');
        });
    }

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });
    }

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const curr = document.getElementById('currPwd').value;
            const next = document.getElementById('newPwd').value;
            const storedPwd = localStorage.getItem('admin_pass') || '111111';

            if (curr !== storedPwd) {
                alert("Current password incorrect!");
                return;
            }

            if (next.length < 6) {
                alert("New password must be 6 digits.");
                return;
            }

            localStorage.setItem('admin_pass', next);
            alert("Password updated successfully!");
            settingsModal.classList.remove('active');
            changePasswordForm.reset();
        });
    }

    // Load Orders from LocalStorage
    const loadOrders = () => {
        const orders = JSON.parse(localStorage.getItem('crown_orders')) || [];

        if (orders.length === 0) {
            ordersBody.innerHTML = '';
            emptyState.style.display = 'block';
            document.getElementById('ordersTable').style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        document.getElementById('ordersTable').style.display = 'table';
        ordersBody.innerHTML = '';

        orders.forEach((order, index) => {
            const tr = document.createElement('tr');

            const reqPreview = order.requirements.length > 50
                ? order.requirements.substring(0, 50) + '...'
                : order.requirements;

            const contactHtml = order.delivery === 'whatsapp'
                ? `<i class="fab fa-whatsapp" style="color: #10b981;"></i> ${order.phone}<br><small>${order.email}</small>`
                : `<i class="fas fa-envelope" style="color: var(--primary-accent);"></i> ${order.email}`;

            // Map status to CSS classes
            let statusClass = 'status-pending';
            if (order.status.toLowerCase().includes('pending')) statusClass = 'status-pending';
            if (order.status.toLowerCase().includes('active')) statusClass = 'status-active';
            if (order.status.toLowerCase().includes('completed')) statusClass = 'status-completed';
            if (order.status.toLowerCase().includes('cancelled')) statusClass = 'status-cancelled';

            // Action buttons
            let actionsHtml = '';
            if (order.status === 'Pending Review') {
                actionsHtml += `<button class="action-btn action-approve" onclick="updateOrderStatus('${order.id}', 'Active')"><i class="fas fa-check"></i> Approve</button>`;
            }
            if (order.status === 'Active') {
                actionsHtml += `<button class="action-btn action-complete" onclick="updateOrderStatus('${order.id}', 'Completed')"><i class="fas fa-flag-checkered"></i> Complete</button>`;
            }
            if (order.status !== 'Cancelled' && order.status !== 'Completed') {
                actionsHtml += `<button class="action-btn action-cancel" onclick="updateOrderStatus('${order.id}', 'Cancelled')"><i class="fas fa-times"></i> Cancel</button>`;
            }
            if (order.status === 'Cancelled' || order.status === 'Completed') {
                actionsHtml += `<small style="opacity: 0.5;">No actions</small>`;
            }

            tr.innerHTML = `
                <td style="font-weight: 600;">${order.id}</td>
                <td style="color: var(--text-secondary);">${order.date}</td>
                <td><span style="color: white; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${order.service}</span></td>
                <td>
                    <strong>Scope:</strong> ${order.scope}<br>
                    <strong>Timeline:</strong> <span style="color: ${order.urgency === 'rush' ? '#ef4444' : 'inherit'}">${order.urgency}</span>
                </td>
                <td>${contactHtml}</td>
                <td title="${order.requirements}" style="color: var(--text-secondary); font-size: 0.9rem; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${reqPreview}</td>
                <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                <td>${actionsHtml}</td>
            `;
            ordersBody.appendChild(tr);
        });
    };

    // Global function for status updates
    window.updateOrderStatus = (orderId, newStatus) => {
        let orders = JSON.parse(localStorage.getItem('crown_orders')) || [];
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            localStorage.setItem('crown_orders', JSON.stringify(orders));
            loadOrders(); // Refresh table
        }
    };

    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to delete all simulated order data? This cannot be undone.")) {
                localStorage.removeItem('crown_orders');
                loadOrders();
            }
        });
    }

    checkAuth();
});
