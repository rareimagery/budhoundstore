/**
 * @file
 * Barcode / QR scanner for Drupal Commerce product forms.
 *
 * Adds a "📷 Scan Barcode" button next to every SKU field on the page.
 * Uses the html5-qrcode library (loaded from CDN on first use) to access
 * the device camera. Supports rear camera on phones/tablets as well as
 * USB barcode scanners (which already act as keyboard input — they fill the
 * field automatically without needing this script).
 */

(function (Drupal, once) {
  'use strict';

  const CDN_URL = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
  let scannerInstance = null;
  let modalEl = null;

  // ── Behavior ──────────────────────────────────────────────────────────────

  Drupal.behaviors.commerceBarcodeScanner = {
    attach: function (context) {
      // SKU inputs live inside the variation inline entity form.
      // Their name attribute contains "[sku]" in the path.
      const skuInputs = context.querySelectorAll
        ? context.querySelectorAll('input[type="text"][name*="[sku]"]')
        : [];

      once('barcode-scan-btn', skuInputs).forEach(addScanButton);
    }
  };

  // ── UI helpers ────────────────────────────────────────────────────────────

  function addScanButton(input) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '📷 Scan Barcode';
    btn.className = 'button button--small barcode-scan-trigger';
    btn.style.cssText = 'margin-left: 8px; vertical-align: middle;';
    btn.setAttribute('aria-label', 'Open barcode scanner');

    // Insert directly after the input field
    input.parentNode.insertBefore(btn, input.nextSibling);

    btn.addEventListener('click', function () {
      openModal(input);
    });
  }

  function openModal(targetInput) {
    closeModal(); // clean up any previous modal

    // ── Modal markup ───────────────────────────────────────────────────────
    modalEl = document.createElement('div');
    modalEl.id = 'barcode-scanner-modal';
    modalEl.innerHTML = `
      <div id="bs-overlay" style="
        position:fixed;inset:0;background:rgba(0,0,0,0.65);
        display:flex;align-items:center;justify-content:center;z-index:99999;
      ">
        <div style="
          background:#fff;border-radius:14px;padding:24px;
          width:500px;max-width:95vw;
          box-shadow:0 24px 64px rgba(0,0,0,0.35);
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        ">
          <!-- Header -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="margin:0;font-size:1.05rem;color:#222;">📷 Scan Product Barcode</h3>
            <button id="bs-close" type="button" style="
              background:#f0f0f0;border:none;border-radius:50%;
              width:32px;height:32px;font-size:18px;cursor:pointer;
              display:flex;align-items:center;justify-content:center;
            ">×</button>
          </div>

          <!-- Camera viewfinder -->
          <div id="bs-reader" style="border-radius:10px;overflow:hidden;background:#111;"></div>
          <p id="bs-hint" style="font-size:0.82rem;color:#666;text-align:center;margin:10px 0 16px;">
            Point the camera at the barcode or QR code on the product packaging.
          </p>

          <!-- Manual fallback -->
          <div style="border-top:1px solid #eee;padding-top:14px;">
            <p style="font-size:0.82rem;color:#555;margin:0 0 8px;">Or type / paste the code manually:</p>
            <div style="display:flex;gap:8px;">
              <input
                id="bs-manual"
                type="text"
                placeholder="Barcode or SKU…"
                class="form-text"
                style="flex:1;padding:8px 12px;border:1px solid #ccc;border-radius:6px;font-size:0.9rem;"
              />
              <button id="bs-manual-submit" type="button" class="button button--primary"
                style="white-space:nowrap;">Use This</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    // Close on overlay click or × button
    document.getElementById('bs-close').addEventListener('click', closeModal);
    document.getElementById('bs-overlay').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });

    // Manual entry
    document.getElementById('bs-manual-submit').addEventListener('click', function () {
      const val = document.getElementById('bs-manual').value.trim();
      if (val) applyCode(val, targetInput);
    });
    document.getElementById('bs-manual').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const val = this.value.trim();
        if (val) applyCode(val, targetInput);
      }
    });

    // Start camera scanner
    loadLibraryThen(function () {
      initScanner(targetInput);
    });
  }

  // ── Scanner lifecycle ─────────────────────────────────────────────────────

  function loadLibraryThen(callback) {
    if (window.Html5Qrcode) {
      callback();
      return;
    }
    const script = document.createElement('script');
    script.src = CDN_URL;
    script.onload = callback;
    script.onerror = function () {
      setHint('Camera library failed to load. Use manual entry below.');
    };
    document.head.appendChild(script);
  }

  function initScanner(targetInput) {
    if (!window.Html5Qrcode) return;

    scannerInstance = new Html5Qrcode('bs-reader');
    scannerInstance
      .start(
        { facingMode: 'environment' },          // rear camera on mobile
        { fps: 10, qrbox: { width: 260, height: 140 } },
        function onScanSuccess(decodedText) {   // barcode detected
          applyCode(decodedText, targetInput);
        },
        function onScanFailure() {}             // no match yet — normal, ignore
      )
      .catch(function (err) {
        if (err && err.toString().includes('NotAllowed')) {
          setHint('Camera access was denied. Please allow camera access and try again, or use manual entry below.');
        } else {
          setHint('Camera unavailable on this device. Use manual entry below.');
        }
      });
  }

  // ── Apply scanned code ────────────────────────────────────────────────────

  function applyCode(code, targetInput) {
    targetInput.value = code;

    // Fire native events so Drupal / browser validation picks up the change
    targetInput.dispatchEvent(new Event('input',  { bubbles: true }));
    targetInput.dispatchEvent(new Event('change', { bubbles: true }));

    closeModal();

    // Brief green flash to confirm the fill
    targetInput.style.transition = 'background-color 0.2s';
    targetInput.style.backgroundColor = '#d4edda';
    setTimeout(function () {
      targetInput.style.backgroundColor = '';
    }, 1600);

    targetInput.focus();
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  function closeModal() {
    if (scannerInstance) {
      scannerInstance.stop().catch(function () {});
      scannerInstance = null;
    }
    if (modalEl) {
      modalEl.remove();
      modalEl = null;
    }
  }

  function setHint(msg) {
    const hint = document.getElementById('bs-hint');
    if (hint) hint.textContent = msg;
  }

}(Drupal, once));
