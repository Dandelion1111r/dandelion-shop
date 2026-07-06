let state = {
    message: '',
    textColor: '#8e44ad',
    fontSize: 20,
    balloonColor: '#FF69B4',
    filling: 'mini-balloons',
    design: 'default',
    symbol: '',
    card: '',
    persona: '',
    qty: 1,
    balloonType: 'latex',
    balloonTypePrice: 0,
    textEffect: 'normal'
  };

  let cart = (function() { try { return JSON.parse(localStorage.getItem('dandelionCart') || '[]'); } catch(e) { return []; } })();
  const PRICE = 42.90;
  const WA_NUMBER = '491757668955';

  const messageInput   = document.getElementById('messageInput');
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const fontSizeVal    = document.getElementById('fontSizeVal');
  const fillingSelect  = document.getElementById('fillingSelect');
  const designSelect   = document.getElementById('designSelect');
  const symbolSelect   = document.getElementById('symbolSelect');
  const SHIPPING_FEE       = 5.49;
  const FREE_SHIPPING_FROM = 60;
  const cardTextarea   = document.getElementById('cardTextarea');
  const charCount      = document.getElementById('charCount');
  const personaInput   = document.getElementById('personaInput');
  const qtyMinus       = document.getElementById('qtyMinus');
  const qtyPlus        = document.getElementById('qtyPlus');
  const qtyVal         = document.getElementById('qtyVal');
  const addToCartBtn   = document.getElementById('addToCartBtn');
  const cartCard       = document.getElementById('cartCard');
  const cartItemsList  = document.getElementById('cartItemsList');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const discountCodeInput = document.getElementById('discountCodeInput');
  const applyDiscountBtn  = document.getElementById('applyDiscountBtn');
  const VALID_DISCOUNT_CODE = 'WILLKOMMEN10';
  let appliedDiscount = false;
  applyDiscountBtn.addEventListener('click', () => {
    const code = discountCodeInput.value.trim().toUpperCase();
    const lang = localStorage.getItem('lang') || 'de';
    if (code === VALID_DISCOUNT_CODE) {
      appliedDiscount = true;
      showToast(lang === 'ro' ? '🎉 Codul de reducere a fost aplicat!' : '🎉 Rabattcode wurde angewendet!');
      updateCartUI();
    } else {
      showToast(lang === 'ro' ? '❌ Cod de reducere invalid.' : '❌ Ungültiger Rabattcode.');
    }
  });
  const cartCount      = document.getElementById('cartCount');
  const clearCartBtn   = document.getElementById('clearCartBtn');
  const textDisplay    = document.getElementById('textDisplay');
  const emojiDisplay   = document.getElementById('emojiDisplay');
  const balloonBody    = document.getElementById('balloonBody');
  const balloonFillColor = document.getElementById('balloonFillColor');
  const fillGradStop   = document.getElementById('fillGradStop');
  const fillGradStop2  = document.getElementById('fillGradStop2');
  const floatingEmojiContainer = document.getElementById('floatingEmojiContainer');
  const toast          = document.getElementById('toast');

  document.getElementById('balloonColorSwatches').addEventListener('click', e => {
    const sw = e.target.closest('.swatch');
    if (!sw) return;
    document.querySelectorAll('#balloonColorSwatches .swatch').forEach(s => s.classList.remove('active'));
    sw.classList.add('active');
    state.balloonColor = sw.dataset.color;
    document.getElementById('selectedColorName').textContent = sw.dataset.name;
    updatePreview();
  });

  document.getElementById('textColorSwatches').addEventListener('click', e => {
    const sw = e.target.closest('.text-swatch');
    if (!sw) return;
    document.querySelectorAll('#textColorSwatches .text-swatch').forEach(s => s.classList.remove('active'));
    sw.classList.add('active');
    state.textColor = sw.dataset.color;
    updatePreview();
  });

  fontSizeSlider.addEventListener('input', () => {
    state.fontSize = fontSizeSlider.value;
    fontSizeVal.textContent = state.fontSize + 'px';
    updatePreview();
  });

  messageInput.addEventListener('input', () => {
    state.message = messageInput.value;
    updatePreview();
  });

  document.getElementById('balloonTypeSelect').addEventListener('change', (e) => {
    state.balloonType = e.target.value;
    state.balloonTypePrice = parseFloat(e.target.selectedOptions[0].dataset.price) || 0;
    updatePriceDisplay();
  });

  document.getElementById('textEffectSelect').addEventListener('change', (e) => {
    state.textEffect = e.target.value;
    updatePreview();
  });

  function updatePriceDisplay() {
    document.querySelector('.price-main').textContent = (PRICE + state.balloonTypePrice).toFixed(2).replace('.',',') + ' €';
  }

  fillingSelect.addEventListener('change', () => {
    state.filling = fillingSelect.value;
    updatePreview();
  });

  designSelect.addEventListener('change', () => {
    state.design = designSelect.value;
    applyDesignTemplate(state.design);
  });

  symbolSelect.addEventListener('change', () => {
    state.symbol = symbolSelect.value;
    updatePreview();
  });

  cardTextarea.addEventListener('input', () => {
    state.card = cardTextarea.value;
    charCount.textContent = cardTextarea.value.length;
  });

  personaInput.addEventListener('input', () => {
    state.persona = personaInput.value;
  });

  qtyMinus.addEventListener('click', () => {
    if (state.qty > 1) { state.qty--; qtyVal.value = state.qty; }
  });

  qtyPlus.addEventListener('click', () => {
    if (state.qty < 20) { state.qty++; qtyVal.value = state.qty; }
  });

  document.getElementById('customImageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('⚠️ Bild ist zu groß (max. 4 MB)');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      state.customImage = reader.result;
      document.getElementById('customImageThumb').src = state.customImage;
      document.getElementById('customImagePreviewRow').style.display = 'flex';
      updatePreview();
      showToast('🖼️ Bild hinzugefügt!');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('removeCustomImage').addEventListener('click', () => {
    state.customImage = null;
    document.getElementById('customImageInput').value = '';
    document.getElementById('customImagePreviewRow').style.display = 'none';
    updatePreview();
  });

  function encodeDesign(s) {
    return btoa(encodeURIComponent(JSON.stringify({
      message: s.message, textColor: s.textColor, fontSize: s.fontSize,
      balloonColor: s.balloonColor, filling: s.filling, design: s.design,
      symbol: s.symbol, card: s.card, balloonType: s.balloonType,
      balloonTypePrice: s.balloonTypePrice, textEffect: s.textEffect
    })));
  }
  function decodeDesign(str) {
    try { return JSON.parse(decodeURIComponent(atob(str))); } catch(e) { return null; }
  }
  function applyDesign(d) {
    if (!d) return;
    Object.assign(state, d);
    messageInput.value = state.message || '';
    cardTextarea.value = state.card || '';
    charCount.textContent = (state.card || '').length;
    fontSizeSlider.value = state.fontSize;
    fontSizeVal.textContent = state.fontSize + 'px';
    designSelect.value = state.design || 'default';
    fillingSelect.value = state.filling || 'mini-balloons';
    symbolSelect.value = state.symbol || '';
    document.getElementById('balloonTypeSelect').value = state.balloonType || 'latex';
    document.getElementById('textEffectSelect').value = state.textEffect || 'normal';
    state.balloonTypePrice = parseFloat(document.getElementById('balloonTypeSelect').selectedOptions[0].dataset.price) || 0;
    updatePriceDisplay();
    document.querySelectorAll('#balloonColorSwatches .swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.color === state.balloonColor);
      if (s.dataset.color === state.balloonColor) document.getElementById('selectedColorName').textContent = s.dataset.name;
    });
    document.querySelectorAll('#textColorSwatches .text-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.color === state.textColor);
    });
    if (state.customImage) {
      document.getElementById('customImageThumb').src = state.customImage;
      document.getElementById('customImagePreviewRow').style.display = 'flex';
    } else {
      document.getElementById('customImagePreviewRow').style.display = 'none';
    }
    updatePreview();
  }
  function getSavedDesigns() {
    try { return JSON.parse(localStorage.getItem('savedDesigns') || '[]'); } catch(e) { return []; }
  }
  function renderSavedDesigns() {
    const saved = getSavedDesigns();
    const row = document.getElementById('savedDesignsRow');
    if (saved.length === 0) { row.style.display = 'none'; row.innerHTML = ''; return; }
    row.style.display = 'flex';
    row.innerHTML = saved.map((d, i) => `
      <span style="display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid #eee;border-radius:20px;padding:6px 10px;font-size:var(--fs-xs);cursor:pointer;" onclick="loadSavedDesign(${i})">
        <span style="width:14px;height:14px;border-radius:50%;background:${d.balloonColor};display:inline-block;border:1px solid #ddd;"></span>
        ${d.message ? d.message.substring(0,16) : 'Design ' + (i+1)}
        <i class="fas fa-times" style="color:var(--text-light);" onclick="event.stopPropagation();deleteSavedDesign(${i})"></i>
      </span>`).join('');
  }
  window.loadSavedDesign = function(i) {
    const saved = getSavedDesigns();
    applyDesign(saved[i]);
    showToast('💾 Design geladen!');
  };
  window.deleteSavedDesign = function(i) {
    const saved = getSavedDesigns();
    saved.splice(i, 1);
    localStorage.setItem('savedDesigns', JSON.stringify(saved));
    renderSavedDesigns();
  };
  document.getElementById('saveDesignBtn').addEventListener('click', () => {
    const saved = getSavedDesigns();
    saved.push({
      message: state.message, textColor: state.textColor, fontSize: state.fontSize,
      balloonColor: state.balloonColor, filling: state.filling, design: state.design,
      symbol: state.symbol, card: state.card, balloonType: state.balloonType,
      balloonTypePrice: state.balloonTypePrice, textEffect: state.textEffect
    });
    localStorage.setItem('savedDesigns', JSON.stringify(saved));
    renderSavedDesigns();
    showToast('💾 Design gespeichert!');
  });
  document.getElementById('shareDesignBtn').addEventListener('click', () => {
    const url = location.origin + location.pathname + '?design=' + encodeDesign(state);
    if (navigator.share) {
      navigator.share({ title: 'Mein Dandelion 11:11 Ballon-Design', text: 'Schau dir mein personalisiertes Ballon-Design an!', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => showToast('🔗 Link kopiert!'));
    }
  });
  renderSavedDesigns();
  (function loadDesignFromUrl() {
    const params = new URLSearchParams(location.search);
    const d = params.get('design');
    if (d) applyDesign(decodeDesign(d));
    const kat = params.get('kat');
    if (kat) {
      setTimeout(() => {
        showPage('kollektionen');
        const btn = document.querySelector(`.koll-filter[onclick="filterKoll('${kat}',this)"]`);
        if (btn) filterKoll(kat, btn); else renderKoll(kat);
      }, 0);
    }
    const page = params.get('page');
    if (page) {
      setTimeout(() => showPage(page), 0);
    }
  })();

  addToCartBtn.addEventListener('click', () => {
    for (let i = 0; i < state.qty; i++) {
      cart.push({
        id: Date.now() + i,
        message: state.message,
        symbol: state.symbol,
        filling: state.filling,
        balloonColor: state.balloonColor,
        textColor: state.textColor,
        design: state.design,
        card: state.card,
        persona: state.persona,
        customImage: state.customImage,
        balloonType: state.balloonType,
        textEffect: state.textEffect,
        price: PRICE + state.balloonTypePrice,
        date: new Date()
      });
    }
    updateCartUI();
    showToast(localStorage.getItem('lang')==='ro' ? `🛒 ${state.qty}x balon adăugat în coș!` : `🛒 ${state.qty}x Ballon in den Warenkorb gelegt!`);
  });

  // Show cart on load if items exist (added from category pages or previous session)
  if (cart.length) {
    updateCartUI();
    updateNavBadge();
    setTimeout(() => {
      document.getElementById('cartCard')?.scrollIntoView({ behavior: 'smooth' });
      showToast(`🛒 ${cart.length === 1 ? cart[0].productName || cart[0].message || 'Artikel' : cart.length + ' Artikel'} im Warenkorb`);
    }, 400);
  }

  clearCartBtn.addEventListener('click', () => {
    cart = [];
    localStorage.removeItem('dandelionCart');
    updateCartUI();
  });

  document.getElementById('cartWhatsappBtn')?.addEventListener('click', () => {
    const persona = state.persona?.trim();
    let msg = '🎈 *DANDELION 11:11 – ANFRAGE* 🎈\n\nHallo! Ich interessiere mich für eure Ballons und würde gerne mehr erfahren. 😊';
    if (persona) msg += `\n\n💡 *Über die Person:*\n"${persona}"`;
    msg += '\n\nKönnt ihr mir helfen?';
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  });

  function updateCartUI() {
    try { localStorage.setItem('dandelionCart', JSON.stringify(cart)); } catch(e) {}
    if (!cart.length) {
      cartCard.style.display = 'none';
      return;
    }
    cartCard.style.display = 'block';
    cartCount.textContent = cart.length;
    let html = '';
    let total = 0;
    cart.forEach(item => {
      total += item.price;
      html += `
        <div class="cart-item-row">
          <div>
            <div class="cart-item-name">${item.isKollProduct ? item.productName : (item.message || 'Ballon ohne Text') + ' ' + (item.symbol||'')}</div>
            <div class="cart-item-detail">${item.isKollProduct ? 'Fertigprodukt' : (item.filling !== 'none' ? item.filling : 'Keine Füllung') + ' · ' + item.design}</div>
          </div>
          <div class="cart-item-right">
            <span class="cart-item-price">${item.price.toFixed(2)} €</span>
            <button class="remove-btn" data-id="${item.id}">×</button>
          </div>
        </div>`;
    });
    const shipping = total >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
    html += `
        <div class="cart-item-row">
          <div class="cart-item-name">🚚 Versand (DHL)</div>
          <div class="cart-item-right">
            <span class="cart-item-price">${shipping === 0 ? 'kostenlos' : shipping.toFixed(2).replace('.', ',') + ' €'}</span>
          </div>
        </div>`;
    const discountAmount = appliedDiscount ? total * 0.1 : 0;
    if (appliedDiscount) {
      html += `
        <div class="cart-item-row">
          <div class="cart-item-name">🎉 ${VALID_DISCOUNT_CODE} (-10%)</div>
          <div class="cart-item-right">
            <span class="cart-item-price">-${discountAmount.toFixed(2).replace('.', ',')} €</span>
          </div>
        </div>`;
    }
    cartItemsList.innerHTML = html;
    cartTotalPrice.textContent = (total - discountAmount + shipping).toFixed(2).replace('.', ',') + ' €';
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        cart = cart.filter(i => i.id !== parseInt(btn.dataset.id));
        updateCartUI();
      });
    });
  }

  function updateNavBadge() {
    const badge = document.getElementById('navCartBadge');
    if (!badge) return;
    if (cart.length) {
      badge.textContent = cart.length;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  const _origUpdateCartUI = updateCartUI;
  updateCartUI = function() {
    _origUpdateCartUI();
    updateNavBadge();
  };

  window.addKollProduct = function(id) {
    const p = kollProducts.find(x => x.id === id);
    if (!p) return;
    cart.push({
      id: Date.now(),
      message: lp(p,'name'),
      symbol: p.emoji,
      filling: 'none',
      balloonColor: '#8e44ad',
      textColor: '#ffffff',
      design: 'standard',
      card: '',
      persona: '',
      price: p.price,
      productName: lp(p,'name'),
      date: new Date(),
      isKollProduct: true
    });
    updateCartUI();
    showToast(localStorage.getItem('lang')==='ro' ? `🛒 ${lp(p,'name')} adăugat în coș!` : `🛒 ${lp(p,'name')} in den Warenkorb gelegt!`);
    showPage('shop');
    setTimeout(() => document.getElementById('cartCard')?.scrollIntoView({behavior:'smooth'}), 80);
  };

  window.openProdModal = function(id) {
    const p = kollProducts.find(x => x.id === id);
    if (!p) return;
    const modal = document.getElementById('prodModal');
    const imgDiv = document.getElementById('prodModalImg');
    const imgs = p.imgs || (p.img ? [p.img] : []);
    if (imgs.length > 1) {
      imgDiv.innerHTML = `
        <div style="position:relative;background:#f3e6f9;">
          <img id="prodModalCarouselImg" src="${imgs[0]}" alt="${lp(p,'name')}" decoding="async" sizes="(max-width:600px) 100vw, 560px" style="width:100%;aspect-ratio:3/4;height:auto;object-fit:contain;display:block;">
          <button onclick="prodModalCarouselNav(-1)" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.35);color:#fff;border:none;border-radius:50%;width:34px;height:34px;font-size:1.2rem;cursor:pointer;">‹</button>
          <button onclick="prodModalCarouselNav(1)" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.35);color:#fff;border:none;border-radius:50%;width:34px;height:34px;font-size:1.2rem;cursor:pointer;">›</button>
          <div style="position:absolute;bottom:8px;left:0;right:0;display:flex;justify-content:center;gap:6px;">
            ${imgs.map((_,i) => `<span class="prodModalDot" data-i="${i}" style="width:8px;height:8px;border-radius:50%;background:${i===0?'#fff':'rgba(255,255,255,0.5)'};display:inline-block;"></span>`).join('')}
          </div>
        </div>`;
      window._prodModalImgs = imgs;
      window._prodModalIdx = 0;
    } else {
      imgDiv.innerHTML = imgs[0]
        ? `<img src="${imgs[0]}" alt="${lp(p,'name')}" decoding="async" sizes="(max-width:600px) 100vw, 560px" style="width:100%;aspect-ratio:3/4;height:auto;object-fit:contain;background:#f3e6f9;display:block;">`
        : `<div style="height:200px;display:flex;align-items:center;justify-content:center;font-size:5rem;">${p.emoji}</div>`;
    }
    document.getElementById('prodModalBadge').innerHTML = p.badge
      ? `<span style="background:linear-gradient(135deg,#8e44ad,#d63384);color:#fff;font-size:0.72rem;font-weight:700;padding:4px 12px;border-radius:50px;text-transform:uppercase;">${lp(p,'badge')}</span>` : '';
    document.getElementById('prodModalName').textContent = lp(p,'name');
    document.getElementById('prodModalDesc').textContent = lp(p,'desc');
    const specsBox = document.getElementById('prodModalSpecs');
    const specs = productSpecs[p.id];
    if (specs) {
      const lang = localStorage.getItem('lang') || 'de';
      const title = lang === 'ro' ? '📏 Detalii produs (aprox.)' : '📏 Produktdetails (ca.)';
      specsBox.innerHTML = `<strong style="color:var(--purple);">${title}</strong><div style="margin-top:6px;">${(lang === 'ro' ? specs.ro : specs.de)}</div>`;
      specsBox.style.display = 'block';
    } else {
      specsBox.style.display = 'none';
    }
    document.getElementById('prodModalPrice').textContent = p.price.toFixed(2).replace('.',',') + ' €';
    document.getElementById('prodModalCartBtn').onclick = function() {
      closeProdModal();
      addKollProduct(id);
    };
    renderProdBundle(p);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    setLang(localStorage.getItem('lang') || 'de');
  };

  function renderProdBundle(p) {
    const box = document.getElementById('prodModalBundle');
    const candidates = kollProducts.filter(x => x.id !== p.id && x.cat === p.cat);
    const pool = candidates.length >= 2 ? candidates : kollProducts.filter(x => x.id !== p.id);
    const partner = pool[Math.floor(Math.random() * pool.length)];
    if (!partner) { box.innerHTML = ''; return; }
    const bundlePrice = (p.price + partner.price) * 0.9;
    box.innerHTML = `
      <h3 style="font-size:1rem;font-weight:700;color:var(--purple);margin-bottom:10px;">💡 ${localStorage.getItem('lang')==='ro' ? 'Se asortează perfect' : 'Passt perfekt dazu'}</h3>
      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:200px;">
          ${(partner.img || (partner.imgs && partner.imgs[0])) ? `<img src="${partner.img || partner.imgs[0]}" alt="${lp(partner,'name')}" style="width:56px;height:56px;object-fit:cover;border-radius:10px;" onerror="this.outerHTML='<span style=&quot;width:56px;height:56px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;background:#f7eefb;border-radius:10px;&quot;>'+'${partner.emoji}'+'</span>';">` : `<span style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;background:#f7eefb;border-radius:10px;">${partner.emoji}</span>`}
          <div>
            <div style="font-weight:600;font-size:var(--fs-sm);">${lp(partner,'name')}</div>
            <div style="font-size:var(--fs-xs);color:var(--text-light);">${partner.price.toFixed(2).replace('.',',')} €</div>
          </div>
        </div>
        <button onclick="addBundle(${p.id},${partner.id})" style="background:#f7eefb;border:1px solid var(--purple);color:var(--purple);border-radius:50px;padding:10px 18px;font-size:var(--fs-sm);font-weight:600;cursor:pointer;white-space:nowrap;">
          🎁 Bundle für ${bundlePrice.toFixed(2).replace('.',',')} € <span style="text-decoration:line-through;color:var(--text-light);font-weight:400;">${(p.price+partner.price).toFixed(2).replace('.',',')} €</span>
        </button>
      </div>`;
  }

  window.addBundle = function(id1, id2) {
    addKollProduct(id1);
    addKollProduct(id2);
    const last = cart[cart.length - 1];
    const beforeLast = cart[cart.length - 2];
    if (last && beforeLast) {
      const total = beforeLast.price + last.price;
      const discounted = total * 0.9;
      const diff = total - discounted;
      last.price = Math.max(0, last.price - diff);
      updateCartUI();
    }
    closeProdModal();
    showToast('🎁 Bundle mit 10% Rabatt zum Warenkorb hinzugefügt!');
  };

  window.prodModalCarouselNav = function(dir) {
    const imgs = window._prodModalImgs;
    if (!imgs) return;
    window._prodModalIdx = (window._prodModalIdx + dir + imgs.length) % imgs.length;
    document.getElementById('prodModalCarouselImg').src = imgs[window._prodModalIdx];
    document.querySelectorAll('.prodModalDot').forEach((d,i) => {
      d.style.background = i === window._prodModalIdx ? '#fff' : 'rgba(255,255,255,0.5)';
    });
  };

  window.closeProdModal = function(e) {
    if (e && e.target !== document.getElementById('prodModal')) return;
    document.getElementById('prodModal').style.display = 'none';
    document.body.style.overflow = '';
  };

  window.openLbx = function(src) {
    if (!src) return;
    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lightbox-img');
    lbImg.src = src;
    lb.style.display = 'flex';
    lb.style.position = 'fixed';
    lb.style.inset = '0';
    lb.style.background = 'rgba(0,0,0,0.88)';
    lb.style.zIndex = '9999';
    lb.style.alignItems = 'center';
    lb.style.justifyContent = 'center';
    lb.style.padding = '20px';
    lb.onclick = function() { lb.style.display = 'none'; };
  };

  function updatePreview() {
    balloonBody.setAttribute('fill', state.balloonColor);
    balloonBody.setAttribute('opacity', '0.28');
    fillGradStop.setAttribute('stop-color', state.balloonColor);
    fillGradStop2.setAttribute('stop-color', state.balloonColor);
    if (state.message || state.symbol) {
      emojiDisplay.style.display = state.symbol ? 'block' : 'none';
      emojiDisplay.textContent = state.symbol;
      textDisplay.textContent = state.message;
      textDisplay.style.color = state.textColor;
      textDisplay.style.fontSize = state.fontSize + 'px';
      textDisplay.className = 'balloon-text-display' + (state.textEffect !== 'normal' ? ' fx-' + state.textEffect : '');
      if (state.textEffect === 'glitter') textDisplay.style.color = '';
    } else {
      emojiDisplay.style.display = 'none';
      textDisplay.textContent = '';
    }
    const customImageDisplay = document.getElementById('customImageDisplay');
    if (state.customImage) {
      customImageDisplay.src = state.customImage;
      customImageDisplay.style.display = 'block';
    } else {
      customImageDisplay.style.display = 'none';
    }
    updateFilling();
  }

  const FILLING_MAP = {
    'none':         { emoji: '', count: 0 },
    'mini-balloons':{ emoji: '🎈', count: 40 },
    'confetti':     { emoji: '🎊', count: 55 },
    'hearts':       { emoji: '❤️', count: 38 },
    'stars':        { emoji: '⭐', count: 42 },
    'flowers':      { emoji: '🌸', count: 36 },
    'butterflies':  { emoji: '🦋', count: 30 }
  };

  function updateFilling() {
    floatingEmojiContainer.innerHTML = '';
    const cfg = FILLING_MAP[state.filling] || FILLING_MAP['none'];
    if (!cfg.emoji) return;
    const cx = 170, cy = 210, rx = 120, ry = 110;
    for (let i = 0; i < cfg.count; i++) {
      const angle = Math.random() * Math.PI;
      const r = Math.sqrt(Math.random());
      const x = cx + Math.cos(angle) * r * rx * 0.88;
      const y = cy + Math.abs(Math.sin(angle)) * r * ry * 0.9;
      const el = document.createElement('div');
      el.className = 'floating-emoji';
      el.textContent = cfg.emoji;
      el.style.left = (x / 340 * 100) + '%';
      el.style.top = (y / 420 * 100) + '%';
      el.style.fontSize = (11 + Math.random() * 6) + 'px';
      el.style.animationDelay = (Math.random() * 3) + 's';
      el.style.animationDuration = (2.5 + Math.random() * 2) + 's';
      floatingEmojiContainer.appendChild(el);
    }
  }

  const DESIGNS = {
    default:    { color: '#FF69B4', filling: 'mini-balloons', symbol: '',   text: '', textColor: '#8e44ad' },
    birthday:   { color: '#FFD700', filling: 'confetti',      symbol: '🎉', text: 'Alles Gute!', textColor: '#d63384' },
    valentine:  { color: '#FF69B4', filling: 'hearts',        symbol: '❤️', text: 'Ich liebe dich', textColor: '#c0392b' },
    graduation: { color: '#C9A0DC', filling: 'stars',         symbol: '🎓', text: 'Herzlichen Glückwunsch!', textColor: '#2d1b69' },
    wedding:    { color: '#FFFFFF', filling: 'hearts',         symbol: '💍', text: 'Just Married', textColor: '#8e44ad' },
    newborn:    { color: '#ADD8E6', filling: 'stars',          symbol: '👶', text: 'Willkommen!', textColor: '#2980b9' },
    congrats:   { color: '#98FB98', filling: 'confetti',       symbol: '🎊', text: 'Herzlichen Glückwunsch!', textColor: '#27ae60' },
    christmas:  { color: '#FF6B6B', filling: 'stars',          symbol: '🎄', text: 'Frohe Weihnachten!', textColor: '#c0392b' }
  };

  function applyDesignTemplate(key) {
    const d = DESIGNS[key];
    if (!d) return;
    document.querySelectorAll('#balloonColorSwatches .swatch').forEach(s => {
      s.classList.remove('active');
      if (s.dataset.color === d.color) s.classList.add('active');
    });
    state.balloonColor = d.color;
    document.querySelectorAll('#textColorSwatches .text-swatch').forEach(s => {
      s.classList.remove('active');
      if (s.dataset.color === d.textColor) s.classList.add('active');
    });
    state.textColor = d.textColor;
    fillingSelect.value = d.filling;
    state.filling = d.filling;
    symbolSelect.value = d.symbol;
    state.symbol = d.symbol;
    if (!state.message && d.text) {
      messageInput.value = d.text;
      state.message = d.text;
    }
    updatePreview();
  }

  function setPreviewTheme(key) {
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');
    designSelect.value = key;
    applyDesignTemplate(key);
  }

  function toggleFAQ(btn) {
    const answer = btn.nextElementSibling;
    const isOpen = answer.classList.contains('open');
    document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
    document.querySelectorAll('.faq-q').forEach(q => q.classList.remove('open'));
    if (!isOpen) { answer.classList.add('open'); btn.classList.add('open'); }
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // Init
  state.message = 'Alles Gute, Ralu! 🎂';
  state.textColor = '#1a6bbf';
  state.fontSize = 18;
  state.filling = 'stars';
  state.balloonColor = '#FF69B4';
  state.symbol = '⭐';
  messageInput.value = state.message;
  fillingSelect.value = state.filling;
  symbolSelect.value = state.symbol;
  document.querySelectorAll('#balloonColorSwatches .swatch').forEach(s => {
    s.classList.remove('active');
    if (s.dataset.color === state.balloonColor) s.classList.add('active');
  });
  document.getElementById('selectedColorName').textContent = 'Pink';
  document.querySelectorAll('#textColorSwatches .text-swatch').forEach(s => {
    s.classList.remove('active');
    if (s.dataset.color === state.textColor) s.classList.add('active');
  });
  fontSizeSlider.value = state.fontSize;
  fontSizeVal.textContent = state.fontSize + 'px';
  updatePreview();

  // Page switching
  function showPage(page) {
    ['shop','kollektionen','ueberuns','kontakt','impressum','datenschutz','agb','widerruf'].forEach(p => {
      document.getElementById('page-' + p).style.display = page === p ? '' : 'none';
      const n = document.getElementById('nav-' + p);
      if (n) n.classList.toggle('active-nav', page === p);
    });
    window.scrollTo(0, 0);
    if (page === 'kollektionen') renderKoll('all');
    document.querySelector('.nav-links')?.classList.remove('open');
  }
  window.showPage = showPage;

  const i18n = {
    de: {
      nav_shop: 'Shop', nav_koll: 'Kollektionen', nav_ueber: 'Über uns', nav_kontakt: 'Kontakt', nav_all_koll: 'Alle ansehen →',
      hero_title: 'Personalisierter Ballon Bad Wörishofen, Bayern ✨',
      hero_sub: 'Dein einzigartiger Ballon individuell gestaltet mit Text, Symbolen und farbiger Füllung, handgemacht in Bad Wörishofen, Bayern',
      hero_specs_title: 'PRODUKTDETAILS',
      hero_specs_1: 'Transparenter Bubble-Ballon, Ø ca. 50 cm',
      hero_specs_2: 'Gesamthöhe ca. 60 cm',
      hero_specs_3: 'Mit Luft gefüllt (kein Helium)',
      hero_specs_4: 'Haltbarkeit: ca. 4–12 Wochen oder länger bei richtiger Lagerung',
      luxury_tagline: 'Handgefertigt in unserer Manufaktur · Premium-Materialien · Liebevolle Verpackung',
      filter_all: 'Alle', filter_geburtstag: '🎂 Geburtstag', filter_hochzeit: '💍 Hochzeit',
      filter_babyparty: '👶 Babyparty', filter_liebe: '💕 Liebe', filter_fussball: '⚽ Fußball',
      filter_kuscheltiere: '🧸 Kuscheltiere', filter_sonstiges: '✨ Sonstiges',
      add_to_cart: 'In den Warenkorb', send_whatsapp: 'Bestellung über WhatsApp senden',
      clear_cart: '🗑 Warenkorb leeren', cart_title: 'Warenkorb',
      koll_title: '🎈 Unsere Kollektionen', koll_sub: 'Handgefertigte Ballons für jeden Anlass mit Liebe gestaltet',
      back_to_config: '← Zurück zum Konfigurator',
      cookie_text: '🍪 Wir verwenden Cookies, um deine Erfahrung zu verbessern und unsere Website zu analysieren. Mehr dazu in unserer Datenschutzerklärung.',
      cookie_necessary: 'Nur notwendige', cookie_accept: 'Alle akzeptieren',
      discount_title: 'Willkommen bei Dandelion 11:11!',
      discount_text: 'Sichere dir 10% Rabatt auf deine erste Bestellung mit dem Code:',
      discount_btn: 'Jetzt einkaufen',
      discount_code_placeholder: 'Rabattcode', discount_code_apply: 'Anwenden',
      kontakt_sub: 'Wir freuen uns, von dir zu hören! Schreib uns einfach, wir antworten so schnell wie möglich. 🌼',
      kontakt_standort: 'Standort', kontakt_erreichbarkeit: 'Erreichbarkeit', kontakt_email: 'E-Mail', kontakt_whatsapp: 'WhatsApp',
      kontakt_jetzt_schreiben: 'Jetzt schreiben', kontakt_nachricht_senden: 'Nachricht senden',
      kontakt_antwortzeit: 'Wir melden uns innerhalb von 24 Stunden.',
      kontakt_label_name: 'Name', kontakt_label_email: 'E-Mail', kontakt_label_betreff: 'Betreff', kontakt_label_nachricht: 'Nachricht',
      kontakt_placeholder_name: 'Dein Name', kontakt_placeholder_email: 'deine@email.de', kontakt_placeholder_betreff: 'Worum geht es?',
      kontakt_placeholder_nachricht: 'Schreib uns deine Frage oder Wünsche...', kontakt_placeholder_captcha: 'Antwort eingeben',
      kontakt_sicherheitsfrage: 'Sicherheitsfrage:', kontakt_send_btn: 'Via WhatsApp senden',
      kontakt_form_hinweis: 'Das Formular öffnet WhatsApp mit deiner Nachricht.',
      werktage_badge: '3–7 Werktage', search_placeholder: 'Produkte durchsuchen…',
      ship_home_text: 'In ca. 3–7 Werktagen direkt zu dir nach Hause.',
      ship_home_text2: '3–7 Werktage', ship_home_text3: '3–7 Werktage nach Bestelleingang',
      local_delivery_note: '📍 Wohnst du in der Nähe von Bad Wörishofen? Dann liefere ich deinen Ballon gerne persönlich, auf Wunsch sogar mit einer handgeschriebenen Grußkarte vom Schenkenden.',
      damage_note: '📦 Sollte der Ballon beschädigt ankommen, schick uns einfach ein Foto über WhatsApp, wir finden gemeinsam eine schnelle Lösung.',
      dein_text_title: 'Dein Text', text_label: 'Text auf dem Ballon', max_chars_50: '(max. 50 Zeichen)',
      message_placeholder: 'z.B. Alles Gute zum Geburtstag!',
      font_color_label: 'Schriftfarbe', font_size_label: 'Schriftgröße',
      custom_image_label: 'Eigenes Bild / Logo hochladen', optional_label: '(optional)',
      shown_on_balloon_label: 'Wird auf dem Ballon angezeigt',
      filling_design_title: 'Füllung & Design', balloon_color_filling_label: 'Ballonfarbe / Füllung',
      choose_color_label: 'Wähle eine Farbe', balloon_type_label: 'Ballontyp',
      opt_latex: '🎈 Latex-Ballon (rund)', opt_herz: '💗 Herz-Ballon (+3,00 €)', opt_stern_typ: '⭐ Stern-Ballon (+3,00 €)',
      opt_folie: '🌟 Folienballon Premium (+6,00 €)', opt_bubble: '🔮 Bubble-Ballon (transparent) (+9,00 €)',
      text_effect_label: 'Text-Effekt', opt_normal: 'Normal', opt_fett: 'Fett', opt_kursiv: 'Kursiv',
      opt_schatten: 'Mit Schatten', opt_umriss: 'Umriss', opt_glitzer: '✨ Glitzer-Effekt',
      filling_type_label: 'Art der Füllung', opt_keine_fuellung: 'Keine Füllung', opt_mini_balloons: 'Mini-Ballons 🎈',
      opt_confetti: 'Konfetti 🎉', opt_hearts: 'Herzen ❤️', opt_stars: 'Sterne ⭐', opt_flowers: 'Blumen 🌸', opt_butterflies: 'Schmetterlinge 🦋',
      design_template_label: 'Design-Vorlage', opt_default: 'Standard', opt_birthday: '🎂 Geburtstag', opt_valentine: '❤️ Valentinstag',
      opt_graduation: '🎓 Abschluss', opt_wedding: '💍 Hochzeit', opt_newborn: '👶 Neugeborenes', opt_congrats: '🎊 Glückwünsche', opt_christmas: '🎄 Weihnachten',
      symbol_add_label: 'Symbol hinzufügen', opt_sym_none: 'Kein Symbol', opt_sym_herz: '❤️ Herz', opt_sym_ring: '💍 Ring',
      opt_sym_hut: '🎓 Absolventenhut', opt_sym_teddy: '🧸 Teddy', opt_sym_fuesse: '👣 Babyfüße', opt_sym_geschenk: '🎁 Geschenk',
      opt_sym_party: '🎉 Party', opt_sym_blumen: '💐 Blumen', opt_sym_stern: '⭐ Stern', opt_sym_schmetterling: '🦋 Schmetterling',
      opt_sym_mond: '🌙 Mond', opt_sym_glitzer: '✨ Glitzer',
      card_extras_title: 'Grußkarte & Extras', card_label: 'Grußkarte', optional_150_label: '(optional, max. 150 Zeichen)',
      card_placeholder: 'Dein persönlicher Gruß für die Karte...',
      describe_person_label: 'Beschreibe die Person', optional_recommendation_label: '(optional für individuelle Empfehlung)',
      persona_placeholder: '💡 Keine Idee welche Farbe oder Füllung passt? Kein Problem! 😊 Beschreib uns die Person: welche Farben mag sie, was liebt sie, was sind ihre Hobbys? Wir helfen dir mit kreativen Ideen!',
      quantity_title: 'Menge', save_label: 'Speichern', share_label: 'Teilen',
      ueber_h1: 'Über Dandelion 11:11',
      ueber_subtitle: 'Eine Geschichte über Träume, Kleber, geplatzte Ballons und die Magie dahinter.',
      ueber_p1: 'Als ich klein war, glaubte ich,<br>dass Dandelions magisch sind.',
      ueber_p2: 'Wenn ich eine fliegende Pusteblume fing und mir etwas wünschte, dann ging dieser Wunsch in Erfüllung.',
      ueber_p3: 'Heute weiß ich, dass es nicht ganz so einfach ist.',
      ueber_p4: 'Träume entstehen nicht von selbst.<br>\n    Sie werden gebaut. Mit den Händen, mit Geduld, mit Verzicht.<br>\n    Manchmal auf Schlaf. Manchmal auf Menschen.',
      ueber_p5: 'So entstand Dandelion.',
      ueber_p6: 'Nicht aus einem perfekten Plan, sondern aus einer Küche, in der mehr Kleber als Ordnung war.<br>\n    Aus einem Keller, gestrichen mit Farbe und Hoffnung.<br>\n    Aus Tagen, an denen ich nicht wusste, ob ich Kunst mache oder einfach nur ein großes, buntes Chaos erschaffe.',
      ueber_weg_title: 'Der Weg',
      ueber_p7: 'Ich habe Möbel montiert, Kartons geschleppt, Ballons zum Platzen gebracht und dabei auch die eine oder andere Existenzkrise durchlebt.',
      ueber_p8: 'Aber jedes Mal habe ich neu angefangen. Immer wieder.<br>\n    <em>Wie eine Dandelion, die fällt und trotzdem wieder aufsteigt.</em>',
      ueber_heute_title: 'Dandelion heute',
      ueber_p9: 'Dandelion ist mehr als ein Business.<br>\n    Es ist ein Kindheitstraum, den ich mit beiden Händen festhalte.',
      ueber_p10: 'Jedes Detail, jede Blume, jedes Lächeln, das ich zurückbekommen habe, ist erarbeitet. Mit allem, was ich bin.',
      ueber_p10b: 'Vielleicht wirke ich manchmal wie ein verträumtes Mädchen. Aber hinter allem steht Arbeit, Entscheidung und Ausdauer.',
      ueber_p11: 'Dandelion ist meine Welt.<br>\n    Eine Welt, die leiser geworden ist als der Anfang und klarer.',
      ueber_p12: 'Meine. Und vielleicht auch ein kleines Stück deine. 🌼',
      ueber_award_title: '🏆 Ausgezeichnet: Adventskranz-Wettbewerb 2023',
      ueber_award_text: 'Im Dezember 2023 habe ich mit meinem selbstgestalteten Adventskranz beim Wettbewerb unserer lokalen Zeitung in Mindelheim gewonnen, mit liebevoll gestalteten Nussknacker-Figuren in Pink, Schwarz und Lila. Es war eine riesige Ehre, dass meine Arbeit in der Zeitung vorgestellt wurde! 🌟',
      ueber_behind_title: '🎈 Hinter den Kulissen',
      ueber_behind_text: 'Echte Momente von der Idee bis zum fertigen Ballon. Klick auf ein Bild zum Vergrößern.',
      ueber_g1: 'Erster Ballon geplatzt 😅', ueber_g2: 'Möbel montieren im Keller',
      ueber_g3: 'Kreatives Chaos in der Küche', ueber_g4: 'Erste Bestellungen verpacken',
      ueber_g5: 'Details mit Liebe gestaltet', ueber_g6: 'Fertige Kreationen',
      hiw_rating: '⭐ 4.9/5 von unseren Kunden',
      hiw_step1_title: '1. Wähle & personalisiere', hiw_step1_text: 'Wähle Farbe, Text & Füllung für deinen Ballon.',
      topbar_tagline: 'Personalisierte Ballons & Geschenke für jeden Anlass',
      topbar_info: '🎈 Kostenlose Lieferung ab 60 € &nbsp;|&nbsp; Handgemacht mit Liebe in Deutschland &nbsp;|&nbsp; Persönliche Beratung via WhatsApp',
      hiw_madein: '💜 Handgemacht mit Liebe in Deutschland',
      hiw_step2_title: '2. Wir fertigen mit Liebe', hiw_step2_text: 'Jeder Ballon wird liebevoll von Hand vorbereitet.',
      hiw_freeship: '🚚 Kostenlose Lieferung ab 60 €',
      hiw_step3_title: '3. Schnelle Lieferung',
      hiw_discover: 'Nicht sicher, was du möchtest? Entdecke unsere Kollektionen →',
      badge_sustainable: 'Nachhaltig', badge_handmade: 'Handgemacht', badge_secure: 'Sicher bestellen', badge_fastship: 'Schnelle Lieferung',
      order_whatsapp_now: 'Jetzt über WhatsApp bestellen', secure_encrypted: 'Sicher & verschlüsselt',
      bank_transfer: 'Banküberweisung', whatsapp_order_label: 'WhatsApp-Bestellung', whatsapp_support_label: 'WhatsApp-Support',
      satisfaction_guarantee: 'Zufriedenheitsgarantie', cart_total: 'Gesamtbetrag',
      feat_handmade_title: 'Handgemacht', feat_handmade_text: 'Jeder Ballon wird mit Liebe individuell gefertigt',
      feat_ship_title: 'Schnelle Lieferung', feat_sustainable_title: 'Nachhaltig',
      feat_sustainable_text: '100% natürlicher Latex, biologisch abbaubar',
      feat_whatsapp_title: 'WhatsApp Support', feat_whatsapp_text: 'Persönliche Beratung einfach schreiben!',
      info_what_makes: 'Was macht unsere Ballons <span>besonders?</span>',
      info_list1: 'Großer transparenter Ballon (Ø 35–50 cm, je nach Design) aus hochwertigem Latex',
      info_list2: 'Gefüllt mit bunten Mini-Ballons, Konfetti, Herzen oder Sternen',
      info_list3: 'Personalisierter Text und Wunschsymbol im Inneren',
      info_list4: 'Handgeschriebene Grußkarte inklusive',
      info_list5: 'Perfekt für Geburtstag, Hochzeit, Babyparty, Jubiläum & mehr',
      info_list6: 'Jeder Ballon ein Unikat liebevoll gestaltet in Deutschland',
      info_list7: 'Mit Luft gefüllt, hält 4–12 Wochen oder länger bei richtiger Lagerung',
      faq_title: 'Häufige <span>Fragen</span>',
      faq_q1: 'Wie lange hält der Ballon?', faq_a1: 'Unser Ballon wird mit Luft gefüllt (kein Helium) und hält dadurch ca. 4–12 Wochen oder länger bei richtiger Lagerung – viel länger als ein klassischer Heliumballon.',
      faq_q2: 'Wie bestelle ich?', faq_a2: 'Konfiguriere deinen Ballon, lege ihn in den Warenkorb und sende deine Bestellung direkt über WhatsApp. Wir melden uns innerhalb weniger Stunden mit Bestätigung.',
      faq_q3: 'Wie schnell wird geliefert?', faq_a3: 'Nach Bestellbestätigung bearbeiten wir deine Bestellung innerhalb von 1–3 Werktagen. Der Versand per DHL dauert danach zusätzlich 2–4 Werktage – insgesamt also bis zu 7 Werktage in Deutschland.',
      faq_q4: 'Kann ich mehrere Ballons bestellen?', faq_a4: 'Ja! Du kannst mehrere verschiedene Ballons konfigurieren und alle zusammen in den Warenkorb legen. Ab 3 Ballons gewähren wir 10% Rabatt.',
      faq_q5: 'Ist der Ballon mit Luft oder Helium gefüllt?', faq_a5: 'Unser Ballon wird bereits mit Luft gefüllt geliefert (kein Helium nötig) und ist direkt einsatzbereit. Dadurch hält er auch viel länger – ca. 4–12 Wochen statt nur ein bis zwei Tage wie bei Heliumballons.',
      versand_title: 'Versand & <span>Rückgabe</span> 📦',
      vfaq_q1: 'Wie lange dauert die Lieferung?', vfaq_a1: 'Wir bearbeiten jede Bestellung individuell mit Liebe. Nach Bestellbestätigung versenden wir innerhalb von 1–3 Werktagen per DHL. Die Lieferzeit in Deutschland beträgt danach 2–4 Werktage.',
      vfaq_q2: 'Wie werden die Ballons verpackt?', vfaq_a2: 'Die Ballons werden sorgfältig und sicher verpackt, damit sie unbeschädigt bei dir ankommen. Wir verwenden schützende Verpackungsmaterialien speziell für empfindliche Artikel.',
      vfaq_q3: 'Kann ich meinen Ballon zurückgeben?', vfaq_a3: 'Da jeder Ballon individuell und personalisiert für dich gefertigt wird, ist eine Rückgabe leider nicht möglich. Sollte dein Ballon beschädigt ankommen, schick uns einfach ein Foto, wir finden gemeinsam eine Lösung! 💛',
      vfaq_q4: 'Was kostet der Versand?', vfaq_a4: 'Der Versand erfolgt mit DHL Paket M und kostet 5,49 €. Ab einem Bestellwert von 60 € ist der Versand kostenlos.',
      real_photos_title: 'Echte Ballons, echte <span>Momente</span> 📸',
      delivered_title: '🚗 Direkt zu dir geliefert',
      reviews_title: 'Was unsere Kunden <span>sagen</span> 💬',
      review_text1: 'Absolut traumhaft! Der Ballon hat meine Tochter zu Tränen gerührt. Die Verarbeitung ist top, der Text wunderschön genau wie bestellt. Definitiv wieder!',
      review_text2: 'Schnelle Lieferung, liebevolle Verpackung und ein wunderschöner Ballon. Die Mini-Ballons in Hellblau waren perfekt für die Babyparty. Alle waren begeistert!',
      review_text3: 'Zum Heiratsantrag bestellt sie hat JA gesagt! 😍 Der Ballon mit den Herzchen war einfach magisch. Danke Dandelion 11:11 für diesen unvergesslichen Moment!',
      footer_brand_text: 'Handgemachte Erlebnisballons für deine unvergesslichen Momente. Mit Liebe gestaltet, persönlich versendet.',
      footer_shop_title: 'Shop', footer_link_all: 'Alle Ballons', footer_link_geburtstag: 'Geburtstag',
      footer_link_hochzeit: 'Hochzeit', footer_link_babyparty: 'Babyparty',
      footer_info_title: 'Info', footer_link_ueber: 'Über uns', footer_link_kontakt: 'Kontakt', footer_link_versand: 'Versand & Rückgabe',
      footer_copyright: 'Dandelion 11:11 · Alle Rechte vorbehalten',
      toast_default: '🛒 Ballon wurde in den Warenkorb gelegt!'
    },
    ro: {
      nav_shop: 'Magazin', nav_koll: 'Colecții', nav_ueber: 'Despre noi', nav_kontakt: 'Contact', nav_all_koll: 'Vezi toate →',
      hero_title: 'Balon personalizat după dorința ta ✨',
      hero_sub: 'Balonul tău unic, personalizat cu text, simboluri și umplutură colorată, realizat manual în Bad Wörishofen, Bayern',
      hero_specs_title: 'DETALII PRODUS',
      hero_specs_1: 'Balon transparent tip bubble, Ø aprox. 50 cm',
      hero_specs_2: 'Înălțime totală aprox. 60 cm',
      hero_specs_3: 'Umplut cu aer (fără heliu)',
      hero_specs_4: 'Durabilitate: aprox. 4–12 săptămâni sau mai mult, la depozitare corectă',
      luxury_tagline: 'Realizat manual în atelierul nostru · Materiale premium · Ambalare cu grijă',
      filter_all: 'Toate', filter_geburtstag: '🎂 Aniversare', filter_hochzeit: '💍 Nuntă',
      filter_babyparty: '👶 Botez/Baby', filter_liebe: '💕 Dragoste', filter_fussball: '⚽ Fotbal',
      filter_kuscheltiere: '🧸 Jucării', filter_sonstiges: '✨ Diverse',
      add_to_cart: 'Adaugă în coș', send_whatsapp: 'Trimite comanda pe WhatsApp',
      clear_cart: '🗑 Golește coșul', cart_title: 'Coș',
      koll_title: '🎈 Colecțiile noastre', koll_sub: 'Baloane lucrate manual pentru orice ocazie, cu drag',
      back_to_config: '← Înapoi la configurator',
      cookie_text: '🍪 Folosim cookie-uri pentru a-ți îmbunătăți experiența și pentru a analiza site-ul nostru. Mai multe detalii în politica noastră de confidențialitate.',
      cookie_necessary: 'Doar necesare', cookie_accept: 'Acceptă toate',
      discount_title: 'Bine ai venit la Dandelion 11:11!',
      discount_text: 'Beneficiezi de 10% reducere la prima ta comandă cu codul:',
      discount_btn: 'Cumpără acum',
      discount_code_placeholder: 'Cod de reducere', discount_code_apply: 'Aplică',
      kontakt_sub: 'Ne bucurăm să te citim! Scrie-ne și îți răspundem cât mai rapid posibil. 🌼',
      kontakt_standort: 'Locație', kontakt_erreichbarkeit: 'Disponibilitate', kontakt_email: 'E-Mail', kontakt_whatsapp: 'WhatsApp',
      kontakt_jetzt_schreiben: 'Scrie-ne acum', kontakt_nachricht_senden: 'Trimite un mesaj',
      kontakt_antwortzeit: 'Răspundem în maximum 24 de ore.',
      kontakt_label_name: 'Nume', kontakt_label_email: 'E-Mail', kontakt_label_betreff: 'Subiect', kontakt_label_nachricht: 'Mesaj',
      kontakt_placeholder_name: 'Numele tău', kontakt_placeholder_email: 'emailul@tau.de', kontakt_placeholder_betreff: 'Despre ce este vorba?',
      kontakt_placeholder_nachricht: 'Scrie-ne întrebarea sau dorințele tale...', kontakt_placeholder_captcha: 'Introdu răspunsul',
      kontakt_sicherheitsfrage: 'Întrebare de securitate:', kontakt_send_btn: 'Trimite pe WhatsApp',
      kontakt_form_hinweis: 'Formularul deschide WhatsApp cu mesajul tău.',
      werktage_badge: '3–7 zile lucrătoare', search_placeholder: 'Caută produse…',
      ship_home_text: 'Livrare în aprox. 3–7 zile lucrătoare direct la tine acasă.',
      ship_home_text2: '3–7 zile lucrătoare', ship_home_text3: '3–7 zile lucrătoare după comandă',
      local_delivery_note: '📍 Locuiești în apropiere de Bad Wörishofen? Atunci îți pot livra balonul personal, la cerere chiar și cu o felicitare scrisă de mână din partea celui care face cadoul.',
      damage_note: '📦 Dacă coletul ajunge avariat sau balonul stricat, trimite-ne pur și simplu o poză pe WhatsApp, găsim împreună o soluție rapidă.',
      dein_text_title: 'Textul tău', text_label: 'Text pe balon', max_chars_50: '(max. 50 de caractere)',
      message_placeholder: 'ex. La mulți ani!',
      font_color_label: 'Culoarea textului', font_size_label: 'Mărimea textului',
      custom_image_label: 'Încarcă o imagine / logo propriu', optional_label: '(opțional)',
      shown_on_balloon_label: 'Va fi afișat pe balon',
      filling_design_title: 'Umplutură & Design', balloon_color_filling_label: 'Culoare balon / Umplutură',
      choose_color_label: 'Alege o culoare', balloon_type_label: 'Tip de balon',
      opt_latex: '🎈 Balon din latex (rotund)', opt_herz: '💗 Balon inimă (+3,00 €)', opt_stern_typ: '⭐ Balon stea (+3,00 €)',
      opt_folie: '🌟 Balon folie Premium (+6,00 €)', opt_bubble: '🔮 Balon Bubble (transparent) (+9,00 €)',
      text_effect_label: 'Efect text', opt_normal: 'Normal', opt_fett: 'Bold', opt_kursiv: 'Cursiv',
      opt_schatten: 'Cu umbră', opt_umriss: 'Contur', opt_glitzer: '✨ Efect sclipici',
      filling_type_label: 'Tip de umplutură', opt_keine_fuellung: 'Fără umplutură', opt_mini_balloons: 'Mini-baloane 🎈',
      opt_confetti: 'Confetti 🎉', opt_hearts: 'Inimioare ❤️', opt_stars: 'Stele ⭐', opt_flowers: 'Flori 🌸', opt_butterflies: 'Fluturi 🦋',
      design_template_label: 'Șablon design', opt_default: 'Standard', opt_birthday: '🎂 Aniversare', opt_valentine: '❤️ Valentine',
      opt_graduation: '🎓 Absolvire', opt_wedding: '💍 Nuntă', opt_newborn: '👶 Nou-născut', opt_congrats: '🎊 Felicitări', opt_christmas: '🎄 Crăciun',
      symbol_add_label: 'Adaugă un simbol', opt_sym_none: 'Fără simbol', opt_sym_herz: '❤️ Inimă', opt_sym_ring: '💍 Inel',
      opt_sym_hut: '🎓 Tichie absolvire', opt_sym_teddy: '🧸 Ursuleț', opt_sym_fuesse: '👣 Tălpi de bebeluș', opt_sym_geschenk: '🎁 Cadou',
      opt_sym_party: '🎉 Petrecere', opt_sym_blumen: '💐 Flori', opt_sym_stern: '⭐ Stea', opt_sym_schmetterling: '🦋 Fluture',
      opt_sym_mond: '🌙 Lună', opt_sym_glitzer: '✨ Sclipici',
      card_extras_title: 'Felicitare & Extra', card_label: 'Felicitare', optional_150_label: '(opțional, max. 150 de caractere)',
      card_placeholder: 'Mesajul tău personal pentru felicitare...',
      describe_person_label: 'Descrie persoana', optional_recommendation_label: '(opțional, pentru recomandare personalizată)',
      persona_placeholder: '💡 Nu știi ce culoare sau umplutură se potrivește? Nicio problemă! 😊 Descrie-ne persoana: ce culori îi plac, ce iubește, care sunt hobby-urile ei? Te ajutăm cu idei creative!',
      quantity_title: 'Cantitate', save_label: 'Salvează', share_label: 'Trimite',
      ueber_h1: 'Despre Dandelion 11:11',
      ueber_subtitle: 'O poveste despre vise, lipici, baloane sparte și magia din spatele lor.',
      ueber_p1: 'Când eram mică, credeam<br>că păpădiile sunt magice.',
      ueber_p2: 'Dacă prindeam o păpădie zburătoare și îmi puneam o dorință, dorința se îndeplinea.',
      ueber_p3: 'Astăzi știu că nu este chiar așa de simplu.',
      ueber_p4: 'Visurile nu apar de la sine.<br>\n    Ele se construiesc. Cu mâinile, cu răbdare, cu sacrificii.<br>\n    Câteodată renunțând la somn. Câteodată la oameni.',
      ueber_p5: 'Așa a apărut Dandelion.',
      ueber_p6: 'Nu dintr-un plan perfect, ci dintr-o bucătărie în care era mai mult lipici decât ordine.<br>\n    Dintr-un subsol vopsit cu culoare și speranță.<br>\n    Din zile în care nu știam dacă fac artă sau doar un mare haos colorat.',
      ueber_weg_title: 'Drumul',
      ueber_p7: 'Am montat mobilă, am cărat cutii, am spart baloane și am trecut și prin câte o mică criză existențială.',
      ueber_p8: 'Dar de fiecare dată am luat-o de la capăt. Mereu.<br>\n    <em>Ca o păpădie care cade și totuși se ridică din nou.</em>',
      ueber_heute_title: 'Dandelion astăzi',
      ueber_p9: 'Dandelion este mai mult decât o afacere.<br>\n    Este un vis din copilărie, pe care îl țin cu ambele mâini.',
      ueber_p10: 'Fiecare detaliu, fiecare floare, fiecare zâmbet pe care l-am primit înapoi este muncit. Cu tot ce sunt.',
      ueber_p10b: 'Poate par câteodată o fată visătoare. Dar în spatele a tot stă muncă, decizie și perseverență.',
      ueber_p11: 'Dandelion este lumea mea.<br>\n    O lume care a devenit mai liniștită decât la început și mai clară.',
      ueber_p12: 'A mea. Și poate, puțin, și a ta. 🌼',
      ueber_award_title: '🏆 Premiat: Concursul de Coronițe de Advent 2023',
      ueber_award_text: 'În decembrie 2023 am câștigat cu coronița mea de Advent creată manual concursul jurnalului local din Mindelheim, cu figurine de spărgător de nuci create cu drag în roz, negru și mov. A fost o onoare imensă ca lucrarea mea să fie prezentată în jurnal! 🌟',
      ueber_behind_title: '🎈 În culise',
      ueber_behind_text: 'Momente reale de la idee până la balonul finit. Apasă pe o imagine pentru a o mări.',
      ueber_g1: 'Primul balon spart 😅', ueber_g2: 'Montat mobilă în subsol',
      ueber_g3: 'Haos creativ în bucătărie', ueber_g4: 'Împachetarea primelor comenzi',
      ueber_g5: 'Detalii create cu drag', ueber_g6: 'Creații finite',
      hiw_rating: '⭐ 4.9/5 din recenziile clienților',
      hiw_step1_title: '1. Alege & personalizează', hiw_step1_text: 'Alege culoarea, textul și umplutura balonului tău.',
      topbar_tagline: 'Baloane și cadouri personalizate pentru orice ocazie',
      topbar_info: '🎈 Livrare gratuită de la 60 € &nbsp;|&nbsp; Lucrat manual cu drag în Germania &nbsp;|&nbsp; Consiliere personală prin WhatsApp',
      hiw_madein: '💜 Lucrat manual cu drag în Germania',
      hiw_step2_title: '2. Pregătim cu drag', hiw_step2_text: 'Fiecare balon este pregătit manual cu multă grijă.',
      hiw_freeship: '🚚 Livrare gratuită de la 60 €',
      hiw_step3_title: '3. Livrare rapidă',
      hiw_discover: 'Nu ești sigur ce vrei? Descoperă colecțiile noastre →',
      badge_sustainable: 'Sustenabil', badge_handmade: 'Lucrat manual', badge_secure: 'Comandă sigură', badge_fastship: 'Livrare rapidă',
      order_whatsapp_now: 'Comandă acum pe WhatsApp', secure_encrypted: 'Sigur & criptat',
      bank_transfer: 'Transfer bancar', whatsapp_order_label: 'Comandă prin WhatsApp', whatsapp_support_label: 'Suport WhatsApp',
      satisfaction_guarantee: 'Garanția satisfacției', cart_total: 'Total',
      feat_handmade_title: 'Lucrat manual', feat_handmade_text: 'Fiecare balon este creat individual cu drag',
      feat_ship_title: 'Livrare rapidă', feat_sustainable_title: 'Sustenabil',
      feat_sustainable_text: 'Latex 100% natural, biodegradabil',
      feat_whatsapp_title: 'Suport WhatsApp', feat_whatsapp_text: 'Scrie-ne pentru o consiliere personală!',
      info_what_makes: 'Ce face baloanele noastre <span>speciale?</span>',
      info_list1: 'Balon transparent mare (Ø 35–50 cm, în funcție de design) din latex de înaltă calitate',
      info_list2: 'Umplut cu mini-baloane colorate, confetti, inimioare sau stele',
      info_list3: 'Text personalizat și simbol la dorință în interior',
      info_list4: 'Felicitare scrisă de mână inclusă',
      info_list5: 'Perfect pentru aniversări, nunți, baby shower, jubilee & multe altele',
      info_list6: 'Fiecare balon este unicat, creat cu drag în Germania',
      info_list7: 'Umplut cu aer, rezistă 4–12 săptămâni sau mai mult dacă este păstrat corect',
      faq_title: 'Întrebări <span>frecvente</span>',
      faq_q1: 'Cât rezistă balonul?', faq_a1: 'Balonul nostru este umplut cu aer (fără heliu) și rezistă astfel aproximativ 4–12 săptămâni sau mai mult dacă este păstrat corect – mult mai mult decât un balon clasic cu heliu.',
      faq_q2: 'Cum comand?', faq_a2: 'Configurează-ți balonul, adaugă-l în coș și trimite comanda direct pe WhatsApp. Îți răspundem în câteva ore cu confirmarea.',
      faq_q3: 'Cât de rapid se livrează?', faq_a3: 'După confirmarea comenzii, procesăm comanda în 1–3 zile lucrătoare. Livrarea prin DHL durează apoi încă 2–4 zile lucrătoare – în total până la 7 zile lucrătoare în Germania.',
      faq_q4: 'Pot comanda mai multe baloane?', faq_a4: 'Da! Poți configura mai multe baloane diferite și le poți adăuga pe toate în coș. De la 3 baloane oferim 10% reducere.',
      faq_q5: 'Balonul este umplut cu aer sau cu heliu?', faq_a5: 'Balonul nostru este livrat deja umplut cu aer (fără heliu) și este gata de utilizare imediat. Astfel rezistă mult mai mult – aprox. 4–12 săptămâni, comparativ cu doar 1-2 zile la baloanele cu heliu.',
      versand_title: 'Livrare & <span>retur</span> 📦',
      vfaq_q1: 'Cât durează livrarea?', vfaq_a1: 'Procesăm fiecare comandă individual, cu drag. După confirmarea comenzii, expediem în 1–3 zile lucrătoare prin DHL. Timpul de livrare în Germania este apoi de 2–4 zile lucrătoare.',
      vfaq_q2: 'Cum sunt împachetate baloanele?', vfaq_a2: 'Baloanele sunt împachetate cu grijă și în siguranță, pentru a ajunge nedeteriorate la tine. Folosim materiale de protecție special pentru articole fragile.',
      vfaq_q3: 'Pot returna balonul meu?', vfaq_a3: 'Deoarece fiecare balon este realizat individual și personalizat pentru tine, returul nu este posibil. Dacă balonul tău ajunge deteriorat, trimite-ne o poză și găsim împreună o soluție! 💛',
      vfaq_q4: 'Cât costă livrarea?', vfaq_a4: 'Livrarea se face cu DHL Paket M și costă 5,49 €. De la o valoare a comenzii de 60 €, livrarea este gratuită.',
      real_photos_title: 'Baloane reale, momente <span>reale</span> 📸',
      delivered_title: '🚗 Livrat direct la tine',
      reviews_title: 'Ce spun <span>clienții</span> noștri 💬',
      review_text1: 'Absolut fantastic! Balonul a emoționat-o pe fiica mea până la lacrimi. Calitatea este excelentă, textul exact cum l-am comandat. Cu siguranță vom reveni!',
      review_text2: 'Livrare rapidă, ambalaj plin de grijă și un balon superb. Mini-baloanele albastre au fost perfecte pentru baby shower. Toată lumea a fost încântată!',
      review_text3: 'L-am comandat pentru o cerere în căsătorie ea a zis DA! 😍 Balonul cu inimioare a fost pur și simplu magic. Mulțumim Dandelion 11:11 pentru acest moment de neuitat!',
      footer_brand_text: 'Baloane experiență lucrate manual pentru momentele tale de neuitat. Create cu drag, livrate personal.',
      footer_shop_title: 'Magazin', footer_link_all: 'Toate baloanele', footer_link_geburtstag: 'Aniversare',
      footer_link_hochzeit: 'Nuntă', footer_link_babyparty: 'Baby Shower',
      footer_info_title: 'Info', footer_link_ueber: 'Despre noi', footer_link_kontakt: 'Contact', footer_link_versand: 'Livrare & retur',
      footer_copyright: 'Dandelion 11:11 · Toate drepturile rezervate',
      toast_default: '🛒 Balonul a fost adăugat în coș!'
    }
  };
  window.setLang = function(lang) {
    localStorage.setItem('lang', lang);
    document.getElementById('lang-de').style.opacity = lang === 'de' ? '1' : '0.4';
    document.getElementById('lang-ro').style.opacity = lang === 'ro' ? '1' : '0.4';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (i18n[lang][key]) el.textContent = i18n[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (i18n[lang][key]) el.placeholder = i18n[lang][key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (i18n[lang][key]) el.innerHTML = i18n[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (i18n[lang][key]) el.setAttribute('placeholder', i18n[lang][key]);
    });
  };
  setLang(localStorage.getItem('lang') || 'de');

  updateFavBadge();

  window.closeDiscountPopup = function() {
    document.getElementById('discountPopup').style.display = 'none';
    localStorage.setItem('discountPopupShown', '1');
  };

  window.setCookieConsent = function(accepted) {
    localStorage.setItem('cookieConsent', accepted ? 'all' : 'necessary');
    const el = document.getElementById('cookieBanner');
    if (el) el.style.display = 'none';
  };

  if (!localStorage.getItem('cookieConsent')) {
    const el = document.getElementById('cookieBanner');
    if (el) el.style.display = 'block';
  }

  if (!localStorage.getItem('discountPopupShown')) {
    setTimeout(() => {
      const el = document.getElementById('discountPopup');
      if (el) el.style.display = 'flex';
    }, 4000);
  }

  (function showUrgencyBar() {
    const el = document.getElementById('urgencyBar');
    if (!el) return;
    const now = new Date();
    const cutoff = now.getHours() < 14;
    const days = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
    let shipDay = new Date(now);
    shipDay.setDate(now.getDate() + (cutoff ? 1 : 2));
    if (shipDay.getDay() === 0) shipDay.setDate(shipDay.getDate() + 1);
    if (shipDay.getDay() === 6) shipDay.setDate(shipDay.getDate() + 2);
    const lang = localStorage.getItem('lang');
    if (lang === 'ro') {
      const daysRo = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'];
      el.textContent = `⏰ Comandă în următoarele ore, livrare ${daysRo[shipDay.getDay()]}!`;
    } else {
      el.textContent = `⏰ Bestelle innerhalb der nächsten Stunden, Versand am ${days[shipDay.getDay()]}!`;
    }
  })();

  document.addEventListener('click', function(e) {
    const nav = document.querySelector('.nav-links');
    if (nav && nav.classList.contains('open') && !nav.contains(e.target) && !e.target.closest('.hamburger')) {
      nav.classList.remove('open');
    }
  });

  const RECAPTCHA_SITE_KEY = '6LeCKj8tAAAAALbDBccbAMBvhZVd6DFvgopyDGYg';

  window.sendKontaktWA = function() {
    const name     = document.getElementById('k-name').value.trim();
    const email    = document.getElementById('k-email').value.trim();
    const subject  = document.getElementById('k-subject').value.trim();
    const msg      = document.getElementById('k-msg').value.trim();
    const honeypot = document.getElementById('k-website').value.trim();
    if (honeypot) { return; }
    const _ro = localStorage.getItem('lang') === 'ro';
    if (!msg) { alert(_ro ? 'Te rugăm să scrii un mesaj.' : 'Bitte schreib eine Nachricht.'); return; }
    const btn = document.querySelector('[onclick="sendKontaktWA()"]');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }
    grecaptcha.ready(() => {
      grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'kontakt' }).then(token => {
        if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        if (!token) { alert(_ro ? 'Verificare anti-spam eșuată. Încearcă din nou.' : 'Anti-Spam-Prüfung fehlgeschlagen. Bitte erneut versuchen.'); return; }
        let wa = '📩 *DANDELION 11:11 – KONTAKTANFRAGE*\n\n';
        if (name)    wa += `👤 Name: ${name}\n`;
        if (email)   wa += `📧 E-Mail: ${email}\n`;
        if (subject) wa += `📌 Betreff: ${subject}\n`;
        wa += `\n💬 Nachricht:\n${msg}`;
        window.open('https://wa.me/491757668955?text=' + encodeURIComponent(wa), '_blank');
      });
    });
  };

  // Kollektionen
  function lp(p, field) {
    return localStorage.getItem('lang')==='ro' ? (p[field+'_ro'] || p[field]) : p[field];
  }
  window.lp = lp;
  function truncateWords(str, max) {
    if (str.length <= max) return str;
    const cut = str.slice(0, max);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
  }
  window.truncateWords = truncateWords;
  const kollProducts = [
    { id:1, name:'Ballon-Box Boho Luxe', desc:'Ein großer personalisierter Chromballon in Blau-Gold mit Schmetterlingsdekor, umhüllt von einem üppigen Arrangement aus Trockenblumen, Rosen, Pampasgras und goldenen Bändern. Handgemacht und einzigartig.', price:79.00, cat:'geburtstag', badge:'Bestseller', emoji:'🦋', img:'ballon-box-boho-blau-gold.webp', name_ro:'Cutie cu Baloane Boho Luxe', desc_ro:'Un balon mare personalizat din crom în albastru-auriu cu decor de fluturi, înconjurat de un aranjament generos din flori uscate, trandafiri, iarba pampas și panglici aurii. Realizat manual și unic.', badge_ro:'Cel mai vândut' },
    { id:2, name:'Ballon-Box Schwarz & Gold', desc:'Luxuriöse Ballon-Box im eleganten Schwarz-Gold-Look: großer schwarzer Ballon mit Goldfolie und Schriftzug, goldene Chromballons, dunkelrote Rosen und schwarzes Krepp-Papier in einer stilvollen Geschenkbox.', price:85.00, cat:'geburtstag', badge:'Premium', emoji:'🖤', img:'ballon-box-schwarz-gold.webp', name_ro:'Cutie cu Baloane Negru & Auriu', desc_ro:'Cutie cu baloane luxoasă în stilul elegant negru-auriu: balon mare negru cu folie aurie și mesaj personalizat, baloane cromate aurii, trandafiri roșu-închis și hârtie creponată neagră într-o cutie cadou stilată.', badge_ro:'Premium' },
    { id:3, name:'Lila Champagner-Ballon', desc:'Romantischer personalisierter Ballon in leuchtendem Lila mit Goldflitter, dekoriert mit frischen Blumen in Rosa und Weiß sowie glitzernden Lila-Kugeln, präsentiert auf einer Champagnerflasche als besonderes Geschenk.', price:69.00, cat:'geburtstag', badge:'Neu', emoji:'💜', img:'ballon-lila-champagner.webp', name_ro:'Balon Mov cu Șampanie', desc_ro:'Balon personalizat romantic în mov strălucitor cu sclipici auriu, decorat cu flori proaspete roz și albe, precum și sfere mov sclipitoare, prezentat pe o sticlă de șampanie ca un cadou special.', badge_ro:'Nou' },
    { id:4, name:'Romantischer Rosa Ballon', desc:'Großer rosafarbener Marmorballon mit individueller Pärchen-Silhouette und Initialen, umgeben von frischen Rosen, Gerbera und Schleierkraut sowie zarten Herzballons. Ein romantisches Geschenk für jeden besonderen Anlass.', price:79.00, cat:'hochzeit', badge:'Beliebt', emoji:'💑', img:'hochzeitsballon-rosa.webp', name_ro:'Balon Roz Romantic', desc_ro:'Balon marmorat roz mare cu silueta personalizată a unui cuplu și inițiale, înconjurat de trandafiri proaspeți, gerbera și miuță, precum și baloane în formă de inimă. Un cadou romantic pentru orice ocazie specială.', badge_ro:'Popular' },
    { id:5, name:'Fußball Blumenbox', desc:'Einzigartiges Arrangement für Fußballfans: personalisierter Fußballballon mit Fußballschuhen als Dekorelement, umgeben von bunten Rosen in Rot, Blau, Weiß und Gold auf einem goldenen Tablett.', price:69.00, cat:'fussball', badge:'Einzigartig', emoji:'⚽', img:'fussball-blumenbox.webp', name_ro:'Cutie Florală Fotbal', desc_ro:'Aranjament unic pentru fanii fotbalului: balon de fotbal personalizat cu ghete de fotbal ca element decorativ, înconjurat de trandafiri colorați în roșu, albastru, alb și auriu, pe o tavă aurie.', badge_ro:'Unicat' },
    { id:6, name:'Ballon mit Wunsch-Illustration', desc:'Vollständig personalisierter Ballon mit individueller Illustration nach Wunsch, ideal für Unternehmen, Vereine oder besondere Hobbys. Jeder Ballon ist ein einzigartiges Kunstwerk, das bleibt.', price:59.00, cat:'sonstiges', badge:'Individuell', emoji:'🎨', img:'ballon-wunsch-illustration.webp', name_ro:'Balon cu Ilustrație Personalizată', desc_ro:'Balon complet personalizat cu o ilustrație individuală la cerere, ideal pentru firme, asociații sau hobby-uri speciale. Fiecare balon este o operă de artă unică, care rămâne.', badge_ro:'Personalizat' },
    { id:7, name:'Dark-Chrome Ballon-Box', desc:'Dramatische und luxuriöse Ballon-Box mit großem dunkel-chromen Ballon in Schwarz-Gold, personalisiert mit Name oder Wunschbotschaft. Mit schwarzen Rosen, Goldkugeln, Perlen und weißen Blüten in einer eleganten runden Box.', price:85.00, cat:'geburtstag', badge:'Premium', emoji:'🖤', img:'ballon-box-dark-chrome-schwarz-gold.webp', name_ro:'Cutie cu Balon Dark-Chrome', desc_ro:'Cutie cu baloane dramatică și luxoasă cu un balon mare cromat-întunecat în negru-auriu, personalizat cu numele sau mesajul dorit. Cu trandafiri negri, sfere aurii, perle și flori albe într-o cutie rotundă elegantă.', badge_ro:'Premium' },
    { id:8, name:'Lila Hochzeits-Ballon-Box', desc:'Atemberaubende Hochzeitskomposition: violetter Marmorballon mit goldener Pärchen-Silhouette und Namen, dekoriert mit goldenen Schmetterlingen. Dazu eine opulente Blumenbox mit dunkelvioletten Rosen, Perlen und Schleierkraut.', price:89.00, cat:'hochzeit', badge:'Exklusiv', emoji:'💜', img:'hochzeitsballon-box-lila.webp', name_ro:'Cutie cu Balon de Nuntă Mov', desc_ro:'Compoziție impresionantă pentru nuntă: balon marmorat violet cu silueta aurie a unui cuplu și numele lor, decorat cu fluturi aurii. Plus o cutie florală opulentă cu trandafiri violet-închis, perle și miuță.', badge_ro:'Exclusiv' },
    { id:9, name:'Teddybär Blumenbox', desc:'Zauberhafter Blumenkorb mit einem kuschligen weißen Teddybären, umgeben von frischen gelb-orangenen Rosen, Perlengirlanden, Schmetterlingen und Marienkäfern. Ein unvergessliches Geschenk für Kinder und Babys.', price:59.00, cat:'kuscheltiere', badge:'Süß', emoji:'🐻', img:'teddybaer-blumenbox.webp', name_ro:'Cutie Florală cu Ursuleț de Pluș', desc_ro:'Coș floral fermecător cu un ursuleț de pluș alb și pufos, înconjurat de trandafiri proaspeți galben-portocalii, ghirlande de perle, fluturi și buburuze. Un cadou neuitat pentru copii și bebeluși.', badge_ro:'Drăguț' },
    { id:10, name:'Pilz-Gnom Blumenbox', desc:'Märchenhaftes Blumenarrangement mit einem charmanten Pilz-Gnom, eingebettet in sonnige gelb-orangene Rosen mit Perlen, Federn und bunten Schmetterlingen. Handgemacht mit viel Liebe für besondere Geburtstage.', price:55.00, cat:'geburtstag', badge:'', emoji:'🍄', img:'pilz-gnom-blumenbox.webp', name_ro:'Cutie Florală cu Gnom Ciupercă', desc_ro:'Aranjament floral de poveste cu un gnom-ciupercă fermecător, încadrat de trandafiri galben-portocalii însorit, cu perle, pene și fluturi colorați. Realizat manual cu multă dragoste pentru zile de naștere speciale.', badge_ro:'' },
    { id:11, name:'Drachen Blumenbox', desc:'Traumhaftes Blumenarrangement mit einer niedlichen Drachen-Figur in Lila, umgeben von bunten Blüten in Orange, Creme und Violett. Perfekt für Babypartys, Kindertaufen und besondere Kinderwünsche.', price:55.00, cat:'babyparty', badge:'Neu', emoji:'🐉', img:'drachen-blumenbox.webp', name_ro:'Cutie Florală cu Dragon', desc_ro:'Aranjament floral de poveste cu o figurină drăguță de dragon mov, înconjurată de flori colorate în portocaliu, crem și violet. Perfect pentru baby showere, botezuri și dorințe speciale pentru copii.', badge_ro:'Nou' },
    { id:12, name:'Gamer Geburtstags-Set', desc:'Das perfekte Geschenk für kleine und große Gamer: personalisierter Pinguin-Plüsch mit Namen, Folienballon im Gaming-Design und bunte Luftballons im coolen Blau-Schwarz-Look.', price:65.00, cat:'kuscheltiere', badge:'Beliebt', emoji:'🎮', img:'gamer-geburtstags-set.webp', name_ro:'Set Aniversar Gamer', desc_ro:'Cadoul perfect pentru micii și marii gameri: pluș personalizat în formă de pinguin cu numele, balon folie cu design gaming și baloane colorate cu aer într-un look cool albastru-negru.', badge_ro:'Popular' },
    { id:13, name:'Stitch Blumenstrauß', desc:'Zauberhafter Blumenstrauß mit dem beliebten Disney-Stitch Plüschtier, eingebettet in romantische rosa Rosen und schimmernde holografische Blüten in Blau-Grün mit Eukalyptuszweigen. Ein Geschenk, das Augen zum Leuchten bringt.', price:65.00, cat:'kuscheltiere', badge:'Disney', emoji:'💙', img:'stitch-blumenstrauss.webp', name_ro:'Buchet Floral Stitch', desc_ro:'Buchet floral fermecător cu îndrăgita jucărie de pluș Disney Stitch, înconjurată de trandafiri roz romantici și flori holografice strălucitoare în albastru-verde cu crenguțe de eucalipt. Un cadou care face ochii să sclipească.', badge_ro:'Disney' },
    { id:14, name:'Feen-Blumenbox', desc:'Märchenhafte Blumenbox mit einer zauberhaften Feenpuppe mit lila Flügeln, umgeben von holografischen Rosen in Blau-Türkis, Pfingstrosen in Rosa und Weiß sowie Eukalyptuszweigen. Ein Traum für kleine Mädchen.', price:69.00, cat:'babyparty', badge:'Magisch', emoji:'🧚', img:'feen-blumenbox.webp', name_ro:'Cutie Florală cu Zână', desc_ro:'Cutie florală de poveste cu o păpușă zână fermecătoare cu aripi violet, înconjurată de trandafiri holografici albastru-turcoaz, bujori roz și albi și crenguțe de eucalipt. Un vis pentru fetițe.', badge_ro:'Magic' },
    { id:15, name:'Ferrero Geburtstags-Box', desc:'Edle Geburtstags-Box im Schwarz-Gold-Look: Ferrero Rocher Pralinen, schwarze Fransendekoration, Pixel-Sonnenbrille und goldene Geburtstagsbeschriftung. Für alle, die es stilvoll und süß mögen.', price:55.00, cat:'geburtstag', badge:'Trendy', emoji:'🍫', img:'ferrero-geburtstagsbox.webp', name_ro:'Cutie Aniversară Ferrero', desc_ro:'Cutie aniversară elegantă în stil negru-auriu: bomboane Ferrero Rocher, decor cu franjuri negri, ochelari de soare pixelați și mesaj aniversar auriu. Pentru cei care iubesc stilul și dulciurile.', badge_ro:'Trendy' },
    { id:16, name:'Spiderman Geburtstags-Box', desc:'Personalisierter goldener Marmorballon mit individuellem Namen und Geburtstagswunsch, dekoriert mit einer Spiderman-Figur. Dazu eine bunte Box gefüllt mit Süßigkeiten wie Milka, Haribo und mehr, ein Highlight für kleine Superhelden-Fans.', price:65.00, cat:'geburtstag', badge:'Beliebt', emoji:'🕷️', img:'spiderman-geburtstagsbox.webp', name_ro:'Cutie Aniversară Spiderman', desc_ro:'Balon marmorat auriu personalizat cu numele și mesajul de zi de naștere, decorat cu o figurină Spiderman. Plus o cutie colorată plină cu dulciuri precum Milka, Haribo și altele, un highlight pentru micii fani ai super-eroilor.', badge_ro:'Popular' },
    { id:17, name:'Einhorn-Ballonstrauß', desc:'Verspielter Ballonstrauß mit einem schimmernden Einhorn-Folienballon, rosa Herzballon, silbernem Ei-Ballon und pastellfarbenen Luftballons, liebevoll verpackt mit Schleifen in Rosa und Lila. Ein Traum für kleine Prinzessinnen.', price:49.00, cat:'kuscheltiere', badge:'Neu', emoji:'🦄', img:'einhorn-ballonstrauss.webp', fit:'contain', name_ro:'Buchet de Baloane Unicorn', desc_ro:'Buchet jucăuș de baloane cu un balon folie unicorn strălucitor, un balon roz în formă de inimă, un balon argintiu în formă de ou și baloane pastel cu aer, ambalate cu drag cu fundițe roz și mov. Un vis pentru micile prințese.', badge_ro:'Nou' },
    { id:18, name:'Teddy Geschenkbox mit Ballon', desc:'Liebevolle Geschenkbox mit kuscheligem Teddybären, personalisiertem Ballon mit Wunschtext in Lila-Weiß und einer großen Auswahl an Süßigkeiten wie Milka und Haribo. Perfekt für besondere Glückwünsche.', price:59.00, cat:'kuscheltiere', badge:'Beliebt', emoji:'🧸', img:'teddy-geschenkbox-mit-ballon.webp', fit:'contain', name_ro:'Cutie Cadou cu Ursuleț și Balon', desc_ro:'Cutie cadou plină de drag cu un ursuleț de pluș pufos, balon personalizat cu mesajul dorit în mov-alb și o selecție generoasă de dulciuri precum Milka și Haribo. Perfect pentru urări speciale.', badge_ro:'Popular' },
    { id:19, name:'Regenbogen-Einhorn im Ballon', desc:'Magischer transparenter Stuffed-Ballon mit einem bunten Regenbogen-Einhorn-Plüschtier und pastellfarbenen Mini-Ballons im Inneren, verziert mit rosa Schleife und Geburtstags-Topper. Ein unvergessliches Highlight zum Auspacken.', price:69.00, cat:'kuscheltiere', badge:'Magisch', emoji:'🌈', img:'regenbogen-einhorn-ballon.webp', fit:'contain', name_ro:'Unicorn Curcubeu în Balon', desc_ro:'Balon transparent magic, umplut cu o jucărie de pluș unicorn-curcubeu colorată și mini-baloane pastel în interior, decorat cu fundă roz și topper aniversar. Un highlight de neuitat la despachetare.', badge_ro:'Magic' },
    { id:20, name:'Premium Blumenbox mit Schmetterling', desc:'Exklusive Blumenbox mit einer eleganten Mischung aus Anemonen, Rosen und Hortensien in Rosa, Lila und Violett, verziert mit einem bunten Schmetterling und edlen Bändern. Ein luxuriöses Geschenk für besondere Anlässe.', price:75.00, cat:'sonstiges', badge:'Exklusiv', emoji:'🦋', img:'premium-blumenbox-schmetterling.webp', fit:'contain', name_ro:'Cutie Florală Premium cu Fluture', desc_ro:'Cutie florală exclusivă cu un amestec elegant de anemone, trandafiri și hortensii în roz, mov și violet, decorată cu un fluture colorat și panglici fine. Un cadou luxos pentru ocazii speciale.', badge_ro:'Exclusiv' },
    { id:21, name:'Whiskey & Ferrero Strauß', desc:'Außergewöhnlicher Strauß für besondere Männer: drei Mini-Flaschen Jack Daniel\'s Whiskey kombiniert mit goldenen Ferrero-Rocher-Pralinen, elegant verpackt in schwarzem und goldenem Papier mit passender Schleife.', price:59.00, cat:'sonstiges', badge:'Für Ihn', emoji:'🥃', img:'whiskey-ferrero-strauss.webp', fit:'contain', name_ro:'Buchet Whiskey & Ferrero', desc_ro:'Buchet extraordinar pentru bărbați deosebiți: trei sticluțe mini de whiskey Jack Daniel\'s combinate cu bomboane aurii Ferrero Rocher, ambalate elegant în hârtie neagră și aurie cu fundă asortată.', badge_ro:'Pentru El' },
    { id:22, name:'Geburtstagsballon Blau mit Blumenbox', desc:'Großer personalisierter Ballon mit Glitzereffekt und Schriftzug "Alles Gute zum Geburtstag", umgeben von zartblauen Hortensien, pfirsichfarbenen Rosen und frischem Eukalyptus in einer eleganten Box mit Feen-Motiv.', price:75.00, cat:'geburtstag', badge:'Beliebt', emoji:'🧚', img:'geburtstagsballon-blau-blumenbox.webp', fit:'contain', name_ro:'Balon Aniversar Albastru cu Cutie Florală', desc_ro:'Balon mare personalizat cu efect sclipitor și mesajul "La mulți ani", înconjurat de hortensii bleu, trandafiri piersică și eucalipt proaspăt într-o cutie elegantă cu motiv de zână.', badge_ro:'Popular' },
    { id:23, name:'Blumenkorb mit Foto-Medaillon', desc:'Wunderschöner Blumenkorb mit weißen, gelben und pinken Blüten sowie lila Hortensien, verziert mit einem individuell gestalteten Foto-Medaillon. Ein einzigartiges, persönliches Geschenk für besondere Menschen.', price:65.00, cat:'sonstiges', badge:'Individuell', emoji:'📷', img:'blumenkorb-foto-medaillon.webp', fit:'contain', name_ro:'Coș Floral cu Medalion Foto', desc_ro:'Coș floral superb cu flori albe, galbene și roz, plus hortensii violet, decorat cu un medalion foto personalizat. Un cadou unic și personal pentru oamenii speciali.', badge_ro:'Personalizat' },
    { id:24, name:'Heißluftballon "Happy Valentine\'s Day"', desc:'Romantische Geschenkbox in Heißluftballon-Form mit der Aufschrift "Happy Valentine\'s Day", goldenen Ferrero-Rocher-Pralinen, rosa Rosen und grünem Akzent. Ein Hingucker für Verliebte.', price:65.00, cat:'liebe', badge:'Romantisch', emoji:'💗', img:'heissluftballon-valentinstag.webp', fit:'contain', name_ro:'Balon cu Aer Cald "Happy Valentine\'s Day"', desc_ro:'Cutie cadou romantică în formă de balon cu aer cald, cu mesajul "Happy Valentine\'s Day", bomboane aurii Ferrero Rocher, trandafiri roz și accent verde. Un cadou care atrage privirile îndrăgostiților.', badge_ro:'Romantic' },
    { id:25, name:'Teddybär im Geschenkballon', desc:'Kuscheliger Teddybär mit roter Satinschleife, eingehüllt in einen großen transparenten Stuffed-Ballon und präsentiert auf einer eleganten Box mit roter Dekoration. Ein herzerwärmendes Geschenk für jeden Anlass.', price:49.00, cat:'kuscheltiere', badge:'Beliebt', emoji:'🧸', img:'teddybaer-geschenkballon-rot.webp', fit:'contain', name_ro:'Ursuleț în Balon Cadou', desc_ro:'Ursuleț de pluș pufos cu fundă de satin roșie, învelit într-un balon transparent mare și prezentat pe o cutie elegantă cu decor roșu. Un cadou care încălzește sufletul pentru orice ocazie.', badge_ro:'Popular' },
    { id:26, name:'Herz-Box mit Ferrero & roten Rosen', desc:'Romantische herzförmige Geschenkbox gefüllt mit goldenen Ferrero-Rocher-Pralinen und umrahmt von samtroten Rosen. Verziert mit einer eleganten roten Schleife, das perfekte Geschenk für besondere Liebesbeweise.', price:45.00, cat:'liebe', badge:'Romantisch', emoji:'❤️', img:'herz-box-ferrero-rote-rosen.webp', fit:'contain', name_ro:'Cutie Inimă cu Ferrero & Trandafiri Roșii', desc_ro:'Cutie cadou romantică în formă de inimă, plină cu bomboane aurii Ferrero Rocher și încadrată de trandafiri roșu-catifelat. Decorată cu o fundă roșie elegantă, cadoul perfect pentru dovezi de dragoste speciale.', badge_ro:'Romantic' },
    { id:27, name:'Kinder Joy Blumenstrauß', desc:'Süßer Strauß mit drei Kinder-Joy-Überraschungseiern, eingebettet in zartrosa Schleierkraut und dekoriert mit rosafarbenem Verpackungspapier und Satinschleife. Eine fröhliche Überraschung für Kinder und Naschkatzen.', price:29.00, cat:'babyparty', badge:'Süß', emoji:'🍬', img:'kinder-joy-blumenstrauss.webp', fit:'contain', name_ro:'Buchet Floral Kinder Joy', desc_ro:'Buchet dulce cu trei ouă-surpriză Kinder Joy, încadrate de miuță roz-pal și decorate cu hârtie de ambalaj roz și fundă de satin. O surpriză veselă pentru copii și iubitorii de dulciuri.', badge_ro:'Dulce' },
    { id:28, name:'Fußballschuh-Blumenstrauß', desc:'Origineller Strauß für Fußballfans: ein Paar pinke Fußballschuhe eingebettet in pinke Rosen, Gerbera in Pink und Bordeaux sowie weißen Schleierkraut. Ein Geschenk, das garantiert in Erinnerung bleibt.', price:55.00, cat:'fussball', badge:'Einzigartig', emoji:'⚽', img:'fussballschuh-blumenstrauss.webp', fit:'contain', name_ro:'Buchet Floral cu Ghete de Fotbal', desc_ro:'Buchet original pentru fanii fotbalului: o pereche de ghete de fotbal roz încadrate de trandafiri roz, gerbera roz și visiniu, plus miuță albă. Un cadou care rămâne garantat în memorie.', badge_ro:'Unicat' },
    { id:29, name:'Abschluss-Ballon "conGRADulations"', desc:'Eleganter weißer Ballon mit Doktorhut und goldener Quaste, individuell bedruckt mit "conGRADulations" und dem Namen des Absolventen. Verziert mit schwarzer Schleife, das perfekte Geschenk zum Schulabschluss oder Studienabschluss.', price:39.00, cat:'sonstiges', badge:'Individuell', emoji:'🎓', img:'abschluss-ballon-congradulations.webp', fit:'contain', name_ro:'Balon de Absolvire "conGRADulations"', desc_ro:'Balon alb elegant cu tocă de absolvire și ciucure auriu, personalizat cu "conGRADulations" și numele absolventului. Decorat cu fundă neagră, cadoul perfect pentru absolvirea școlii sau facultății.', badge_ro:'Personalizat' },
    { id:30, name:'Fußball-Fan Strauß "Ronaldo"', desc:'Einzigartiger Strauß für Fußballfans mit Cristiano-Ronaldo-Motiven, Vereinswappen, Trikot mit Wunschnummer und Fußball-Dekoration auf marineblauem Papier. Das ultimative Geschenk für jeden Fußballfan.', price:45.00, cat:'fussball', badge:'Fan-Edition', emoji:'⚽', img:'fussball-fan-strauss-ronaldo.webp', fit:'contain', name_ro:'Buchet Fan Fotbal "Ronaldo"', desc_ro:'Buchet unic pentru fanii fotbalului cu motive Cristiano Ronaldo, sigla clubului, tricou cu numărul preferat și decor de fotbal pe hârtie bleumarin. Cadoul suprem pentru orice fan de fotbal.', badge_ro:'Ediție Fan' },
    { id:31, name:'Fußballschuh-Strauß "Nike"', desc:'Sportlicher Strauß mit cremefarbenen Nike-Fußballschuhen, eingebettet in zartem gelb-weißem Schleierkraut und stilvoll verpackt in braunem Kraftpapier. Ein originelles Geschenk für jeden Fußballfan.', price:49.00, cat:'fussball', badge:'Sportlich', emoji:'⚽', img:'fussballschuh-strauss-nike.webp', fit:'contain', name_ro:'Buchet cu Ghete de Fotbal "Nike"', desc_ro:'Buchet sportiv cu ghete de fotbal Nike crem, încadrate de miuță delicată galben-albă și ambalate stilat în hârtie kraft maro. Un cadou original pentru orice fan al fotbalului.', badge_ro:'Sportiv' },
    { id:32, name:'Fußballschuh-Vase mit weißen Rosen', desc:'Außergewöhnliches Arrangement aus silbernen Fußballschuhen als Vase, gefüllt mit weißen Rosen und Schleierkraut, präsentiert auf einem eleganten Metalltablett mit einem Fußball als Deko-Element. Ein echter Hingucker für Fußballfans.', price:55.00, cat:'fussball', badge:'Einzigartig', emoji:'⚽', img:'fussballschuh-vase-weisse-rosen.webp', fit:'contain', name_ro:'Vază din Ghete de Fotbal cu Trandafiri Albi', desc_ro:'Aranjament extraordinar din ghete de fotbal argintii folosite ca vază, umplute cu trandafiri albi și miuță, prezentate pe o tavă metalică elegantă cu o minge de fotbal ca element decorativ. Un adevărat punct de atracție pentru fanii fotbalului.', badge_ro:'Unicat' },
    { id:33, name:'Gesicht-Skulptur mit Trockenblumen', desc:'Außergewöhnliche Deko-Skulptur in Silber, ein Gesicht mit verdeckenden Händen, gekrönt von einem üppigen Arrangement aus Trockenblumen, rosa Schleierkraut und Eukalyptus. Ein modernes Statement-Stück für Liebhaber außergewöhnlicher Deko.', price:69.00, cat:'sonstiges', badge:'Einzigartig', emoji:'🌿', img:'gesicht-skulptur-trockenblumen.webp', fit:'contain', name_ro:'Sculptură Față cu Flori Uscate', desc_ro:'Sculptură decorativă extraordinară în argintiu, o față cu mâini protectoare, încoronată de un aranjament generos din flori uscate, miuță roz și eucalipt. O piesă modernă pentru iubitorii de decor neobișnuit.', badge_ro:'Unicat' },
    { id:34, name:'Oster-Blumenbox mit Drachen', desc:'Fröhliche Osterdekoration mit einem niedlichen Drachen im Hasenkostüm und Osterkörbchen, umgeben von pastellfarbenen Rosen in Gelb, Rosa und Blau sowie bunten Ostereiern und einem Marienkäfer. Ein liebevolles Geschenk zu Ostern.', price:55.00, cat:'sonstiges', badge:'Ostern', emoji:'🐰', img:'easter-drachen-blumenbox.webp', fit:'contain', name_ro:'Cutie Florală de Paște cu Dragon', desc_ro:'Decorație de Paște veselă cu un dragon drăguț în costum de iepuraș și coșuleț de Paște, înconjurat de trandafiri pastel în galben, roz și albastru, plus ouă de Paște colorate și o buburuză. Un cadou plin de drag de Paște.', badge_ro:'Paște' },
    { id:35, name:'Lamborghini Modellauto Bilderrahmen', desc:'Exklusives Deko-Objekt für Autoliebhaber: ein detailgetreues Lamborghini Huracán Performante Modellauto in einem eleganten schwarzen Schattenrahmen mit gravierten technischen Daten. Ein einzigartiges Geschenk für jeden Sportwagen-Fan.', price:79.00, cat:'sonstiges', badge:'Für Ihn', emoji:'🏎️', img:'lamborghini-modellauto-bilderrahmen.webp', fit:'contain', name_ro:'Ramă cu Macheta Lamborghini', desc_ro:'Obiect decorativ exclusiv pentru iubitorii de mașini: o machetă detaliată Lamborghini Huracán Performante într-o ramă elegantă neagră cu date tehnice gravate. Un cadou unic pentru orice fan al mașinilor sport.', badge_ro:'Pentru El' },
    { id:36, name:'Oster-Blumenbox mit Häschen', desc:'Bezaubernde Osterkomposition mit einem niedlichen Häschen-Pferd, umgeben von Rosen in Pink, Blau und Lila, Pastell-Ostereiern, einem Marienkäfer und einem kleinen gelben Küken. Ein wundervolles Geschenk zum Osterfest.', price:55.00, cat:'sonstiges', badge:'Ostern', emoji:'🐣', img:'oster-blumenbox-haeschen.webp', fit:'contain', name_ro:'Cutie Florală de Paște cu Iepuraș', desc_ro:'Compoziție fermecătoare de Paște cu un căluț-iepuraș drăguț, înconjurat de trandafiri roz, albastru și mov, ouă de Paște pastel, o buburuză și un pui mic galben. Un cadou minunat de Paște.', badge_ro:'Paște' },
    { id:37, name:'Oster-Blumenbox mit Hase & Küken', desc:'Liebevolle Osterbox mit einem süßen weißen Hasen, der ein gelbes Küken hält, umgeben von zartblauen und pinken Rosen, Pastell-Ostereiern und kleinen Schoko-Figuren. Ein herzerwärmendes Geschenk zum Osterfest.', price:55.00, cat:'sonstiges', badge:'Ostern', emoji:'🐰', img:'oster-blumenbox-hase-kueken.webp', fit:'contain', name_ro:'Cutie Florală de Paște cu Iepuraș & Pui', desc_ro:'Cutie de Paște plină de drag cu un iepuraș alb dulce care ține un pui galben, înconjurat de trandafiri bleu și roz, ouă de Paște pastel și mici figurine din ciocolată. Un cadou care încălzește sufletul de Paște.', badge_ro:'Paște' },
    { id:38, name:'Oster-Blumenbox mit Macaron-Küken', desc:'Süße Osterdekoration mit einem Küken in Hasenohren, das bunte Macarons hält, eingebettet in zartblaue, lila und pinke Rosen mit Pastell-Ostereiern und Schoko-Figuren. Ein farbenfrohes Geschenk für Ostern.', price:55.00, cat:'sonstiges', badge:'Ostern', emoji:'🐥', img:'oster-blumenbox-macaron-kueken.webp', fit:'contain', name_ro:'Cutie Florală de Paște cu Pui și Macaron', desc_ro:'Decorație dulce de Paște cu un pui cu urechi de iepuraș care ține macarons colorate, încadrat de trandafiri bleu, mov și roz cu ouă de Paște pastel și figurine din ciocolată. Un cadou colorat de Paște.', badge_ro:'Paște' },
    { id:39, name:'Oster-Blumenbox mit Astronauten-Küken', desc:'Originelle Osterkomposition mit einem niedlichen Küken im Astronautenanzug, umgeben von zartblauen und pinken Rosen, Pastell-Ostereiern und kleinen Schoko-Figuren. Ein außergewöhnliches Geschenk für kleine Entdecker.', price:55.00, cat:'sonstiges', badge:'Ostern', emoji:'🚀', img:'oster-blumenbox-astronauten-kueken.webp', fit:'contain', name_ro:'Cutie Florală de Paște cu Pui-Astronaut', desc_ro:'Compoziție originală de Paște cu un pui drăguț în costum de astronaut, înconjurat de trandafiri bleu și roz, ouă de Paște pastel și mici figurine din ciocolată. Un cadou extraordinar pentru micii exploratori.', badge_ro:'Paște' },
    { id:40, name:'Oster-Blumenbox mit grünem Drachen', desc:'Fröhliche Osterbox mit einem freundlichen grünen Drachen mit Hasenohren, umgeben von zartblauen, lila und pinken Rosen, Pastell-Ostereiern und kleinen Schoko-Figuren. Ein liebevolles Geschenk zu Ostern.', price:55.00, cat:'sonstiges', badge:'Ostern', emoji:'🐉', img:'oster-blumenbox-gruener-drache.webp', fit:'contain', name_ro:'Cutie Florală de Paște cu Dragon Verde', desc_ro:'Cutie de Paște veselă cu un dragon verde prietenos cu urechi de iepuraș, înconjurat de trandafiri bleu, mov și roz, ouă de Paște pastel și mici figurine din ciocolată. Un cadou plin de drag de Paște.', badge_ro:'Paște' },
    { id:41, name:'Lamborghini Modellauto Bilderrahmen Blau', desc:'Exklusives Deko-Objekt für Autoliebhaber: ein detailgetreues Lamborghini Huracán Performante Modellauto in einem eleganten schwarzen Schattenrahmen mit türkisfarbenem Hintergrund und gravierten technischen Daten. Ein einzigartiges Geschenk für jeden Sportwagen-Fan.', price:79.00, cat:'sonstiges', badge:'Für Ihn', emoji:'🏎️', img:'lamborghini-modellauto-bilderrahmen-blau.webp', fit:'contain', name_ro:'Ramă cu Macheta Lamborghini Albastru', desc_ro:'Obiect decorativ exclusiv pentru iubitorii de mașini: o machetă detaliată Lamborghini Huracán Performante într-o ramă elegantă neagră cu fundal turcoaz și date tehnice gravate. Un cadou unic pentru orice fan al mașinilor sport.', badge_ro:'Pentru El' },
    { id:42, name:'Oster-Blumenbox mit Hasenfamilie', desc:'Herzerwärmende Osterbox mit zwei kuscheligen Hasenfiguren, ein großer Hase küsst liebevoll ein Baby-Häschen in einer Eierschale, umgeben von zartblauen, lila und pinken Rosen sowie Pastell-Ostereiern und Schoko-Figuren. Ein rührendes Geschenk zum Osterfest.', price:55.00, cat:'sonstiges', badge:'Ostern', emoji:'🐰', img:'oster-blumenbox-hasenfamilie.webp', fit:'contain', name_ro:'Cutie Florală de Paște cu Familie de Iepurași', desc_ro:'Cutie de Paște emoționantă cu două figurine pufoase de iepuraș, un iepuraș mare sărută cu drag un iepuraș-bebeluș dintr-o coajă de ou, înconjurați de trandafiri bleu, mov și roz, ouă de Paște pastel și figurine din ciocolată. Un cadou tandru de Paște.', badge_ro:'Paște' },
    { id:43, name:'Oster-Blumenbox mit Macaron-Hase', desc:'Charmante Osterkomposition mit einem Hasen im rosa Kleid, der einen bunten Turm aus glitzernden Macarons balanciert, umgeben von zartblauen, lila und pinken Rosen sowie Pastell-Ostereiern und Schoko-Figuren. Ein süßes Geschenk zu Ostern.', price:55.00, cat:'sonstiges', badge:'Ostern', emoji:'🐰', img:'oster-blumenbox-macaron-hase.webp', fit:'contain', name_ro:'Cutie Florală de Paște cu Iepuraș și Macaron', desc_ro:'Compoziție fermecătoare de Paște cu un iepuraș în rochiță roz, care echilibrează un turn colorat din macarons sclipitoare, înconjurat de trandafiri bleu, mov și roz, ouă de Paște pastel și figurine din ciocolată. Un cadou dulce de Paște.', badge_ro:'Paște' },
    { id:44, name:'Geburtstags-Geschenkbox für Hunde "Dog Mom"', desc:'Liebevolle Geschenkbox "Alles Gute zum Geburtstag" für Hundeliebhaber: mit Pflegeprodukten, einer Tasse, einem "Dog Mom" Halstuch und Cap, einem Tennisball sowie selbstgemachten Hundekeksen und Leckerlis. Das perfekte Geschenk für jede Hundemama.', price:45.00, cat:'sonstiges', badge:'Für Hundeliebhaber', emoji:'🐶', imgs:['hunde-geschenkbox-dogmom-1.webp','hunde-geschenkbox-dogmom-2.webp','hunde-geschenkbox-dogmom-3.webp','hunde-geschenkbox-dogmom-4.webp','hunde-geschenkbox-dogmom-5.webp','hunde-geschenkbox-dogmom-6.webp','hunde-geschenkbox-dogmom-7.webp'], fit:'contain', name_ro:'Cutie Cadou Aniversară pentru Câini "Dog Mom"', desc_ro:'Cutie cadou plină de drag "La mulți ani" pentru iubitorii de câini: cu produse de îngrijire, o cană, o bandană și o șapcă "Dog Mom", o minge de tenis, plus biscuiți și recompense pentru câini făcute manual. Cadoul perfect pentru orice mămică de cățel.', badge_ro:'Pentru Iubitorii de Câini' },
    { id:45, name:'Hundeleckerli-Set mit Tennisball', desc:'Liebevoll verpacktes Set mit selbstgemachten Hundekeksen und Leckerlis in einer transparenten Tüte mit Schleife, dazu ein Tennisball, beide mit niedlichem "Dandelion 11:11" Hund-und-Hand-Motiv. Ein süßes kleines Geschenk für jeden Vierbeiner.', price:13.00, cat:'sonstiges', badge:'Für Hunde', emoji:'🦴', imgs:['hunde-geschenkbox-dogmom-4.webp','hunde-geschenkbox-dogmom-5.webp'], fit:'contain', name_ro:'Set Recompense pentru Câini cu Minge de Tenis', desc_ro:'Set ambalat cu drag cu biscuiți și recompense pentru câini făcute manual într-o pungă transparentă cu fundă, plus o minge de tenis, ambele cu drăgălașul motiv "Dandelion 11:11" câine-și-mână. Un mic cadou dulce pentru orice patruped.', badge_ro:'Pentru Câini' },
    { id:46, name:'Perlen-Brautstrauß Ivory', desc:'Eleganter Brautstrauß aus cremeweißen Ranunkeln, umhüllt von zartem Tüll mit aufgenähten Perlen, verziert mit Perlenzweigen und langen Perlenbändern. Ein zeitloses Accessoire für die Braut am schönsten Tag.', price:65.00, cat:'hochzeit', badge:'Für die Braut', emoji:'🤍', img:'brautstrauss-perlen-ivory.webp', fit:'contain', name_ro:'Buchet de Mireasă cu Perle Ivoriu', desc_ro:'Buchet de mireasă elegant din ranunculus crem, înfășurat în tul delicat cu perle cusute, decorat cu crenguțe de perle și panglici lungi de perle. Un accesoriu atemporal pentru mireasă în ziua cea mai frumoasă.', badge_ro:'Pentru Mireasă' },
    { id:47, name:'Blumenball Rosa Volleyball', desc:'Verspieltes Blumenarrangement um einen rosa Volleyball, umkränzt von rosa Rosen und zartem Schleierkraut. Ein einzigartiges Geschenk für sportbegeisterte Mädchen und Frauen.', price:69.00, cat:'sonstiges', badge:'Einzigartig', emoji:'🏐', img:'blumenball-rosa-volleyball.webp', fit:'contain', name_ro:'Buchet Floral cu Minge de Volei Roz', desc_ro:'Aranjament floral jucăuș în jurul unei mingi de volei roz, încununat cu trandafiri roz și miuță delicată. Un cadou unic pentru fetele și femeile pasionate de sport.', badge_ro:'Unicat' },
    { id:48, name:'Brauthaarschmuck Perlen & Orchideen', desc:'Romantischer Haarreif für die Braut mit mehrreihigen Perlenketten und einer Seite aus weißen Orchideenblüten. Ein elegantes Detail für die Hochzeitsfrisur.', price:45.00, cat:'hochzeit', badge:'Für die Braut', emoji:'🌸', img:'brauthaarschmuck-perlen-orchideen.webp', fit:'contain', name_ro:'Coroniță de Mireasă cu Perle și Orhidee', desc_ro:'Coroniță romantică pentru mireasă cu șiraguri de perle pe mai multe rânduri și o latură din flori albe de orhidee. Un detaliu elegant pentru coafura de nuntă.', badge_ro:'Pentru Mireasă' },
    { id:49, name:'Pop-Me Gender-Reveal-Ballon "Boy or Girl"', desc:'Großer transparenter "Boy or Girl"-Ballon zum Aufstechen, gefüllt mit rosa oder blauem Puder und kleinen Luftballons nach Wahl der Geschlechterfarbe. Mit einem Nadelstich an der markierten Stelle platzt der innere Farb-Ballon und enthüllt das Babygeschlecht, der perfekte Überraschungsmoment für jede Gender-Reveal-Party.', price:39.00, cat:'babyparty', badge:'Gender-Reveal', emoji:'🦋', img:'gender-reveal-ballon-boy-or-girl.webp', fit:'contain', name_ro:'Balon Pop-Me Gender-Reveal "Boy or Girl"', desc_ro:'Balon mare transparent "Boy or Girl" de spart, umplut cu praf roz sau bleu și mici baloane în culoarea aleasă pentru sex. Cu o gaură de ac în locul marcat, balonul colorat din interior se sparge și dezvăluie sexul bebelușului, momentul perfect de surpriză pentru orice petrecere gender-reveal.', badge_ro:'Gender-Reveal' },
    { id:50, name:'Personalisiertes Ringkissen-Tablett mit Namen & Datum', desc:'Elegantes Ringkissen-Tablett für die Trauung, individuell mit den Namen des Brautpaars und dem Hochzeitsdatum versehen. Erhältlich in mehreren liebevoll gestalteten Varianten: mit roten Rosen, mit weißen oder ivory-farbenen Rosen auf Spiegeltablett, oder maritim mit Muscheln und Trockenblumen. Ein wunderschönes Detail für die Ringübergabe und ein bleibendes Erinnerungsstück.', price:35.00, cat:'hochzeit', badge:'Für die Trauung', emoji:'💍', imgs:['ringkissen-tablett-rote-rosen.webp','ringkissen-tablett-weisse-rosen-spiegel.webp','ringkissen-tablett-ivory-rosen-spiegel.webp','ringkissen-tablett-maritim-muscheln-kranz.webp','ringkissen-tablett-maritim-muscheln-spiegel.webp'], fit:'contain', name_ro:'Tavă Personalizată pentru Verighete cu Nume & Dată', desc_ro:'Tavă elegantă pentru verighete, personalizată cu numele mirilor și data nunții. Disponibilă în mai multe variante create cu drag: cu trandafiri roșii, cu trandafiri albi sau ivoriu pe tavă-oglindă, sau maritimă cu scoici și flori uscate. Un detaliu superb pentru schimbul verighetelor și o amintire de neprețuit.', badge_ro:'Pentru Cununie' },
    { id:51, name:'Deko-Oldtimer mit Trockenblumen & Perlen', desc:'Niedlicher Mini-Oldtimer aus Metall, liebevoll dekoriert mit einem üppigen Trockenblumenarrangement aus Federgras, Eukalyptus und Perlenranken auf dem Dach. Erhältlich in Rosa mit zartem Pampasgras-Mix oder in Schwarz mit türkis-rosa Blumenmischung. Ein einzigartiges Deko-Geschenk für Liebhaber außergewöhnlicher Blumenkunst.', price:18.00, cat:'sonstiges', badge:'Einzigartig', emoji:'🚗', imgs:['deko-oldtimer-trockenblumen-perlen-set.webp','deko-oldtimer-schwarz-tuerkis-rosa-blumen.webp','deko-oldtimer-rosa-schwarz-rueckansicht.webp','deko-oldtimer-rosa-pampasgras-detail.webp','deko-oldtimer-rosa-schwarz-seitenansicht.webp'], fit:'contain', name_ro:'Mașinuță Decorativă cu Flori Uscate & Perle', desc_ro:'Mașinuță retro din metal, decorată cu drag cu un aranjament generos de flori uscate din iarbă-pampas, eucalipt și șiraguri de perle pe plafon. Disponibilă în roz cu un mix delicat de pampas, sau în negru cu flori turcoaz și roz. Un cadou decorativ unic pentru iubitorii de aranjamente florale neobișnuite.', badge_ro:'Unicat' },
    { id:52, name:'Boxhandschuh-Blumenstrauß "Kraft & Blüten"', desc:'Ein roter Boxhandschuh, liebevoll umrahmt von dunkelroten und schwarzen Pfingstrosen, goldenen Kugeln und einer eleganten goldenen Schleife. Ein außergewöhnliches Geschenk, das Stärke, Disziplin und Leidenschaft auf den Punkt bringt, perfekt für jeden Box-Fan oder Sportler in deinem Leben.', price:49.00, cat:'geburtstag', badge:'Einzigartig', emoji:'🥊', imgs:['boxhandschuh-blumenstrauss-frontal.webp','boxhandschuh-blumenstrauss-seitenansicht.webp'], fit:'contain', name_ro:'Buchet cu Mănușă de Box "Forță & Petale"', desc_ro:'O mănușă de box roșie, încadrată cu drag de bujori roșu-închis și negri, bile aurii și o fundă elegantă aurie. Un cadou ieșit din comun, care exprimă forța, disciplina și pasiunea, perfect pentru orice fan al boxului sau sportiv din viața ta.', badge_ro:'Unicat' },
    { id:53, name:'Kaffeebecher-Blumenstrauß mit Fee', desc:'Ein süßer Coffee-to-go-Becher, eingebettet in einen romantischen Blumenstrauß aus altrosa Pfingstrosen, weinroten Dahlien und zartem Grün, verziert mit einer kleinen Feenfigur und einer rosa Schleife. Das perfekte Geschenk für jeden Kaffeeliebhaber mit Sinn für schöne Dinge.', price:18.00, cat:'sonstiges', badge:'Für Kaffeeliebhaber', emoji:'☕', imgs:['kaffeebecher-blumenstrauss-fee-detail.webp','kaffeebecher-blumenstrauss-fee-seitenansicht.webp'], fit:'contain', name_ro:'Buchet cu Pahar de Cafea & Zână', desc_ro:'Un pahar dulce de cafea to-go, înconjurat de un buchet romantic din bujori roz-prăfuit, dalii bordo și verdeață delicată, decorat cu o mică figurină de zână și o fundă roz. Cadoul perfect pentru orice iubitor de cafea cu simț pentru lucrurile frumoase.', badge_ro:'Pentru Iubitorii de Cafea' },
    { id:54, name:'Tennisschläger-Blumenstrauß', desc:'Ein eleganter weißer Tennisschläger mit pinkem Griffband, dekoriert mit einem zarten Strauß aus pinken und weißen Rosen, Ranunkeln, Hortensien und Orchideen. Ein außergewöhnliches Geschenk für jede Tennisspielerin oder jeden Sportfan, der Eleganz und Leidenschaft für den Sport verbindet.', price:45.00, cat:'sonstiges', badge:'Für Sportfans', emoji:'🎾', img:'tennisschlaeger-blumenstrauss.webp', fit:'contain', name_ro:'Buchet cu Rachetă de Tenis', desc_ro:'O rachetă de tenis elegantă, albă, cu mâner roz, decorată cu un buchet delicat din trandafiri roz și albi, ranunculus, hortensii și orhidee. Un cadou ieșit din comun pentru orice jucătoare de tenis sau fan al sportului, care îmbină eleganța cu pasiunea pentru sport.', badge_ro:'Pentru Fani Sport' },
    { id:55, name:'Pop-Ballon "Stitch" mit Blumen & Schmetterlingen', desc:'Wunderschöner marmorierter Ballon in Blau-Gold mit dem beliebten Stitch-Motiv, kombiniert mit einem zarten Arrangement aus Pastell-Pompon-Blumen und filigranen Schmetterlingen. Ein verspieltes Geschenk, das Groß und Klein zum Strahlen bringt.', price:18.00, cat:'geburtstag', badge:'Für Stitch-Fans', emoji:'🦋', img:'ballon-stitch-blumen-schmetterlinge.webp', fit:'contain', name_ro:'Balon "Stitch" cu Flori & Fluturași', desc_ro:'Balon marmorat superb în albastru-auriu cu îndrăgitul personaj Stitch, combinat cu un aranjament delicat de flori pastel și fluturași filigranați. Un cadou jucăuș care îi încântă pe cei mici, dar și pe cei mari.', badge_ro:'Pentru Fanii lui Stitch' },
    { id:56, name:'Luxus-Blumenbox "Dior"-Schleife', desc:'Edle Blumenbox mit einem üppigen Arrangement aus Pfingstrosen und Ranunkeln in Rosa, Creme und Taubenblau, verziert mit Perlenranken und einer eleganten Satinschleife im "Dior"-Design. Das perfekte Luxus-Geschenk für besondere Anlässe.', price:18.00, cat:'sonstiges', badge:'Luxus-Edition', emoji:'🎀', img:'dior-blumenbox-schleife.webp', fit:'contain', name_ro:'Cutie de Flori de Lux cu Fundă "Dior"', desc_ro:'Cutie de flori elegantă cu un aranjament generos de bujori și ranunculus în roz, crem și albastru-porumbel, decorată cu șiraguri de perle și o fundă satinată elegantă în stil "Dior". Cadoul de lux perfect pentru ocazii speciale.', badge_ro:'Ediție de Lux' },
    { id:57, name:'CR7 Fan-Geschenkbox "Road to 2026"', desc:'Edle schwarze Geschenkbox für Fußballfans mit goldener Ronaldo-Silhouette: ein gerahmtes Bild zeigt Cristiano Ronaldos Weltmeisterschaften von 2006 bis 2026 als Sammelkarten, dazu eine goldene Fußballer-Pokalfigur und eine kleine goldene Ball-Trophäe, liebevoll in schwarzem Papierstroh präsentiert. Das perfekte Geschenk für jeden CR7- und Fußballfan.', price:39.00, cat:'fussball', badge:'Fan-Edition', emoji:'🏆', imgs:['fussball-geschenkbox-cr7-ronaldo-inhalt.webp','fussball-geschenkbox-cr7-ronaldo-deckel-offen.webp','fussball-geschenkbox-cr7-ronaldo-bilderrahmen.webp','fussball-geschenkbox-cr7-ronaldo-frontal.webp'], fit:'contain', name_ro:'Cutie Cadou Fan CR7 "Road to 2026"', desc_ro:'Cutie cadou elegantă, neagră, pentru fanii fotbalului, cu silueta aurie a lui Ronaldo: o ramă foto prezintă drumul lui Cristiano Ronaldo prin Campionatele Mondiale din 2006 până în 2026 sub formă de cartonașe de colecție, plus o figurină-trofeu aurie de fotbalist și o mică trofeu-minge aurie, prezentate cu drag în paie de hârtie negre. Cadoul perfect pentru orice fan CR7 și al fotbalului.', badge_ro:'Ediție Fan' },
    { id:58, name:'CR7 Fan-Geschenkbox "One Last Dance"', desc:'Edle schwarze Geschenkbox für Fußballfans mit goldener Ronaldo-Silhouette: ein gerahmtes Bild zeigt das ikonische Handshake-Motiv "One last dance – A timeless journey of legend" von Cristiano Ronaldo zwischen 2006 und 2026, dazu eine goldene Fußballer-Pokalfigur und eine kleine goldene Ball-Trophäe, liebevoll in schwarzem Papierstroh präsentiert. Das perfekte Geschenk für jeden CR7- und Fußballfan.', price:39.00, cat:'fussball', badge:'Fan-Edition', emoji:'🏆', imgs:['fussball-geschenkbox-cr7-ronaldo-inhalt-detail.webp','fussball-geschenkbox-cr7-ronaldo-rahmen-detail.webp','fussball-geschenkbox-cr7-ronaldo-schraegansicht.webp'], fit:'contain', name_ro:'Cutie Cadou Fan CR7 "One Last Dance"', desc_ro:'Cutie cadou elegantă, neagră, pentru fanii fotbalului, cu silueta aurie a lui Ronaldo: o ramă foto prezintă emblematicul motiv "One last dance – A timeless journey of legend" al lui Cristiano Ronaldo între 2006 și 2026, plus o figurină-trofeu aurie de fotbalist și o mică trofeu-minge aurie, prezentate cu drag în paie de hârtie negre. Cadoul perfect pentru orice fan CR7 și al fotbalului.', badge_ro:'Ediție Fan' },
    { id:59, name:'CR7 Fan-Geschenkbox "El Bicho"', desc:'Edle schwarze Geschenkbox für Fußballfans mit goldener Ronaldo-Silhouette: ein gerahmtes Bild im Sammelkarten-Collagen-Stil zeigt sechs Panini-Karten von Cristiano Ronaldo mit dem Schriftzug "Ronaldo – Cristiano – El Bicho – CR7", dazu eine goldene Fußballer-Pokalfigur und eine kleine goldene Ball-Trophäe, liebevoll in schwarzem Papierstroh präsentiert. Das perfekte Geschenk für jeden CR7- und Fußballfan.', price:39.00, cat:'fussball', badge:'Fan-Edition', emoji:'🏆', imgs:['fussball-geschenkbox-cr7-ronaldo-inhalt-sticker.webp','fussball-geschenkbox-cr7-ronaldo-rahmen-sticker.webp','fussball-geschenkbox-cr7-ronaldo-draufsicht.webp','fussball-geschenkbox-cr7-ronaldo-draufsicht-2.webp'], fit:'contain', name_ro:'Cutie Cadou Fan CR7 "El Bicho"', desc_ro:'Cutie cadou elegantă, neagră, pentru fanii fotbalului, cu silueta aurie a lui Ronaldo: o ramă foto în stil colaj de cartonașe de colecție prezintă șase cartonașe Panini ale lui Cristiano Ronaldo cu inscripția "Ronaldo – Cristiano – El Bicho – CR7", plus o figurină-trofeu aurie de fotbalist și o mică trofeu-minge aurie, prezentate cu drag în paie de hârtie negre. Cadoul perfect pentru orice fan CR7 și al fotbalului.', badge_ro:'Ediție Fan' },
  ];

  // Approximate product dimensions (PRODUKTDETAILS). Estimates based on typical sizes
  // for this kind of handmade balloon/flower-box product — not exact lab measurements.
  const productSpecs = {
    1:  { de:'Ballon: ø ca. 45 cm, mit Luft gefüllt (Helium nur bei Abholung/Lieferung vor Ort)<br>Box: ca. 30×30×35 cm', ro:'Balon: ø aprox. 45 cm, umplut cu aer (heliu doar la ridicare/livrare locală)<br>Cutie: aprox. 30×30×35 cm' },
    2:  { de:'Ballon: ø ca. 45 cm, mit Luft gefüllt (Helium nur bei Abholung/Lieferung vor Ort)<br>Box: ca. 30×30×35 cm', ro:'Balon: ø aprox. 45 cm, umplut cu aer (heliu doar la ridicare/livrare locală)<br>Cutie: aprox. 30×30×35 cm' },
    3:  { de:'Ballon: ø ca. 40 cm, mit Luft gefüllt (Helium nur bei Abholung/Lieferung vor Ort)<br>Gesamthöhe (auf Flasche): ca. 55 cm', ro:'Balon: ø aprox. 40 cm, umplut cu aer (heliu doar la ridicare/livrare locală)<br>Înălțime totală (pe sticlă): aprox. 55 cm' },
    4:  { de:'Ballon: ø ca. 45 cm, mit Luft gefüllt (Helium nur bei Abholung/Lieferung vor Ort)<br>Arrangement: ca. 35×35 cm', ro:'Balon: ø aprox. 45 cm, umplut cu aer (heliu doar la ridicare/livrare locală)<br>Aranjament: aprox. 35×35 cm' },
    5:  { de:'Ballon: ø ca. 35 cm, mit Luft gefüllt (Helium nur bei Abholung/Lieferung vor Ort)', ro:'Balon: ø aprox. 35 cm, umplut cu aer (heliu doar la ridicare/livrare locală)' },
    6:  { de:'Ballon: ø ca. 40 cm, mit Luft gefüllt (Helium nur bei Abholung/Lieferung vor Ort)', ro:'Balon: ø aprox. 40 cm, umplut cu aer (heliu doar la ridicare/livrare locală)' },
    7:  { de:'Ballon: ø ca. 45 cm, mit Luft gefüllt (Helium nur bei Abholung/Lieferung vor Ort)<br>Box: ca. 30×30×35 cm', ro:'Balon: ø aprox. 45 cm, umplut cu aer (heliu doar la ridicare/livrare locală)<br>Cutie: aprox. 30×30×35 cm' },
    8:  { de:'Ballon: ø ca. 45 cm, mit Luft gefüllt (Helium nur bei Abholung/Lieferung vor Ort)<br>Blumenbox: ca. 35×35×40 cm', ro:'Balon: ø aprox. 45 cm, umplut cu aer (heliu doar la ridicare/livrare locală)<br>Cutie florală: aprox. 35×35×40 cm' },
    9:  { de:'Korb: ca. 25×20×20 cm<br>Teddybär: ca. 20 cm', ro:'Coș: aprox. 25×20×20 cm<br>Ursuleț: aprox. 20 cm' },
    10: { de:'Box: ca. 20×20×18 cm', ro:'Cutie: aprox. 20×20×18 cm' },
    11: { de:'Box: ca. 20×20×18 cm', ro:'Cutie: aprox. 20×20×18 cm' },
    12: { de:'Folienballon: ø ca. 45 cm<br>Ballons: ø ca. 25 cm, mit Luft gefüllt<br>Plüsch: ca. 25 cm', ro:'Balon folie: ø aprox. 45 cm<br>Baloane: ø aprox. 25 cm, umplute cu aer<br>Pluș: aprox. 25 cm' },
    13: { de:'Straußhöhe: ca. 35 cm', ro:'Înălțime buchet: aprox. 35 cm' },
    14: { de:'Box: ca. 22×22×20 cm', ro:'Cutie: aprox. 22×22×20 cm' },
    15: { de:'Box: ca. 20×20×10 cm', ro:'Cutie: aprox. 20×20×10 cm' },
    16: { de:'Ballon: ø ca. 45 cm, mit Luft gefüllt (Helium nur bei Abholung/Lieferung vor Ort)<br>Box: ca. 25×25×30 cm', ro:'Balon: ø aprox. 45 cm, umplut cu aer (heliu doar la ridicare/livrare locală)<br>Cutie: aprox. 25×25×30 cm' },
    17: { de:'Folienballon: ø ca. 45 cm<br>Herzballon: ø ca. 40 cm<br>Ballons: ø ca. 25 cm, mit Luft gefüllt<br>Gesamthöhe an Bändern: ca. 70 cm', ro:'Balon folie: ø aprox. 45 cm<br>Balon inimă: ø aprox. 40 cm<br>Baloane: ø aprox. 25 cm, umplute cu aer<br>Înălțime totală pe panglici: aprox. 70 cm' },
    18: { de:'Ballon: ø ca. 40 cm, mit Luft gefüllt (Helium nur bei Abholung/Lieferung vor Ort)<br>Box: ca. 25×25×30 cm', ro:'Balon: ø aprox. 40 cm, umplut cu aer (heliu doar la ridicare/livrare locală)<br>Cutie: aprox. 25×25×30 cm' },
    19: { de:'Transparenter Stuffed-Ballon: ø ca. 50 cm<br>Gesamthöhe: ca. 60 cm<br>Mit Luft gefüllt (kein Helium)', ro:'Balon transparent tip stuffed: ø aprox. 50 cm<br>Înălțime totală: aprox. 60 cm<br>Umplut cu aer (fără heliu)' },
    20: { de:'Box: ca. 25×25×25 cm', ro:'Cutie: aprox. 25×25×25 cm' },
    21: { de:'Straußhöhe: ca. 35 cm', ro:'Înălțime buchet: aprox. 35 cm' },
    22: { de:'Ballon: ø ca. 45 cm, mit Luft gefüllt (Helium nur bei Abholung/Lieferung vor Ort)<br>Blumenbox: ca. 30×30×35 cm', ro:'Balon: ø aprox. 45 cm, umplut cu aer (heliu doar la ridicare/livrare locală)<br>Cutie florală: aprox. 30×30×35 cm' },
    23: { de:'Korb: ca. 25×20×20 cm', ro:'Coș: aprox. 25×20×20 cm' },
    24: { de:'Box: ca. 20×20×25 cm', ro:'Cutie: aprox. 20×20×25 cm' },
    25: { de:'Transparenter Stuffed-Ballon: ø ca. 45 cm<br>Gesamthöhe: ca. 55 cm<br>Mit Luft gefüllt (kein Helium)', ro:'Balon transparent tip stuffed: ø aprox. 45 cm<br>Înălțime totală: aprox. 55 cm<br>Umplut cu aer (fără heliu)' },
    26: { de:'Box: ca. 18×16×8 cm', ro:'Cutie: aprox. 18×16×8 cm' },
    27: { de:'Straußhöhe: ca. 30 cm', ro:'Înălțime buchet: aprox. 30 cm' },
    28: { de:'Straußhöhe: ca. 35 cm', ro:'Înălțime buchet: aprox. 35 cm' },
    29: { de:'Ballon: ø ca. 40 cm, mit Luft gefüllt (Helium nur bei Abholung/Lieferung vor Ort)', ro:'Balon: ø aprox. 40 cm, umplut cu aer (heliu doar la ridicare/livrare locală)' },
    30: { de:'Straußhöhe: ca. 35 cm', ro:'Înălțime buchet: aprox. 35 cm' },
    31: { de:'Straußhöhe: ca. 35 cm', ro:'Înălțime buchet: aprox. 35 cm' },
    32: { de:'Arrangement: ca. 30×20×15 cm', ro:'Aranjament: aprox. 30×20×15 cm' },
    33: { de:'Skulptur: ca. 25×20×30 cm', ro:'Sculptură: aprox. 25×20×30 cm' },
    34: { de:'Box: ca. 20×20×18 cm', ro:'Cutie: aprox. 20×20×18 cm' },
    35: { de:'Bilderrahmen: ca. 30×20×4 cm', ro:'Ramă: aprox. 30×20×4 cm' },
    36: { de:'Box: ca. 20×20×18 cm', ro:'Cutie: aprox. 20×20×18 cm' },
    37: { de:'Box: ca. 20×20×18 cm', ro:'Cutie: aprox. 20×20×18 cm' },
    38: { de:'Box: ca. 20×20×18 cm', ro:'Cutie: aprox. 20×20×18 cm' },
    39: { de:'Box: ca. 20×20×18 cm', ro:'Cutie: aprox. 20×20×18 cm' },
    40: { de:'Box: ca. 20×20×18 cm', ro:'Cutie: aprox. 20×20×18 cm' },
    41: { de:'Bilderrahmen: ca. 30×20×4 cm', ro:'Ramă: aprox. 30×20×4 cm' },
    42: { de:'Box: ca. 20×20×18 cm', ro:'Cutie: aprox. 20×20×18 cm' },
    43: { de:'Box: ca. 20×20×18 cm', ro:'Cutie: aprox. 20×20×18 cm' },
    44: { de:'Box: ca. 25×20×15 cm', ro:'Cutie: aprox. 25×20×15 cm' },
    45: { de:'Tüte: ca. 15×10 cm<br>Tennisball: ø ca. 6,5 cm', ro:'Pungă: aprox. 15×10 cm<br>Minge de tenis: ø aprox. 6,5 cm' },
    46: { de:'Brautstrauß: ca. 25×20 cm', ro:'Buchet de mireasă: aprox. 25×20 cm' },
    47: { de:'Blumenball: ø ca. 25 cm', ro:'Buchet rotund: ø aprox. 25 cm' },
    48: { de:'Haarschmuck: ca. 15×8 cm', ro:'Accesoriu de păr: aprox. 15×8 cm' },
    49: { de:'Ballon: ø ca. 45 cm, mit Luft gefüllt', ro:'Balon: ø aprox. 45 cm, umplut cu aer' },
    50: { de:'Tablett: ca. 25×18×5 cm', ro:'Tavă: aprox. 25×18×5 cm' },
    51: { de:'Mini-Oldtimer mit Deko: ca. 20×10×12 cm', ro:'Mașinuță decorativă: aprox. 20×10×12 cm' },
    52: { de:'Arrangement: ca. 25×20×15 cm', ro:'Aranjament: aprox. 25×20×15 cm' },
    53: { de:'Arrangement mit Becher: ca. 20×15×25 cm', ro:'Aranjament cu pahar: aprox. 20×15×25 cm' },
    54: { de:'Tennisschläger mit Blumen: ca. 68×27 cm', ro:'Rachetă de tenis cu flori: aprox. 68×27 cm' },
    55: { de:'Ballon: ø ca. 30 cm, mit Luft gefüllt', ro:'Balon: ø aprox. 30 cm, umplut cu aer' },
    56: { de:'Box: ca. 22×22×16 cm', ro:'Cutie: aprox. 22×22×16 cm' },
    57: { de:'Box: ca. 35×25×10 cm<br>Bilderrahmen: ca. 30×20 cm', ro:'Cutie: aprox. 35×25×10 cm<br>Ramă foto: aprox. 30×20 cm' },
    58: { de:'Box: ca. 35×25×10 cm<br>Bilderrahmen: ca. 30×20 cm', ro:'Cutie: aprox. 35×25×10 cm<br>Ramă foto: aprox. 30×20 cm' },
    59: { de:'Box: ca. 35×25×10 cm<br>Bilderrahmen: ca. 30×20 cm', ro:'Cutie: aprox. 35×25×10 cm<br>Ramă foto: aprox. 30×20 cm' },
  };

  // SEO: Product schema markup (JSON-LD) for search engines
  (function injectProductSchema() {
    const baseUrl = 'https://www.dandelion1111.de/';
    const itemListElement = kollProducts.map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Product",
        "name": p.name,
        "description": p.desc,
        "image": baseUrl + encodeURIComponent(p.img || (p.imgs && p.imgs[0]) || 'Dandelionlogo-fixed.png'),
        "url": baseUrl + "#produkt-" + p.id,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "EUR",
          "price": p.price.toFixed(2),
          "availability": "https://schema.org/InStock"
        }
      }
    }));
    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": itemListElement
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  })();

  function getFavorites() {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch(e) { return []; }
  }
  function updateFavBadge() {
    const favs = getFavorites();
    const badge = document.getElementById('navFavBadge');
    if (!badge) return;
    if (favs.length > 0) {
      badge.textContent = favs.length;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
  window.toggleFavorite = function(id) {
    let favs = getFavorites();
    if (favs.includes(id)) favs = favs.filter(f => f !== id);
    else favs.push(id);
    localStorage.setItem('favorites', JSON.stringify(favs));
    updateFavBadge();
    if (currentKollFilter === 'favorites') renderKoll('favorites');
    else {
      const heart = document.getElementById('fav-' + id);
      if (heart) heart.classList.toggle('active', favs.includes(id));
    }
  };
  window.showFavorites = function() {
    showPage('kollektionen');
    document.querySelectorAll('.koll-filter').forEach(b => b.classList.remove('active'));
    renderKoll('favorites');
  };
  window.toggleSearchBar = function() {
    const bar = document.getElementById('navSearchBar');
    const show = bar.style.display !== 'block';
    bar.style.display = show ? 'block' : 'none';
    if (show) {
      document.getElementById('navSearchInput').value = '';
      document.getElementById('navSearchInput').focus();
    } else {
      runProductSearch('');
    }
  };
  window.runProductSearch = function(query) {
    showPage('kollektionen');
    document.querySelectorAll('.koll-filter').forEach(b => b.classList.remove('active'));
    const q = query.trim().toLowerCase();
    if (!q) { renderKoll('all'); return; }
    currentKollFilter = 'search';
    const list = kollProducts.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || (p.name_ro||'').toLowerCase().includes(q) || (p.desc_ro||'').toLowerCase().includes(q));
    renderKollList(sortKollList(list));
  };
  let currentKollFilter = 'all';
  function sortKollList(list) {
    return [...list].sort((a, b) => {
      const aBest = a.badge === 'Bestseller' ? 0 : 1;
      const bBest = b.badge === 'Bestseller' ? 0 : 1;
      if (aBest !== bBest) return aBest - bBest;
      return a.price - b.price;
    });
  }
  function renderKoll(filter) {
    currentKollFilter = filter;
    const favs = getFavorites();
    let list;
    if (filter === 'all') list = kollProducts;
    else if (filter === 'favorites') list = kollProducts.filter(p => favs.includes(p.id));
    else list = kollProducts.filter(p => p.cat === filter);
    renderKollList(sortKollList(list));
  }
  function renderKollList(list) {
    const favs = getFavorites();
    if (list.length === 0) {
      document.getElementById('koll-grid').innerHTML = `<p style="text-align:center;color:var(--text-light);grid-column:1/-1;padding:40px 0;">${localStorage.getItem('lang')==='ro' ? 'Niciun produs găsit.' : 'Keine Produkte gefunden.'}</p>`;
      return;
    }
    document.getElementById('koll-grid').innerHTML = list.map(p => `
      <div class="koll-card">
        <div class="koll-img" onclick="openProdModal(${p.id})" style="cursor:pointer;">
          ${(p.img || (p.imgs && p.imgs[0])) ? `<img src="${p.img || p.imgs[0]}" alt="${lp(p,'name')}" loading="lazy" decoding="async" sizes="(max-width:768px) calc(50vw - 16px), (max-width:1200px) calc(33vw - 20px), 300px" style="width:100%;height:100%;object-fit:${p.fit || 'cover'};object-position:center top;display:block;pointer-events:none;${p.fit==='contain' ? 'background:#fff;' : ''}">` : `<span style="font-size:4rem;pointer-events:none;">${p.emoji}</span>`}
          ${p.badge ? `<span class="koll-badge" style="pointer-events:none;">${lp(p,'badge')}</span>` : ''}
          <div id="fav-${p.id}" class="fav-heart ${favs.includes(p.id) ? 'active' : ''}" onclick="event.stopPropagation();toggleFavorite(${p.id})" style="position:absolute;bottom:8px;right:8px;background:rgba(142,68,173,0.75);color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;z-index:3;"><i class="${favs.includes(p.id) ? 'fas' : 'far'} fa-heart"></i></div>
        </div>
        <div class="koll-body">
          <div class="koll-name" onclick="openProdModal(${p.id})" style="cursor:pointer;">${lp(p,'name')}</div>
          <div class="koll-desc">${truncateWords(lp(p,'desc'), 90)}</div>
          <div class="koll-footer">
            <div class="koll-price">${p.price.toFixed(2).replace('.',',')} €${p.oldPrice ? `<span class="old">${p.oldPrice.toFixed(2).replace('.',',')} €</span>` : ''}</div>
            <button class="btn-koll-config" onclick="event.stopPropagation();addKollProduct(${p.id})">
              <i class="fas fa-shopping-bag"></i> <span data-i18n="add_to_cart">In den Warenkorb</span>
            </button>
          </div>
        </div>
      </div>`
    ).join('');
    setLang(localStorage.getItem('lang') || 'de');
  }

  window.openLightbox = function(src) {
    if (!src) return;
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox').classList.add('open');
  };
  window.closeLightbox = function() {
    document.getElementById('lightbox').classList.remove('open');
  };
  window.filterKoll = function(cat, btn) {
    document.querySelectorAll('.koll-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderKoll(cat);
  };
