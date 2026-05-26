/**
 * tGS Studios - Main Application Entry Point
 * 
 * This module consolidates and orchestrates all application functionality:
 * - Business data & UI interactions (theme, menu, animations)
 * - Real-time analytics event tracking
 * - GA4 data collection & Google Sheets sync
 * - Automated data collection scheduling
 * 
 * Load this single file in your HTML instead of multiple script tags:
 * <script src="main.js" defer></script>
 */

// ============================================================================
// MODULE LOADER WITH DEPENDENCY MANAGEMENT
// ============================================================================

const TGSApp = {
    // Configuration
    config: {
        debug: true, // Set to false in production
        analyticsEnabled: true,
        schedulerEnabled: true
    },

    // Module registry
    modules: {},

    /**
     * Register a module for loading
     * @param {string} name - Module name
     * @param {function} initFunction - Module initialization function
     */
    register(name, initFunction) {
        this.modules[name] = initFunction;
        if (this.config.debug) {
            console.log(`✓ Module registered: ${name}`);
        }
    },

    /**
     * Initialize all registered modules
     */
    init() {
        console.log('🚀 TGS Studios App Starting...\n');
        
        // Load modules in dependency order
        const loadOrder = [
            'businessData',
            'analytics',
            'scheduler'
        ];

        loadOrder.forEach(moduleName => {
            if (this.modules[moduleName]) {
                try {
                    this.modules[moduleName]();
                    if (this.config.debug) {
                        console.log(`✓ Module initialized: ${moduleName}`);
                    }
                } catch (error) {
                    console.error(`✗ Error initializing ${moduleName}:`, error);
                }
            }
        });

        console.log('\n✅ TGS Studios App Ready\n');
    }
};

// ============================================================================
// MODULE 1: BUSINESS DATA & UI INTERACTIONS
// ============================================================================

TGSApp.register('businessData', function() {
    const TGSCreative = {
        contactEmail: 'info@tgsstudios.com',
        website: 'https://tgsstudios.co.uk',
        linkedin: 'https://www.linkedin.com/company/118834600',
        formspree: 'https://formspree.io/f/mykvbdzp',
        regions: ['United Kingdom', 'West Africa', 'United States'],
        brands: [
            {
                name: 'tGS Creative',
                summary: 'Strategy, management, media production, and brand architecture for expertise that deserves reach.'
            },
            {
                name: 'WYA',
                summary: 'Wear Your Ambition — a fashion label built around execution, authenticity, and standard.'
            }
        ]
    };

    (() => {
        const root = document.documentElement;
        const themeToggle = document.querySelector('[data-theme-toggle]');
        const menuToggle = document.querySelector('[data-menu-toggle]');
        const nav = document.querySelector('[data-site-nav]');
        const currentYear = new Date().getFullYear();
        const yearNodes = document.querySelectorAll('[data-year]');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

        // Update year in footer
        yearNodes.forEach(node => {
            node.textContent = currentYear;
        });

        // Theme toggle functionality
        if (themeToggle) {
            const syncLabel = () => {
                const isDark = root.getAttribute('data-theme') === 'dark';
                themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
                themeToggle.innerHTML = isDark
                    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M17.36 17.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M17.36 6.64l1.42-1.42"></path></svg>'
                    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3c0 .29.02.58.05.87A7 7 0 0 0 21 12.79z"></path></svg>';
            };
            syncLabel();
            themeToggle.addEventListener('click', () => {
                const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                root.setAttribute('data-theme', next);
                syncLabel();
            });
        }

        // Menu toggle functionality
        if (menuToggle && nav) {
            menuToggle.addEventListener('click', () => {
                const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
                menuToggle.setAttribute('aria-expanded', String(!expanded));
                nav.classList.toggle('is-open');
            });
            nav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    nav.classList.remove('is-open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }

        // Scroll-triggered reveal animations
        const reveals = document.querySelectorAll('.reveal');
        if ('IntersectionObserver' in window && reveals.length) {
            const io = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.14 });
            reveals.forEach(el => io.observe(el));
        } else {
            reveals.forEach(el => el.classList.add('is-visible'));
        }

        // Make business data globally available
        window.TGSCreative = TGSCreative;
    })();
});

// ============================================================================
// MODULE 2: ANALYTICS - REAL-TIME EVENT TRACKING & GA4 DATA COLLECTION
// ============================================================================

