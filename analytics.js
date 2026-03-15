
// Analytics tracking functions

// Track portfolio clicks
function trackPortfolioClick(category) {
    const data = {
        type: 'portfolio_click',
        timestamp: new Date().toISOString(),
        category: category,
        page: window.location.pathname,
        userAgent: navigator.userAgent
    };

    // Send to Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'portfolio_click', {
            'category': category,
            'page_title': document.title
        });
    }

    // Send to Google Sheets via Apps Script
    fetch('https://script.google.com/macros/s/AKfycbxqSOHruVvDLfzaawj-dEBhcngwOosPnK7U7qK1wMNvn0g1AvYg2Cau9Rxc6X_RfzA/exec', {
        method: 'POST',
        body: JSON.stringify(data)
    }).catch(error => {
        console.log('Analytics error:', error);
    });
}

// Track service interest
function trackServiceInterest(service) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'service_interest', {
            'service_type': service
        });
    }
}

// Initialize analytics tracking
document.addEventListener('DOMContentLoaded', function() {
    // Track portfolio item clicks
    document.querySelectorAll('.portfolio-item').forEach(item => {
        item.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            if (category) {
                trackPortfolioClick(category);
            }
        });
    });

    // Track service link clicks
    document.querySelectorAll('.service-link').forEach(link => {
        link.addEventListener('click', function() {
            const href = this.getAttribute('href');
            if (href && href.includes('#')) {
                const service = href.split('#')[1];
                trackServiceInterest(service);
            }
        });
    });
});
