(function () {
  'use strict';

  document.documentElement.classList.add('js-enabled');

  // Navigation menu toggle
  var navToggle = document.getElementById('nav-toggle');
  var siteNav = document.getElementById('site-nav');
  var mqDesktop = window.matchMedia('(min-width: 1024px)');

  function closeMenu(returnFocus) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.textContent = 'メニュー';
    if (!mqDesktop.matches) {
      siteNav.hidden = true;
    } else {
      siteNav.hidden = false;
    }
    if (returnFocus) {
      navToggle.focus();
    }
  }

  function openMenu() {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.textContent = '閉じる';
    siteNav.hidden = false;
  }

  if (navToggle && siteNav) {
    // Initialize collapsed on mobile
    if (!mqDesktop.matches) {
      siteNav.hidden = true;
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = 'メニュー';
    } else {
      siteNav.hidden = false;
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = 'メニュー';
    }

    navToggle.addEventListener('click', function () {
      var isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMenu(false);
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu(true);
      }
    });

    var navLinks = siteNav.querySelectorAll('a');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function () {
        if (!mqDesktop.matches) {
          closeMenu(false);
        }
      });
    }

    if (typeof mqDesktop.addEventListener === 'function') {
      mqDesktop.addEventListener('change', function (e) {
        if (e.matches) {
          siteNav.hidden = false;
          navToggle.setAttribute('aria-expanded', 'false');
          navToggle.textContent = 'メニュー';
        } else {
          siteNav.hidden = true;
          navToggle.setAttribute('aria-expanded', 'false');
          navToggle.textContent = 'メニュー';
        }
      });
    }
  }

  // Mock contact form handling
  var form = document.getElementById('contact-form');
  if (form) {
    var nameInput = document.getElementById('contact-name');
    var emailInput = document.getElementById('contact-email');
    var shopInput = document.getElementById('contact-shop');
    var messageInput = document.getElementById('contact-message');
    var submitBtn = document.getElementById('contact-submit');
    var statusBox = document.getElementById('contact-status');

    var nameError = document.getElementById('contact-name-error');
    var emailError = document.getElementById('contact-email-error');
    var messageError = document.getElementById('contact-message-error');

    // Prevent any form submission
    form.addEventListener('submit', function (e) {
      e.preventDefault();
    });

    function setFieldState(input, errorEl, hintId, errorMessage) {
      if (!input || !errorEl) return;
      if (errorMessage) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', hintId + ' ' + errorEl.id);
        errorEl.textContent = errorMessage;
        errorEl.hidden = false;
      } else {
        input.setAttribute('aria-invalid', 'false');
        input.setAttribute('aria-describedby', hintId);
        errorEl.textContent = '';
        errorEl.hidden = true;
      }
    }

    function isValidEmail(value) {
      if (!value || value.length > 254) return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function validateForm() {
      var firstInvalid = null;

      var nameVal = nameInput ? nameInput.value.trim() : '';
      if (!nameVal) {
        setFieldState(nameInput, nameError, 'contact-name-hint', 'お名前を入力してください。');
        if (!firstInvalid) firstInvalid = nameInput;
      } else {
        setFieldState(nameInput, nameError, 'contact-name-hint', '');
      }

      var emailVal = emailInput ? emailInput.value.trim() : '';
      if (!isValidEmail(emailVal)) {
        setFieldState(emailInput, emailError, 'contact-email-hint', 'メールアドレスの形式を確認してください。');
        if (!firstInvalid) firstInvalid = emailInput;
      } else {
        setFieldState(emailInput, emailError, 'contact-email-hint', '');
      }

      var messageVal = messageInput ? messageInput.value.trim() : '';
      if (!messageVal) {
        setFieldState(messageInput, messageError, 'contact-message-hint', 'ご相談内容を入力してください。');
        if (!firstInvalid) firstInvalid = messageInput;
      } else {
        setFieldState(messageInput, messageError, 'contact-message-hint', '');
      }

      if (firstInvalid) {
        if (statusBox) {
          statusBox.textContent = '';
          statusBox.hidden = true;
        }
        firstInvalid.focus();
        return false;
      }

      if (statusBox) {
        statusBox.textContent = '入力内容を確認しました。これはデモのため、送信・保存は行っていません。返信はありません。';
        statusBox.hidden = false;
      }
      return true;
    }

    var inputs = [nameInput, emailInput, shopInput, messageInput];
    for (var j = 0; j < inputs.length; j++) {
      if (inputs[j]) {
        inputs[j].disabled = false;
        if (inputs[j].tagName === 'INPUT') {
          inputs[j].addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              validateForm();
            }
          });
        }
      }
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        validateForm();
      });
    }
  }
})();
