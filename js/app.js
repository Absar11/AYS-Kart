/* AysKart V1 — static storefront with WhatsApp checkout.
   IMPORTANT: Set STORE_WHATSAPP below to the seller's number with country code,
   digits only. Example for India: 919876543210 (do not include + or spaces).
*/
const STORE_WHATSAPP = "918074568216";
const PRODUCTS = window.AYSKART_PRODUCTS || [];
const CART_KEY = "ayskart_cart_v1";
let cart = loadCart();
let activeCategory = "All";
let searchTerm = "";
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const money = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);
const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
const productById = id => PRODUCTS.find(product => product.id === id);

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === "string" && Number.isInteger(item.qty) && item.qty > 0) : [];
  } catch { return []; }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}
function cartQty() { return cart.reduce((sum, item) => sum + item.qty, 0); }
function cartTotal() {
  return cart.reduce((sum, item) => {
    const product = productById(item.id);
    return sum + (product ? (Number(product.discountPrice ?? product.price) * item.qty) : 0);
  }, 0);
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}
function addToCart(id) {
  const product = productById(id);
  if (!product) return;
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  showToast(`${product.name} added to cart`);
}
function changeQty(id, amount) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.qty += amount;
  if (item.qty <= 0) cart = cart.filter(entry => entry.id !== id);
  saveCart();
}
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}
function renderCategories() {
  const categories = ["All", ...new Set(PRODUCTS.map(product => product.category).filter(Boolean))];
  $("#categoryList").innerHTML = categories.map(category =>
    `<button class="category-chip ${activeCategory === category ? "active" : ""}" data-category="${escapeHTML(category)}">${escapeHTML(category === "All" ? "All products" : category)}</button>`
  ).join("");
}
function getVisibleProducts() {
  let visible = PRODUCTS.filter(product => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return matchesCategory && haystack.includes(searchTerm.toLowerCase());
  });
  const sort = $("#sortSelect")?.value || "featured";
  if (sort === "price-low") visible.sort((a,b) => Number(a.discountPrice ?? a.price) - Number(b.discountPrice ?? b.price));
  else if (sort === "price-high") visible.sort((a,b) => Number(b.discountPrice ?? b.price) - Number(a.discountPrice ?? a.price));
  else if (sort === "name") visible.sort((a,b) => a.name.localeCompare(b.name));
  else visible.sort((a,b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  return visible;
}
function renderProducts() {
  const visible = getVisibleProducts();
  $("#resultsCount").textContent = `${visible.length} product${visible.length === 1 ? "" : "s"}`;
  $("#emptyState").classList.toggle("hidden", visible.length > 0);
  $("#productGrid").innerHTML = visible.map(product => {
    const price = Number(product.discountPrice ?? product.price);
    const oldPrice = Number(product.price);
    return `<article class="product-card">
      <div class="product-image" data-view="${escapeHTML(product.id)}">
        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.src='https://placehold.co/600x600/F2F4F6/092B4C?text=AysKart'">
        ${product.badge ? `<span class="product-badge">${escapeHTML(product.badge)}</span>` : ""}
      </div>
      <div class="product-info">
        <div class="product-category">${escapeHTML(product.category || "General")}</div>
        <h3 class="product-name">${escapeHTML(product.name)}</h3>
        <div class="product-bottom"><div><span class="price">${money(price)}</span>${oldPrice > price ? `<span class="old-price">${money(oldPrice)}</span>` : ""}</div>
        <button class="add-button" data-add="${escapeHTML(product.id)}" aria-label="Add ${escapeHTML(product.name)} to cart">+</button></div>
      </div>
    </article>`;
  }).join("");
}
function renderCart() {
  $("#cartCount").textContent = cartQty();
  $("#drawerCount").textContent = `(${cartQty()})`;
  $("#cartSubtotal").textContent = money(cartTotal());
  $("#checkoutSubtotal").textContent = money(cartTotal());
  const validItems = cart.filter(item => productById(item.id));
  if (validItems.length !== cart.length) {
    cart = validItems;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  $("#cartItems").innerHTML = cart.length ? cart.map(item => {
    const product = productById(item.id);
    if (!product) return "";
    const price = Number(product.discountPrice ?? product.price);
    return `<div class="cart-line">
      <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" onerror="this.src='https://placehold.co/120x120/F2F4F6/092B4C?text=Product'">
      <div><h4>${escapeHTML(product.name)}</h4><div class="line-price">${money(price)}</div>
        <div class="quantity-control"><button data-qty="${escapeHTML(product.id)}" data-change="-1" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button data-qty="${escapeHTML(product.id)}" data-change="1" aria-label="Increase quantity">+</button></div>
      </div>
      <button class="remove-item" data-remove="${escapeHTML(product.id)}" aria-label="Remove ${escapeHTML(product.name)}">×</button>
    </div>`;
  }).join("") : `<div class="cart-empty"><strong>Your cart is waiting.</strong>Add a few things you love.</div>`;
}
function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#drawerBackdrop").classList.add("show");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#drawerBackdrop").classList.remove("show");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function openProduct(id) {
  const product = productById(id);
  if (!product) return;
  const price = Number(product.discountPrice ?? product.price);
  $("#productModalContent").innerHTML = `<div class="product-detail">
    <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" onerror="this.src='https://placehold.co/600x600/F2F4F6/092B4C?text=AysKart'">
    <div><div class="product-category">${escapeHTML(product.category || "General")}</div><h2>${escapeHTML(product.name)}</h2>
      <p>${escapeHTML(product.description || "A thoughtful find from AysKart.")}</p>
      <div class="detail-price">${money(price)} ${Number(product.price) > price ? `<del>${money(product.price)}</del>` : ""}</div>
      <button class="btn btn-primary" data-add="${escapeHTML(product.id)}">Add to cart <span>＋</span></button>
    </div>
  </div>`;
  $("#productModalBackdrop").classList.add("show");
}
function closeProduct() { $("#productModalBackdrop").classList.remove("show"); }
function openCheckout() {
  if (!cart.length) { showToast("Your cart is empty"); return; }
  closeCart();
  $("#checkoutSubtotal").textContent = money(cartTotal());
  $("#checkoutBackdrop").classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeCheckout() {
  $("#checkoutBackdrop").classList.remove("show");
  document.body.style.overflow = "";
}
function buildWhatsAppMessage(details) {
  const lines = [
    "*New Order — AysKart*",
    "",
    "*Customer details*",
    `Name: ${details.name}`,
    `Mobile: ${details.mobile}`,
    `Address: ${details.address}`,
    `City: ${details.city}`,
    `State: ${details.state}`,
    `Pincode: ${details.pincode}`,
    "",
    "*Order items*"
  ];
  cart.forEach(item => {
    const product = productById(item.id);
    if (!product) return;
    const price = Number(product.discountPrice ?? product.price);
    lines.push(`• ${product.name} x ${item.qty} — ${money(price * item.qty)}`);
  });
  lines.push("", `*Subtotal: ${money(cartTotal())}*`);
  if (details.notes) lines.push("", `Order notes: ${details.notes}`);
  lines.push("", "Please confirm product availability, delivery charges and payment details.");
  return lines.join("\n");
}
function submitCheckout(event) {
  event.preventDefault();
  if (!cart.length) { showToast("Your cart is empty"); closeCheckout(); return; }
  if (!/^91\d{10}$/.test(STORE_WHATSAPP)) {
    showToast("Store WhatsApp number is not configured yet");
    return;
  }
  const formData = new FormData(event.currentTarget);
  const details = Object.fromEntries(formData.entries());
  const url = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(buildWhatsAppMessage(details))}`;
  window.open(url, "_blank", "noopener,noreferrer");
  // Do not clear cart here: the user still needs to press Send in WhatsApp.
}

document.addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  const view = event.target.closest("[data-view]");
  const category = event.target.closest("[data-category]");
  const qty = event.target.closest("[data-qty]");
  const remove = event.target.closest("[data-remove]");
  if (add) { addToCart(add.dataset.add); closeProduct(); }
  if (view) openProduct(view.dataset.view);
  if (category) { activeCategory = category.dataset.category; renderCategories(); renderProducts(); }
  if (qty) changeQty(qty.dataset.qty, Number(qty.dataset.change));
  if (remove) removeFromCart(remove.dataset.remove);
});

$("#searchForm").addEventListener("submit", event => {
  event.preventDefault();
  searchTerm = $("#searchInput").value.trim();
  renderProducts();
  $("#shop").scrollIntoView({ behavior: "smooth" });
});
$("#searchInput").addEventListener("input", event => { searchTerm = event.target.value.trim(); renderProducts(); });
$("#sortSelect").addEventListener("change", renderProducts);
$("#clearFilters").addEventListener("click", () => {
  activeCategory = "All"; searchTerm = ""; $("#searchInput").value = "";
  renderCategories(); renderProducts();
});
$("#openCart").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#drawerBackdrop").addEventListener("click", closeCart);
$("#goCheckout").addEventListener("click", openCheckout);
$("#closeProductModal").addEventListener("click", closeProduct);
$("#productModalBackdrop").addEventListener("click", event => { if (event.target === $("#productModalBackdrop")) closeProduct(); });
$("#closeCheckout").addEventListener("click", closeCheckout);
$("#checkoutBackdrop").addEventListener("click", event => { if (event.target === $("#checkoutBackdrop")) closeCheckout(); });
$("#checkoutForm").addEventListener("submit", submitCheckout);
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { closeCart(); closeProduct(); closeCheckout(); }
});
$("#year").textContent = new Date().getFullYear();

renderCategories();
renderProducts();
renderCart();
