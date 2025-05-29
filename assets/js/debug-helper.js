/**
 * Debug helper functions for admin panel
 * This script helps identify issues with loading and initialization
 */

// Global debugging object
window.debugInfo = {
    loadStart: Date.now(),
    events: [],
    errors: []
};

// Log debugging events
function logDebugEvent(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const event = {
        timestamp,
        message,
        type,
        timeSinceStart: Date.now() - window.debugInfo.loadStart
    };
    
    window.debugInfo.events.push(event);
    console.log(`[${type.toUpperCase()}] ${message} (${event.timeSinceStart}ms)`);
    
    // If this is running on a real page, log to error log if it exists
    if (typeof addErrorLog === 'function') {
        addErrorLog(`[Debug] ${message}`, type);
    }
}

// Track loading spinner state
function trackSpinnerState() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (!loadingSpinner) {
        logDebugEvent('Loading spinner element not found!', 'error');
        return;
    }
    
    // Log initial state
    const isActive = loadingSpinner.classList.contains('active');
    logDebugEvent(`Initial spinner state: ${isActive ? 'ACTIVE' : 'HIDDEN'}`);
    
    // Create observer to monitor changes to the loading spinner
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const isNowActive = loadingSpinner.classList.contains('active');
                logDebugEvent(`Spinner state changed to: ${isNowActive ? 'ACTIVE' : 'HIDDEN'}`);
            }
        });
    });
    
    // Start observing
    observer.observe(loadingSpinner, { attributes: true });
    
    return observer;
}

// Monitor Promise completions
function monitorPromises() {
    // Save original Promise methods
    const originalThen = Promise.prototype.then;
    const originalCatch = Promise.prototype.catch;
    
    // Override then method to track promise completions
    Promise.prototype.then = function(onFulfilled, onRejected) {
        return originalThen.call(
            this,
            (value) => {
                if (onFulfilled && onFulfilled.name) {
                    logDebugEvent(`Promise resolved: ${onFulfilled.name}`);
                } else {
                    logDebugEvent('Anonymous promise resolved');
                }
                return onFulfilled ? onFulfilled(value) : value;
            },
            (reason) => {
                if (onRejected) {
                    logDebugEvent(`Promise rejected and handled: ${reason}`, 'warning');
                    return onRejected(reason);
                }
                return originalCatch.call(this, reason);
            }
        );
    };
}

// Monitor for uncaught errors
window.addEventListener('error', (event) => {
    logDebugEvent(`Uncaught error: ${event.message}`, 'error');
    window.debugInfo.errors.push({
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Initialize debugging when page loads
document.addEventListener('DOMContentLoaded', () => {
    logDebugEvent('DOM Content Loaded');
    trackSpinnerState();
    monitorPromises();
    
    // Force hide spinner after timeout (safety measure)
    setTimeout(() => {
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner && loadingSpinner.classList.contains('active')) {
            logDebugEvent('Forcing spinner hide after timeout', 'warning');
            loadingSpinner.classList.remove('active');
        }
    }, 10000); // 10 second safety timeout
});

// Export debug functions
window.debugHelper = {
    logEvent: logDebugEvent,
    getInfo: () => window.debugInfo
};
