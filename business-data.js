
// Business information and configuration data
const businessData = {
    company: {
        name: "tGS Studios",
        tagline: "Professional Photography in Salford",
        description: "Capturing moments that matter - Events, Portraits, Commercial & Documentary",
        location: "Salford, Greater Manchester",
        email: "info@tgsstudios.com",
        phone: "",
        website: "https://tgsstudios.com"
    },
    
    services: [
        {
            id: "events",
            name: "Event Photography",
            description: "Weddings, graduations, corporate events",
            features: [
                "Full event coverage",
                "High-resolution edited photos", 
                "Online gallery delivery",
                "Print options available"
            ],
            startingPrice: "Contact for quote"
        },
        {
            id: "portraits",
            name: "Portrait Sessions", 
            description: "Professional headshots, lifestyle portraits",
            features: [
                "Studio or location shoots",
                "Professional retouching",
                "Multiple outfit changes", 
                "Same-day previews"
            ],
            startingPrice: "£150"
        },
        {
            id: "commercial",
            name: "Commercial Photography",
            description: "Product shots, business content",
            features: [
                "Product catalog shoots",
                "Brand photography",
                "Corporate headshots",
                "Marketing materials"
            ],
            startingPrice: "£200"
        }
    ],
    
    social: {
        instagram: "",
        facebook: "",
        twitter: "",
        linkedin: ""
    },
    
    booking: {
        calendlyUrl: "https://app.simplymeet.me/tgsstudios?is_widget=1&view=",
        mailchimpAction: "https://your-mailchimp-url.com/subscribe/post?u=YOUR_USER_ID&id=YOUR_LIST_ID"
    },
    
    seo: {
        keywords: [
            "photography",
            "photographer", 
            "Salford",
            "Greater Manchester",
            "wedding photography",
            "portrait photography",
            "commercial photography",
            "event photography"
        ],
        defaultTitle: "tGS Studios - Professional Photography in Salford",
        defaultDescription: "Professional photography services in Salford, Greater Manchester. Specializing in events, portraits, and commercial photography."
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = businessData;
} else {
    window.businessData = businessData;
}