TGSApp.register('analytics', function() {
    // ========================================================================
    // REAL-TIME EVENT TRACKING
    // ========================================================================

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

        // Send to Google Sheets
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
            console.error('Analytics error:', error);
        });
    }

    /**
     * Initialize real-time event tracking
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

    // ========================================================================
    // GA4 DATA COLLECTION & REPORTING
    // ========================================================================

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

        async getAccessToken() {
            // Placeholder - implement OAuth2 flow with service account
            return 'YOUR_ACCESS_TOKEN';
        }

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
     */
    async function collectAndSyncAnalyticsData() {
        try {
            const collector = new GoogleAnalyticsCollector(
                'YOUR_GA4_PROPERTY_ID',
                'YOUR_SERVICE_ACCOUNT_CREDENTIALS'
            );

            console.log('📊 Collecting website data from Google Analytics...');
            
            const analyticsData = await collector.collectWebsiteData('7daysAgo', 'today');
            console.log('✓ Data collected:', analyticsData);
            
            const updateResult = await collector.updateGoogleSheets(analyticsData);
            console.log('✓ Google Sheets updated successfully:', updateResult);
            
            return {
                success: true,
                data: analyticsData,
                sheetsUpdate: updateResult
            };

        } catch (error) {
            console.error('✗ Error in analytics sync:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Initialize event tracking when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEventTracking);
    } else {
        initializeEventTracking();
    }

    // Make functions globally available
    window.trackPortfolioClick = trackPortfolioClick;
    window.trackServiceInterest = trackServiceInterest;
    window.GoogleAnalyticsCollector = GoogleAnalyticsCollector;
    window.collectAndSyncAnalyticsData = collectAndSyncAnalyticsData;
});

// ============================================================================
// MODULE 3: DATA COLLECTION SCHEDULER
// ============================================================================

TGSApp.register('scheduler', function() {
    /**
     * Data Collection Scheduler
     * Automates the collection of website analytics data
     */
    class DataCollectionScheduler {
        constructor() {
            this.intervals = new Map();
            this.isRunning = false;
        }

        /**
         * Schedule daily data collection
         * @param {string} timeOfDay - Time in HH:MM format (default: '09:00')
         */
        scheduleDailyCollection(timeOfDay = '09:00') {
            const now = new Date();
            const [hours, minutes] = timeOfDay.split(':').map(Number);
            
            const scheduledTime = new Date(now);
            scheduledTime.setHours(hours, minutes, 0, 0);
            
            // If the time has passed today, schedule for tomorrow
            if (scheduledTime <= now) {
                scheduledTime.setDate(scheduledTime.getDate() + 1);
            }
            
            const msUntilFirst = scheduledTime.getTime() - now.getTime();
            const msPerDay = 24 * 60 * 60 * 1000;
            
            setTimeout(() => {
                this.runDataCollection();
                
                const dailyInterval = setInterval(() => {
                    this.runDataCollection();
                }, msPerDay);
                
                this.intervals.set('daily', dailyInterval);
            }, msUntilFirst);
            
            console.log(`⏰ Daily data collection scheduled for ${timeOfDay}`);
        }

        /**
         * Schedule hourly data collection for real-time monitoring
         */
        scheduleHourlyCollection() {
            const hourlyInterval = setInterval(() => {
                this.runDataCollection('1hour');
            }, 60 * 60 * 1000);
            
            this.intervals.set('hourly', hourlyInterval);
            console.log('⏰ Hourly data collection scheduled');
        }

        /**
         * Run data collection
         * @param {string} timeRange - Time range identifier
         */
        async runDataCollection(timeRange = '1day') {
            try {
                if (typeof window.collectAndSyncAnalyticsData !== 'function') {
                    console.warn('⚠️ Analytics module not loaded');
                    return;
                }

                console.log(`📤 Running data collection for ${timeRange}...`);
                
                const result = await window.collectAndSyncAnalyticsData();
                
                if (result.success) {
                    console.log('✓ Scheduled data collection completed successfully');
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'data_collection', {
                            'custom_parameter': timeRange,
                            'status': 'success'
                        });
                    }
                } else {
                    console.error('✗ Scheduled data collection failed:', result.error);
                }
                
            } catch (error) {
                console.error('✗ Error in scheduled data collection:', error);
            }
        }

        /**
         * Start the scheduler
         */
        start() {
            if (this.isRunning) {
                console.log('⚠️ Scheduler is already running');
                return;
            }
            
            this.isRunning = true;
            this.scheduleDailyCollection('09:00');
            this.scheduleHourlyCollection();
            
            console.log('▶️ Data collection scheduler started');
        }

        /**
         * Stop the scheduler
         */
        stop() {
            this.intervals.forEach((interval, name) => {
                clearInterval(interval);
                console.log(`⏹️ Stopped ${name} collection`);
            });
            
            this.intervals.clear();
            this.isRunning = false;
            console.log('⏹️ Data collection scheduler stopped');
        }
    }

    // Initialize scheduler only on main page to avoid multiple instances
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        const scheduler = new DataCollectionScheduler();
        scheduler.start();
        window.dataScheduler = scheduler;
    }

    // Make scheduler globally available
    window.DataCollectionScheduler = DataCollectionScheduler;
});

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TGSApp.init());
} else {
    TGSApp.init();
}

// Make app object globally available for debugging
window.TGSApp = TGSApp;
