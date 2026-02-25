/**
 * Wellnix JavaScript Utilities
 * Version: 2.0
 * Modern utility functions for enhanced UX
 */

// ============================================
// THEME MANAGEMENT
// ============================================

class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateToggleButton();
    }

    toggle() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        this.updateToggleButton();
    }

    updateToggleButton() {
        const button = document.getElementById('theme-toggle');
        if (button) {
            button.textContent = this.theme === 'light' ? '🌙' : '☀️';
            button.setAttribute('aria-label', `Switch to ${this.theme === 'light' ? 'dark' : 'light'} mode`);
        }
    }
}

// ============================================
// LOADING OVERLAY
// ============================================

class LoadingOverlay {
    constructor() {
        this.overlay = null;
        this.createOverlay();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'loader-overlay';
        this.overlay.innerHTML = `
            <div class="loader-content">
                <div class="spinner spinner-lg"></div>
                <div class="loader-text">
                    <h3>Processing...</h3>
                    <p id="loader-message">Please wait while we analyze your data</p>
                </div>
                <div class="progress-bar" style="width: 300px; margin-top: 20px;">
                    <div class="progress-bar-fill" id="loading-progress" style="width: 0%"></div>
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);
    }

    show(message = 'Processing...') {
        if (this.overlay) {
            const messageEl = this.overlay.querySelector('#loader-message');
            if (messageEl) messageEl.textContent = message;
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
            this.setProgress(0);
        }
    }

    setProgress(percent) {
        const progressBar = document.getElementById('loading-progress');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
    }

    updateMessage(message) {
        const messageEl = this.overlay.querySelector('#loader-message');
        if (messageEl) messageEl.textContent = message;
    }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

class ToastNotification {
    constructor() {
        this.container = null;
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <span class="alert-icon">${icons[type] || icons.info}</span>
            <div class="alert-content">
                <div class="alert-title">${this.getTitle(type)}</div>
                <div>${message}</div>
            </div>
        `;

        this.container.appendChild(toast);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        return toast;
    }

    getTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };
        return titles[type] || titles.info;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// ============================================
// FILE UPLOAD WITH DRAG & DROP
// ============================================

class FileUploader {
    constructor(elementId, options = {}) {
        this.element = document.getElementById(elementId);
        this.options = {
            maxSize: options.maxSize || 50 * 1024 * 1024, // 50MB default
            allowedTypes: options.allowedTypes || ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/avi', 'video/mov'],
            onSelect: options.onSelect || null,
            previewContainer: options.previewContainer || null
        };

        if (this.element) {
            this.init();
        }
    }

    init() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.element.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop area when dragging over
        ['dragenter', 'dragover'].forEach(eventName => {
            this.element.addEventListener(eventName, () => {
                this.element.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.element.addEventListener(eventName, () => {
                this.element.classList.remove('drag-over');
            }, false);
        });

        // Handle dropped files
        this.element.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        }, false);

        // Handle click to upload
        this.element.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = this.options.allowedTypes.join(',');
            input.onchange = (e) => this.handleFiles(e.target.files);
            input.click();
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFiles(files) {
        if (files.length === 0) return;

        const file = files[0];

        // Validate file
        if (!this.validateFile(file)) return;

        // Show preview
        if (this.options.previewContainer) {
            this.showPreview(file);
        }

        // Call callback
        if (this.options.onSelect) {
            this.options.onSelect(file);
        }
    }

    validateFile(file) {
        // Check file type
        if (!this.options.allowedTypes.includes(file.type)) {
            toast.error(`File type not allowed. Please upload: ${this.options.allowedTypes.join(', ')}`);
            return false;
        }

        // Check file size
        if (file.size > this.options.maxSize) {
            toast.error(`File too large. Maximum size: ${this.formatBytes(this.options.maxSize)}`);
            return false;
        }

        return true;
    }

