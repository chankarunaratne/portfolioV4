// Portfolio website animations and interactions

document.addEventListener('DOMContentLoaded', function () {
  // Share navbar height for layout calculations (e.g., about page fixed panel height)
  function updateNavbarHeightVar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const height = navbar.offsetHeight || 0;
    document.documentElement.style.setProperty(
      '--navbar-height',
      `${height}px`,
    );
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
    { selector: '.work-experience-section', delay: 1300 },
    { selector: '.testimonials-section', delay: 1500 },
    { selector: '.footer-section', delay: 1700 },
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
      if (
        isHome &&
        (href === 'index.html' || href === './index.html' || href === '/')
      ) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Navigation links functionality
  const allScrollLinks = document.querySelectorAll(
    '.nav-link, .highlight-text',
  );
  allScrollLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href') || '';

      // Smooth-scroll for in-page anchor navigation
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
          (link) => link.textContent === linkText,
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

  // --- About Nav Tab Interaction ---
  const aboutNav = aboutModal
    ? aboutModal.querySelector('.about-modal-nav')
    : null;
  const aboutNavSlider = aboutNav
    ? aboutNav.querySelector('.about-nav-slider')
    : null;
  const aboutNavItems = aboutNav
    ? aboutNav.querySelectorAll('.about-modal-nav-item')
    : [];
  const aboutBodies = aboutModal
    ? aboutModal.querySelectorAll('.about-modal-body[data-tab]')
    : [];
  const aboutBodyStack = aboutModal
    ? aboutModal.querySelector('.about-modal-body-stack')
    : null;
  let activeAboutBody = Array.from(aboutBodies).find(function (body) {
    return body.classList.contains('is-active');
  });
  if (!activeAboutBody && aboutBodies.length) {
    activeAboutBody = aboutBodies[0];
    activeAboutBody.classList.add('is-visible', 'is-active');
  }

  function setAboutBodyStackHeight(body) {
    if (!aboutBodyStack || !body) return;
    const targetHeight = body.scrollHeight;
    aboutBodyStack.style.height = targetHeight + 'px';
  }

  function clearAboutBodyAnimation(body, phase) {
    if (!body) return;
    const handlerKey =
      phase === 'enter' ? '__aboutEnterHandler' : '__aboutExitHandler';
    const timeoutKey =
      phase === 'enter' ? '__aboutEnterTimeout' : '__aboutExitTimeout';
    const handler = body[handlerKey];
    if (handler) {
      body.removeEventListener('animationend', handler);
      body[handlerKey] = null;
    }
    const timeoutId = body[timeoutKey];
    if (timeoutId !== undefined && timeoutId !== null) {
      clearTimeout(timeoutId);
      body[timeoutKey] = null;
    }
  }

  function activateAboutBody(body) {
    if (!body) return;
    clearAboutBodyAnimation(body, 'exit');
    clearAboutBodyAnimation(body, 'enter');
    body.classList.remove('is-leaving');
    body.classList.add('is-visible');
    requestAnimationFrame(function () {
      body.classList.add('is-active');
      body.classList.add('is-entering');
      const handleEnterEnd = function (event) {
        if (
          event.target !== body ||
          event.animationName !== 'aboutModalBodyFadeIn'
        ) {
          return;
        }
        body.classList.remove('is-entering');
        if (body.__aboutEnterHandler === handleEnterEnd) {
          body.__aboutEnterHandler = null;
        }
        body.removeEventListener('animationend', handleEnterEnd);
      };
      body.__aboutEnterHandler = handleEnterEnd;
      body.addEventListener('animationend', handleEnterEnd);
      if (aboutModal && aboutModal.style.display !== 'none') {
        setAboutBodyStackHeight(body);
      }
    });
  }

  function deactivateAboutBody(body) {
    if (!body) {
      return;
    }

    clearAboutBodyAnimation(body, 'enter');

    const isCurrentlyActive = body.classList.contains('is-active');
    if (!isCurrentlyActive) {
      body.classList.remove('is-visible');
      return;
    }

    body.classList.remove('is-entering');
    clearAboutBodyAnimation(body, 'exit');
    body.classList.add('is-leaving');

    function finalize() {
      clearAboutBodyAnimation(body, 'exit');
      body.classList.remove('is-leaving');
      body.classList.remove('is-visible');
    }

    const handleExitEnd = function (event) {
      if (
        event.target !== body ||
        event.animationName !== 'aboutModalBodyFadeOut'
      ) {
        return;
      }
      finalize();
    };
    body.__aboutExitHandler = handleExitEnd;
    body.addEventListener('animationend', handleExitEnd);

    const fallbackTimeout = setTimeout(finalize, 800);
    body.__aboutExitTimeout = fallbackTimeout;

    requestAnimationFrame(function () {
      body.classList.remove('is-active');
    });
  }

  function switchAboutBody(tabKey) {
    if (!aboutModal) return;
    const nextBody = aboutModal.querySelector(
      '.about-modal-body[data-tab="' + tabKey + '"]',
    );

    if (!nextBody || nextBody === activeAboutBody) {
      return;
    }

    const previousBody = activeAboutBody;
    activeAboutBody = nextBody;
    activateAboutBody(nextBody);
    deactivateAboutBody(previousBody);
  }

  function ensureAboutBodyStackMeasured() {
    if (aboutModal && aboutModal.style.display !== 'none' && activeAboutBody) {
      setAboutBodyStackHeight(activeAboutBody);
    }
  }

  function positionAboutNavSlider(animate) {
    if (!aboutNav || !aboutNavSlider) return;
    const activeItem = aboutNav.querySelector(
      '.about-modal-nav-item.is-active',
    );
    if (!activeItem) return;

    const navRect = aboutNav.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const offsetLeft = itemRect.left - navRect.left + aboutNav.scrollLeft - 4; // subtract nav padding, add scrollLeft for horizontal scroll

    if (!animate) {
      aboutNavSlider.style.transition = 'none';
    }
    aboutNavSlider.style.width = itemRect.width + 'px';
    aboutNavSlider.style.transform = 'translateX(' + offsetLeft + 'px)';

    if (!animate) {
      // Force reflow then re-enable transitions
      void aboutNavSlider.offsetWidth;
      aboutNavSlider.style.transition = '';
    }
  }

  if (aboutNavItems.length) {
    aboutNavItems.forEach(function (item) {
      item.addEventListener('click', function () {
        if (item.classList.contains('is-active')) return;

        // Move active state
        aboutNavItems.forEach(function (btn) {
          btn.classList.remove('is-active');
          btn.removeAttribute('aria-current');
        });
        item.classList.add('is-active');
        item.setAttribute('aria-current', 'page');

        // Animate slider
        positionAboutNavSlider(true);

        // Switch content based on tab
        const tabName = item.textContent.toLowerCase().trim();
        const tabMap = {
          intro: 'intro',
          philosophy: 'philosophy',
          photography: 'photography',
          'movie log': 'movie-log',
        };
        const tabKey = tabMap[tabName];
        if (tabKey) {
          switchAboutBody(tabKey);
        }
      });
    });

    // Reposition slider on resize so it stays aligned
    window.addEventListener('resize', function () {
      if (aboutModal && aboutModal.style.display !== 'none') {
        positionAboutNavSlider(false);
        ensureAboutBodyStackMeasured();
      }
    });
  }

  function openAboutModal() {
    if (!aboutModal) return;

    // Reduce Chrome scroll/compositing jank by pausing the animated sky while a modal is open.
    window.skyRenderer?.pause('aboutModal');

    aboutModal.style.display = 'flex';
    ensureAboutBodyStackMeasured();
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Reset scroll position to top
    if (aboutModalContainer) {
      aboutModalContainer.scrollTop = 0;
    }

    // Position the nav slider without animation on open (needs a frame for layout)
    requestAnimationFrame(function () {
      positionAboutNavSlider(false);
      ensureAboutBodyStackMeasured();
    });

    // Trigger animation replay for desktop
    if (window.innerWidth >= 768) {
      // Remove class if it exists (cleanup)
      aboutModal.classList.remove('opening');
      aboutModal.classList.remove('animation-complete');

      // Force Reflow
      void aboutModal.offsetWidth;

      // Add class to trigger animation
      aboutModal.classList.add('opening');

      // Cleanup to ensure crisp text after animation
      setTimeout(() => {
        if (aboutModal.classList.contains('opening')) {
          aboutModal.classList.add('animation-complete');
        }
      }, 1400); // 0.8s duration + 0.5s max delay + buffer
    }

    // Mobile-only: mirror the case study modal's "scroll anywhere -> scroll popup" behavior.
    // IMPORTANT: On desktop Chrome, any non-passive wheel listener can force main-thread scrolling
    // and cause scroll jank even if the handler returns early.
    if (window.innerWidth < 768) {
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
          Math.min(maxScroll, currentScroll + scrollAmount),
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
        aboutModalContainer.scrollTop = Math.max(
          0,
          Math.min(maxScroll, newScroll),
        );
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
    }

    // Mobile-only: prevent scroll propagation when container reaches limits
    if (aboutModalContainer && window.innerWidth < 768) {
      let localTouchStartY = 0;

      const handleWheel = function (e) {
        if (window.innerWidth >= 768) return;
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
        if (window.innerWidth >= 768) return;
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
  }

  function closeAboutModal() {
    if (!aboutModal) return;

    // Resume immediately on close intent so the sky feels instant behind the closing animation.
    window.skyRenderer?.resume('aboutModal');

    // Remove hash from URL when closing
    if (window.location.hash === '#about') {
      history.pushState(
        '',
        document.title,
        window.location.pathname + window.location.search,
      );
    }

    // Helper to run the actual teardown
    const finishClosing = () => {
      aboutModal.classList.remove('closing');
      aboutModal.classList.remove('opening');
      aboutModal.classList.remove('animation-complete');
      aboutModal.style.display = 'none';
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';

      if (aboutModalContainer && aboutModalContainer._scrollHandlers) {
        aboutModalContainer.removeEventListener(
          'wheel',
          aboutModalContainer._scrollHandlers.wheel,
        );
        aboutModalContainer.removeEventListener(
          'touchstart',
          aboutModalContainer._scrollHandlers.touchstart,
        );
        aboutModalContainer.removeEventListener(
          'touchmove',
          aboutModalContainer._scrollHandlers.touchmove,
        );
        aboutModalContainer._scrollHandlers = null;
      }

      if (document._aboutScrollHandlers) {
        document.removeEventListener(
          'wheel',
          document._aboutScrollHandlers.wheel,
        );
        document.removeEventListener(
          'touchstart',
          document._aboutScrollHandlers.touchstart,
        );
        document.removeEventListener(
          'touchmove',
          document._aboutScrollHandlers.touchmove,
        );
        document._aboutScrollHandlers = null;
      }
    };

    // Desktop: animate slide-down before hiding
    if (window.innerWidth >= 768 && aboutModal.style.display !== 'none') {
      aboutModal.classList.add('closing');
      setTimeout(finishClosing, 600); // Matches CSS animation duration
    } else {
      finishClosing();
    }
  }

  // About link clicks (desktop + mobile)
  const aboutLinks = document.querySelectorAll(
    '.nav-link[href="#about"], .mobile-nav-link[href="#about"], .footer-link[href="#about"]',
  );
  aboutLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      // Close mobile menu if open
      closeMobileMenuIfPresent();
      // Open modal directly
      openAboutModal();
    });
  });

  // Close About modal interactions
  if (aboutModalClose) {
    aboutModalClose.addEventListener('click', function (e) {
      e.preventDefault();
      closeAboutModal();
    });
  }

  if (aboutModalOverlay) {
    aboutModalOverlay.addEventListener('click', function (e) {
      e.preventDefault();
      closeAboutModal();
    });
  }

  // Close About modal with Escape key (only when About is open)
  document.addEventListener('keydown', function (e) {
    if (
      e.key === 'Escape' &&
      aboutModal &&
      aboutModal.style.display === 'flex'
    ) {
      closeAboutModal();
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
      navigator.userAgent,
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
    window.skyRenderer?.pause('videoModal');
    // Add the Loom embed to the container
    loomEmbedContainer.innerHTML = loomEmbedHTML;

    // Show the modal
    videoModal.style.display = 'flex';

    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }

  // Function to close video modal
  function closeVideoModal() {
    window.skyRenderer?.resume('videoModal');
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
        "Play Chan's video introduction",
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
    '.case-study-modal-overlay',
  );
  const caseStudyModalClose = document.querySelector('.case-study-modal-close');
  const caseStudyModalContainer = caseStudyModal
    ? caseStudyModal.querySelector('.case-study-modal-container')
    : null;

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
          <li>80%+ practitioner activation rate within first 2 weeks of onboarding</li>
          <li>Reduced daily tool switching from 4–5 tools to a single interface, based on practitioner interviews</li>
        </ul>
      `,
      solutionText:
        'The centralised Inbox helps manage all patient interactions, including assigning patients, messaging, and appointment management. This reduced tool switching, streamlined day-to-day workflows, and enabled faster responses to patients.',
      solutionImage: 'assets/docswell-case-study/inbox-general.png',
      solutionTextAfterImage:
        'Message templates allow practitioners to quickly send recurring messages with pre-attached documents, forms, and images, reducing repetitive actions and saving time.',
      solutionImageAfterText:
        'assets/docswell-case-study/inbox-message-template.png',
      calendarText:
        'A centralised calendar to manage all appointments and practitioner schedules across the practice.',
      calendarImages: [
        'assets/docswell-case-study/calendar-general.png',
        'assets/docswell-case-study/calendar-modal.png',
        'assets/docswell-case-study/calendar-event.png',
      ],
      profileText:
        'A comprehensive profile section for the patient inludes all details related to them that will help the practitioner in aiding him easily.',
      profileImages: [
        'assets/docswell-case-study/profile.png',
        'assets/docswell-case-study/notes.png',
        'assets/docswell-case-study/note-create.png',
      ],
      settingsText:
        'The settings experience was restructured into a clear, well-organised system, making complex practice configuration easier to understand and manage.',
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
      logo: 'assets/jiffy-case-study/jiffyhive-company-logo.png',
      featuredImage: 'assets/jiffy-case-study/jiffy-featured.png',
      company: 'Jiffyhive',
      role: 'Founding Designer',
      title: 'Jiffyhive: AI-powered employee hiring platform',
      subheading:
        'Jiffy aims to eliminate the tedious process of hiring employees with the help of AI.',
      background: `
        <p style="margin-bottom: 16px;">Our Co-founder who constantly hires software engineers, had one main problem - spending weeks to find the right candidate for the job.</p>
        <p style="margin-bottom: 16px;">Our main goal was to reduce the steps in the traditional hiring process and get the manager to have the initial chat not in a matter of days, but minutes.</p>
      `,
      roleText: `
        <p style="margin-bottom: 16px;">I worked as the founding designer partnering closely with the two co-founders. I led design while wearing multiple hats.</p>
      `,
      outcome: `
        <ul>
          <li>Finalised the MVP design in 6 weeks</li>
          <li>Development now ongoing</li>
        </ul>
      `,
      solutionImages: [
        'assets/jiffy-case-study/0.5-searching-initial.png',
        'assets/jiffy-case-study/1.0-searching-1.png',
        'assets/jiffy-case-study/1.1-searching-2.png',
        'assets/jiffy-case-study/1.2-call.png',
        'assets/jiffy-case-study/1.3-inbox.png',
        'assets/jiffy-case-study/1.4-shortlist.png',
        'assets/jiffy-case-study/1.5-candidate-home.png',
        'assets/jiffy-case-study/1.6-candidate-profile.png',
        'assets/jiffy-case-study/1.7-candidate-experience.png',
        'assets/jiffy-case-study/1.8-candidate-add-experience.png',
        'assets/jiffy-case-study/1.9-candidate-add-project.png',
      ],
      description: '',
    },
  };

  // Function to open case study modal with specific content
  function openCaseStudyModal(caseStudyType) {
    // Pause early to avoid competing with modal DOM work + Chrome compositing while scrolling.
    window.skyRenderer?.pause('caseStudyModal');
    const data = caseStudyData[caseStudyType] || caseStudyData['docswell']; // Fallback to docswell if type not found

    // Hide body headings only for sections below the divider when viewing Docswell
    const shouldHideLowerHeadings = caseStudyType === 'docswell';
    [
      'case-study-solution-heading',
      'case-study-calendar-heading',
      'case-study-settings-heading',
    ].forEach((headingId) => {
      const headingEl = document.getElementById(headingId);
      if (headingEl)
        headingEl.style.display = shouldHideLowerHeadings ? 'none' : '';
    });

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
      'case-study-featured-image',
    );
    if (data.featuredImage) {
      featuredImageContainer.innerHTML = `<img src="${data.featuredImage}" alt="${data.company} featured image" data-image-popup="${data.featuredImage}" />`;
    } else if (caseStudyType === 'docswell') {
      const imagesContainer = tempDiv.querySelector('.case-study-images');
      if (imagesContainer) {
        const firstImage = imagesContainer.querySelector(
          'img[src*="dashboard"]',
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
      document.getElementById('case-study-background-text').innerHTML =
        data.background;
    } else if (paragraphs.length > 0) {
      // Fallback: Use first paragraph for Background
      document.getElementById('case-study-background-text').innerHTML =
        paragraphs[0].outerHTML;
      paragraphs[0].remove();
    } else {
      document.getElementById('case-study-background-text').innerHTML = '';
    }

    // Reset scroll position to top
    if (caseStudyModalContainer) {
      caseStudyModalContainer.scrollTop = 0;
    }

    // Show the modal
    caseStudyModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Trigger animation replay for desktop
    if (window.innerWidth >= 768) {
      // Remove class if it exists (cleanup)
      caseStudyModal.classList.remove('opening');
      caseStudyModal.classList.remove('animation-complete');

      // Force Reflow
      void caseStudyModal.offsetWidth;

      // Add class to trigger animation
      caseStudyModal.classList.add('opening');

      // Cleanup to ensure crisp text after animation
      setTimeout(() => {
        if (caseStudyModal.classList.contains('opening')) {
          caseStudyModal.classList.add('animation-complete');
        }
      }, 1400); // 0.8s duration + 0.5s max delay + buffer
    } else {
      // Mobile: immediately add animation-complete to prevent blur
      caseStudyModal.classList.remove('opening');
      caseStudyModal.classList.add('animation-complete');
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
      'case-study-outcome-section',
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
      'case-study-solution-section',
    );
    const solutionTextEl = document.getElementById('case-study-solution-text');
    const solutionImagesContainer = document.getElementById(
      'case-study-solution-images',
    );

    if (caseStudyType === 'rememberly') {
      solutionSection.style.display = 'none';
    } else {
      solutionSection.style.display = 'flex';
    }

    const hasSolutionImages =
      Array.isArray(data.solutionImages) && data.solutionImages.length > 0;

    // Populate solution images (used by Jiffyhive)
    if (solutionImagesContainer) {
      if (hasSolutionImages) {
        solutionImagesContainer.innerHTML = data.solutionImages
          .map((imgSrc, idx) => {
            const imageNumber = idx + 1;
            return `<img src="${imgSrc}" alt="Jiffyhive screen ${imageNumber}" class="case-study-image" data-image-popup="${imgSrc}" />`;
          })
          .join('');
        solutionImagesContainer.style.display = '';
      } else {
        solutionImagesContainer.innerHTML = '';
        solutionImagesContainer.style.display = 'none';
      }
    }

    // Populate/hide solution text
    if (solutionTextEl) {
      if (hasSolutionImages && caseStudyType === 'jiffyhive') {
        solutionTextEl.textContent = '';
        solutionTextEl.style.display = 'none';
      } else if (data.solutionText && String(data.solutionText).trim()) {
        solutionTextEl.textContent = data.solutionText;
        solutionTextEl.style.display = '';
      } else {
        // Fallback placeholders (but avoid showing placeholders when section is image-only)
        if (caseStudyType === 'rememberly') {
          solutionTextEl.textContent =
            'This is a placeholder sentence for the Solution section in the Rememberly case study.';
        } else {
          solutionTextEl.textContent =
            'This is a placeholder sentence for the Solution section.';
        }
        solutionTextEl.style.display = '';
      }
    }

    // Set solution image if exists
    const solutionImageContainer = document.getElementById(
      'case-study-solution-image',
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
      'case-study-solution-text-after',
    );
    if (data.solutionTextAfterImage) {
      solutionTextAfterContainer.textContent = data.solutionTextAfterImage;
      solutionTextAfterContainer.style.display = 'block';
    } else {
      solutionTextAfterContainer.style.display = 'none';
    }

    // Set solution image after text if exists
    const solutionImageAfterContainer = document.getElementById(
      'case-study-solution-image-after',
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
    const calendarSection = document.getElementById(
      'case-study-calendar-section',
    );
    if (data.calendarText) {
      calendarSection.style.display = 'flex';
      document.getElementById('case-study-calendar-text').textContent =
        data.calendarText;

      const calendarImagesContainer = document.getElementById(
        'case-study-calendar-images',
      );
      if (data.calendarImages && data.calendarImages.length > 0) {
        calendarImagesContainer.innerHTML = data.calendarImages
          .map(
            (imgSrc) =>
              `<img src="${imgSrc}" alt="Calendar image" class="case-study-image" data-image-popup="${imgSrc}" />`,
          )
          .join('');
      } else {
        calendarImagesContainer.innerHTML = '';
      }
    } else {
      calendarSection.style.display = 'none';
    }

    // Show and populate Profile section if exists in data
    const profileSection = document.getElementById(
      'case-study-profile-section',
    );
    if (data.profileText) {
      profileSection.style.display = 'flex';
      document.getElementById('case-study-profile-text').textContent =
        data.profileText;

      const profileImagesContainer = document.getElementById(
        'case-study-profile-images',
      );
      if (data.profileImages && data.profileImages.length > 0) {
        profileImagesContainer.innerHTML = data.profileImages
          .map(
            (imgSrc) =>
              `<img src="${imgSrc}" alt="Profile image" class="case-study-image" data-image-popup="${imgSrc}" />`,
          )
          .join('');
      } else {
        profileImagesContainer.innerHTML = '';
      }
    } else {
      profileSection.style.display = 'none';
    }

    // Show and populate Settings section if exists in data
    const settingsSection = document.getElementById(
      'case-study-settings-section',
    );
    if (data.settingsText) {
      settingsSection.style.display = 'flex';
      document.getElementById('case-study-settings-text').textContent =
        data.settingsText;

      const settingsImageContainer = document.getElementById(
        'case-study-settings-image',
      );
      if (data.settingsImage) {
        settingsImageContainer.innerHTML = `<img src="${data.settingsImage}" alt="Settings image" class="case-study-image" data-image-popup="${data.settingsImage}" />`;
      } else {
        settingsImageContainer.innerHTML = '';
      }
    } else {
      settingsSection.style.display = 'none';
    }

    // Set the remaining content (other paragraphs and images) in description
    const descriptionSection = document.getElementById(
      'case-study-description',
    );
    if (data.description) {
      descriptionSection.style.display = 'block';
      descriptionSection.innerHTML = tempDiv.innerHTML;
    } else {
      descriptionSection.style.display = 'none';
      descriptionSection.innerHTML = '';
    }

    // Attach image popup handlers for ALL images in the modal that have data-image-popup
    const allPopupImages =
      caseStudyModal.querySelectorAll('[data-image-popup]');
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

    // Modal elements are already referenced in the outer scope

    // Mobile-only: scroll forwarding + scroll boundary handling.
    // IMPORTANT: Keep these off desktop Chrome to avoid main-thread wheel scrolling.
    if (window.innerWidth < 768) {
      const isEventFromScrollableContainer = function (e) {
        if (!caseStudyModalContainer) return false;
        let target = e.target;

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

      const forwardScrollToPopupWheel = function (e) {
        if (isEventFromScrollableContainer(e)) return;
        if (!caseStudyModalContainer) return;

        e.preventDefault();
        e.stopPropagation();

        const scrollAmount = e.deltaY;
        const currentScroll = caseStudyModalContainer.scrollTop;
        const maxScroll =
          caseStudyModalContainer.scrollHeight -
          caseStudyModalContainer.clientHeight;
        const isAtTop = currentScroll === 0;
        const isAtBottom = currentScroll >= maxScroll - 1;

        if ((isAtTop && scrollAmount < 0) || (isAtBottom && scrollAmount > 0)) {
          return;
        }

        const newScroll = Math.max(
          0,
          Math.min(maxScroll, currentScroll + scrollAmount),
        );
        caseStudyModalContainer.scrollTop = newScroll;
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
        if (isEventFromScrollableContainer(e)) return;
        if (!caseStudyModalContainer || e.touches.length !== 1) return;

        e.preventDefault();
        e.stopPropagation();

        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        const maxScroll =
          caseStudyModalContainer.scrollHeight -
          caseStudyModalContainer.clientHeight;
        const newScroll = touchStartScroll + deltaY;

        caseStudyModalContainer.scrollTop = Math.max(
          0,
          Math.min(maxScroll, newScroll),
        );
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

      document._caseStudyScrollHandlers = {
        wheel: forwardScrollToPopupWheel,
        touchstart: forwardScrollToPopupTouchStart,
        touchmove: forwardScrollToPopupTouchMove,
      };
    }

    if (caseStudyModalContainer && window.innerWidth < 768) {
      let touchStartY = 0;

      const handleWheel = function (e) {
        if (window.innerWidth >= 768) return;
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
        if (window.innerWidth >= 768) return;
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
    // Resume immediately on close intent so the sky animates behind the closing transition.
    window.skyRenderer?.resume('caseStudyModal');
    // Remove hash from URL when closing
    const currentHash = window.location.hash;
    if (
      currentHash === '#docswell' ||
      currentHash === '#rememberly' ||
      currentHash === '#jiffyhive'
    ) {
      history.pushState(
        '',
        document.title,
        window.location.pathname + window.location.search,
      );
    }

    // Helper to run the actual teardown
    const finishClosing = () => {
      caseStudyModal.classList.remove('closing');
      caseStudyModal.classList.remove('opening'); // Reset entry animation class
      caseStudyModal.classList.remove('animation-complete');
      caseStudyModal.style.display = 'none';
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';

      // Remove scroll event listeners from container
      const caseStudyModalContainer = document.querySelector(
        '.case-study-modal-container',
      );
      if (caseStudyModalContainer && caseStudyModalContainer._scrollHandlers) {
        caseStudyModalContainer.removeEventListener(
          'wheel',
          caseStudyModalContainer._scrollHandlers.wheel,
        );
        caseStudyModalContainer.removeEventListener(
          'touchstart',
          caseStudyModalContainer._scrollHandlers.touchstart,
        );
        caseStudyModalContainer.removeEventListener(
          'touchmove',
          caseStudyModalContainer._scrollHandlers.touchmove,
        );
        caseStudyModalContainer._scrollHandlers = null;
      }

      // Remove document scroll handlers
      if (document._caseStudyScrollHandlers) {
        document.removeEventListener(
          'wheel',
          document._caseStudyScrollHandlers.wheel,
        );
        document.removeEventListener(
          'touchstart',
          document._caseStudyScrollHandlers.touchstart,
        );
        document.removeEventListener(
          'touchmove',
          document._caseStudyScrollHandlers.touchmove,
        );
        document._caseStudyScrollHandlers = null;
      }
    };

    // Desktop: animate slide-down before hiding
    if (window.innerWidth >= 768 && caseStudyModal.style.display !== 'none') {
      caseStudyModal.classList.add('closing');
      setTimeout(finishClosing, 600); // Matches CSS animation duration
    } else {
      // Mobile or already closed: close immediately
      finishClosing();
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
    window.skyRenderer?.pause('imagePopup');
    popupImage.src = imageSrc;
    popupImage.alt = imageAlt;
    imagePopupModal.classList.remove('closing');
    imagePopupModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    isZoomed = false;
  }

  // Function to close image popup modal
  function closeImagePopup() {
    if (imagePopupModal.style.display === 'none') return;

    // Resume immediately; if another modal is still open, token-based pausing keeps the sky paused.
    window.skyRenderer?.resume('imagePopup');

    imagePopupModal.classList.add('closing');
    setTimeout(() => {
      imagePopupModal.style.display = 'none';
      imagePopupModal.classList.remove('closing');
      document.body.style.overflow = 'auto';
      isZoomed = false;
    }, 300); // Matches CSS animation duration
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

    const allLinks = [...Array.from(navLinks), ...Array.from(mobileNavLinks)];

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
  }

  setActiveNav();
  window.addEventListener('hashchange', setActiveNav);

  // Hash-driven About modal behavior (removed to treat as simple popup)
  // function syncAboutModalToHash() { ... }

  // Re-attach close handlers for the moved close buttons
  // Because we moved the close buttons in the DOM, we need to ensure their listeners are attached
  // The variables `aboutModalClose` and `caseStudyModalClose` were queried at the top of DOMContentLoaded
  // but let's re-query them to be safe if they weren't caught or to be explicit.

  const newCaseStudyCloseBtn = document.querySelector(
    '#case-study-modal > .case-study-modal-close',
  );
  if (newCaseStudyCloseBtn) {
    newCaseStudyCloseBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeCaseStudyModal();
    });
  }

  const newAboutCloseBtn = document.querySelector(
    '#about-modal > .case-study-modal-close',
  );
  if (newAboutCloseBtn) {
    newAboutCloseBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeAboutModal();
    });
  }

  // Hash-based modal opening on page load
  function handleInitialHash() {
    const hash = window.location.hash;

    if (hash === '#about') {
      // Open about modal
      openAboutModal();
    } else if (hash === '#docswell') {
      // Open Docswell case study
      openCaseStudyModal('docswell');
    } else if (hash === '#rememberly') {
      // Open Rememberly case study
      openCaseStudyModal('rememberly');
    } else if (hash === '#jiffyhive') {
      // Open Jiffyhive case study
      openCaseStudyModal('jiffyhive');
    }
  }

  // Check hash on initial page load
  handleInitialHash();

  // Listen for hash changes (e.g., browser back/forward)
  window.addEventListener('hashchange', function () {
    const hash = window.location.hash;

    // Close any open modals first
    const aboutModalOpen = aboutModal && aboutModal.style.display === 'flex';
    const caseStudyModalOpen =
      caseStudyModal && caseStudyModal.style.display === 'flex';

    if (hash === '#about') {
      if (caseStudyModalOpen) closeCaseStudyModal();
      if (!aboutModalOpen) openAboutModal();
    } else if (hash === '#docswell') {
      if (aboutModalOpen) closeAboutModal();
      if (!caseStudyModalOpen) openCaseStudyModal('docswell');
    } else if (hash === '#rememberly') {
      if (aboutModalOpen) closeAboutModal();
      if (!caseStudyModalOpen) openCaseStudyModal('rememberly');
    } else if (hash === '#jiffyhive') {
      if (aboutModalOpen) closeAboutModal();
      if (!caseStudyModalOpen) openCaseStudyModal('jiffyhive');
    } else if (hash === '') {
      // No hash - close all modals
      if (aboutModalOpen) closeAboutModal();
      if (caseStudyModalOpen) closeCaseStudyModal();
    }
  });
});
