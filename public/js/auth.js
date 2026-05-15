// Auth page JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Google sign-in buttons (placeholder functionality)
    const googleBtns = document.querySelectorAll('.btn--google');
    googleBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // TODO: Implement Google OAuth
            alert('Funcionalidade de login com Google será implementada em breve.');
        });
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredInputs = form.querySelectorAll('input[required]');
            let isValid = true;

            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = '#ffffff';
                }
            });

            if (!isValid) {
                e.preventDefault();
            }
        });
    });

    // Input focus effects
    const inputs = document.querySelectorAll('.field__input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#48de8d';
        });

        input.addEventListener('blur', function() {
            if (this.value.trim()) {
                this.style.borderColor = '#48de8d';
            } else {
                this.style.borderColor = '#ffffff';
            }
        });
    });

    // Toast notification function
    function showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }

    // Make showToast globally available
    window.showToast = showToast;
});
