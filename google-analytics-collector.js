
/**
 * Google Analytics Data Collector
 * Connects to GA4 API and collects website statistics
 */

class GoogleAnalyticsCollector {
    constructor(propertyId, credentials) {
        this.propertyId = propertyId;
        this.credentials = credentials;
        this.baseUrl = 'https://analyticsdata.googleapis.com/v1beta';
    }

    async getAccessToken() {
        // This would typically use service account credentials
        // For now, return a placeholder - you'll need to implement OAuth2 flow
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
        // This function sends data to Google Sheets
        const sheetsUrl = https://script.google.com/macros/s/AKfycbxqSOHruVvDLfzaawj-dEBhcngwOosPnK7U7qK1wMNvn0g1AvYg2Cau9Rxc6X_RfzA/exec;
        
        try {
            const response = await fetch(sheetsUrl, {
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

// Main function as requested
async function collectWebsiteData() {
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
        console.error('Error in collectWebsiteData:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { collectWebsiteData, GoogleAnalyticsCollector };
} else {
    window.collectWebsiteData = collectWebsiteData;
    window.GoogleAnalyticsCollector = GoogleAnalyticsCollector;
}
