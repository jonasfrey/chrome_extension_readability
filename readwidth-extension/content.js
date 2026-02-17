(() => {
  let o_el__target = null;
  let o_el__panel_slider = null;
  let s_attr__modified = "data-readwidth-modified";
  let s_attr__style_original = "data-readwidth-original";

  // Track the element that was right-clicked
  document.addEventListener("contextmenu", (o_evt) => {
    o_el__target = f_o_el__text_block(o_evt.target);
  });

  // Find the nearest meaningful text container
  let f_o_el__text_block = function(o_el) {
    let a_s_tag = new Set([
      "P", "DIV", "ARTICLE", "SECTION", "MAIN", "BLOCKQUOTE",
      "LI", "TD", "TH", "FIGCAPTION", "DETAILS", "SUMMARY",
      "H1", "H2", "H3", "H4", "H5", "H6", "PRE", "DD", "DT"
    ]);

    let o_el__current = o_el;
    while (o_el__current && o_el__current !== document.body) {
      if (a_s_tag.has(o_el__current.tagName)) {
        let s_text = o_el__current.textContent?.trim() || "";
        if (s_text.length > 20) return o_el__current;
      }
      o_el__current = o_el__current.parentElement;
    }
    return o_el.parentElement || o_el;
  };
  
  // Measure average character width for an element's computed font
  let f_n_scl_x__char = function(o_el) {
    let o_style = getComputedStyle(o_el);
    let o_el__canvas = document.createElement("canvas");
    let o_ctx = o_el__canvas.getContext("2d");
    o_ctx.font = `${o_style.fontStyle} ${o_style.fontWeight} ${o_style.fontSize} ${o_style.fontFamily}`;

    let s_sample = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,.;:!?-";
    let n_scl_x = o_ctx.measureText(s_sample).width;
    return n_scl_x / s_sample.length;
  };

  // Calculate the current approximate characters per line
  let f_n_cpl__current = function(o_el) {
    let n_scl_x__char = f_n_scl_x__char(o_el);
    let o_style = getComputedStyle(o_el);
    let n_padding__left = parseFloat(o_style.paddingLeft) || 0;
    let n_padding__right = parseFloat(o_style.paddingRight) || 0;
    let n_scl_x__content = o_el.clientWidth - n_padding__left - n_padding__right;
    return Math.round(n_scl_x__content / n_scl_x__char);
  };

  // Apply a character-per-line limit to an element
  let f_apply_cpl = function(o_el, n_cpl) {
    if (!o_el.hasAttribute(s_attr__style_original)) {
      o_el.setAttribute(s_attr__style_original, o_el.getAttribute("style") || "");
    }

    let n_scl_x__char = f_n_scl_x__char(o_el);
    let o_style = getComputedStyle(o_el);
    let n_padding__left = parseFloat(o_style.paddingLeft) || 0;
    let n_padding__right = parseFloat(o_style.paddingRight) || 0;
    let n_scl_x__target = Math.round(n_scl_x__char * n_cpl) + n_padding__left + n_padding__right;

    o_el.style.maxWidth = n_scl_x__target + "px";
    o_el.style.marginLeft = "auto";
    o_el.style.marginRight = "auto";
    o_el.setAttribute(s_attr__modified, "true");
  };

  // Reset a single element
  let f_reset_el = function(o_el) {
    if (!o_el?.hasAttribute(s_attr__style_original)) return;
    let s_style__original = o_el.getAttribute(s_attr__style_original);
    if (s_style__original) {
      o_el.setAttribute("style", s_style__original);
    } else {
      o_el.removeAttribute("style");
    }
    o_el.removeAttribute(s_attr__style_original);
    o_el.removeAttribute(s_attr__modified);
  };

  // Reset all modified elements on the page
  let f_reset_all = function() {
    document.querySelectorAll(`[${s_attr__modified}]`).forEach(f_reset_el);
  };

  // Get target elements based on scope
  let f_a_o_el__target = function(o_el, s_scope) {
    if (s_scope === "element") return [o_el];
    let a_s_tag = new Set([
      "P", "DIV", "BLOCKQUOTE", "LI", "H1", "H2", "H3", "H4", "H5", "H6", "PRE", "DD", "DT"
    ]);
    let a_o_el__target = [o_el];
    o_el.querySelectorAll("*").forEach((o_el__child) => {
      if (a_s_tag.has(o_el__child.tagName) && o_el__child.textContent.trim().length > 20) {
        a_o_el__target.push(o_el__child);
      }
    });
    return a_o_el__target;
  };

  // ── Slider Panel UI ──────────────────────────────────────────────

  let f_remove_slider = function() {
    if (o_el__panel_slider) {
      o_el__panel_slider.remove();
      o_el__panel_slider = null;
    }
  };

  let n_cpl__default = 65;

  // Apply CPL to all targets for the given scope and update the display
  let f_apply_to_scope = function(o_el, s_scope, n_cpl, o_el__panel) {
    let a_o_el = f_a_o_el__target(o_el, s_scope);
    a_o_el.forEach((o_el__item) => f_apply_cpl(o_el__item, n_cpl));
    if (o_el__panel) {
      o_el__panel.querySelector(".rw-current").textContent = f_n_cpl__current(o_el);
    }
  };

  let f_create_slider = function(o_el) {
    f_remove_slider();

    let s_scope = "children";

    // Immediately apply default CPL so the user sees the result in one click
    f_apply_to_scope(o_el, s_scope, n_cpl__default, null);

    let n_cpl__current = f_n_cpl__current(o_el);

    let o_el__panel = document.createElement("div");
    o_el__panel.id = "readwidth-panel";
    o_el__panel.innerHTML = `
      <div class="rw-header">
        <span class="rw-logo">↔ ReadWidth</span>
        <button class="rw-close" title="Close">✕</button>
      </div>
      <div class="rw-body">
        <div class="rw-info">
          Current: <strong class="rw-current">${n_cpl__current}</strong> chars/line
        </div>
        <div class="rw-control">
          <label>Target chars/line:</label>
          <div class="rw-slider-row">
            <input type="range" min="30" max="120" value="${n_cpl__default}" class="rw-slider" />
            <span class="rw-value">${n_cpl__default}</span>
          </div>
        </div>
        <div class="rw-control">
          <label>Apply to:</label>
          <div class="rw-scope-row">
            <button class="rw-scope-btn" data-scope="element">This block</button>
            <button class="rw-scope-btn active" data-scope="children">Block + children</button>
          </div>
        </div>
        <div class="rw-actions">
          <button class="rw-btn rw-reset">Reset</button>
        </div>
        <div class="rw-guide">
          <div class="rw-guide-bar">
            <span class="rw-zone rw-zone-ok" style="left:22.2%;width:22.2%;" title="50–70: Optimal">50–70 ✓</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(o_el__panel);
    o_el__panel_slider = o_el__panel;

    let o_el__slider = o_el__panel.querySelector(".rw-slider");
    let o_el__display_val = o_el__panel.querySelector(".rw-value");
    let o_el__btn_close = o_el__panel.querySelector(".rw-close");
    let o_el__btn_reset = o_el__panel.querySelector(".rw-reset");
    let a_o_el__btn_scope = o_el__panel.querySelectorAll(".rw-scope-btn");

    // Live-apply as the slider is dragged
    o_el__slider.addEventListener("input", () => {
      o_el__display_val.textContent = o_el__slider.value;
      let n_cpl = parseInt(o_el__slider.value, 10);
      f_apply_to_scope(o_el, s_scope, n_cpl, o_el__panel);
    });

    a_o_el__btn_scope.forEach((o_el__btn) => {
      o_el__btn.addEventListener("click", () => {
        a_o_el__btn_scope.forEach((o_el__btn_other) => o_el__btn_other.classList.remove("active"));
        o_el__btn.classList.add("active");
        s_scope = o_el__btn.dataset.scope;
        let n_cpl = parseInt(o_el__slider.value, 10);
        f_apply_to_scope(o_el, s_scope, n_cpl, o_el__panel);
      });
    });

    o_el__btn_reset.addEventListener("click", () => {
      let a_o_el = f_a_o_el__target(o_el, "children");
      a_o_el.forEach(f_reset_el);
      o_el__panel.querySelector(".rw-current").textContent = f_n_cpl__current(o_el);
    });

    o_el__btn_close.addEventListener("click", () => {
      f_remove_slider();
    });

    let f_handle_esc = function(o_evt) {
      if (o_evt.key === "Escape") {
        f_remove_slider();
        document.removeEventListener("keydown", f_handle_esc);
      }
    };
    document.addEventListener("keydown", f_handle_esc);

    f_make_draggable(o_el__panel, o_el__panel.querySelector(".rw-header"));
  };

  let f_make_draggable = function(o_el__panel, o_el__handle) {
    let n_off_x, n_off_y, b_dragging = false;

    o_el__handle.addEventListener("mousedown", (o_evt) => {
      if (o_evt.target.classList.contains("rw-close")) return;
      b_dragging = true;
      let o_rect = o_el__panel.getBoundingClientRect();
      n_off_x = o_evt.clientX - o_rect.left;
      n_off_y = o_evt.clientY - o_rect.top;
      o_el__panel.style.transition = "none";
      o_evt.preventDefault();
    });

    document.addEventListener("mousemove", (o_evt) => {
      if (!b_dragging) return;
      o_el__panel.style.left = (o_evt.clientX - n_off_x) + "px";
      o_el__panel.style.top = (o_evt.clientY - n_off_y) + "px";
      o_el__panel.style.right = "auto";
    });

    document.addEventListener("mouseup", () => {
      b_dragging = false;
    });
  };

  // ── Message listener ─────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((o_msg) => {
    if (o_msg.action === "showSlider" && o_el__target) {
      f_create_slider(o_el__target);
    } else if (o_msg.action === "resetElement" && o_el__target) {
      f_reset_el(o_el__target);
    } else if (o_msg.action === "resetAll") {
      f_reset_all();
      f_remove_slider();
    }
  });
})();