    showPreview(file) {
        const container = document.getElementById(this.options.previewContainer);
        if (!container) return;

        const preview = document.createElement('div');
        preview.className = 'file-preview';

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.className = 'file-preview-image';
            img.file = file;

            const reader = new FileReader();
            reader.onload = (e) => img.src = e.target.result;
            reader.readAsDataURL(file);

            preview.appendChild(img);
        }

        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <div>
                <strong>${file.name}</strong><br>
                <small>${this.formatBytes(file.size)}</small>
            </div>
            <button type="button" class="btn btn-sm btn-outline" onclick="this.closest('.file-preview').remove()">
                Remove
            </button>
        `;

        preview.appendChild(fileInfo);
        container.innerHTML = '';
        container.appendChild(preview);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// ============================================
// FORM VALIDATION
// ============================================

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validate()) {
                e.preventDefault();
                return false;
            }
        });

        // Real-time validation
        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
        });
    }

    validate() {
        let isValid = true;
        const fields = this.form.querySelectorAll('input[required], select[required], textarea[required]');

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        // Check if required
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'This field is required';
        }

        // Check email format
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }

        // Check number range
        if (field.type === 'number' && value) {
            const min = field.getAttribute('min');
            const max = field.getAttribute('max');
            const numValue = parseFloat(value);

            if (min && numValue < parseFloat(min)) {
                isValid = false;
                message = `Value must be at least ${min}`;
            }
            if (max && numValue > parseFloat(max)) {
                isValid = false;
                message = `Value must not exceed ${max}`;
            }
        }

        // Update UI
        this.updateFieldValidation(field, isValid, message);
        return isValid;
    }

    updateFieldValidation(field, isValid, message) {
        const wrapper = field.closest('.form-group');
        if (!wrapper) return;

        // Remove existing error message
        const existingError = wrapper.querySelector('.error-message');
        if (existingError) existingError.remove();

        if (!isValid) {
            field.style.borderColor = 'var(--error)';
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.style.color = 'var(--error)';
            errorMsg.style.fontSize = 'var(--text-sm)';
            errorMsg.style.marginTop = 'var(--space-1)';
            errorMsg.textContent = message;
            wrapper.appendChild(errorMsg);
        } else {
            field.style.borderColor = '';
        }
    }
}

// ============================================
// TAB MANAGEMENT
// ============================================

class TabManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (this.container) {
            this.init();
        }
    }

    init() {
        const tabs = this.container.querySelectorAll('.tab-button');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
        });
    }

    switchTab(tabId) {
        // Deactivate all tabs and contents
        this.container.querySelectorAll('.tab-button').forEach(tab => {
            tab.classList.remove('active');
        });
        this.container.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Activate selected tab
        const selectedTab = this.container.querySelector(`[data-tab="${tabId}"]`);
        const selectedContent = this.container.querySelector(`#${tabId}`);

        if (selectedTab) selectedTab.classList.add('active');
        if (selectedContent) selectedContent.classList.add('active');
    }
}

// ============================================
// SMOOTH SCROLL
// ============================================

function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// ANIMATION ON SCROLL
// ============================================

class ScrollAnimator {
    constructor() {
        this.elements = document.querySelectorAll('[data-animate]');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fade-in-up');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });

            this.elements.forEach(el => observer.observe(el));
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            this.elements.forEach(el => el.classList.add('animate-fade-in-up'));
        }
    }
}

// ============================================
// INITIALIZE ON DOM LOAD
// ============================================

// Global instances
let theme, loader, toast, scrollAnimator;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize utilities
    theme = new ThemeManager();
    loader = new LoadingOverlay();
    toast = new ToastNotification();
    scrollAnimator = new ScrollAnimator();

    // Smooth scroll
    smoothScroll();

    // Add theme toggle button if it exists
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => theme.toggle());
    }
});

// Export for use in other scripts
window.Wellnix = {
    ThemeManager,
    LoadingOverlay,
    ToastNotification,
    FileUploader,
    FormValidator,
    TabManager,
    ScrollAnimator,
    // Expose global instances
    theme: () => theme,
    loader: () => loader,
    toast: () => toast
};
