
/**
 * Data Collection Scheduler
 * Automates the collection of website analytics data
 */

class DataCollectionScheduler {
    constructor() {
        this.intervals = new Map();
        this.isRunning = false;
    }

    // Schedule daily data collection
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
        
        // Set timeout for first execution
        setTimeout(() => {
            this.runDataCollection();
            
            // Then run every 24 hours
            const dailyInterval = setInterval(() => {
                this.runDataCollection();
            }, msPerDay);
            
            this.intervals.set('daily', dailyInterval);
        }, msUntilFirst);
        
        console.log(`Daily data collection scheduled for ${timeOfDay}`);
    }

    // Schedule hourly data collection for real-time monitoring
    scheduleHourlyCollection() {
        const hourlyInterval = setInterval(() => {
            this.runDataCollection('1hour');
        }, 60 * 60 * 1000); // Every hour
        
        this.intervals.set('hourly', hourlyInterval);
        console.log('Hourly data collection scheduled');
    }

    async runDataCollection(timeRange = '1day') {
        try {
            console.log(`Running data collection for ${timeRange}...`);
            
            // Call the main collection function
            const result = await collectWebsiteData();
            
            if (result.success) {
                console.log('Scheduled data collection completed successfully');
                
                // Log to analytics for tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'data_collection', {
                        'custom_parameter': timeRange,
                        'status': 'success'
                    });
                }
            } else {
                console.error('Scheduled data collection failed:', result.error);
            }
            
        } catch (error) {
            console.error('Error in scheduled data collection:', error);
        }
    }

    // Start the scheduler
    start() {
        if (this.isRunning) {
            console.log('Scheduler is already running');
            return;
        }
        
        this.isRunning = true;
        this.scheduleDailyCollection('09:00'); // 9 AM daily
        this.scheduleHourlyCollection(); // Every hour for real-time data
        
        console.log('Data collection scheduler started');
    }

    // Stop the scheduler
    stop() {
        this.intervals.forEach((interval, name) => {
            clearInterval(interval);
            console.log(`Stopped ${name} collection`);
        });
        
        this.intervals.clear();
        this.isRunning = false;
        console.log('Data collection scheduler stopped');
    }
}

// Initialize scheduler when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only run scheduler on the main page to avoid multiple instances
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        const scheduler = new DataCollectionScheduler();
        
        // Start scheduler automatically
        scheduler.start();
        
        // Make scheduler available globally for manual control
        window.dataScheduler = scheduler;
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataCollectionScheduler;
} else {
    window.DataCollectionScheduler = DataCollectionScheduler;
}
