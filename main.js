// Enhanced Image Carousel with Auto-Detection and Preloading
class ImageCarousel {
    constructor(container, folderPath, autoPlay = true, interval = 4000) {
        this.container = container;
        this.folderPath = folderPath;
        this.images = [];
        this.currentIndex = 0;
        this.autoPlay = autoPlay;
        this.interval = interval;
        this.isPlaying = false;
        this.autoPlayTimer = null;
        this.supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        this.preloadedImages = new Map();

        this.init();
    }

    async init() {
        await this.detectImages();
        if (this.images.length > 0) {
            this.createCarouselHTML();
            this.bindEvents();
            if (this.autoPlay) {
                this.startAutoPlay();
            }
        }
    }

    async detectImages() {
        try {
            // Predefined image lists for security with optimized loading
            const imageSets = {
                'images/hero': [
                    'hero-main1.jpg', 'hero-main2.jpg', 'hero-main3.jpg'
                ],
                'images/about': [
                    'about-hero1.jpg', 'about-hero2.jpg', 'about-hero3.jpg',
                    'about-hero4.jpg', 'about-hero5.jpg'
                ],
                'images/portfolio': [
                    '_MG_0685-28_1751928700191.jpg', '_MG_0701-42_1751928700191.jpg',
                    '_MG_1443-36_1751928700191.jpg', '_MG_1803-7-min_1751928700191.jpg',
                    '_MG_1829-24-min_1751928700191.jpg', '_MG_2758_1751928700191.JPG',
                    '_MG_3283_1751928700191.JPG', '_MG_4252_1751928700191.JPG',
                    '_MG_6107-429_1751928700191.jpg', '_MG_6126-444_1751928700191.jpg',
                    '_MG_8312_1751928700191.JPG', '4new_1751928700191.jpg',
                    'N_MG_0913_1751928700191.jpg', 'N_MG_0942_1751928700191.jpg',
                    'N_MG_1113_1751928700192.jpg', 'N_MG_1247_1751928700192.jpg',
                    'check_MG_8051_1751928700191.jpg', 'check_MG_8088_1751928700191.jpg',
                    'checkb&w_MG_8043_1751928700191.jpg'
                ]
            };

            const imageList = imageSets[this.folderPath] || imageSets['images/hero'];

            // Efficiently check images with WebP preference
            const imagePromises = imageList.map(async (filename, index) => {
                const baseName = filename.replace(/\.[^/.]+$/, "");
                const webpPath = `${this.folderPath}/${baseName}.webp`;
                const originalPath = `${this.folderPath}/${filename}`;
                
                // Try WebP first, fallback to original
                let finalPath = originalPath;
                if (await this.imageExists(webpPath)) {
                    finalPath = webpPath;
                } else if (!(await this.imageExists(originalPath))) {
                    console.warn(`Image not found: ${filename}`);
                    return null;
                }

                // Preload only first 3 images for performance
                if (index < 3) {
                    this.preloadImage(finalPath);
                }

                return {
                    src: finalPath,
                    alt: this.generateAltText(filename)
                };
            });

            const results = await Promise.all(imagePromises);
            this.images = results.filter(img => img !== null);

            if (this.images.length === 0) {
                this.loadFallbackImages();
            }

        } catch (error) {
            console.warn('Image detection failed, using fallback images');
            this.loadFallbackImages();
        }
    }

    preloadImage(src) {
        if (!this.preloadedImages.has(src)) {
            const img = new Image();
            img.src = src;
            this.preloadedImages.set(src, img);
        }
        return this.preloadedImages.get(src);
    }

    async imageExists(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }

    generateAltText(filename) {
        const cleanName = filename.replace(/[_\-\d\.]/g, ' ').replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
        return `Professional photography by tGS Studios - ${cleanName}`;
    }

    loadFallbackImages() {
        this.images = [
            { src: 'images/hero/hero-main1.jpg', alt: 'Professional Photography by tGS Studios' },
            { src: 'images/hero/hero-main2.jpg', alt: 'Creative Portrait Work by tGS Studios' },
            { src: 'images/hero/hero-main3.jpg', alt: 'Wedding Photography by tGS Studios' }
        ];
    }

