// Portfolio website animations and interactions

document.addEventListener('DOMContentLoaded', function () {
  // Share navbar height for layout calculations (e.g., about page fixed panel height)
  function updateNavbarHeightVar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const height = navbar.offsetHeight || 0;
    document.documentElement.style.setProperty('--navbar-height', `${height}px`);
  }

  updateNavbarHeightVar();
  window.addEventListener('resize', updateNavbarHeightVar);

  // Sequential spring blur animation system
  const elementsToAnimate = [
    { selector: '.navbar', delay: 300 },
    // About page: animate the panel with the same system (no effect on home)
    { selector: '.about-panel', delay: 500 },
    { selector: '.hero', delay: 500 },
    { selector: '.video-intro', delay: 700 },
    { selector: '.case-studies', delay: 900 },
    { selector: '.my-products-section', delay: 1100 },
  ];

  // Start sequential animations
  elementsToAnimate.forEach(({ selector, delay }) => {
    const element = document.querySelector(selector);
    if (element) {
      // Apply initial animation class and transitions
      element.classList.add('fade-blur-up');

      // Trigger animation after delay
      setTimeout(() => {
        element.classList.add('animate');
      }, delay);
    }
  });
  // Navbar remains static at top of page; no scroll background behavior

  // Logo click handler for home navigation
  const logoLink = document.querySelector('.logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', function (e) {
      const href = this.getAttribute('href') || '';
      const isHome =
        window.location.pathname.endsWith('/') ||
        window.location.pathname.endsWith('/index.html') ||
        window.location.pathname.endsWith('index.html');

      // If we're already on home, keep the existing smooth scroll-to-top behavior.
      if (isHome && (href === 'index.html' || href === './index.html' || href === '/')) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Navigation links functionality
  const allScrollLinks = document.querySelectorAll('.nav-link, .highlight-text');
  allScrollLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href') || '';

      // Smooth-scroll for in-page anchor navigation (e.g., #my-products on homepage)
      if (href.startsWith('#') && href.length > 1) {
        const targetId = href.slice(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (href === '#' || href === '') {
        // Keep previous behavior for placeholder links
        e.preventDefault();
      }

      // Handle active state only for navbar links
      if (this.classList.contains('nav-link')) {
        const desktopNavLinks = document.querySelectorAll('.nav-link');
        desktopNavLinks.forEach((l) => l.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  // Re-define navLinks for mobile menu logic to maintain original behavior
  const navLinks = document.querySelectorAll('.nav-link');

  // Mobile menu functionality
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  // Helper usable outside the mobile-menu init block (so other handlers can close menu safely)
  function closeMobileMenuIfPresent() {
    if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
    if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
  }

  if (mobileMenuToggle && mobileMenuOverlay) {
    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      const isActive = mobileMenuToggle.classList.contains('active');

      if (isActive) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (
        mobileMenuOverlay.classList.contains('active') &&
        !mobileMenuOverlay.contains(e.target) &&
        !mobileMenuToggle.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });

    // Handle mobile nav link clicks
    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href') || '';

        if (href.startsWith('#') && href.length > 1) {
          const targetId = href.slice(1);
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else if (href === '#' || href === '') {
          e.preventDefault();
        }

        // Remove active class from all mobile links
        mobileNavLinks.forEach((l) => l.classList.remove('active'));
        // Remove active class from desktop links too
        navLinks.forEach((l) => l.classList.remove('active'));

        // Add active class to clicked mobile link
        this.classList.add('active');

        // Add active class to corresponding desktop link
        const linkText = this.textContent;
        const correspondingDesktopLink = Array.from(navLinks).find(
          (link) => link.textContent === linkText
        );
        if (correspondingDesktopLink) {
          correspondingDesktopLink.classList.add('active');
        }

        // Close mobile menu after selection
        closeMobileMenu();
      });
    });

    function openMobileMenu() {
      mobileMenuToggle.classList.add('active');
      mobileMenuOverlay.classList.add('active');
    }

    function closeMobileMenu() {
      mobileMenuToggle.classList.remove('active');
      mobileMenuOverlay.classList.remove('active');
    }
  }

  // About Modal Functionality (reuses the same modal CSS classes as case studies)
  const aboutModal = document.getElementById('about-modal');
  const aboutModalOverlay = aboutModal
    ? aboutModal.querySelector('.case-study-modal-overlay')
    : null;
  const aboutModalClose = aboutModal
    ? aboutModal.querySelector('.case-study-modal-close')
    : null;
  const aboutModalContainer = aboutModal
    ? aboutModal.querySelector('.case-study-modal-container')
    : null;

  function openAboutModal() {
    if (!aboutModal) return;

    aboutModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Mirror the case study modal's "scroll anywhere -> scroll popup" behavior,
    // but keep handlers separate so we never impact case study modal behavior.
    const isEventFromScrollableContainer = function (e) {
      if (!aboutModalContainer) return false;
      let target = e.target;
      while (target && target !== document.body) {
        if (
          target === aboutModalContainer ||
          aboutModalContainer.contains(target)
        ) {
          return true;
        }
        target = target.parentElement;
      }
      return false;
    };

    const forwardScrollToPopupWheel = function (e) {
      if (isEventFromScrollableContainer(e)) return;
      if (!aboutModalContainer) return;

      e.preventDefault();
      e.stopPropagation();

      const scrollAmount = e.deltaY;
      const currentScroll = aboutModalContainer.scrollTop;
      const maxScroll =
        aboutModalContainer.scrollHeight - aboutModalContainer.clientHeight;
      const isAtTop = currentScroll === 0;
      const isAtBottom = currentScroll >= maxScroll - 1;

      if ((isAtTop && scrollAmount < 0) || (isAtBottom && scrollAmount > 0)) {
        return;
      }

      const newScroll = Math.max(
        0,
        Math.min(maxScroll, currentScroll + scrollAmount)
      );
      aboutModalContainer.scrollTop = newScroll;
    };

    let touchStartY = 0;
    let touchStartScroll = 0;

    const forwardScrollToPopupTouchStart = function (e) {
      if (aboutModalContainer && e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        touchStartScroll = aboutModalContainer.scrollTop;
      }
    };

    const forwardScrollToPopupTouchMove = function (e) {
      if (isEventFromScrollableContainer(e)) return;
      if (!aboutModalContainer || e.touches.length !== 1) return;

      e.preventDefault();
      e.stopPropagation();

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      const maxScroll =
        aboutModalContainer.scrollHeight - aboutModalContainer.clientHeight;
      const newScroll = touchStartScroll + deltaY;
      aboutModalContainer.scrollTop = Math.max(0, Math.min(maxScroll, newScroll));
    };

    document.addEventListener('wheel', forwardScrollToPopupWheel, {
      passive: false,
    });
    document.addEventListener('touchstart', forwardScrollToPopupTouchStart, {
      passive: true,
    });
    document.addEventListener('touchmove', forwardScrollToPopupTouchMove, {
      passive: false,
    });

    document._aboutScrollHandlers = {
      wheel: forwardScrollToPopupWheel,
      touchstart: forwardScrollToPopupTouchStart,
      touchmove: forwardScrollToPopupTouchMove,
    };

    // Prevent scroll propagation when container reaches limits (same idea as case studies)
    if (aboutModalContainer) {
      let localTouchStartY = 0;

      const handleWheel = function (e) {
        const container = e.currentTarget;
        const isAtTop = container.scrollTop === 0;
        const isAtBottom =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 1;

        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      const handleTouchStart = function (e) {
        localTouchStartY = e.touches[0].clientY;
      };

      const handleTouchMove = function (e) {
        const container = e.currentTarget;
        const touchY = e.touches[0].clientY;
        const deltaY = localTouchStartY - touchY;
        const isAtTop = container.scrollTop === 0;
        const isAtBottom =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 1;

        if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      aboutModalContainer.addEventListener('wheel', handleWheel, {
        passive: false,
      });
      aboutModalContainer.addEventListener('touchstart', handleTouchStart, {
        passive: true,
      });
      aboutModalContainer.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });

      aboutModalContainer._scrollHandlers = {
        wheel: handleWheel,
        touchstart: handleTouchStart,
        touchmove: handleTouchMove,
      };
    }

    // Focus close button for accessibility
    if (aboutModalClose) {
      setTimeout(() => aboutModalClose.focus(), 150);
    }
  }

  function closeAboutModal() {
    if (!aboutModal) return;
    aboutModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    if (aboutModalContainer && aboutModalContainer._scrollHandlers) {
      aboutModalContainer.removeEventListener(
        'wheel',
        aboutModalContainer._scrollHandlers.wheel
      );
      aboutModalContainer.removeEventListener(
        'touchstart',
        aboutModalContainer._scrollHandlers.touchstart
      );
      aboutModalContainer.removeEventListener(
        'touchmove',
        aboutModalContainer._scrollHandlers.touchmove
      );
      aboutModalContainer._scrollHandlers = null;
    }

    if (document._aboutScrollHandlers) {
      document.removeEventListener('wheel', document._aboutScrollHandlers.wheel);
      document.removeEventListener(
        'touchstart',
        document._aboutScrollHandlers.touchstart
      );
      document.removeEventListener(
        'touchmove',
        document._aboutScrollHandlers.touchmove
      );
      document._aboutScrollHandlers = null;
    }
  }

  // About link clicks (desktop + mobile)
  let aboutOpenedViaClick = false;
  const aboutLinks = document.querySelectorAll(
    '.nav-link[href="#about"], .mobile-nav-link[href="#about"]'
  );
  aboutLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      aboutOpenedViaClick = true;
      // Close mobile menu if open
      closeMobileMenuIfPresent();
      // Hash-driven behavior; opening will be handled by hashchange below
      window.location.hash = '#about';
    });
  });

  function closeAboutByHashOrReplace() {
    // If the About modal was opened via an in-page click, prefer history.back()
    // so the browser back button behavior stays natural.
    if (aboutOpenedViaClick && window.location.hash === '#about') {
      aboutOpenedViaClick = false;
      history.back();
      return;
    }

    // Otherwise (e.g., direct visit to #about), clear hash without navigating away.
    if (window.location.hash === '#about') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    closeAboutModal();
    setActiveNav();
  }

  // Close About modal interactions
  if (aboutModalClose) {
    aboutModalClose.addEventListener('click', function (e) {
      e.preventDefault();
      closeAboutByHashOrReplace();
    });
  }

  if (aboutModalOverlay) {
    aboutModalOverlay.addEventListener('click', function (e) {
      e.preventDefault();
      closeAboutByHashOrReplace();
    });
  }

  // Close About modal with Escape key (only when About is open)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && aboutModal && aboutModal.style.display === 'flex') {
      closeAboutByHashOrReplace();
    }
  });

  // Feature flag: Set to true to enable video intro button, false to disable
  const VIDEO_INTRO_ENABLED = false;

  // Video interaction handlers
  const watchBtn = document.querySelector('.watch-btn');
  const videoThumbnail = document.querySelector('.video-thumbnail');
  const videoModal = document.getElementById('video-modal');
  const videoModalClose = document.querySelector('.video-modal-close');
  const videoModalOverlay = document.querySelector('.video-modal-overlay');
  const loomEmbedContainer = document.getElementById('loom-embed-container');

  // Loom video configuration
  const loomVideoId = '2ea578cee6d74116b211a16accde633d';
  const loomVideoUrl = `https://www.loom.com/share/${loomVideoId}`;

  // Loom embed code
  const loomEmbedHTML = `<div style="position: relative; padding-bottom: 62.5%; height: 0;"><iframe src="https://www.loom.com/embed/${loomVideoId}?sid=ff0ac7cc-1a10-474a-877e-26d861031448" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>`;

  // Mobile detection function
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  // Initialize mobile GIF thumbnail if on mobile
  function initializeMobileVideoThumbnail() {
    // No longer replacing thumbnail content on mobile
    // Let CSS handle the custom video-icon.png background
    return isMobileDevice(); // Just return if it's mobile for other logic
  }

  // Function to open video modal
  function openVideoModal() {
    // Add the Loom embed to the container
    loomEmbedContainer.innerHTML = loomEmbedHTML;

    // Show the modal
    videoModal.style.display = 'flex';

    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';

    // Focus on the close button for accessibility
    setTimeout(() => {
      videoModalClose.focus();
    }, 300);
  }

  // Function to close video modal
  function closeVideoModal() {
    // Hide the modal
    videoModal.style.display = 'none';

    // Remove the embed to stop the video
    loomEmbedContainer.innerHTML = '';

    // Restore body scrolling
    document.body.style.overflow = 'auto';
  }

  // Function to handle video play
  function handleVideoPlay() {
    openVideoModal();
  }

  // Initialize video thumbnail based on device type
  const isMobile = initializeMobileVideoThumbnail();

  // Apply feature flag: disable interactions if flag is off
  if (!VIDEO_INTRO_ENABLED) {
    // Disable watch button
    if (watchBtn) {
      watchBtn.style.pointerEvents = 'none';
      watchBtn.setAttribute('disabled', 'true');
      watchBtn.setAttribute('aria-disabled', 'true');
    }

    // Disable video thumbnail
    if (videoThumbnail) {
      videoThumbnail.style.pointerEvents = 'none';
      videoThumbnail.setAttribute('tabindex', '-1');
      videoThumbnail.setAttribute('aria-disabled', 'true');
    }

    // Disable entire video-intro section on mobile
    const videoIntroSection = document.querySelector('.video-intro');
    if (videoIntroSection) {
      videoIntroSection.style.pointerEvents = 'none';
      videoIntroSection.setAttribute('tabindex', '-1');
      videoIntroSection.setAttribute('aria-disabled', 'true');
    }
  } else {
    // Feature is enabled - add event handlers as normal
    // Add modal event handlers for both mobile and desktop
    // Watch button
    if (watchBtn) {
      watchBtn.addEventListener('click', function (e) {
        e.preventDefault();
        handleVideoPlay();
      });
    }

    // Video thumbnail click
    if (videoThumbnail) {
      videoThumbnail.addEventListener('click', function () {
        handleVideoPlay();
      });

      // Keyboard accessibility for thumbnail
      videoThumbnail.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleVideoPlay();
        }
      });
    }

    // Make entire video-intro section clickable on mobile
    const videoIntroSection = document.querySelector('.video-intro');
    if (videoIntroSection && isMobileDevice()) {
      videoIntroSection.addEventListener('click', function (e) {
        // Only trigger if the click wasn't on the thumbnail (to avoid double-triggering)
        if (!videoThumbnail || !videoThumbnail.contains(e.target)) {
          handleVideoPlay();
        }
      });

      // Add cursor pointer style for mobile
      videoIntroSection.style.cursor = 'pointer';

      // Keyboard accessibility for the entire section on mobile
      videoIntroSection.setAttribute('tabindex', '0');
      videoIntroSection.setAttribute('role', 'button');
      videoIntroSection.setAttribute(
        'aria-label',
        "Play Chan's video introduction"
      );

      videoIntroSection.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleVideoPlay();
        }
      });
    }
  }

  // Modal close event listeners
  if (videoModalClose) {
    videoModalClose.addEventListener('click', closeVideoModal);
  }

  if (videoModalOverlay) {
    videoModalOverlay.addEventListener('click', closeVideoModal);
  }

  // Close modal with Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && videoModal.style.display === 'flex') {
      closeVideoModal();
    }
  });

  // Handle window resize to switch between mobile/desktop modes
  let resizeTimeout;
  let wasMobile = isMobile;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      // Reload the page if device type changes to ensure proper initialization
      const currentlyMobile = isMobileDevice();
      if (currentlyMobile !== wasMobile) {
        location.reload();
      }
    }, 250);
  });

  // Case Study Modal Functionality
  const caseStudyModal = document.getElementById('case-study-modal');
  const caseStudyModalOverlay = document.querySelector(
    '.case-study-modal-overlay'
  );
  const caseStudyModalClose = document.querySelector('.case-study-modal-close');

  // Case study data for each card
  const caseStudyData = {
    docswell: {
      logo: 'assets/docswell-case-study/product-logo.png',
      company: 'Docswell',
      role: 'Product Designer',
      title:
        'Leading design at Docswell to help them go from MVP to public launch',
      subheading:
        'Docswell is a UK-based medtech company that helps medical practices completely digitise their workflow.',
      background: `
        <p style="margin-bottom: 16px;">At the time, UK medical practitioners relied on multiple disconnected tools for appointments, records, and communication, creating time-consuming workflows that pulled focus away from patient care.</p>
        <p style="margin-bottom: 16px;">When I joined, there was already an early MVP, but as the company shifted its focus to therapist-led practices, we redesigned both the practitioner and patient portals to better support new needs and prepare the platform for its first public release.</p>
      `,
      roleText: `
        <p style="margin-bottom: 16px;">I was the sole designer on the team and wore multiple hats. I led user research, design system, and end-to-end UI design. I also played a pivotal role in product decisions while collaborating closely with the Founder and COO.</p>
      `,
      description: `
        <div class="case-study-images">
          <img src="assets/docswell-case-study/docswell-export-dashboard.png" alt="Docswell dashboard" class="case-study-image" data-image-popup="assets/docswell-case-study/docswell-export-dashboard.png" />
        </div>
      `,
      outcome: `
        <ul>
          <li>Led the design to launch the MVP in 4 months</li>
          <li>Launched the product to multiple practices in the UK for initial testing. Eventual public launch.</li>
          <li>Pilot estimations showed a reduced new-clinic setup from 25 minutes (manual forms) to 12 minutes. Saving admins around 2.5 hours/week.</li>
          <li>Built and maintained a new design system that cut significant design and UI dev hours</li>
        </ul>
      `,
      solutionHeading: 'Inbox',
      solutionText:
        'A centralised place to manage all patient interactions, including assigning patients, messaging, and appointment management. This reduced tool switching, streamlined day-to-day workflows, and enabled faster responses to patients.',
      solutionImage: 'assets/docswell-case-study/inbox-general.png',
      solutionTextAfterImage: 'Message templates allow practitioners to quickly send recurring messages with pre-attached documents, forms, and images, reducing repetitive actions and saving time.',
      solutionImageAfterText: 'assets/docswell-case-study/inbox-message-template.png',
      calendarHeading: 'Calendar',
      calendarText: 'A centralised calendar to manage all appointments and practitioner schedules across the practice.',
      calendarImages: [
        'assets/docswell-case-study/calendar-general.png',
        'assets/docswell-case-study/calendar-modal.png',
        'assets/docswell-case-study/calendar-event.png'
      ],
      settingsHeading: 'Settings',
      settingsText: 'The settings experience was restructured into a clear, well-organised system, making complex practice configuration easier to understand and manage.',
      settingsImage: 'assets/docswell-case-study/settings-general.png',
    },
    rememberly: {
      logo: 'assets/rememberly-case-study/rememberly-company-logo.png',
      featuredImage: 'assets/rememberly-case-study/rememberly-featured.png',
      company: 'Rememberly',
      role: 'Founder + Maker',
      title:
        'Founding Rememberly: An iPhone app to Save highlights from physical books',
      subheading:
        'Worked on the full cycle from concept to development as Im working on launching my first iPhone app with the help of AI tools like Cursor.',
      background: `
        <p style="margin-bottom: 16px;">A problem I had while reading physical books is not being able to save highlights easily. Physically using a highlighter on the books was a no-go for many reasons.</p>
        <p style="margin-bottom: 16px;">I wanted to solve this for myself and I'm sure there's many who face the same issue. So I'm building Rememberly, basically Kindle highlights but for your physical books.</p>
      `,
      roleText: `
        <p style="margin-bottom: 16px;">Building the product from 0 to 1.</p>
      `,
      outcome: `
        <p style="margin-bottom: 16px;">Design completed and I'm currently building it using XCode, Cursor and Antigravity. I have built a working base userflow for saving a scanned text, managing books, and managing saved quotes. I'm hoping to release a working testflight in the coming weeks.</p>
      `,
      description: `
        <p style="margin-bottom: 16px;">You can add a quote by taking a photo or uploading a photo of a page. The app uses native OCR to detect the text.</p>
        <p style="margin-bottom: 16px;">Then you can create a book and neatly organise them in it.</p>
        <div class="case-study-images">
          <img src="assets/rememberly-case-study/1.scan-quote.png" alt="Scanning a quote" class="case-study-image" data-image-popup="assets/rememberly-case-study/1.scan-quote.png" />
          <img src="assets/rememberly-case-study/2.select-quote.png" alt="Selecting a quote" class="case-study-image" data-image-popup="assets/rememberly-case-study/2.select-quote.png" />
        </div>
        <p style="margin-top: 24px; margin-bottom: 16px;">Users can add books in two ways: search for a book through an API or add a custom book. If the user chooses to search for a book, the API will populate the book cover.</p>
        <p style="margin-bottom: 16px;">I wanted to give custom books some love. Instead of a boring generic thumbnail that will be shared by all books, I gave the ability to customise the book cover with a color theme and engraved the first letter of the title into the cover.</p>
        <p style="margin-bottom: 16px;">I was able to create the engraving using SwiftUI without having to use multiple assets representing all the outcomes. Just the color variations of the book was uploaded as an asset.</p>
        <div class="case-study-images">
          <img src="assets/rememberly-case-study/3.add-book.png" alt="Adding a book" class="case-study-image" data-image-popup="assets/rememberly-case-study/3.add-book.png" />
        </div>
        <p style="margin-top: 24px; margin-bottom: 16px;">You can manage your saved quotes and library of books neatly in one place.</p>
        <div class="case-study-images">
          <img src="assets/rememberly-case-study/4.my-library.png" alt="My library" class="case-study-image" data-image-popup="assets/rememberly-case-study/4.my-library.png" />
          <img src="assets/rememberly-case-study/5.quotes.png" alt="My quotes" class="case-study-image" data-image-popup="assets/rememberly-case-study/5.quotes.png" />
        </div>
        <p style="margin-top: 24px; margin-bottom: 16px;">You can also share a quote externally as a text or image in a message or maybe even to your Instagram story. More options are available in the menu.</p>
        <div class="case-study-images">
          <img src="assets/rememberly-case-study/6.share.png" alt="Sharing a quote" class="case-study-image" data-image-popup="assets/rememberly-case-study/6.share.png" />
          <img src="assets/rememberly-case-study/7. final.png" alt="Final screen" class="case-study-image" data-image-popup="assets/rememberly-case-study/7. final.png" />
        </div>
      `,
    },
    jiffyhive: {
      logo: '',
      company: 'Jiffyhive',
      role: 'Founding Designer',
      title: 'Jiffyhive: AI-powered employee hiring platform',
      subheading:
        'This is a placeholder sentence for the Jiffyhive case study.',
      background: `
        <p style="margin-bottom: 16px;">(AI-generated placeholder) The original hiring flow for Jiffyhive, an AI-powered employee hiring platform, was overwhelming for both employers and candidates. Recruiters struggled with long setup times, noisy candidate lists, and little clarity on why certain matches were recommended. Candidates, on the other hand, found the application process repetitive and impersonal, with unclear expectations around role fit and response timelines. As a result, drop-off rates were high and hiring teams relied heavily on manual screening despite the presence of AI.</p>
      `,
      roleText: `
        <p style="margin-bottom: 16px;">I worked as the sole product designer, partnering closely with the founder and a small engineering team. I led discovery, UX research, flow redesign, wireframing, and high-fidelity prototyping, and supported implementation through ongoing design reviews. We followed a lean, outcome-driven process, shipping in small increments and validating assumptions through weekly usability tests with recruiters and job seekers across different company sizes.</p>
      `,
      description: `
        <p>We began by mapping the end-to-end hiring journey and interviewing 6 hiring managers and 8 job seekers. The key pain points were clear: too many steps to post a role, low trust in AI recommendations, and poor feedback loops for candidates. These insights informed a redesigned experience that focused on fast role setup, transparent AI matching signals, and clear next-step communication — allowing employers to reach qualified candidates in minutes while giving applicants confidence that their profiles were being evaluated fairly and efficiently.</p>
      `,
    },
  };

  // Function to open case study modal with specific content
  function openCaseStudyModal(caseStudyType) {
    const data = caseStudyData[caseStudyType] || caseStudyData['docswell']; // Fallback to docswell if type not found

    // Update modal content
    const logoElement = document.getElementById('case-study-logo');
    if (data.logo) {
      // If logo URL provided, create img element
      logoElement.innerHTML = `<img src="${data.logo}" alt="${data.company} logo" style="width: 100%; height: 100%; object-fit: cover;" />`;
    } else {
      // Show placeholder background (already styled in CSS)
      logoElement.innerHTML = '';
    }

    document.getElementById('case-study-company-name').textContent =
      data.company;
    document.getElementById('case-study-role').textContent = data.role;
    document.getElementById('case-study-title').textContent = data.title;
    document.getElementById('case-study-subheading').textContent =
      data.subheading || '';

    // Extract paragraphs for Background and Role sections
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data.description;
    const paragraphs = tempDiv.querySelectorAll('p');

    // Extract dashboard image for docswell (first image in the images container)
    const featuredImageContainer = document.getElementById(
      'case-study-featured-image'
    );
    if (data.featuredImage) {
      featuredImageContainer.innerHTML = `<img src="${data.featuredImage}" alt="${data.company} featured image" data-image-popup="${data.featuredImage}" />`;
    } else if (caseStudyType === 'docswell') {
      const imagesContainer = tempDiv.querySelector('.case-study-images');
      if (imagesContainer) {
        const firstImage = imagesContainer.querySelector(
          'img[src*="dashboard"]'
        );
        if (firstImage) {
          // Clone and add the dashboard image to featured image container
          const clonedImage = firstImage.cloneNode(true);
          featuredImageContainer.innerHTML = '';
          featuredImageContainer.appendChild(clonedImage);
          // Remove the dashboard image from the original container
          firstImage.remove();
        }
      }
    } else {
      featuredImageContainer.innerHTML = '';
    }

    if (data.background) {
      document.getElementById('case-study-background-text').innerHTML = data.background;
    } else if (paragraphs.length > 0) {
      // Fallback: Use first paragraph for Background
      document.getElementById('case-study-background-text').innerHTML =
        paragraphs[0].outerHTML;
      paragraphs[0].remove();
    } else {
      document.getElementById('case-study-background-text').innerHTML = '';
    }

    // Refresh paragraphs list after removals
    const remainingParasAfterBackground = tempDiv.querySelectorAll('p');

    if (data.roleText) {
      document.getElementById('case-study-role-text').innerHTML = data.roleText;
    } else if (remainingParasAfterBackground.length > 0) {
      // Fallback: Set role text to next paragraph's text content
      document.getElementById('case-study-role-text').innerHTML =
        remainingParasAfterBackground[0].outerHTML;
      remainingParasAfterBackground[0].remove();
    } else {
      // Use placeholder if no more paragraphs
      document.getElementById('case-study-role-text').innerHTML =
        '<p>Placeholder text for the Role section.</p>';
    }

    // Show and populate Outcome section
    const outcomeSection = document.getElementById(
      'case-study-outcome-section'
    );
    const divider = document.querySelector('.case-study-divider');

    outcomeSection.style.display = 'flex';
    
    // Divider is always shown if it exists
    if (divider) divider.style.display = 'block';
    
    // Set outcome text based on case study data or placeholders
    if (data.outcome) {
      document.getElementById('case-study-outcome-text').innerHTML =
        data.outcome;
    } else {
      let outcomeText =
        'This is a placeholder sentence for the Outcome section.';
      if (caseStudyType === 'jiffyhive') {
        outcomeText =
          'This is a placeholder sentence for the Outcome section in the Jiffyhive case study.';
      }
      document.getElementById('case-study-outcome-text').textContent =
        outcomeText;
    }

    // Show and populate Solution section
    const solutionSection = document.getElementById(
      'case-study-solution-section'
    );
    
    if (caseStudyType === 'rememberly') {
      solutionSection.style.display = 'none';
    } else {
      solutionSection.style.display = 'flex';
    }

    // Set heading and text based on case study data
    document.getElementById('case-study-solution-heading').textContent =
      data.solutionHeading || 'Solution';

    if (data.solutionText) {
      document.getElementById('case-study-solution-text').textContent =
        data.solutionText;
    } else {
      // Fallback placeholders
      let solutionText =
        'This is a placeholder sentence for the Solution section.';
      if (caseStudyType === 'rememberly') {
        solutionText =
          'This is a placeholder sentence for the Solution section in the Rememberly case study.';
      } else if (caseStudyType === 'jiffyhive') {
        solutionText =
          'This is a placeholder sentence for the Solution section in the Jiffyhive case study.';
      }
      document.getElementById('case-study-solution-text').textContent =
        solutionText;
    }

    // Set solution image if exists
    const solutionImageContainer = document.getElementById(
      'case-study-solution-image'
    );
    if (data.solutionImage) {
      solutionImageContainer.innerHTML = `<img src="${data.solutionImage}" alt="${
        data.solutionHeading || 'Solution'
      } image" data-image-popup="${data.solutionImage}" />`;
    } else {
      solutionImageContainer.innerHTML = '';
    }

    // Set solution text after image if exists
    const solutionTextAfterContainer = document.getElementById(
      'case-study-solution-text-after'
    );
    if (data.solutionTextAfterImage) {
      solutionTextAfterContainer.textContent = data.solutionTextAfterImage;
      solutionTextAfterContainer.style.display = 'block';
    } else {
      solutionTextAfterContainer.style.display = 'none';
    }

    // Set solution image after text if exists
    const solutionImageAfterContainer = document.getElementById(
      'case-study-solution-image-after'
    );
    if (data.solutionImageAfterText) {
      solutionImageAfterContainer.innerHTML = `<img src="${data.solutionImageAfterText}" alt="${
        data.solutionHeading || 'Solution'
      } image" data-image-popup="${data.solutionImageAfterText}" />`;
      solutionImageAfterContainer.style.display = 'block';
    } else {
      solutionImageAfterContainer.style.display = 'none';
    }

    // Show and populate Calendar section if exists in data
    const calendarSection = document.getElementById('case-study-calendar-section');
    if (data.calendarHeading) {
      calendarSection.style.display = 'flex';
      document.getElementById('case-study-calendar-heading').textContent = data.calendarHeading;
      document.getElementById('case-study-calendar-text').textContent = data.calendarText;
      
      const calendarImagesContainer = document.getElementById('case-study-calendar-images');
      if (data.calendarImages && data.calendarImages.length > 0) {
        calendarImagesContainer.innerHTML = data.calendarImages.map(imgSrc => 
          `<img src="${imgSrc}" alt="Calendar image" class="case-study-image" data-image-popup="${imgSrc}" />`
        ).join('');
      } else {
        calendarImagesContainer.innerHTML = '';
      }
    } else {
      calendarSection.style.display = 'none';
    }

    // Show and populate Settings section if exists in data
    const settingsSection = document.getElementById('case-study-settings-section');
    if (data.settingsHeading) {
      settingsSection.style.display = 'flex';
      document.getElementById('case-study-settings-heading').textContent = data.settingsHeading;
      document.getElementById('case-study-settings-text').textContent = data.settingsText;
      
      const settingsImageContainer = document.getElementById('case-study-settings-image');
      if (data.settingsImage) {
        settingsImageContainer.innerHTML = `<img src="${data.settingsImage}" alt="Settings image" class="case-study-image" data-image-popup="${data.settingsImage}" />`;
      } else {
        settingsImageContainer.innerHTML = '';
      }
    } else {
      settingsSection.style.display = 'none';
    }

    // Set the remaining content (other paragraphs and images) in description
    const descriptionSection = document.getElementById('case-study-description');
    if (data.description) {
      descriptionSection.style.display = 'block';
      descriptionSection.innerHTML = tempDiv.innerHTML;
    } else {
      descriptionSection.style.display = 'none';
      descriptionSection.innerHTML = '';
    }

    // Attach image popup handlers for ALL images in the modal that have data-image-popup
    const allPopupImages = caseStudyModal.querySelectorAll('[data-image-popup]');
    allPopupImages.forEach((img) => {
      // Small cleanup: remove old listeners if any (though they are usually new elements)
      img.onclick = null; 
      img.addEventListener('click', function () {
        const imageSrc = this.getAttribute('data-image-popup');
        const imageAlt = this.getAttribute('alt') || '';
        openImagePopup(imageSrc, imageAlt);
      });
    });

    // Show modal
    caseStudyModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Get references to modal elements
    const caseStudyModalContainer = document.querySelector(
      '.case-study-modal-container'
    );

    // Function to check if event originated from scrollable container
    const isEventFromScrollableContainer = function (e) {
      if (!caseStudyModalContainer) return false;
      let target = e.target;

      // Walk up the DOM tree to check if we're inside the scrollable container
      while (target && target !== document.body) {
        if (
          target === caseStudyModalContainer ||
          caseStudyModalContainer.contains(target)
        ) {
          return true;
        }
        target = target.parentElement;
      }
      return false;
    };

    // Forward scroll events to popup container when scrolling outside popup
    const forwardScrollToPopupWheel = function (e) {
      // If scroll is from the scrollable container, let it handle naturally
      if (isEventFromScrollableContainer(e)) {
        return;
      }

      // Otherwise, prevent background scroll and forward to popup container
      if (caseStudyModalContainer) {
        e.preventDefault();
        e.stopPropagation();

        // Check boundaries before applying scroll
        const scrollAmount = e.deltaY;
        const currentScroll = caseStudyModalContainer.scrollTop;
        const maxScroll =
          caseStudyModalContainer.scrollHeight -
          caseStudyModalContainer.clientHeight;
        const isAtTop = currentScroll === 0;
        const isAtBottom = currentScroll >= maxScroll - 1;

        // Prevent scroll if trying to scroll beyond boundaries
        if ((isAtTop && scrollAmount < 0) || (isAtBottom && scrollAmount > 0)) {
          return; // Already at limit, don't scroll
        }

        // Apply scroll to the container
        const newScroll = Math.max(
          0,
          Math.min(maxScroll, currentScroll + scrollAmount)
        );
        caseStudyModalContainer.scrollTop = newScroll;
      }
    };

    let touchStartY = 0;
    let touchStartScroll = 0;

    const forwardScrollToPopupTouchStart = function (e) {
      if (caseStudyModalContainer && e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        touchStartScroll = caseStudyModalContainer.scrollTop;
      }
    };

    const forwardScrollToPopupTouchMove = function (e) {
      // If scroll is from the scrollable container, let it handle naturally
      if (isEventFromScrollableContainer(e)) {
        return;
      }

      // Otherwise, prevent background scroll and forward to popup container
      if (caseStudyModalContainer && e.touches.length === 1) {
        e.preventDefault();
        e.stopPropagation();

        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        const currentScroll = caseStudyModalContainer.scrollTop;
        const maxScroll =
          caseStudyModalContainer.scrollHeight -
          caseStudyModalContainer.clientHeight;
        const newScroll = touchStartScroll + deltaY;

        // Clamp to boundaries
        const clampedScroll = Math.max(0, Math.min(maxScroll, newScroll));
        caseStudyModalContainer.scrollTop = clampedScroll;
      }
    };

    // Add scroll forwarding to document to catch scrolls anywhere on the page
    // This ensures scrolling anywhere (overlay, modal, or outside) scrolls the popup
    document.addEventListener('wheel', forwardScrollToPopupWheel, {
      passive: false,
    });
    document.addEventListener('touchstart', forwardScrollToPopupTouchStart, {
      passive: true,
    });
    document.addEventListener('touchmove', forwardScrollToPopupTouchMove, {
      passive: false,
    });

    // Store document handlers for cleanup
    document._caseStudyScrollHandlers = {
      wheel: forwardScrollToPopupWheel,
      touchstart: forwardScrollToPopupTouchStart,
      touchmove: forwardScrollToPopupTouchMove,
    };

    // Prevent scroll propagation when container reaches limits
    if (caseStudyModalContainer) {
      let touchStartY = 0;

      const handleWheel = function (e) {
        const container = e.currentTarget;
        const isAtTop = container.scrollTop === 0;
        const isAtBottom =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 1;

        // Prevent scroll propagation when at limits
        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      const handleTouchStart = function (e) {
        touchStartY = e.touches[0].clientY;
      };

      const handleTouchMove = function (e) {
        const container = e.currentTarget;
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        const isAtTop = container.scrollTop === 0;
        const isAtBottom =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 1;

        // Prevent scroll propagation when at limits
        if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      // Use wheel event for mouse wheel scrolling
      caseStudyModalContainer.addEventListener('wheel', handleWheel, {
        passive: false,
      });
      caseStudyModalContainer.addEventListener('touchstart', handleTouchStart, {
        passive: true,
      });
      caseStudyModalContainer.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });

      // Store the handlers so we can remove them later
      caseStudyModalContainer._scrollHandlers = {
        wheel: handleWheel,
        touchstart: handleTouchStart,
        touchmove: handleTouchMove,
      };
    }
  }

  // Function to close case study modal
  function closeCaseStudyModal() {
    caseStudyModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    // Remove scroll event listeners from container
    const caseStudyModalContainer = document.querySelector(
      '.case-study-modal-container'
    );
    if (caseStudyModalContainer && caseStudyModalContainer._scrollHandlers) {
      caseStudyModalContainer.removeEventListener(
        'wheel',
        caseStudyModalContainer._scrollHandlers.wheel
      );
      caseStudyModalContainer.removeEventListener(
        'touchstart',
        caseStudyModalContainer._scrollHandlers.touchstart
      );
      caseStudyModalContainer.removeEventListener(
        'touchmove',
        caseStudyModalContainer._scrollHandlers.touchmove
      );
      caseStudyModalContainer._scrollHandlers = null;
    }

    // Remove document scroll handlers
    if (document._caseStudyScrollHandlers) {
      document.removeEventListener(
        'wheel',
        document._caseStudyScrollHandlers.wheel
      );
      document.removeEventListener(
        'touchstart',
        document._caseStudyScrollHandlers.touchstart
      );
      document.removeEventListener(
        'touchmove',
        document._caseStudyScrollHandlers.touchmove
      );
      document._caseStudyScrollHandlers = null;
    }
  }

  // Case study card click handlers
  const caseCards = document.querySelectorAll('.case-card');
  caseCards.forEach((card) => {
    card.addEventListener('click', function () {
      const caseStudyType = card.getAttribute('data-case-study');
      if (caseStudyType) {
        openCaseStudyModal(caseStudyType);
      }
    });
  });

  // Close case study modal event listeners
  if (caseStudyModalClose) {
    caseStudyModalClose.addEventListener('click', closeCaseStudyModal);
  }

  if (caseStudyModalOverlay) {
    caseStudyModalOverlay.addEventListener('click', closeCaseStudyModal);
  }

  // Close case study modal with Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && caseStudyModal.style.display === 'flex') {
      closeCaseStudyModal();
    }
  });

  // Image Popup Modal Functionality
  const imagePopupModal = document.getElementById('image-popup-modal');
  const imagePopupOverlay = document.querySelector('.image-popup-overlay');
  const imagePopupClose = document.querySelector('.image-popup-close');
  const popupImage = document.getElementById('popup-image');

  // Function to open image popup modal
  function openImagePopup(imageSrc, imageAlt) {
    popupImage.src = imageSrc;
    popupImage.alt = imageAlt;
    imagePopupModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    isZoomed = false;
  }

  // Function to close image popup modal
  function closeImagePopup() {
    imagePopupModal.style.display = 'none';
    document.body.style.overflow = 'auto';

    isZoomed = false;
  }

  // Image click handlers
  const popupImages = document.querySelectorAll('[data-image-popup]');
  popupImages.forEach((img) => {
    img.addEventListener('click', function () {
      const imageSrc = this.getAttribute('data-image-popup');
      const imageAlt = this.getAttribute('alt');
      openImagePopup(imageSrc, imageAlt);
    });
  });

  // Close image popup event listeners
  if (imagePopupClose) {
    imagePopupClose.addEventListener('click', closeImagePopup);
  }

  if (imagePopupOverlay) {
    imagePopupOverlay.addEventListener('click', closeImagePopup);
  }

  // Close image popup with Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && imagePopupModal.style.display === 'flex') {
      closeImagePopup();
    }
  });



  // Set nav active state based on current page + hash
  function setActiveNav() {
    const path = window.location.pathname.toLowerCase();
    const isAbout = path.endsWith('/about.html') || path.endsWith('about.html');

    navLinks.forEach((l) => l.classList.remove('active'));
    mobileNavLinks.forEach((l) => l.classList.remove('active'));

    const allLinks = [
      ...Array.from(navLinks),
      ...Array.from(mobileNavLinks),
    ];

    if (isAbout || window.location.hash === '#about') {
      allLinks.forEach((l) => {
        if ((l.getAttribute('href') || '').includes('about.html')) {
          l.classList.add('active');
        }
        if ((l.getAttribute('href') || '') === '#about') {
          l.classList.add('active');
        }
      });
      return;
    }

    // Homepage: highlight My Products when hash matches, otherwise none
    if (window.location.hash === '#my-products') {
      allLinks.forEach((l) => {
        if ((l.getAttribute('href') || '') === '#my-products') {
          l.classList.add('active');
        }
      });
    }
  }

  setActiveNav();
  window.addEventListener('hashchange', setActiveNav);

  // Hash-driven About modal open/close
  function syncAboutModalToHash() {
    if (!aboutModal) return;
    if (window.location.hash === '#about') {
      if (aboutModal.style.display !== 'flex') openAboutModal();
    } else {
      if (aboutModal.style.display === 'flex') closeAboutModal();
    }
  }

  syncAboutModalToHash();
  window.addEventListener('hashchange', syncAboutModalToHash);
});
