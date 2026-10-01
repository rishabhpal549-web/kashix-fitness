/**
 * KASHIX FITNESS — Master Client JavaScript & Supabase Integration
 * Brand: KashiX Fitness | Train Strong. Live Stronger.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Header scroll effect ---
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // --- Mobile Drawer Menu ---
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const closeDrawerBtn = document.querySelector('.mobile-drawer-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

  function openDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  mobileLinks.forEach(link => link.addEventListener('click', closeDrawer));

  // --- Universal Tour Booking Modal ---
  const modal = document.getElementById('tourModal');
  const modalCloseBtn = document.querySelector('.modal-close-btn');
  const openModalBtns = document.querySelectorAll('[data-open-modal="tour"]');

  function openModal(service = 'Gym Membership') {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      const serviceSelect = modal.querySelector('select[name="service"]');
      if (serviceSelect && service) {
        serviceSelect.value = service;
      }
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-service') || 'Gym Membership';
      openModal(service);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // --- Supabase Data Submission Helper ---
  async function saveEnquiryToSupabase(payload) {
    const config = window.KASHIX_SUPABASE_CONFIG;
    if (!config || !config.url || !config.anonKey) {
      // Supabase credentials not set yet; continue with front-end flow
      return { success: true, localOnly: true };
    }

    try {
      const endpoint = `${config.url.replace(/\/+$/, '')}/rest/v1/kashix_enquiries`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('Supabase submission response status:', response.status, errorText);
        return { success: false, error: errorText };
      }

      return { success: true };
    } catch (err) {
      console.error('Supabase network error:', err);
      return { success: false, error: err.message };
    }
  }

  // --- Form Submissions (Main Contact & Modal Form) ---
  const forms = document.querySelectorAll('form[data-ajax-form="true"]');
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 6px;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          Submit Ho Raha Hai...
        `;
      }

      const formData = new FormData(form);
      const name = formData.get('fullName') || 'Valued Visitor';
      const phone = formData.get('phoneNumber') || '';
      const whatsapp = formData.get('whatsappNumber') || phone;
      const goal = formData.get('fitnessGoal') || '';
      const visitDate = formData.get('visitDate') || null;
      const time = formData.get('trainingTime') || '';
      const service = formData.get('service') || 'Gym Tour';
      const message = formData.get('message') || '';

      const payload = {
        full_name: name,
        phone_number: phone,
        whatsapp_number: whatsapp,
        fitness_goal: goal,
        visit_date: visitDate ? visitDate : null,
        training_time: time,
        service: service,
        message: message,
        source: form.id === 'contactPageForm' ? 'contact_page' : 'modal_tour_booking'
      };

      // Attempt saving to Supabase
      await saveEnquiryToSupabase(payload);

      // Render clean confirmation screen
      form.innerHTML = `
        <div class="form-status success" style="display: block; text-align: center; padding: 2.5rem 1.5rem;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(184, 255, 61, 0.15); border: 2px solid var(--accent-lime); color: var(--accent-lime); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3 style="color: var(--text-white); margin-bottom: 0.5rem; font-family: var(--font-display); font-size: 1.85rem;">Dhanyawad, ${escapeHtml(name)} ji!</h3>
          <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 1.5rem; line-height: 1.5;">
            Aapki enquiry <strong>${escapeHtml(service)}</strong> ke liye receive ho gayi hai.<br>
            Hamari team aapse jald hi contact karke scheduled visit slot confirm karegi.
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <a href="https://wa.me/?text=${encodeURIComponent(`Hi KashiX Fitness, mera naam ${name} hai. Maine abhi ${service} ke liye website par enquiry submit ki hai aur apna gym tour confirm karna chahta hoon.`)}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.101-.477-.15-.678.15-.201.3-.778.979-.954 1.18-.176.201-.352.226-.653.076-.301-.15-1.272-.469-2.423-1.496-.895-.798-1.5-1.784-1.676-2.085-.176-.301-.019-.464.132-.614.135-.135.301-.351.452-.527.15-.176.201-.301.301-.502.101-.201.05-.376-.025-.527-.075-.15-.678-1.632-.929-2.234-.244-.588-.492-.508-.678-.517l-.578-.01c-.201 0-.527.075-.803.376s-1.054 1.029-1.054 2.511c0 1.482 1.079 2.912 1.23 3.113.15.201 2.124 3.243 5.146 4.549.719.311 1.28.497 1.717.636.721.229 1.378.197 1.898.119.58-.088 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.125-.276-.201-.577-.351z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.305C8.42 21.536 10.15 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.64 0-3.17-.48-4.47-1.3l-.32-.2-2.96.77.79-2.88-.21-.34A8.16 8.16 0 0 1 3.8 12c0-4.52 3.68-8.2 8.2-8.2 4.52 0 8.2 3.68 8.2 8.2 0 4.52-3.68 8.2-8.2 8.2z"/>
              </svg>
              WhatsApp Par Fast-Track Karein
            </a>
            <button type="button" class="btn btn-secondary btn-sm" onclick="location.reload()">OK / Done</button>
          </div>
        </div>
      `;
    });
  });

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  // --- Accordion Logic (FAQ) ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('active');
        });
        if (!isActive) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  });

  const faqCompactItems = document.querySelectorAll('.faq-compact-item');
  faqCompactItems.forEach(item => {
    const question = item.querySelector('.faq-compact-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqCompactItems.forEach(other => {
          if (other !== item) other.classList.remove('active');
        });
        if (!isActive) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  });

  // --- Gallery Filter Bar ---
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
});
