document.addEventListener('DOMContentLoaded', () => {
    // Current State for Localization
    let currentCurrency = 'usd';

    // UI Elements
    const startExperienceBtn = document.getElementById('startExperience');

    // WhatsApp OTP & Country Picker Initialization
    let iti;
    const modalPhone = document.getElementById('modalPhone');
    if (modalPhone) {
        iti = window.intlTelInput(modalPhone, {
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
            initialCountry: "auto",
            geoIpLookup: callback => {
                fetch("https://ipapi.co/json")
                    .then(res => res.json())
                    .then(data => callback(data.country_code))
                    .catch(() => callback("pk")); // Default to Pakistan if lookup fails
            },
            separateDialCode: true,
            allowDropdown: true,
            autoPlaceholder: "aggressive",
            preferredCountries: ["pk", "us", "gb", "ae", "sa"],
            dropdownContainer: document.body
        });
    }


    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                document.body.style.overflow = 'hidden'; // Prevent scroll when menu open
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Mobile Dropdown Toggle
    const dropbtns = document.querySelectorAll('.dropbtn');
    dropbtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const dropdownContent = btn.nextElementSibling;
                if (dropdownContent) {
                    const isOpen = dropdownContent.style.maxHeight && dropdownContent.style.maxHeight !== '0px';
                    dropdownContent.style.maxHeight = isOpen ? '0px' : dropdownContent.scrollHeight + 'px';
                    btn.querySelector('i').style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
                }
            }
        });
    });

    // Navbar Scroll Effect
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.padding = '10px 0';
            nav.style.background = 'rgba(5, 11, 24, 0.95)';
        } else {
            nav.style.padding = '20px 0';
            nav.style.background = 'transparent';
        }
    });

    // Cursor Follower / Ambient Glow (Premium Touch)
    const cursorGlow = document.createElement('div');
    cursorGlow.style.cssText = `
        position: fixed;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, var(--primary-accent-glow) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: -1;
        opacity: 0;
        transition: opacity 1s ease;
        transform: translate(-50%, -50%);
    `;
    document.body.appendChild(cursorGlow);

    window.addEventListener('mousemove', (e) => {
        cursorGlow.style.opacity = '0.5';
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });

    const iconSun = themeToggleBtn ? themeToggleBtn.querySelector('.fa-sun') : null;
    const iconMoon = themeToggleBtn ? themeToggleBtn.querySelector('.fa-moon') : null;

    // Check saved preference
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



    // --- Reveal on Scroll Logic ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translate(0, 0) scale(1)';
                // Optional: stop observing once revealed
                // revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05, // Lower threshold for better visibility
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Safety Net: Force reveal after 3s if observer fails
    setTimeout(() => {
        document.querySelectorAll('.reveal:not(.active)').forEach(el => {
            el.classList.add('active');
            el.style.opacity = '1';
            el.style.transform = 'translate(0, 0) scale(1)';
            el.style.transition = 'opacity 0.5s ease'; // Ensure smooth forced reveal
        });
    }, 3000);

});