    createCarouselHTML() {
        // Security: Sanitize image sources
        const sanitizedImages = this.images.map(img => ({
            src: this.sanitizeImagePath(img.src),
            alt: this.sanitizeText(img.alt)
        }));

        const carouselHTML = `
            <div class="carousel-container">
                ${sanitizedImages.map((image, index) => `
                    <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                        <img src="${image.src}" alt="${image.alt}" loading="${index === 0 ? 'eager' : 'lazy'}" draggable="false">
                    </div>
                `).join('')}
                <button class="carousel-arrow prev" aria-label="Previous image">‹</button>
                <button class="carousel-arrow next" aria-label="Next image">›</button>
                <div class="carousel-nav" role="navigation" aria-label="Image navigation">
                    ${sanitizedImages.map((_, index) => `
                        <div class="carousel-dot ${index === 0 ? 'active' : ''}" data-slide="${index}" role="button" aria-label="Go to slide ${index + 1}"></div>
                    `).join('')}
                </div>
            </div>
        `;

        this.container.innerHTML = carouselHTML;
        this.slides = this.container.querySelectorAll('.carousel-slide');
        this.dots = this.container.querySelectorAll('.carousel-dot');
        this.prevBtn = this.container.querySelector('.carousel-arrow.prev');
        this.nextBtn = this.container.querySelector('.carousel-arrow.next');
    }

    sanitizeImagePath(path) {
        // Security: Only allow images from specific directories
        const allowedPaths = /^images\/(hero|about|portfolio|blog)\//;
        return allowedPaths.test(path) ? path : 'images/hero/hero-main1.jpg';
    }

    sanitizeText(text) {
        // Security: Sanitize text content
        return text.replace(/[<>\"'&]/g, '');
    }

    bindEvents() {
        if (!this.prevBtn || !this.nextBtn) return;

        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.activeElement === this.container || this.container.contains(document.activeElement)) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prevSlide();
                }
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextSlide();
                }
            }
        });

        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        // Enhanced touch support
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        this.container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;

            const deltaX = endX - startX;
            const deltaY = endY - startY;

            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.prevSlide();
                } else {
                    this.nextSlide();
                }
            }
        });

        // Pause on hover and focus
        this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.container.addEventListener('mouseleave', () => {
            if (this.autoPlay) this.startAutoPlay();
        });

        // Pause when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else if (this.autoPlay) {
                this.startAutoPlay();
            }
        });
    }

    goToSlide(index) {
        if (index === this.currentIndex || !this.slides[index]) return;

        this.slides[this.currentIndex].classList.remove('active');
        this.dots[this.currentIndex].classList.remove('active');

        this.currentIndex = index;

        this.slides[this.currentIndex].classList.add('active');
        this.dots[this.currentIndex].classList.add('active');

        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'carousel_slide_change', {
                'carousel_id': this.container.id || 'unnamed',
                'slide_index': index
            });
        }
    }

    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.goToSlide(prevIndex);
    }

    startAutoPlay() {
        if (this.isPlaying || this.images.length <= 1) return;
        this.isPlaying = true;
        this.autoPlayTimer = setInterval(() => {
            this.nextSlide();
        }, this.interval);
    }

    pauseAutoPlay() {
        this.isPlaying = false;
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
}

