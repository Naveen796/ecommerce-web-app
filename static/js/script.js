/* =====================================================================
   static/js/script.js
   =====================================================================
   ALL the JavaScript for the site lives in this one file, wrapped in a
   DOMContentLoaded event so the elements are guaranteed to exist.

   IMPORTANT IDEA
   --------------
   JavaScript here only adds CONVENIENCE. The website still works with
   JavaScript switched off, because everything important (adding to the
   cart, logging in, checking out) happens through real HTML forms that
   POST to Flask routes on the server.
   ===================================================================== */

document.addEventListener('DOMContentLoaded', function () {

    /* =================================================================
       1. MOBILE HAMBURGER MENU
       Toggles the .open class that CSS uses to show/hide the menu.
       ================================================================= */
    const navToggle = document.getElementById('navToggle');
    const navMenu   = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            const isOpen = navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close the menu if the screen grows back to desktop size.
        window.addEventListener('resize', function () {
            if (window.innerWidth > 900) {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }


    /* =================================================================
       2. FLASH MESSAGE CLOSE BUTTONS
       Lets the user dismiss a message instead of waiting for the reload.
       ================================================================= */
    document.querySelectorAll('.alert-close').forEach(function (button) {
        button.addEventListener('click', function () {
            const alert = button.closest('.alert');
            if (alert) { alert.remove(); }
        });
    });

    // Auto-hide info/success messages after a few seconds, but keep
    // error messages on screen (the user probably needs to read them).
    document.querySelectorAll('.alert-success, .alert-info').forEach(function (alert) {
        window.setTimeout(function () {
            alert.style.transition = 'opacity .4s';
            alert.style.opacity = '0';
            window.setTimeout(function () { alert.remove(); }, 400);
        }, 6000);
    });


    /* =================================================================
       3. CONFIRM BEFORE DANGEROUS ACTIONS
       Any <form data-confirm="..."> asks first. Used by delete buttons.
       ================================================================= */
    document.querySelectorAll('form[data-confirm]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            const question = form.getAttribute('data-confirm');
            if (!window.confirm(question)) {
                event.preventDefault();   // stop the form from sending
            }
        });
    });


    /* =================================================================
       4. QUANTITY INPUTS
       - Clicking the arrows can never go below 1 or above the stock.
       - Typing 0 is allowed (it means "remove this line"), but only in
         the cart, not on a product page.
       ================================================================= */
    document.querySelectorAll('input[type="number"][name="quantity"]').forEach(function (input) {
        const min = parseInt(input.getAttribute('min'), 10) || 0;
        const maxAttr = input.getAttribute('max');
        const max = maxAttr ? parseInt(maxAttr, 10) : null;

        // Used when the value comes from the "Cart" page.
        if (input.hasAttribute('data-qty-input')) {
            input.addEventListener('change', function () {
                let value = parseInt(input.value, 10);
                if (isNaN(value) || value < 0) {
                    value = 0;                     // 0 = remove the line
                }
                if (max !== null && value > max) {
                    value = max;
                    alert('Only ' + max + ' item(s) are available in stock.');
                }
                input.value = value;
            });
        } else {
            input.addEventListener('change', function () {
                let value = parseInt(input.value, 10);
                if (isNaN(value) || value < min) { value = min; }
                if (max !== null && value > max) {
                    value = max;
                    alert('Only ' + max + ' item(s) are available in stock.');
                }
                input.value = value;
            });
        }
    });


    /* =================================================================
       5. PASSWORD SHOW / HIDE BUTTON
       ================================================================= */
    document.querySelectorAll('.toggle-password').forEach(function (button) {
        button.addEventListener('click', function () {
            const box = button.closest('.password-box');
            const input = box ? box.querySelector('input') : null;
            if (!input) { return; }

            const showing = input.type === 'text';
            input.type = showing ? 'password' : 'text';
            button.textContent = showing ? 'Show' : 'Hide';
            button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
        });
    });


    /* =================================================================
       6. PASSWORD STRENGTH METER  (registration page only)
       Four bars fill up as the password gets stronger.
       The REAL rule still lives on the server in app.py - this is only
       a hint for the visitor.
       ================================================================= */
    const passwordInput = document.getElementById('password');
    const meter = document.getElementById('strengthMeter');

    if (passwordInput && meter) {
        passwordInput.addEventListener('input', function () {
            const value = passwordInput.value;
            meter.className = 'strength-meter';

            if (!value) { return; }

            let score = 0;
            if (value.length >= 6)  { score++; }
            if (value.length >= 10) { score++; }
            if (/[A-Za-z]/.test(value) && /\d/.test(value)) { score++; }
            if (/[^A-Za-z0-9]/.test(value)) { score++; }

            if (score <= 1)      { meter.classList.add('weak'); }
            else if (score === 2) { meter.classList.add('fair'); }
            else if (score === 3) { meter.classList.add('good'); }
            else                  { meter.classList.add('strong'); }
        });
    }


    /* =================================================================
       7. SIMPLE CLIENT SIDE FORM CHECK  (checkout page)
       Gives instant feedback before the page is sent to the server.
       ================================================================= */
    const checkoutForm = document.getElementById('checkoutForm');

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function (event) {
            let firstBadField = null;

            checkoutForm.querySelectorAll('input, textarea, select').forEach(function (field) {
                // Radio buttons are checked as a group below.
                if (field.type === 'radio') { return; }

                field.style.borderColor = '';
                const value = (field.value || '').trim();

                if (field.hasAttribute('required') && !value) {
                    field.style.borderColor = '#dc2626';
                    if (!firstBadField) { firstBadField = field; }
                    return;
                }

                // A 10 digit phone number, numbers only.
                if (field.type === 'tel' && value && !/^[0-9]{10}$/.test(value)) {
                    field.style.borderColor = '#dc2626';
                    if (!firstBadField) { firstBadField = field; }
                    return;
                }

                // A 6 digit PIN code, numbers only.
                if (field.name === 'pincode' && value && !/^[0-9]{6}$/.test(value)) {
                    field.style.borderColor = '#dc2626';
                    if (!firstBadField) { firstBadField = field; }
                    return;
                }

                // A basic email shape check.
                if (field.type === 'email' && value && !/^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(value)) {
                    field.style.borderColor = '#dc2626';
                    if (!firstBadField) { firstBadField = field; }
                }
            });

            // At least one payment method must be chosen.
            const payments = checkoutForm.querySelectorAll('input[name="payment_method"]');
            if (payments.length && !checkoutForm.querySelector('input[name="payment_method"]:checked')) {
                if (!firstBadField) { firstBadField = payments[0]; }
            }

            if (firstBadField) {
                event.preventDefault();
                firstBadField.focus();
                alert('Please fill in all the required fields correctly.');
            }
        });
    }


    /* =================================================================
       8. IMAGE PREVIEW WHEN ADMIN CHOOSES A FILE
       ================================================================= */
    document.querySelectorAll('input[type="file"][data-preview-target]').forEach(function (input) {
        input.addEventListener('change', function () {
            const file = input.files && input.files[0];
            if (!file) { return; }

            // Rough size check so the user is told before the upload fails.
            const maxBytes = 2 * 1024 * 1024;
            if (file.size > maxBytes) {
                alert('That image is larger than 2 MB. Please pick a smaller file.');
                input.value = '';
                return;
            }

            const preview = document.getElementById(input.getAttribute('data-preview-target'));
            if (!preview) { return; }

            // FileReader reads the file that is already on the computer,
            // so this preview works even before the page is saved.
            const reader = new FileReader();
            reader.onload = function (event) { preview.src = event.target.result; };
            reader.readAsDataURL(file);
        });
    });


    /* =================================================================
       9. BACK TO TOP BUTTON  (appears after scrolling down)
       ================================================================= */
    const toTop = document.getElementById('toTop');

    if (toTop) {
        window.addEventListener('scroll', function () {
            toTop.hidden = window.scrollY < 400;
        }, { passive: true });

        toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    /* =================================================================
       10. USER DROPDOWN ON TOUCH DEVICES
       On a phone there is no hover, so tap needs to open the menu.
       ================================================================= */
    document.querySelectorAll('.dropdown-toggle').forEach(function (button) {
        button.addEventListener('click', function (event) {
            const menu = button.nextElementSibling;
            if (!menu) { return; }

            // Only needed on narrow screens; CSS handles hover on desktop.
            if (window.innerWidth > 900) { return; }

            event.stopPropagation();
            menu.classList.toggle('show');
        });
    });

    document.addEventListener('click', function () {
        document.querySelectorAll('.dropdown-menu.show').forEach(function (menu) {
            menu.classList.remove('show');
        });
    });


    /* =================================================================
       11. REFRESH THE CART BADGE
       Fetches /api/cart-count with fetch() and updates the navbar badge
       if the number changed. Nice demonstration of calling an API.
       ================================================================= */
    function refreshCartCount() {
        const badge = document.getElementById('cartCount');
        if (!badge) { return; }

        fetch('/api/cart-count', { headers: { 'X-Requested-With': 'fetch' } })
            .then(function (response) {
                if (!response.ok) { throw new Error('Request failed'); }
                return response.json();
            })
            .then(function (data) {
                const count = parseInt(data.count, 10) || 0;
                badge.textContent = count;
                badge.classList.toggle('hidden', count === 0);
            })
            .catch(function () {
                // Silently ignore - the badge is not important enough to
                // bother the user with an error.
            });
    }

    // Refresh whenever the tab regains focus (for example after checkout).
    window.addEventListener('focus', refreshCartCount);


    /* =================================================================
       12. FADE IN PRODUCT CARDS AS THEY SCROLL INTO VIEW
       A tiny IntersectionObserver, purely for looks.
       ================================================================= */
    const cards = document.querySelectorAll('.product-card');

    if (cards.length && 'IntersectionObserver' in window) {
        cards.forEach(function (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(14px)';
            card.style.transition = 'opacity .4s ease, transform .4s ease';
        });

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);   // animate only once
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(function (card) { observer.observe(card); });
    }

});