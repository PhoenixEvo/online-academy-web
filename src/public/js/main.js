/**
 * Template Name: Mentor
 * Template URL: https://bootstrapmade.com/mentor-free-education-bootstrap-theme/
 * Updated: Jul 07 2025 with Bootstrap v5.3.7
 * Author: BootstrapMade.com
 * License: https://bootstrapmade.com/license/
 */

(function () {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector("body");
    const selectHeader = document.querySelector("#header");
    if (
      !selectHeader.classList.contains("scroll-up-sticky") &&
      !selectHeader.classList.contains("sticky-top") &&
      !selectHeader.classList.contains("fixed-top")
    )
      return;
    window.scrollY > 100
      ? selectBody.classList.add("scrolled")
      : selectBody.classList.remove("scrolled");
  }

  document.addEventListener("scroll", toggleScrolled);
  window.addEventListener("load", toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector(".mobile-nav-toggle");

  function mobileNavToogle() {
    document.querySelector("body").classList.toggle("mobile-nav-active");
    mobileNavToggleBtn.classList.toggle("bi-list");
    mobileNavToggleBtn.classList.toggle("bi-x");
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener("click", mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll("#navmenu a").forEach((navmenu) => {
    navmenu.addEventListener("click", () => {
      if (document.querySelector(".mobile-nav-active")) {
        mobileNavToogle();
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll(".navmenu .toggle-dropdown").forEach((navmenu) => {
    navmenu.addEventListener("click", function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle("active");
      this.parentNode.nextElementSibling.classList.toggle("dropdown-active");
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector("#preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector(".scroll-top");

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100
        ? scrollTop.classList.add("active")
        : scrollTop.classList.remove("active");
    }
  }
  if (scrollTop) {
    scrollTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  window.addEventListener("load", toggleScrollTop);
  document.addEventListener("scroll", toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }
  window.addEventListener("load", aosInit);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: ".glightbox",
  });

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);
  
  /**
   * Password visibility toggle (delegated)
   * Works across pages without inline scripts (CSP friendly)
   */
  document.addEventListener('click', function (event) {
    const btn = event.target.closest('.toggle-password');
    if (!btn) return;
    const targetId = btn.getAttribute('data-target');
    if (!targetId) return;
    const input = document.getElementById(targetId);
    if (!input) return;
    const isPassword = input.getAttribute('type') === 'password';
    input.setAttribute('type', isPassword ? 'text' : 'password');
    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.toggle('bi-eye');
      icon.classList.toggle('bi-eye-slash');
    }
  });

  /**
   * Bootstrap-like form validation for forms with .needs-validation (CSP friendly)
   */
  document.addEventListener('submit', function (e) {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (!form.classList.contains('needs-validation')) return;
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.classList.add('was-validated');
  }, true);

  /**
   * Password confirmation live validation on profile page (CSP friendly)
   */
  document.addEventListener('input', function (e) {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.id === 'confirmPassword') {
      const password = document.getElementById('newPassword');
      if (password && target) {
        target.setCustomValidity(password.value !== target.value ? 'Passwords do not match' : '');
      }
    }
    if (target.id === 'newPassword') {
      const confirm = document.getElementById('confirmPassword');
      if (confirm && confirm.value) {
        confirm.dispatchEvent(new Event('input'));
      }
    }
  });

  /**
   * Newsletter subscription form handler (CSP friendly)
   */
  document.addEventListener('submit', function (e) {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.id !== 'newsletter-form') return;
    
    e.preventDefault();
    handleNewsletterSubmission(form);
  });

  /**
   * Handle newsletter form submission
   */
  async function handleNewsletterSubmission(form) {
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput.value;
    const csrfToken = form.querySelector('input[name="_csrf"]').value;
    const loadingDiv = form.querySelector('.loading');
    const errorDiv = form.querySelector('.error-message');
    const sentDiv = form.querySelector('.sent-message');
    
    // Hide previous messages
    errorDiv.classList.remove('show');
    sentDiv.classList.remove('show');
    loadingDiv.classList.add('show');
    
    try {
      const response = await fetch('/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ email: email })
      });
      
      const result = await response.json();
      
      loadingDiv.classList.remove('show');
      
      if (result.success) {
        sentDiv.classList.add('show');
        emailInput.value = '';
      } else {
        errorDiv.textContent = result.message || 'An error occurred, please try again!';
        errorDiv.classList.add('show');
      }
    } catch (error) {
      loadingDiv.classList.remove('show');
      errorDiv.textContent = 'Network error. Please check your connection and try again.';
      errorDiv.classList.add('show');
      console.error('Newsletter subscription error:', error);
    }
  }
})();