// Enhanced Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    console.log('Mobile nav elements:', { navToggle, navMenu }); // Debug log

    if (navToggle && navMenu) {
        let isTogglingNav = false;

        function toggleMobileNav() {
            if (isTogglingNav) return;
            isTogglingNav = true;

            console.log('Nav toggle activated'); // Debug log
            navMenu.classList.toggle('active');

            // Toggle aria attributes for accessibility
            const isActive = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isActive);
            navMenu.setAttribute('aria-hidden', !isActive);

            // Prevent body scroll when menu is open
            if (isActive) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }

            setTimeout(() => {
                isTogglingNav = false;
            }, 100);
        }

        function closeMobileNav() {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        // Enhanced event listeners for better device compatibility
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileNav();
        });

        // Touch events for mobile devices
        navToggle.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileNav();
        });

        // Close mobile menu when clicking on navigation links
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMobileNav();
            });
        });

        // Close mobile menu when clicking outside of it
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                closeMobileNav();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMobileNav();
            }
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 1024) {
                closeMobileNav();
            }
        });

    } else {
        console.error('Mobile navigation elements not found');
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu && navToggle && !navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });

    // Initialize hero collage
    const heroCollageContainer = document.querySelector('.hero-collage');
    if (heroCollageContainer) {
        initializeHeroCollage();
    }

    const aboutCollageContainer = document.querySelector('.about-collage');
    if (aboutCollageContainer) {
        initializeAboutCollage();
    }

    const portfolioCarouselContainer = document.querySelector('.portfolio-hero .image-carousel');
    if (portfolioCarouselContainer) {
        new ImageCarousel(portfolioCarouselContainer, 'images/portfolio', true, 4000);
    }

    const servicesCarouselContainer = document.querySelector('.services-hero .image-carousel');
    if (servicesCarouselContainer) {
        new ImageCarousel(servicesCarouselContainer, 'images/hero', true, 4500);
    }

    const blogCarouselContainer = document.querySelector('.blog-hero .image-carousel');
    if (blogCarouselContainer) {
        new ImageCarousel(blogCarouselContainer, 'images/hero', true, 4500);
    }

    const contactCarouselContainer = document.querySelector('.contact-hero .image-carousel');
    if (contactCarouselContainer) {
        new ImageCarousel(contactCarouselContainer, 'images/hero', true, 4500);
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Photography Collage Gallery
    const photographyCollageContainer = document.getElementById('photography-collage');
    if (photographyCollageContainer) {
        initializePhotographyCollage();
    }

    // Footer Background Collage
    const footerCollageContainer = document.getElementById('footer-collage');
    if (footerCollageContainer) {
        initializeFooterCollage();
    }

    // Portfolio Modal Functionality
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeModal = document.querySelector('.close-modal');
    const modalPrev = document.querySelector('.modal-prev');
    const modalNext = document.querySelector('.modal-next');
    const imageItems = document.querySelectorAll('.image-item img');

    let currentImageIndex = 0;
    const images = Array.from(imageItems);

    if (imageItems.length > 0) {
        imageItems.forEach((img, index) => {
            img.addEventListener('click', function() {
                modal.style.display = 'block';
                modalImg.src = this.src;
                modalImg.alt = this.alt;
                currentImageIndex = index;
                document.body.style.overflow = 'hidden';
            });
        });

        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        modalPrev.addEventListener('click', function() {
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
            modalImg.src = images[currentImageIndex].src;
            modalImg.alt = images[currentImageIndex].alt;
        });

        modalNext.addEventListener('click', function() {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            modalImg.src = images[currentImageIndex].src;
            modalImg.alt = images[currentImageIndex].alt;
        });

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (modal.style.display === 'block') {
                if (e.key === 'Escape') {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
                if (e.key === 'ArrowLeft') {
                    modalPrev.click();
                }
                if (e.key === 'ArrowRight') {
                    modalNext.click();
                }
            }
        });
    }

    // Enhanced button tracking
    document.querySelectorAll('.btn, .cta-button').forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const currentPage = window.location.pathname;

            if (typeof gtag !== 'undefined') {
                gtag('event', 'button_click', {
                    'button_text': buttonText,
                    'page_path': currentPage
                });
            }
        });
    });

    // Image hover overlay functionality
    initializeImageHoverOverlay();

    // Page view tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            'page_path': window.location.pathname
        });
    }
});

// Fast Collage Functions
function initializeHeroCollage() {
    const container = document.querySelector('.hero-collage');
    const heroImages = [
        'images/hero/hero-main1.webp',
        'images/hero/hero-main2.webp',
        'images/hero/hero-main3.webp'
    ];

    // Preload critical hero images
    heroImages.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onerror = function() {
            this.src = src.replace('.webp', '.jpg');
        };
    });

    heroImages.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'hero-collage-item';
        item.innerHTML = `<img src="${src}" alt="Professional Photography" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async" onerror="this.src='${src.replace('.webp', '.jpg')}'">`;
        container.appendChild(item);
    });
}

