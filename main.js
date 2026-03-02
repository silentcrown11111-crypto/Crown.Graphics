document.addEventListener('DOMContentLoaded', () => {
    // Current State for Localization
    let currentCurrency = 'usd';

    // UI Elements
    const onboardingOverlay = document.getElementById('onboardingOverlay');
    const startExperienceBtn = document.getElementById('startExperience');
    const pricingToggle = document.getElementById('pricingToggle');
    const monthlyBtn = document.getElementById('monthlyBtn');
    const yearlyBtn = document.getElementById('yearlyBtn');

    // Onboarding Logic (Page Load Check)
    if (onboardingOverlay) {
        const hasVisited = localStorage.getItem('crown_visited');
        if (hasVisited === 'true') {
            onboardingOverlay.classList.remove('active');
            onboardingOverlay.style.display = 'none';
        }
    }

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

    // Professional OTP Notification Simulation
    const showWhatsAppNotification = (phone, code) => {
        const notif = document.createElement('div');
        notif.className = 'wp-notif';
        notif.innerHTML = `
            <i class="fab fa-whatsapp"></i>
            <div class="text">
                <h4>WhatsApp Business</h4>
                <p>Crown Graphics: Your code for <b>${phone}</b> is <b>${code}</b>.</p>
            </div>
        `;
        document.body.appendChild(notif);

        setTimeout(() => notif.classList.add('active'), 100);

        // Remove after 8 seconds
        setTimeout(() => {
            notif.classList.remove('active');
            setTimeout(() => notif.remove(), 500);
        }, 8000);
    };
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

    // Premium Reveal Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.pricing-card, .sub-card, .portfolio-item, .bento-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px) scale(0.98)';
        el.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        observer.observe(el);
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

    const prices = document.querySelectorAll('.price[data-usd-monthly]');

    // Function to update DOM prices
    const updatePrices = (isYearly) => {
        if (!prices) return;
        prices.forEach(priceEl => {
            const amountSpan = priceEl.querySelector('.amount');
            const currencySpan = priceEl.querySelector('.currency-symbol');

            let amount = isYearly ? priceEl.getAttribute(`data-${currentCurrency}-yearly`) : priceEl.getAttribute(`data-${currentCurrency}-monthly`);

            // Format numbers with commas
            amount = Number(amount).toLocaleString();
            amountSpan.textContent = amount;

            if (currentCurrency === 'pkr') {
                currencySpan.innerHTML = 'Rs ';
            } else if (currentCurrency === 'gbp') {
                currencySpan.innerHTML = '£';
            } else {
                currencySpan.innerHTML = '$';
            }
        });

        // Trigger dynamic modal price recalculation if it's open
        if (typeof calculatePrice === 'function') {
            calculatePrice();
        }
    };

    // Detect Location
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            if (data.country_code === 'PK') {
                currentCurrency = 'pkr';
            } else if (data.country_code === 'GB') {
                currentCurrency = 'gbp';
            } else {
                currentCurrency = 'usd';
            }
            // Trigger initial update with detected currency
            updatePrices(pricingToggle ? pricingToggle.checked : false);
        })
        .catch(error => {
            console.error("Error fetching location:", error);
            // Fallback to USD
            currentCurrency = 'usd';
            updatePrices(pricingToggle ? pricingToggle.checked : false);
        });

    if (pricingToggle) {
        pricingToggle.addEventListener('change', (e) => {
            const isYearly = e.target.checked;
            if (isYearly) {
                yearlyBtn.classList.add('active');
                monthlyBtn.classList.remove('active');
            } else {
                monthlyBtn.classList.add('active');
                yearlyBtn.classList.remove('active');
            }
            updatePrices(isYearly);
        });
    }

    if (monthlyBtn) {
        monthlyBtn.addEventListener('click', () => {
            if (pricingToggle) {
                pricingToggle.checked = false;
                pricingToggle.dispatchEvent(new Event('change'));
            }
        });
    }

    if (yearlyBtn) {
        yearlyBtn.addEventListener('click', () => {
            if (pricingToggle) {
                pricingToggle.checked = true;
                pricingToggle.dispatchEvent(new Event('change'));
            }
        });
    }
    const themeToggleBtn = document.getElementById('themeToggle');
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

    // Dynamic Quote Modal Logic
    const modalOverlay = document.getElementById('quoteModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const quoteForm = document.getElementById('quoteForm');
    const otpSection = document.getElementById('otpSection');
    const successSection = document.getElementById('successSection');
    const modalDelivery = document.getElementById('modalDelivery');
    const whatsappGroup = document.getElementById('whatsappGroup');
    const otpInput = document.getElementById('otpInput');
    const otpTimerEl = document.getElementById('otpTimer');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const cancelOtpBtn = document.getElementById('cancelOtpBtn');
    const quoteTriggers = document.querySelectorAll('.quote-trigger');
    const navCta = document.querySelector('.nav-cta'); // Generic get started
    const dynamicFieldsContainer = document.getElementById('dynamicFieldsContainer');

    // Checkout Modal Elements
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutCloseBtn = document.querySelector('.checkout-close-btn');
    const pricingBuyBtns = document.querySelectorAll('.pricing-buy-btn');
    const checkoutPlanName = document.getElementById('checkoutPlanName');
    const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');
    const checkoutForm = document.getElementById('checkoutForm');
    const payMethodRadios = document.getElementsByName('payMethod');
    const cardUI = document.getElementById('cardUI');
    const checkoutSuccess = document.getElementById('checkoutSuccess');
    const cardInput = document.getElementById('cardInput');
    const expInput = document.getElementById('expInput');
    const cvcInput = document.getElementById('cvcInput');

    let currentOtp = '';
    let otpInterval;
    let currentService = '';

    // Dynamic Pricing Calculation
    const calculatePrice = () => {
        const scope = document.getElementById('modalScope').value;
        const urgency = document.getElementById('modalUrgency').value;
        const dynamic1 = document.getElementById('modalDynamic1');
        const dynamic2 = document.getElementById('modalDynamic2');

        let basePrice = 50; // Default base
        const lowerService = currentService.toLowerCase();

        // Base Prices by Category
        if (lowerService.includes('logo') || lowerService.includes('brand')) {
            basePrice = 75;
            if (dynamic2 && dynamic2.value === '3d_mascot') basePrice += 100;
        } else if (lowerService.includes('video') || lowerService.includes('youtube') || lowerService.includes('reels') || lowerService.includes('cinematic')) {
            basePrice = 120;
            if (dynamic1 && dynamic1.value === 'horizontal_16_9') basePrice += 30;
        } else if (lowerService.includes('web') || lowerService.includes('saas') || lowerService.includes('ecommerce')) {
            basePrice = 450;
            if (dynamic2 && dynamic2.value === '4-10') basePrice += 300;
            if (dynamic2 && dynamic2.value === '10+') basePrice += 1000;
        } else if (lowerService.includes('extension')) {
            basePrice = 250;
        }

        // Scope Multipliers
        if (scope === 'premium') basePrice *= 1.5;
        if (scope === 'enterprise') basePrice *= 3;

        // Urgency Multipliers
        if (urgency === 'rush') basePrice *= 1.25;

        // Currency Conversion (Simplified for estimate)
        let displayPrice = basePrice;
        let symbol = '$';
        if (currentCurrency === 'pkr') {
            displayPrice = basePrice * 280;
            symbol = 'Rs ';
        } else if (currentCurrency === 'gbp') {
            displayPrice = basePrice * 0.8;
            symbol = '£';
        }

        const estimatedAmountEl = document.getElementById('estimatedAmount');
        if (estimatedAmountEl) {
            estimatedAmountEl.textContent = `${symbol}${Math.round(displayPrice).toLocaleString()} `;
        }
    };

    const openModal = (serviceName) => {
        currentService = serviceName;
        if (modalTitle) {
            modalTitle.textContent = `Request Quote: ${serviceName} `;
        }

        // Reset Views
        quoteForm.style.display = 'block';
        otpSection.style.display = 'none';
        successSection.style.display = 'none';
        modalDesc.style.display = 'block';
        quoteForm.reset();
        whatsappGroup.style.display = 'none';
        clearInterval(otpInterval);

        // Inject Dynamic Fields
        if (dynamicFieldsContainer) {
            dynamicFieldsContainer.innerHTML = ''; // Clear previous
            const lowerService = serviceName.toLowerCase();

            if (lowerService.includes('video') || lowerService.includes('youtube') || lowerService.includes('reels') || lowerService.includes('cinematic') || lowerService.includes('promo') || lowerService.includes('vfx') || lowerService.includes('motion')) {
                dynamicFieldsContainer.innerHTML = `
                    <div class="form-group" style="margin-bottom: 24px;">
                        <label>Select Video Size / Aspect Ratio</label>
                        <select required id="modalDynamic1" style="padding: 16px; border-radius: var(--radius-md); background: rgba(0,0,0,0.2); border: 1px solid var(--border-glass); color: white; width: 100%;">
                            <option value="horizontal_16_9">Horizontal (16:9) - Standard YouTube/Web</option>
                            <option value="vertical_9_16">Vertical (9:16) - TikTok/Reels/Shorts</option>
                            <option value="square_1_1">Square (1:1) - Instagram Post</option>
                            <option value="custom">Custom Size</option>
                        </select>
                    </div>
                `;
            } else if (lowerService.includes('logo') || lowerService.includes('brand')) {
                dynamicFieldsContainer.innerHTML = `
                    <div class="form-group" style="margin-bottom: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 200px;">
                            <label>Logo Size Requirements</label>
                            <select required id="modalDynamic1" style="padding: 16px; border-radius: var(--radius-md); background: rgba(0,0,0,0.2); border: 1px solid var(--border-glass); color: white; width: 100%;">
                                <option value="standard_vector">Standard Vector (Scalable to any size)</option>
                                <option value="website_header">Website Header Size</option>
                                <option value="social_profile">Social Media Profile Image</option>
                                <option value="custom_dimensions">Specific Dimensions</option>
                            </select>
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <label>Preferred Aesthetic</label>
                            <select required id="modalDynamic2" style="padding: 16px; border-radius: var(--radius-md); background: rgba(0,0,0,0.2); border: 1px solid var(--border-glass); color: white; width: 100%;">
                                <option value="minimalist">Minimalist & Clean</option>
                                <option value="3d_mascot">3D / Mascot</option>
                                <option value="typography">Typography Focused</option>
                            </select>
                        </div>
                    </div>
                `;
            } else if (lowerService.includes('picture') || lowerService.includes('poster') || lowerService.includes('card') || lowerService.includes('mockup') || lowerService.includes('social') || lowerService.includes('graphic') || lowerService.includes('illustration')) {
                dynamicFieldsContainer.innerHTML = `
                    <div class="form-group" style="margin-bottom: 24px;">
                        <label>Select Picture / Graphic Size</label>
                        <select required id="modalDynamic1" style="padding: 16px; border-radius: var(--radius-md); background: rgba(0,0,0,0.2); border: 1px solid var(--border-glass); color: white; width: 100%;">
                            <option value="horizontal">Horizontal (Landscape)</option>
                            <option value="vertical">Vertical (Portrait)</option>
                            <option value="square">Square</option>
                            <option value="custom_print">Custom Print Size (e.g., A4, Letter)</option>
                        </select>
                    </div>
                `;
            } else if (lowerService.includes('web') || lowerService.includes('saas') || lowerService.includes('ecommerce') || lowerService.includes('site') || lowerService.includes('page') || lowerService.includes('app')) {
                dynamicFieldsContainer.innerHTML = `
                    <div class="form-group" style="display: flex; gap: 16px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 200px;">
                            <label>Tech Stack Preference</label>
                            <select required id="modalDynamic1" style="padding: 16px; border-radius: var(--radius-md); background: rgba(0,0,0,0.2); border: 1px solid var(--border-glass); color: white; width: 100%;">
                                <option value="react_next">React / Next.js (Custom code)</option>
                                <option value="wordpress">WordPress</option>
                                <option value="shopify">Shopify</option>
                                <option value="no_preference">You decide what's best</option>
                            </select>
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <label>Estimated Pages</label>
                            <select required id="modalDynamic2" style="padding: 16px; border-radius: var(--radius-md); background: rgba(0,0,0,0.2); border: 1px solid var(--border-glass); color: white; width: 100%;">
                                <option value="1-3">1-3 Pages (Landing)</option>
                                <option value="4-10">4-10 Pages</option>
                                <option value="10+">10+ Pages / Platform</option>
                            </select>
                        </div>
                    </div>
                `;
            }

            // Add change listeners to all selects in the modal for real-time pricing
            const modalSelects = modalOverlay.querySelectorAll('select');
            modalSelects.forEach(select => {
                select.addEventListener('change', calculatePrice);
            });
        }

        // Initial Calculation
        calculatePrice();

        if (modalOverlay) {
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    };

    const closeModal = () => {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
            clearInterval(otpInterval);
        }
        if (checkoutModal) {
            checkoutModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // Toggle WhatsApp Input
    if (modalDelivery) {
        modalDelivery.addEventListener('change', (e) => {
            if (e.target.value === 'whatsapp') {
                whatsappGroup.style.display = 'block';
                modalPhone.setAttribute('required', 'true');
            } else {
                whatsappGroup.style.display = 'none';
                modalPhone.removeAttribute('required');
            }
        });
    }

    // Handle initial form submit
    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const deliveryMethod = modalDelivery.value;

            if (deliveryMethod === 'whatsapp') {
                // Get full international number from the picker
                const fullPhone = iti ? iti.getNumber() : modalPhone.value;

                // Generate fake OTP
                currentOtp = Math.floor(1000 + Math.random() * 9000).toString();

                // Professional Simulation instead of alert()
                showWhatsAppNotification(fullPhone, currentOtp);

                // Show OTP UI
                quoteForm.style.display = 'none';
                modalDesc.style.display = 'none';
                otpSection.style.display = 'block';
                otpInput.value = '';

                // Start 60s Timer
                let timeLeft = 60;
                otpTimerEl.textContent = '01:00';

                clearInterval(otpInterval);
                otpInterval = setInterval(() => {
                    timeLeft--;
                    let seconds = timeLeft < 10 ? `0${timeLeft}` : timeLeft;
                    otpTimerEl.textContent = `00:${seconds}`;

                    if (timeLeft <= 0) {
                        clearInterval(otpInterval);
                        otpTimerEl.textContent = 'EXPIRED';
                        currentOtp = null; // Invalidates the OTP
                    }
                }, 1000);
            } else {
                // Direct Website Order Save
                saveOrder();
            }
        });
    }

    // Verify OTP
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', () => {
            if (!currentOtp) {
                alert("OTP has expired. Please go back and request a new one.");
                return;
            }
            if (otpInput.value === currentOtp) {
                clearInterval(otpInterval);
                saveOrder();
            } else {
                alert("Invalid code. Please try again.");
            }
        });
    }

    // Cancel OTP Flow
    if (cancelOtpBtn) {
        cancelOtpBtn.addEventListener('click', () => {
            clearInterval(otpInterval);
            otpSection.style.display = 'none';
            quoteForm.style.display = 'block';
            modalDesc.style.display = 'block';
        });
    }

    // Save Order to localStorage Function
    const saveOrder = () => {
        // Grab dynamic values if they exist
        const dynamic1 = document.getElementById('modalDynamic1');
        const dynamic2 = document.getElementById('modalDynamic2');

        let customReq = document.getElementById('modalCustom').value;
        if (dynamic1) customReq = `[Param 1: ${dynamic1.value}]` + customReq;
        if (dynamic2) customReq = `[Param 2: ${dynamic2.value}]` + customReq;

        const orderData = {
            id: 'ORD-' + Math.floor(Math.random() * 1000000),
            date: new Date().toLocaleString(),
            service: currentService,
            scope: document.getElementById('modalScope').value,
            urgency: document.getElementById('modalUrgency').value,
            requirements: customReq,
            email: document.getElementById('modalEmail').value,
            delivery: modalDelivery.value,
            phone: iti ? iti.getNumber() : (modalPhone.value || 'N/A'),
            status: 'Pending Review'
        };

        // Get existing orders or init empty array
        let orders = JSON.parse(localStorage.getItem('crown_orders')) || [];
        orders.unshift(orderData); // Add to beginning
        localStorage.setItem('crown_orders', JSON.stringify(orders));

        // Show Success UI
        quoteForm.style.display = 'none';
        otpSection.style.display = 'none';
        modalDesc.style.display = 'none';
        successSection.style.display = 'block';
    };

    quoteTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const service = trigger.getAttribute('data-service') || 'Custom Project';
            openModal(service);
        });
    });

    if (navCta) {
        navCta.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('General Consultation');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close on outside click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    if (checkoutModal) {
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) {
                closeModal();
            }
        });
    }

    // --- Checkout Logic ---
    if (checkoutCloseBtn) {
        checkoutCloseBtn.addEventListener('click', closeModal);
    }

    pricingBuyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const plan = btn.getAttribute('data-plan') || 'Custom Tier';
            const price = btn.getAttribute('data-price') || '0';

            // Determine correct symbol
            let currSymbol = '$';
            let currSuffix = 'USD';
            if (currentCurrency === 'pkr') {
                currSymbol = 'Rs ';
                currSuffix = 'PKR';
            } else if (currentCurrency === 'gbp') {
                currSymbol = '£';
                currSuffix = 'GBP';
            }

            if (checkoutPlanName) checkoutPlanName.textContent = plan;
            if (checkoutTotalAmount) checkoutTotalAmount.textContent = `${currSymbol}${Number(price).toLocaleString()} ${currSuffix} `;

            // Reset modal
            if (checkoutForm) {
                checkoutForm.reset();
                checkoutForm.style.display = 'block';
            }
            if (checkoutSuccess) checkoutSuccess.style.display = 'none';
            if (cardUI) cardUI.style.display = 'block'; // Ensure card is shown default if checked

            if (checkoutModal) {
                checkoutModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Toggle Card/PayPal UI
    Array.from(payMethodRadios).forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (cardUI) {
                if (e.target.value === 'card') {
                    cardUI.style.display = 'block';
                    cardInput.setAttribute('required', 'true');
                    expInput.setAttribute('required', 'true');
                    cvcInput.setAttribute('required', 'true');
                } else {
                    cardUI.style.display = 'none';
                    cardInput.removeAttribute('required');
                    expInput.removeAttribute('required');
                    cvcInput.removeAttribute('required');
                }
            }
        });
    });

    // Handle Checkout Submit
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const selectedPlan = checkoutPlanName ? checkoutPlanName.textContent : 'Subscription';
            const userEmail = document.getElementById('checkoutEmail').value;
            const userName = document.getElementById('checkoutName').value;

            let selectedMethod = 'card';
            Array.from(payMethodRadios).forEach(r => {
                if (r.checked) selectedMethod = r.value;
            });

            // Log subscription as an order in localStorage to view on Admin dash
            const orderData = {
                id: 'SUB-' + Math.floor(Math.random() * 1000000),
                date: new Date().toLocaleString(),
                service: `[PLAN] ${selectedPlan} `,
                scope: 'Subscription Access',
                urgency: 'Immediate',
                requirements: `Subscription purchased via ${selectedMethod.toUpperCase()} by ${userName}.`,
                email: userEmail,
                delivery: 'Auto-Provisioned',
                phone: 'N/A',
                status: 'Active'
            };

            let orders = JSON.parse(localStorage.getItem('crown_orders')) || [];
            orders.unshift(orderData);
            localStorage.setItem('crown_orders', JSON.stringify(orders));

            // Show Success UI
            checkoutForm.style.display = 'none';
            if (checkoutSuccess) checkoutSuccess.style.display = 'block';
        });
    }

});
