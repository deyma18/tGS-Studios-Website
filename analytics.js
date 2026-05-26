
/**
 * tGS Studios - Unified Analytics Module
 * Combines real-time event tracking with GA4 data collection
 * 
 * Features:
 * - Real-time user interaction tracking (portfolio clicks, service interest)
 * - Google Analytics 4 integration
 * - GA4 API data collection and reporting
 * - Automatic sync to Google Sheets
 */

// ============================================================================
// REAL-TIME EVENT TRACKING
// ============================================================================

/**
 * Track portfolio clicks
 * @param {string} category - The portfolio category being clicked
 */
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
    sendToGoogleSheets(data);
}

/**
 * Track service interest
 * @param {string} service - The service type being viewed
 */
function trackServiceInterest(service) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'service_interest', {
            'service_type': service
        });
    }
}

/**
 * Send event data to Google Sheets
 * @param {object} data - The data object to send
 */
function sendToGoogleSheets(data) {
    const sheetsUrl = 'https://script.google.com/macros/s/AKfycbxqSOHruVvDLfzaawj-dEBhcngwOosPnK7U7qK1wMNvn0g1AvYg2Cau9Rxc6X_RfzA/exec';
    
    fetch(sheetsUrl, {
        method: 'POST',
        body: JSON.stringify(data)
    }).catch(error => {
        console.log('Analytics error:', error);
    });
}

/**
 * Initialize real-time event tracking on page load
 */
function initializeEventTracking() {
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
}

// ============================================================================
// GA4 DATA COLLECTION & REPORTING
// ============================================================================

/**
 * Google Analytics Data Collector
 * Connects to GA4 API and collects website statistics
 */
class GoogleAnalyticsCollector {
    constructor(propertyId, credentials) {
        this.propertyId = propertyId;
        this.credentials = credentials;
        this.baseUrl = 'https://analyticsdata.googleapis.com/v1beta';
        this.sheetsUrl = 'https://script.google.com/macros/s/AKfycbxqSOHruVvDLfzaawj-dEBhcngwOosPnK7U7qK1wMNvn0g1AvYg2Cau9Rxc6X_RfzA/exec';
    }

    /**
     * Get access token for GA4 API
     * @returns {Promise<string>} Access token
     */
    async getAccessToken() {
        // This would typically use service account credentials
        // For now, return a placeholder - you'll need to implement OAuth2 flow
        return 'YOUR_ACCESS_TOKEN';
    }

    /**
     * Collect website data from GA4 API
     * @param {string} startDate - Start date (e.g., '7daysAgo', 'today')
     * @param {string} endDate - End date (e.g., 'today')
     * @returns {Promise<object>} Formatted analytics data
     */
    async collectWebsiteData(startDate = '7daysAgo', endDate = 'today') {
        try {
            const accessToken = await this.getAccessToken();
            
            const requestBody = {
                property: `properties/${this.propertyId}`,
                dateRanges: [{
                    startDate: startDate,
                    endDate: endDate
                }],
                metrics: [
                    { name: 'sessions' },
                    { name: 'users' },
                    { name: 'pageviews' },
                    { name: 'bounceRate' },
                    { name: 'averageSessionDuration' },
                    { name: 'newUsers' }
                ],
                dimensions: [
                    { name: 'date' },
                    { name: 'pagePath' },
                    { name: 'deviceCategory' },
                    { name: 'trafficSource' }
                ]
            };

            const response = await fetch(`${this.baseUrl}/properties/${this.propertyId}:runReport`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`GA API Error: ${response.status}`);
            }

            const data = await response.json();
            return this.formatAnalyticsData(data);

        } catch (error) {
            console.error('Error collecting website data:', error);
            throw error;
        }
    }

    /**
     * Format raw GA4 API data into structured format
     * @param {object} rawData - Raw data from GA4 API
     * @returns {object} Formatted analytics data
     */
    formatAnalyticsData(rawData) {
        const formattedData = {
            summary: {},
            dailyStats: [],
            pageStats: [],
            deviceStats: [],
            trafficSources: []
        };

        if (rawData.rows) {
            rawData.rows.forEach(row => {
                const date = row.dimensionValues[0].value;
                const pagePath = row.dimensionValues[1].value;
                const deviceCategory = row.dimensionValues[2].value;
                const trafficSource = row.dimensionValues[3].value;

                const metrics = {
                    sessions: parseInt(row.metricValues[0].value),
                    users: parseInt(row.metricValues[1].value),
                    pageviews: parseInt(row.metricValues[2].value),
                    bounceRate: parseFloat(row.metricValues[3].value),
                    avgSessionDuration: parseFloat(row.metricValues[4].value),
                    newUsers: parseInt(row.metricValues[5].value)
                };

                formattedData.dailyStats.push({
                    date,
                    pagePath,
                    deviceCategory,
                    trafficSource,
                    ...metrics
                });
            });
        }

        return formattedData;
    }

    /**
     * Update Google Sheets with analytics data
     * @param {object} data - Analytics data to send
     * @returns {Promise<object>} Response from Google Sheets
     */
    async updateGoogleSheets(data) {
        try {
            const response = await fetch(this.sheetsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'updateAnalytics',
                    data: data,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`Sheets API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating Google Sheets:', error);
            throw error;
        }
    }
}

/**
 * Main function to collect and sync analytics data
 * @returns {Promise<object>} Collection result with success status
 */
async function collectAndSyncAnalyticsData() {
    try {
        // Initialize the collector with your GA4 property ID
        const collector = new GoogleAnalyticsCollector(
            'YOUR_GA4_PROPERTY_ID',
            'YOUR_SERVICE_ACCOUNT_CREDENTIALS'
        );

        console.log('Collecting website data from Google Analytics...');
        
        // Collect daily statistics for the last 7 days
        const analyticsData = await collector.collectWebsiteData('7daysAgo', 'today');
        
        console.log('Data collected:', analyticsData);
        
        // Update Google Sheets with the collected data
        const updateResult = await collector.updateGoogleSheets(analyticsData);
        
        console.log('Google Sheets updated successfully:', updateResult);
        
        return {
            success: true,
            data: analyticsData,
            sheetsUpdate: updateResult
        };

    } catch (error) {
        console.error('Error in analytics sync:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize event tracking when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeEventTracking();
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Real-time tracking
        trackPortfolioClick,
        trackServiceInterest,
        initializeEventTracking,
        // GA4 collection
        GoogleAnalyticsCollector,
        collectAndSyncAnalyticsData
    };
} else {
    // Make functions available globally for browser use
    window.trackPortfolioClick = trackPortfolioClick;
    window.trackServiceInterest = trackServiceInterest;
    window.GoogleAnalyticsCollector = GoogleAnalyticsCollector;
    window.collectAndSyncAnalyticsData = collectAndSyncAnalyticsData;
}
