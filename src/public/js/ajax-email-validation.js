/**
 * Reusable Ajax email validation function
 * Usage: initializeEmailValidation(emailInputId, messageContainerId, excludeUserId)
 * 
 * @param {string} emailInputId - ID of the email input element
 * @param {string} messageContainerId - ID of the container to show validation message
 * @param {number|string|null} excludeUserId - User ID to exclude from check (for edit forms)
 */
function initializeEmailValidation(emailInputId, messageContainerId, excludeUserId = null) {
  const emailInput = document.getElementById(emailInputId);
  const messageContainer = document.getElementById(messageContainerId);
  
  if (!emailInput) {
    console.warn(`Email input with ID "${emailInputId}" not found`);
    return;
  }

  let emailCheckTimeout = null;
  const formGroup = emailInput.closest('.form-group') || emailInput.closest('.mb-3') || emailInput.closest('.inputGroup');
  
  // Create message container if it doesn't exist
  let actualMessageContainer = messageContainer;
  if (!actualMessageContainer && formGroup) {
    const messageDiv = document.createElement('div');
    messageDiv.id = messageContainerId;
    messageDiv.className = 'ajax-validation-message';
    messageDiv.style.cssText = 'display: none; margin-top: 5px; font-size: 0.875rem;';
    formGroup.appendChild(messageDiv);
    actualMessageContainer = messageDiv;
  }

  emailInput.addEventListener('input', function(e) {
    const value = e.target.value.trim();
    
    // Clear previous timeout
    if (emailCheckTimeout) {
      clearTimeout(emailCheckTimeout);
    }

    // Hide validation message initially
    if (actualMessageContainer) {
      actualMessageContainer.style.display = 'none';
      actualMessageContainer.textContent = '';
    }

    // Remove validation classes
    if (formGroup) {
      emailInput.classList.remove('is-valid', 'is-invalid');
    }

    if (value.length === 0) {
      return;
    }

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      if (formGroup) {
        emailInput.classList.add('is-invalid');
      }
      if (messageContainer) {
        messageContainer.style.display = 'block';
        messageContainer.textContent = '✗ Invalid email format';
        messageContainer.style.color = '#dc3545';
      }
      return;
    }

    // Debounce Ajax check (wait 500ms after user stops typing)
    emailCheckTimeout = setTimeout(async () => {
      try {
        // Show loading state
        if (formGroup) {
          emailInput.classList.remove('is-valid', 'is-invalid');
        }
        if (actualMessageContainer) {
          actualMessageContainer.style.display = 'block';
          actualMessageContainer.textContent = 'Checking email availability...';
          actualMessageContainer.style.color = '#6c757d';
        }

        // Build API URL
        let apiUrl = `/api/auth/check-email?email=${encodeURIComponent(value)}`;
        if (excludeUserId) {
          apiUrl += `&excludeUserId=${encodeURIComponent(excludeUserId)}`;
        }

        // Make Ajax request to check email
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        const data = await response.json();

        if (data.success) {
          if (data.available) {
            // Email is available
            if (formGroup) {
              emailInput.classList.remove('is-invalid');
              emailInput.classList.add('is-valid');
            }
            if (actualMessageContainer) {
              actualMessageContainer.textContent = '✓ ' + (data.message || 'Email is available');
              actualMessageContainer.style.color = '#28a745';
            }
          } else {
            // Email is not available
            if (formGroup) {
              emailInput.classList.remove('is-valid');
              emailInput.classList.add('is-invalid');
            }
            if (actualMessageContainer) {
              actualMessageContainer.textContent = '✗ ' + (data.message || 'Email is already registered');
              actualMessageContainer.style.color = '#dc3545';
            }
          }
        } else {
          // Server error
          if (formGroup) {
            emailInput.classList.remove('is-valid', 'is-invalid');
          }
          if (actualMessageContainer) {
            actualMessageContainer.textContent = '⚠ ' + (data.message || 'Unable to verify email');
            actualMessageContainer.style.color = '#ffc107';
          }
        }
      } catch (error) {
        console.error('Email check error:', error);
        if (formGroup) {
          emailInput.classList.remove('is-valid', 'is-invalid');
        }
        if (actualMessageContainer) {
          actualMessageContainer.style.display = 'block';
          actualMessageContainer.textContent = '⚠ Network error. Please try again.';
          actualMessageContainer.style.color = '#ffc107';
        }
      }
    }, 500); // Wait 500ms after user stops typing
  });

  // Also validate on blur
  emailInput.addEventListener('blur', function() {
    const value = emailInput.value.trim();
    if (value.length > 0 && !emailInput.classList.contains('is-valid')) {
      // Trigger validation if not already validated
      emailInput.dispatchEvent(new Event('input'));
    }
  });
}

