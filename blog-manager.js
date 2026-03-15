
// Blog Content Management System
class BlogManager {
    constructor() {
        this.blogPosts = [
            {
                id: 1,
                title: "Mastering Portrait Photography: Tips for Stunning Results",
                excerpt: "Learn the essential techniques for capturing compelling portraits that tell a story and connect with your audience.",
                content: `
                    <h3>Understanding Light and Shadow</h3>
                    <p>The key to exceptional portrait photography lies in understanding how light interacts with your subject. Natural light provides the most flattering results, especially during golden hour.</p>
                    
                    <h3>Composition Techniques</h3>
                    <p>Use the rule of thirds to create dynamic compositions. Position your subject's eyes along the upper third line for maximum impact.</p>
                    
                    <h3>Building Rapport</h3>
                    <p>The best portraits capture genuine emotion. Take time to connect with your subject and make them feel comfortable in front of the camera.</p>
                `,
                date: "2025-01-15",
                image: "images/portfolio/N_MG_0942_1751928700191.jpg",
                category: "portrait"
            },
            {
                id: 2,
                title: "Wedding Photography: Capturing Your Special Day",
                excerpt: "Essential tips for documenting one of life's most important moments with style and elegance.",
                content: `
                    <h3>Pre-Wedding Preparation</h3>
                    <p>Successful wedding photography starts with thorough preparation. Meet with the couple beforehand to understand their vision and timeline.</p>
                    
                    <h3>Key Moments to Capture</h3>
                    <p>Focus on the emotional moments: the first look, exchanging vows, and candid interactions between guests.</p>
                    
                    <h3>Working with Natural Light</h3>
                    <p>Utilize available light sources creatively. Churches and venues often have beautiful architectural lighting that can enhance your shots.</p>
                `,
                date: "2025-01-10",
                image: "images/portfolio/_MG_1443-36_1751928700191.jpg",
                category: "wedding"
            },
            {
                id: 3,
                title: "Event Photography: Telling Stories Through Images",
                excerpt: "How to capture the energy and emotion of live events while staying professional and unobtrusive.",
                content: `
                    <h3>Equipment Essentials</h3>
                    <p>Fast lenses and high ISO performance are crucial for event photography. Be prepared for varying lighting conditions.</p>
                    
                    <h3>Staying Invisible</h3>
                    <p>The best event photographers blend into the background while capturing authentic moments and interactions.</p>
                    
                    <h3>Post-Processing Tips</h3>
                    <p>Develop a consistent editing style that enhances the mood of the event without over-processing the images.</p>
                `,
                date: "2025-01-05",
                image: "images/portfolio/_MG_2758_1751928700191.jpg",
                category: "event"
            }
        ];
        
        this.init();
    }

    init() {
        this.loadBlogPosts();
        this.setupEventListeners();
    }

    loadBlogPosts() {
        const container = document.getElementById('blog-posts');
        if (!container) return;

        container.innerHTML = this.blogPosts.map(post => `
            <article class="blog-post" data-id="${post.id}">
                <div class="post-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                </div>
                <div class="post-content">
                    <h3>${post.title}</h3>
                    <p class="post-date">${this.formatDate(post.date)}</p>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <a href="#" class="read-more" data-post-id="${post.id}">Read More</a>
                </div>
            </article>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('read-more')) {
                e.preventDefault();
                const postId = parseInt(e.target.dataset.postId);
                this.showFullPost(postId);
            }
        });
    }

    showFullPost(postId) {
        const post = this.blogPosts.find(p => p.id === postId);
        if (!post) return;

        const modal = document.createElement('div');
        modal.className = 'blog-modal';
        modal.innerHTML = `
            <div class="blog-modal-content">
                <button class="close-modal">&times;</button>
                <img src="${post.image}" alt="${post.title}" class="modal-image">
                <h2>${post.title}</h2>
                <p class="modal-date">${this.formatDate(post.date)}</p>
                <div class="modal-content">${post.content}</div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Close modal functionality
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Method to add new blog posts (for future content management)
    addPost(postData) {
        const newPost = {
            id: Math.max(...this.blogPosts.map(p => p.id)) + 1,
            ...postData,
            date: new Date().toISOString().split('T')[0]
        };
        
        this.blogPosts.unshift(newPost);
        this.loadBlogPosts();
    }
}

// Initialize blog manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
});