function initializePhotographyCollage() {
    const container = document.querySelector('.photography-collage');
    const portfolioImages = [
        'images/portfolio/_MG_0685-28_1751928700191.jpg',
        'images/portfolio/_MG_1443-36_1751928700191.jpg',
        'images/portfolio/_MG_2758_1751928700191.JPG',
        'images/portfolio/4new_1751928700191.jpg',
        'images/portfolio/N_MG_0942_1751928700191.jpg',
        'images/portfolio/check_MG_8051_1751928700191.jpg',
        'images/portfolio/_MG_0701-42_1751928700191.jpg',
        'images/portfolio/N_MG_0913_1751928700191.jpg'
    ];

    // Preload critical portfolio images
    portfolioImages.slice(0, 4).forEach(src => {
        const img = new Image();
        img.src = src;
    });

    portfolioImages.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'photography-collage-item';
        item.innerHTML = `<img src="${src}" alt="Portfolio Photography" loading="${index < 4 ? 'eager' : 'lazy'}" decoding="async">`;
        item.addEventListener('click', () => {
            window.location.href = 'portfolio.html';
        });
        container.appendChild(item);
    });
}

function initializeAboutCollage() {
    const container = document.querySelector('.about-collage');
    const aboutImages = [
        'images/about/about-hero1.jpg',
        'images/about/about-hero2.jpg',
        'images/about/about-hero3.jpg',
        'images/about/about-hero4.jpg',
        'images/about/about-hero5.jpg'
    ];

    // Preload all about images
    aboutImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    aboutImages.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'about-collage-item';
        item.innerHTML = `<img src="${src}" alt="About Photography" loading="eager" decoding="async">`;
        container.appendChild(item);
    });
}

function initializeFooterCollage() {
    const container = document.querySelector('.footer-background-collage');
    const aboutImages = [
        'images/about/about-hero1.jpg',
        'images/about/about-hero2.jpg',
        'images/about/about-hero3.jpg',
        'images/about/about-hero4.jpg',
        'images/about/about-hero5.jpg'
    ];

    // Repeat images to fill the grid
    const repeatedImages = [];
    for (let i = 0; i < 18; i++) {
        repeatedImages.push(aboutImages[i % aboutImages.length]);
    }

    repeatedImages.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'footer-collage-item';
        item.innerHTML = `<img src="${src}" alt="About Photography" loading="lazy" decoding="async">`;
        container.appendChild(item);
    });
}

// Image hover overlay functionality
function initializeImageHoverOverlay() {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'image-overlay';
    overlay.innerHTML = '<img src="" alt="" />';
    document.body.appendChild(overlay);

    const overlayImg = overlay.querySelector('img');
    let hoverTimer = null;
    let isOverlayActive = false;

    // Function to show overlay
    function showOverlay(imageSrc, imageAlt) {
        overlayImg.src = imageSrc;
        overlayImg.alt = imageAlt;
        overlay.classList.add('active');
        isOverlayActive = true;
        document.body.style.overflow = 'hidden';
    }

    // Function to hide overlay
    function hideOverlay() {
        overlay.classList.remove('active');
        isOverlayActive = false;
        document.body.style.overflow = '';
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
    }

    // Get all hoverable images (exclude navigation and very small images)
    const hoverableImages = document.querySelectorAll(`
        .hero-collage-item img,
        .about-collage-item img,
        .photography-collage-item img,
        .portfolio-collage img,
        .image-item img,
        .footer-collage-item img,
        .carousel-slide img
    `);

    hoverableImages.forEach(img => {
        let isHovering = false;

        img.addEventListener('mouseenter', function() {
            if (isOverlayActive) return;

            isHovering = true;
            hoverTimer = setTimeout(() => {
                if (isHovering && !isOverlayActive) {
                    showOverlay(this.src, this.alt);
                }
            }, 3000);
        });

        img.addEventListener('mouseleave', function() {
            isHovering = false;
            if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
            }
        });
    });

    // Close overlay on click
    overlay.addEventListener('click', hideOverlay);

    // Close overlay on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOverlayActive) {
            hideOverlay();
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (isOverlayActive) {
            hideOverlay();
        }
    });
}

// Performance: Use single event delegation for better memory management
    let performanceOptimized = true;