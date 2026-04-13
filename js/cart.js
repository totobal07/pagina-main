/* Cart with modal, quantity controls, size selector, toasts, and search */
(function(){
  const CART_KEY = 'diddy_cart_v2'; 
  let cart = { items: [] };

  function formatPrice(n){ return '$' + new Intl.NumberFormat('es-CL').format(n); }
  function parsePrice(text){ if(!text) return 0; const digits = String(text).replace(/[^\d]/g,''); return Number(digits || 0); }
  function save(){ try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }catch(e){} }
  function load(){ try{ const s = localStorage.getItem(CART_KEY); if(s) cart = JSON.parse(s); }catch(e){} }

  function recalc(){
    let count = 0, total = 0;
    if(cart.items && cart.items.length){
      cart.items.forEach(it => { const q = Number(it.qty)||0; count += q; total += (Number(it.price)||0)*q; });
    }
    cart.count = count; cart.total = total;
  }

  function updateUI(){ recalc();
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');
    const modalTotal = document.getElementById('cart-modal-total');
    const modalCount = document.getElementById('cart-modal-count');
    if(countEl) countEl.textContent = cart.count || 0;
    if(totalEl) totalEl.textContent = formatPrice(cart.total || 0);
    if(modalTotal) modalTotal.textContent = formatPrice(cart.total || 0);
    if(modalCount) modalCount.textContent = String(cart.count || 0);
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; }); }

  // Search by Title + Price + Size
  function findItemIndex(title, price, size){ 
      return cart.items.findIndex(it => it.title === title && Number(it.price) === Number(price) && it.size === size); 
  }

  // Toast notifications
  function showToast(message) {
      const container = document.getElementById('toast-container');
      if(!container) return;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      container.appendChild(toast);
      
      setTimeout(() => { toast.classList.add('fade-out'); }, 2500);
      setTimeout(() => { toast.remove(); }, 2800);
  }

  function addToCart(card, qty){
    qty = Number(qty) || 1;
    const title = card.querySelector('.product-info h3')?.textContent?.trim() || '';
    const priceText = card.querySelector('.price')?.textContent || '';
    const price = parsePrice(priceText);
    const img = card.querySelector('.product-image')?.src || '';
    
    // Get selected size
    const sizeSelect = card.querySelector('.size-select');
    const size = sizeSelect ? sizeSelect.value : 'Única';

    const idx = findItemIndex(title, price, size);
    if(idx !== -1){ cart.items[idx].qty = (Number(cart.items[idx].qty)||0) + qty; }
    else { cart.items.push({ title, price, qty, img, size }); }
    
    save(); updateUI(); renderCartModal();
    
    // Show notification
    showToast(`✓ Agregado: ${title} (Talla ${size})`);

    // Button feedback
    const btn = card.querySelector('.product-info button');
    if(btn){ const orig = btn.textContent; btn.textContent = 'Añadido ✓'; btn.disabled = true; setTimeout(()=>{ btn.textContent = orig; btn.disabled = false; }, 900); }
    card.classList.add('just-added'); setTimeout(()=>card.classList.remove('just-added'), 700);
  }

  function renderCartModal(){
    const container = document.getElementById('cart-items'); if(!container) return; container.innerHTML = '';
    if(!cart.items || cart.items.length === 0){ container.innerHTML = '<p class="empty">Tu carrito está vacío.</p>'; updateUI(); return; }
    cart.items.forEach((it,i)=>{
      const row = document.createElement('div'); row.className = 'cart-item';
      const subtotal = (Number(it.price)||0) * (Number(it.qty)||0);
      row.innerHTML = `
        <div class="cart-item-left">
          <img src="${escapeHtml(it.img||'')}" alt="" class="cart-thumb" />
          <div class="cart-item-info">
            <div class="cart-item-title">${escapeHtml(it.title)}</div>
            <div style="font-size: 0.85rem; color: #ccc;">Talla: ${escapeHtml(it.size)}</div>
            <div class="cart-item-price">${formatPrice(it.price)}</div>
          </div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-minus" data-index="${i}" aria-label="Disminuir">−</button>
          <input type="number" class="cart-qty-input" data-index="${i}" value="${Number(it.qty)||0}" min="1" aria-label="Cantidad">
          <button class="qty-plus" data-index="${i}" aria-label="Aumentar">+</button>
          <div class="cart-item-subtotal">${formatPrice(subtotal)}</div>
          <button class="remove-item" data-index="${i}" aria-label="Eliminar">✕</button>
        </div>`;
      container.appendChild(row);
    });
    updateUI();
  }

  function changeQty(index, newQty){ index = Number(index); newQty = Number(newQty) || 0; if(isNaN(index) || index<0 || index>=cart.items.length) return; if(newQty<=0){ cart.items.splice(index,1); } else { cart.items[index].qty = newQty; } save(); renderCartModal(); updateUI(); }
  function removeItem(index){ changeQty(index, 0); }
  function clearCart(){ cart = { items: [] }; save(); renderCartModal(); updateUI(); }
  function openCart(){ const m = document.getElementById('cart-modal'); if(!m) return; m.setAttribute('aria-hidden','false'); m.classList.add('open'); renderCartModal(); }
  function closeCart(){ const m = document.getElementById('cart-modal'); if(!m) return; m.setAttribute('aria-hidden','true'); m.classList.remove('open'); }
  function toggleCart(){ const m = document.getElementById('cart-modal'); if(!m) return; if(m.classList.contains('open')) closeCart(); else openCart(); }

  // Search filter logic
  document.addEventListener('input', (e) => {
      if(e.target.id === 'search-input') {
          const term = e.target.value.toLowerCase();
          document.querySelectorAll('.product-card').forEach(card => {
              const text = card.textContent.toLowerCase();
              card.style.display = text.includes(term) ? 'flex' : 'none';
          });
      }
  });

  document.addEventListener('click', (e)=>{
    const t = e.target;
    if(t.matches('.product-info button')){
      const card = t.closest('.product-card'); if(card){ const qEl = card.querySelector('.qty-input'); const q = qEl ? Math.max(1, Number(qEl.value)||1) : 1; addToCart(card, q); } return;
    }
    if(t.closest('#cart')){ toggleCart(); return; }
    if(t.matches('.cart-close')){ closeCart(); return; }
    if(t.matches('#cart-clear')){ clearCart(); return; }
    if(t.matches('.remove-item')){ removeItem(t.dataset.index); return; }
    if(t.matches('.qty-plus')){ const idx = t.dataset.index; const input = document.querySelector(`.cart-qty-input[data-index="${idx}"]`); const cur = Number(input?.value||0); changeQty(idx, cur+1); return; }
    if(t.matches('.qty-minus')){ const idx = t.dataset.index; const input = document.querySelector(`.cart-qty-input[data-index="${idx}"]`); const cur = Number(input?.value||0); changeQty(idx, Math.max(0, cur-1)); return; }
    if(t.id === 'cart-modal') { closeCart(); return; }
  });

  document.addEventListener('change', (e)=>{ const t = e.target; if(t.matches('.cart-qty-input')){ changeQty(t.dataset.index, Number(t.value)||0); } });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape'){ const m = document.getElementById('cart-modal'); if(m && m.classList.contains('open')) closeCart(); } });
  document.addEventListener('DOMContentLoaded', ()=>{ load(); updateUI(); renderCartModal(); });

  // Lógica del Lookbook Automático
  function initLookbook() {
      const slides = document.querySelectorAll('.slide');
      let currentSlide = 0;
      
      if(slides.length > 0) {
          setInterval(() => {
              // Quita la clase 'active' de la imagen actual
              slides[currentSlide].classList.remove('active');
              // Calcula cuál es la siguiente imagen (vuelve a 0 si llega al final)
              currentSlide = (currentSlide + 1) % slides.length;
              // Le pone la clase 'active' a la nueva imagen
              slides[currentSlide].classList.add('active');
          }, 4000); // 4000 milisegundos = cambia cada 4 segundos
      }
  }

  // Iniciamos el lookbook cuando cargue la página
  document.addEventListener('DOMContentLoaded', () => { 
      load(); 
      updateUI(); 
      renderCartModal(); 
      initLookbook(); // Agregamos la llamada aquí
  });
})();