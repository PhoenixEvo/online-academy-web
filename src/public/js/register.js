
// Function to initialize register form
function initRegisterForm() {

  // Get register form elements
  const registerEmail = document.querySelector("#registerEmail");
  const registerPassword = document.querySelector("#registerPassword");
  const registerPasswordConfirm = document.querySelector(
    "#registerPasswordConfirm"
  );
  const showPasswordCheck = document.querySelector("#showPasswordCheck");
  const termsCheck = document.querySelector("#termsCheck");

  if (!registerEmail || !registerPassword || !showPasswordCheck) {
    console.error("Required register form elements not found!");
    return;
  }

  // Float helpers functionality
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

  // Apply float helper to all input groups
  document
    .querySelectorAll(".inputGroup1, .inputGroup2, .inputGroup3")
    .forEach(floatHelper);

  // Show/hide password functionality
  const toggle = document.getElementById("showPasswordCheck");
  const pwd = document.getElementById("registerPassword");

  if (toggle && pwd) {
    toggle.addEventListener("change", () => {
      pwd.type = toggle.checked ? "text" : "password";
    });
  }
  // Full name validation
  const registerName = document.querySelector("#registerName");
  if (registerName) {
    registerName.addEventListener("input", (e) => {
      const value = e.target.value.trim();
      const inputGroup = e.target.closest(".inputGroup");

      if (value.length === 0) {
        inputGroup.classList.remove("valid", "invalid");
      } else if (value.length >= 2 && value.length <= 50) {
        inputGroup.classList.remove("invalid");
        inputGroup.classList.add("valid");
      } else {
        inputGroup.classList.remove("valid");
        inputGroup.classList.add("invalid");
      }
    });
  }

  // Email validation with visual feedback and Ajax check
  if (registerEmail) {
    let emailCheckTimeout = null;
    const emailValidationMessage = document.getElementById("emailValidationMessage");
    const inputGroup = registerEmail.closest(".inputGroup");
    
    registerEmail.addEventListener("input", (e) => {
      const value = e.target.value.trim();

      // Clear previous timeout
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout);
      }

      // Hide validation message initially
      if (emailValidationMessage) {
        emailValidationMessage.style.display = "none";
        emailValidationMessage.textContent = "";
      }

      if (value.length === 0) {
        inputGroup.classList.remove("valid", "invalid");
        return;
      }

      // Basic format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        inputGroup.classList.remove("valid");
        inputGroup.classList.add("invalid");
        return;
      }

      // Debounce Ajax check (wait 500ms after user stops typing)
      emailCheckTimeout = setTimeout(async () => {
        try {
          // Show loading state
          inputGroup.classList.remove("valid", "invalid");
          if (emailValidationMessage) {
            emailValidationMessage.style.display = "block";
            emailValidationMessage.textContent = "Checking email availability...";
            emailValidationMessage.style.color = "#6c757d";
          }

          // Make Ajax request to check email
          const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(value)}`, {
            method: "GET",
            headers: {
              "Accept": "application/json",
              "X-Requested-With": "XMLHttpRequest"
            }
          });

          const data = await response.json();

          if (data.success) {
            if (data.available) {
              // Email is available
              inputGroup.classList.remove("invalid");
              inputGroup.classList.add("valid");
              if (emailValidationMessage) {
                emailValidationMessage.textContent = "✓ " + (data.message || "Email is available");
                emailValidationMessage.style.color = "#28a745";
              }
            } else {
              // Email is not available
              inputGroup.classList.remove("valid");
              inputGroup.classList.add("invalid");
              if (emailValidationMessage) {
                emailValidationMessage.textContent = "✗ " + (data.message || "Email is already registered");
                emailValidationMessage.style.color = "#dc3545";
              }
            }
          } else {
            // Server error
            inputGroup.classList.remove("valid", "invalid");
            if (emailValidationMessage) {
              emailValidationMessage.textContent = "⚠ " + (data.message || "Unable to verify email");
              emailValidationMessage.style.color = "#ffc107";
            }
          }
        } catch (error) {
          console.error("Email check error:", error);
          inputGroup.classList.remove("valid", "invalid");
          if (emailValidationMessage) {
            emailValidationMessage.textContent = "⚠ Network error. Please try again.";
            emailValidationMessage.style.color = "#ffc107";
          }
        }
      }, 500); // Wait 500ms after user stops typing
    });

    // Also validate on blur
    registerEmail.addEventListener("blur", () => {
      const value = registerEmail.value.trim();
      if (value.length > 0 && !inputGroup.classList.contains("valid")) {
        // Trigger validation if not already validated
        registerEmail.dispatchEvent(new Event("input"));
      }
    });
  }

  // Password validation
  if (registerPassword) {
    registerPassword.addEventListener("input", (e) => {
      const value = e.target.value;
      const inputGroup = e.target.closest(".inputGroup");

      if (value.length === 0) {
        inputGroup.classList.remove("valid", "invalid");
      } else if (value.length >= 8) {
        inputGroup.classList.remove("invalid");
        inputGroup.classList.add("valid");
      } else {
        inputGroup.classList.remove("valid");
        inputGroup.classList.add("invalid");
      }
    });
  }

  // Confirm password validation
  if (registerPasswordConfirm && registerPassword) {
    registerPasswordConfirm.addEventListener("input", (e) => {
      const value = e.target.value;
      const passwordValue = registerPassword.value;
      const inputGroup = e.target.closest(".inputGroup");

      if (value.length === 0) {
        inputGroup.classList.remove("valid", "invalid");
      } else if (value === passwordValue && value.length >= 8) {
        inputGroup.classList.remove("invalid");
        inputGroup.classList.add("valid");
      } else {
        inputGroup.classList.remove("valid");
        inputGroup.classList.add("invalid");
      }
    });
  }

  // Terms checkbox validation
  if (termsCheck) {
    termsCheck.addEventListener("change", (e) => {
      const inputGroup = e.target.closest(".inputGroup");

      if (e.target.checked) {
        inputGroup.classList.remove("invalid");
        inputGroup.classList.add("valid");
      } else {
        inputGroup.classList.remove("valid");
        inputGroup.classList.add("invalid");
      }
    });
  }

  // Form submission validation
  const form = document.querySelector('form[action="/auth/register"]');
  if (form) {
    form.addEventListener("submit", (e) => {
      let isValid = true;
      const inputs = form.querySelectorAll("input[required]");

      inputs.forEach((input) => {
        const inputGroup = input.closest(".inputGroup");
        // Name validation
        if (input.name === "name") {
          if (input.value.trim().length < 2 || input.value.trim().length > 50) {
            inputGroup.classList.add("invalid");
            isValid = false;
          }
        }
        // Email validation
        else if (input.type === "email") {
          if (!input.value.includes("@") || !input.value.includes(".")) {
            inputGroup.classList.add("invalid");
            isValid = false;
          }
        }
        // Other input validation
        else if (!input.value.trim()) {
          inputGroup.classList.add("invalid");
          isValid = false;
        } 
        // Password validation
        else if (input.type === "password") {
          if (input.value.length < 8) {
            inputGroup.classList.add("invalid");
            isValid = false;
          }
        }
        // Terms checkbox validation
        else if (input.name === "acceptTerms") {
          if (!input.checked) {
            inputGroup.classList.add("invalid");
            isValid = false;
          }
        }
      });

      // Password confirmation validation
      if (registerPassword && registerPasswordConfirm) {
        if (registerPassword.value !== registerPasswordConfirm.value) {
          registerPasswordConfirm
            .closest(".inputGroup")
            .classList.add("invalid");
          isValid = false;
        }
      }
      
      if (!isValid) {
        e.preventDefault();
      }
    });
  }

}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initRegisterForm);

// Also try to initialize immediately in case DOM is already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRegisterForm);
} else {
  initRegisterForm();
}
