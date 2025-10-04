// Function to initialize verify OTP form
function initVerifyOtpForm() {
  // Get OTP form elements
  const otpInput = document.querySelector("#otpCode");
  const form = document.querySelector('form[action="/auth/verify-otp"]');
  const resendLink = document.querySelector("#resendOtpLink");
  const resendForm = document.querySelector("#resendOtpForm");

  if (!otpInput || !form) {
    console.error("Required OTP form elements not found!");
    return;
  }

  // Float helper functionality
  function floatHelper(group) {
    const input = group.querySelector("input");
    if (!input) return;

    const update = () => {
      if (document.activeElement === input || input.value.trim() !== "") {
        group.classList.add("focusWithText");
      } else {
        group.classList.remove("focusWithText");
      }
    };

    input.addEventListener("focus", update);
    input.addEventListener("blur", update);
    input.addEventListener("input", update);
    update();
  }

  // Apply float helper to OTP input
  const otpGroup = otpInput.closest(".inputGroup");
  if (otpGroup) {
    floatHelper(otpGroup);
  }

  // OTP input validation and formatting
  otpInput.addEventListener("input", (e) => {
    let value = e.target.value;

    // Only allow numbers
    value = value.replace(/[^0-9]/g, "");

    // Limit to 6 digits
    if (value.length > 6) {
      value = value.substring(0, 6);
    }

    e.target.value = value;

    // Update input group styling based on validation
    const inputGroup = e.target.closest(".inputGroup");

    if (value.length === 0) {
      inputGroup.classList.remove("valid", "invalid");
    } else if (value.length === 6) {
      inputGroup.classList.remove("invalid");
      inputGroup.classList.add("valid");
    } else {
      inputGroup.classList.remove("valid");
      inputGroup.classList.add("invalid");
    }
  });

  // Auto-submit when 6 digits are entered
  otpInput.addEventListener("input", (e) => {
    if (e.target.value.length === 6) {
      // Add a small delay to show the validation state
      setTimeout(() => {
        form.submit();
      }, 500);
    }
  });

  // Form submission validation
  form.addEventListener("submit", (e) => {
    const otpValue = otpInput.value.trim();
    const inputGroup = otpInput.closest(".inputGroup");

    if (otpValue.length === 0) {
      e.preventDefault();
      inputGroup.classList.add("invalid");
    } else if (otpValue.length !== 6) {
      e.preventDefault();
      inputGroup.classList.add("invalid");
    } else if (!/^[0-9]{6}$/.test(otpValue)) {
      e.preventDefault();
      inputGroup.classList.add("invalid");
    }
  });

  // Focus on OTP input when page loads
  otpInput.focus();

  // Add paste event handler for OTP
  otpInput.addEventListener("paste", (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const numbersOnly = pastedData.replace(/[^0-9]/g, "");

    if (numbersOnly.length <= 6) {
      otpInput.value = numbersOnly;

      // Trigger input event to update validation
      const inputEvent = new Event("input", { bubbles: true });
      otpInput.dispatchEvent(inputEvent);

      // Auto-submit if 6 digits
      if (numbersOnly.length === 6) {
        setTimeout(() => {
          form.submit();
        }, 500);
      }
    }
  });

  // Handle resend OTP link
  if (resendLink && resendForm) {
    let resendCooldown = 0;

    resendLink.addEventListener("click", async (e) => {
      e.preventDefault();

      if (resendCooldown > 0) {
        return;
      }

      // Get form data as URL-encoded string
      const formData = new FormData(resendForm);
      const urlEncodedData = new URLSearchParams();
      for (let [key, value] of formData.entries()) {
        urlEncodedData.append(key, value);
      }

      // Disable link and show loading
      resendLink.style.pointerEvents = "none";
      resendLink.style.opacity = "0.5";
      const originalText = resendLink.textContent;
      resendLink.textContent = "Sending...";

      try {
        // Submit the hidden form via fetch
        // Get CSRF token from the hidden form
        const csrfToken = resendForm.querySelector('input[name="_csrf"]').value;

        const response = await fetch("/auth/resend-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-CSRF-Token": csrfToken,
          },
          body: urlEncodedData.toString(),
        });

        const result = await response.json();

        if (response.ok) {
          // Show success message
          showMessage(result.success, "success");

          // Start cooldown (60 seconds)
          resendCooldown = 60;
          startCooldown();
        } else {
          // Show error message
          showMessage(result.error, "error");
        }
      } catch (error) {
        console.error("EXCEPTION: Resend OTP error:", error);
        showMessage("Failed to resend OTP. Please try again.", "error");
      } finally {
        // Re-enable link
        resendLink.style.pointerEvents = "auto";
        resendLink.style.opacity = "1";
        resendLink.textContent = originalText;
      }
    });

    // Cooldown timer
    function startCooldown() {
      const interval = setInterval(() => {
        resendCooldown--;
        if (resendCooldown <= 0) {
          clearInterval(interval);
          resendLink.textContent = "Resend OTP";
        } else {
          resendLink.textContent = `Resend OTP (${resendCooldown}s)`;
        }
      }, 1000);
    }
  }

  // Show message function
  function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll(".message-alert");
    existingMessages.forEach((msg) => msg.remove());

    // Create new message
    const messageDiv = document.createElement("div");
    messageDiv.className = "message-alert";
    messageDiv.style.cssText = `
      background-color: ${type === "success" ? "#d4edda" : "#f8d7da"};
      color: ${type === "success" ? "#155724" : "#721c24"};
      border: 1px solid ${type === "success" ? "#c3e6cb" : "#f5c6cb"};
      border-radius: 0.5em;
      padding: 1em;
      margin-bottom: 1em;
      font-size: 0.9em;
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      max-width: 400px;
      text-align: center;
    `;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initVerifyOtpForm);

// Also try to initialize immediately in case DOM is already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVerifyOtpForm);
} else {
  initVerifyOtpForm();
}
