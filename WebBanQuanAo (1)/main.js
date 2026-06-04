/* =====================================================
   LIFEWEAR PROJECT - main.js
   Chuc nang chung:
   - Sidebar menu
   - Chuyen trang / sua link header
   - Dang ky / dang nhap / dang xuat bang localStorage
   - Hien / an mat khau
   - Luu san pham dang xem de dung cho order.html
   - Them vao gio hang / wishlist
   - Hien thi cart, wishlist, checkout neu trang co vung hien thi
   - Search co ban
===================================================== */

(function () {
  "use strict";

  const DEFAULT_USER = {
    email: "admin@gmail.com",
    password: "Q12345678",
    birthday: "01/01/2000",
    gender: "Other"
  };

  const SAMPLE_PRODUCTS = [
    {
      id: "premium-linen-shirt",
      name: "Premium Linen Shirt",
      price: 49.9,
      color: "57 OLIVE",
      size: "Men M",
      image: "images/img39.avif"
    },
    {
      id: "airism-cotton-polo",
      name: "AIRism Cotton Pique Polo Shirt",
      price: 29.9,
      color: "57 OLIVE",
      size: "Men M",
      image: "images/img68.avif"
    },
    {
      id: "mini-tshirt",
      name: "Mini T-Shirt",
      price: 24.9,
      color: "White",
      size: "Women M",
      image: "images/img104.avif"
    }
  ];

  function getStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function initDefaultData() {
    const users = getStorage("users", []);

    if (!Array.isArray(users) || users.length === 0) {
      setStorage("users", [DEFAULT_USER]);
    }
  }

  function toNumber(text) {
    const number = Number(String(text || "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(number) ? number : 0;
  }

  function makeProductId(name, image) {
    return String(`${name || "product"}-${image || ""}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `product-${Date.now()}`;
  }

  function getProductFromCard(card) {
    const name =
      card.querySelector("h2, h3, .product-name")?.textContent?.trim() ||
      "Product name";

    const priceText =
      card.querySelector(".sale-price, .product-price, .item-price, .cart-price")
        ?.textContent || "0";

    const image = card.querySelector("img")?.getAttribute("src") || "";
    const meta = card.querySelector(".product-meta")?.textContent?.trim() || "";

    return {
      id: makeProductId(name, image),
      name,
      price: toNumber(priceText),
      color: "Default",
      size: meta || "Default",
      image
    };
  }

  function getProductFromButton(button) {
    if (button.dataset && (button.dataset.name || button.dataset.id)) {
      return {
        id: button.dataset.id || makeProductId(button.dataset.name, button.dataset.image),
        name: button.dataset.name || "Product name",
        price: Number(button.dataset.price || 0),
        color: button.dataset.color || "Default",
        size: button.dataset.size || "Default",
        image: button.dataset.image || ""
      };
    }

    const card = button.closest(".product-card, .wish-item, .cart-item, .product-info, .order-page");
    return card ? getProductFromCard(card) : SAMPLE_PRODUCTS[0];
  }

  function setupHeaderLinks() {
    document.querySelectorAll("a[href='wishlist.css']").forEach((link) => {
      link.setAttribute("href", "wishlist.html");
    });

    document.querySelectorAll(".search-box").forEach((form) => {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        const input = form.querySelector("input");
        const keyword = input ? input.value.trim() : "";

        if (keyword) {
          localStorage.setItem("searchKeyword", keyword);
        }

        window.location.href = "search.html";
      });
    });
  }

  function createSidebar() {
    if (document.querySelector("#sidebar")) return;

    const sidebar = document.createElement("aside");
    sidebar.id = "sidebar";
    sidebar.className = "sidebar";

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <h2>Menu</h2>
        <button type="button" class="sidebar-close" id="close-sidebar" aria-label="Close menu">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <a href="men.html">Men</a>
        <a href="women.html">Women</a>
        <a href="kids.html">Kids</a>
        <a href="baby.html">Baby</a>
        <a href="search.html">Search</a>
        <a href="wishlist.html">Wishlist</a>
        <a href="cart.html">Shopping Cart</a>
        <a href="login.html">Login</a>
        <a href="register.html">Create Account</a>
      </nav>

      <div class="sidebar-user">
        <p id="sidebar-user-email">Not logged in</p>
        <button type="button" id="sidebar-logout">Logout</button>
      </div>
    `;

    const overlay = document.createElement("div");
    overlay.id = "sidebar-overlay";
    overlay.className = "sidebar-overlay";

    document.body.appendChild(sidebar);
    document.body.appendChild(overlay);

    document.querySelector("#close-sidebar")?.addEventListener("click", closeSidebar);
    document.querySelector("#sidebar-overlay")?.addEventListener("click", closeSidebar);
    document.querySelector("#sidebar-logout")?.addEventListener("click", logoutAccount);

    updateSidebarUser();
  }

  function openSidebar() {
    document.querySelector("#sidebar")?.classList.add("active");
    document.querySelector("#sidebar-overlay")?.classList.add("active");
  }

  function closeSidebar() {
    document.querySelector("#sidebar")?.classList.remove("active");
    document.querySelector("#sidebar-overlay")?.classList.remove("active");
  }

  function setupSidebarButtons() {
    document.querySelectorAll(".menu-btn, .fa-bars").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        openSidebar();
      });
    });
  }

  function updateSidebarUser() {
    const currentUser = getStorage("currentUser", null);
    const userEmail = document.querySelector("#sidebar-user-email");

    if (userEmail) {
      userEmail.textContent = currentUser ? currentUser.email : "Not logged in";
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(password) {
    return (
      password.length >= 8 &&
      password.length <= 20 &&
      /[a-zA-Z]/.test(password) &&
      /[0-9]/.test(password)
    );
  }

  function setupLogin() {
    const form = document.querySelector("#login-form, .login-form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const emailInput = form.querySelector("#login-email, #email, input[type='email']");
      const passwordInput = form.querySelector(
        "#login-password, #password, input[type='password'], input[type='text']"
      );

      const email = emailInput?.value.trim() || "";
      const password = passwordInput?.value.trim() || "";

      if (!email) {
        alert("Vui lòng nhập email.");
        emailInput?.focus();
        return;
      }

      if (!validateEmail(email)) {
        alert("Email không hợp lệ.");
        emailInput?.focus();
        return;
      }

      if (!password) {
        alert("Vui lòng nhập mật khẩu.");
        passwordInput?.focus();
        return;
      }

      const users = getStorage("users", []);
      const foundUser = users.find((user) => {
        return user.email === email && user.password === password;
      });

      if (!foundUser) {
        alert("Email hoặc mật khẩu không đúng.");
        return;
      }

      setStorage("currentUser", foundUser);
      updateSidebarUser();

      alert("Đăng nhập thành công.");
      window.location.href = "men.html";
    });
  }

  function setupRegister() {
    const form = document.querySelector("#register-form, .register-form");
    if (!form) return;

    form.removeAttribute("onsubmit");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const emailInput = form.querySelector("#register-email, #email, input[type='email']");
      const passwordInput = form.querySelector(
        "#register-password, #password, input[type='password'], input[type='text']"
      );
      const birthdayInput = form.querySelector(
        "#register-birthday, #birthday, input[placeholder*='MM'], input[type='date']"
      );
      const genderInput = form.querySelector("input[name='gender']:checked");
      const agreementInput = form.querySelector(
        "#agreement, #age-check, input[type='checkbox']"
      );

      const email = emailInput?.value.trim() || "";
      const password = passwordInput?.value.trim() || "";
      const birthday = birthdayInput?.value.trim() || "";
      const gender = genderInput?.value || "Other";

      if (!email) {
        alert("Vui lòng nhập email.");
        emailInput?.focus();
        return;
      }

      if (!validateEmail(email)) {
        alert("Email không hợp lệ.");
        emailInput?.focus();
        return;
      }

      if (!password) {
        alert("Vui lòng nhập mật khẩu.");
        passwordInput?.focus();
        return;
      }

      if (!validatePassword(password)) {
        alert("Mật khẩu phải từ 8 đến 20 ký tự và có cả chữ lẫn số.");
        passwordInput?.focus();
        return;
      }

      if (birthdayInput && !birthday) {
        alert("Vui lòng nhập ngày sinh.");
        birthdayInput.focus();
        return;
      }

      if (agreementInput && !agreementInput.checked) {
        alert("Bạn cần đồng ý điều khoản trước khi đăng ký.");
        return;
      }

      const users = getStorage("users", []);

      if (users.some((user) => user.email === email)) {
        alert("Email này đã được đăng ký. Vui lòng dùng email khác.");
        return;
      }

      users.push({
        email,
        password,
        birthday,
        gender
      });

      setStorage("users", users);

      alert("Đăng ký tài khoản thành công. Vui lòng đăng nhập.");
      window.location.href = "login.html";
    });
  }

  function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll(".eye-btn, #togglePassword");

    toggleButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        const box = button.closest(".password-box");
        if (!box) return;

        const input = box.querySelector("input");
        if (!input) return;

        const icon =
          button.tagName.toLowerCase() === "i"
            ? button
            : button.querySelector("i");

        if (input.type === "password") {
          input.type = "text";

          icon?.classList.remove("fa-eye");
          icon?.classList.add("fa-eye-slash");

          button.setAttribute("aria-label", "Hide password");
        } else {
          input.type = "password";

          icon?.classList.remove("fa-eye-slash");
          icon?.classList.add("fa-eye");

          button.setAttribute("aria-label", "Show password");
        }
      });
    });
  }

  function setupPasswordRules() {
    const form = document.querySelector("#register-form, .register-form");
    const passwordInput = form?.querySelector("#register-password, #password, input[type='password']");

    if (!passwordInput) return;

    const circles = document.querySelectorAll(".password-rules .circle");

    passwordInput.addEventListener("input", function () {
      const password = passwordInput.value;

      const lengthValid = password.length >= 8 && password.length <= 20;
      const letterNumberValid = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
      const specialValid = /^[A-Za-z0-9!\"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]*$/.test(password);

      if (circles[0]) circles[0].classList.toggle("checked", lengthValid);
      if (circles[1]) circles[1].classList.toggle("checked", letterNumberValid);
      if (circles[2]) circles[2].classList.toggle("checked", specialValid && password.length > 0);
    });
  }

  function logoutAccount() {
    localStorage.removeItem("currentUser");
    updateSidebarUser();

    alert("Bạn đã đăng xuất.");
    window.location.href = "login.html";
  }

  function addToCart(product) {
    const cart = getStorage("cart", []);
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1
      });
    }

    setStorage("cart", cart);
    updateCartCount();

    alert("Đã thêm vào giỏ hàng.");
  }

  function addToWishlist(product) {
    const wishlist = getStorage("wishlist", []);

    if (wishlist.some((item) => item.id === product.id)) {
      alert("Sản phẩm này đã có trong Wishlist.");
      return;
    }

    wishlist.push(product);
    setStorage("wishlist", wishlist);

    alert("Đã thêm vào Wishlist.");
  }

  function setupProductCardClick() {
    document.querySelectorAll(".product-card .product-image").forEach((link) => {
      link.addEventListener("click", function () {
        const card = link.closest(".product-card");
        if (!card) return;

        setStorage("selectedProduct", getProductFromCard(card));
      });
    });
  }

  function setupCartWishlistButtons() {
    document.querySelectorAll(".add-cart, .add-cart-btn, .add-to-cart-btn").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        addToCart(getProductFromButton(button));
      });
    });

    document.querySelectorAll(".wishlist-btn, .add-wishlist").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        addToWishlist(getProductFromButton(button));
      });
    });
  }

  function setupOrderPage() {
    if (!document.querySelector(".order-page")) return;

    const selectedProduct = getStorage("selectedProduct", null);
    if (!selectedProduct) return;

    const productTitle = document.querySelector(".product-title, .product-info h1, .product-info h2");
    const priceText = document.querySelector(".product-price, .sale-price");
    const mainImage = document.querySelector(".product-gallery img");

    if (productTitle) productTitle.textContent = selectedProduct.name;
    if (priceText && selectedProduct.price) priceText.textContent = `$${selectedProduct.price.toFixed(2)}`;
    if (mainImage && selectedProduct.image) mainImage.src = selectedProduct.image;

    document.querySelectorAll(".add-cart-btn, .add-to-cart-btn, .wishlist-btn").forEach((button) => {
      if (!button.dataset.id) {
        button.dataset.id = selectedProduct.id;
        button.dataset.name = selectedProduct.name;
        button.dataset.price = selectedProduct.price;
        button.dataset.color = selectedProduct.color;
        button.dataset.size = selectedProduct.size;
        button.dataset.image = selectedProduct.image;
      }
    });
  }

  function updateCartCount() {
    const cart = getStorage("cart", []);
    const count = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

    document.querySelectorAll(".cart-count").forEach((element) => {
      element.textContent = count;
    });
  }

  function changeQuantity(productId, amount) {
    const cart = getStorage("cart", []);
    const item = cart.find((product) => product.id === productId);

    if (!item) return;

    item.quantity = Number(item.quantity || 1) + amount;

    const nextCart =
      item.quantity <= 0
        ? cart.filter((product) => product.id !== productId)
        : cart;

    setStorage("cart", nextCart);
    renderCart();
    updateCartCount();
  }

  function removeFromCart(productId) {
    const cart = getStorage("cart", []);

    setStorage(
      "cart",
      cart.filter((item) => item.id !== productId)
    );

    renderCart();
    updateCartCount();
  }

  function getCartTotal() {
    const cart = getStorage("cart", []);

    return cart.reduce((total, item) => {
      return total + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);
  }

  function renderCart() {
    const cartList = document.querySelector("#cart-list");
    if (!cartList) return;

    const cart = getStorage("cart", []);

    if (cart.length === 0) {
      cartList.innerHTML = `<p class="empty-message">Your cart is empty.</p>`;
      renderOrderSummary();
      return;
    }

    cartList.innerHTML = cart.map((item) => `
      <article class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">

        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <p>Color: ${item.color || "Default"}</p>
          <p>Size: ${item.size || "Default"}</p>
          <p class="cart-price">$${Number(item.price || 0).toFixed(2)}</p>

          <div class="quantity-box">
            <button type="button" data-action="minus" data-id="${item.id}">-</button>
            <span>${item.quantity || 1}</span>
            <button type="button" data-action="plus" data-id="${item.id}">+</button>
          </div>

          <button type="button" class="remove-btn" data-id="${item.id}">Remove</button>
        </div>

        <div class="cart-subtotal">
          <strong>$${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</strong>
        </div>
      </article>
    `).join("");

    cartList.querySelectorAll("[data-action='minus']").forEach((button) => {
      button.addEventListener("click", () => changeQuantity(button.dataset.id, -1));
    });

    cartList.querySelectorAll("[data-action='plus']").forEach((button) => {
      button.addEventListener("click", () => changeQuantity(button.dataset.id, 1));
    });

    cartList.querySelectorAll(".remove-btn").forEach((button) => {
      button.addEventListener("click", () => removeFromCart(button.dataset.id));
    });

    renderOrderSummary();
  }

  function renderOrderSummary() {
    const orderSummary = document.querySelector("#order-summary");
    if (!orderSummary) return;

    const cart = getStorage("cart", []);
    const count = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
    const subtotal = getCartTotal();

    orderSummary.innerHTML = `
      <div class="summary-row">
        <span>Order Summary</span>
        <strong>${count} Item(s)</strong>
      </div>

      <div class="summary-row">
        <span>Item(s) subtotal</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>

      <div class="summary-row">
        <span>Shipping</span>
        <span>TBD</span>
      </div>

      <div class="summary-row total">
        <strong>Order Total</strong>
        <strong>$${subtotal.toFixed(2)}</strong>
      </div>

      <a href="checkout.html" class="checkout-btn">CHECKOUT</a>
    `;
  }

  function removeFromWishlist(productId) {
    const wishlist = getStorage("wishlist", []);

    setStorage(
      "wishlist",
      wishlist.filter((item) => item.id !== productId)
    );

    renderWishlist();
  }

  function renderWishlist() {
    const list = document.querySelector("#wishlist-list");
    if (!list) return;

    const wishlist = getStorage("wishlist", []);

    if (wishlist.length === 0) {
      list.innerHTML = `<p class="empty-message">Your wishlist is empty.</p>`;
      return;
    }

    list.innerHTML = wishlist.map((item) => `
      <article class="wish-item">
        <div class="item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>

        <div class="item-details">
          <h2>${item.name}</h2>
          <p class="item-meta">Color: ${item.color || "Default"}</p>
          <p class="item-meta">Size: ${item.size || "Default"}</p>
          <p class="item-price">$${Number(item.price || 0).toFixed(2)}</p>

          <button
            type="button"
            class="add-to-cart-btn"
            data-id="${item.id}"
            data-name="${item.name}"
            data-price="${item.price}"
            data-color="${item.color}"
            data-size="${item.size}"
            data-image="${item.image}"
          >
            ADD TO CART
          </button>

          <button type="button" class="remove-btn" data-id="${item.id}">
            Remove
          </button>
        </div>
      </article>
    `).join("");

    list.querySelectorAll(".add-to-cart-btn").forEach((button) => {
      button.addEventListener("click", () => {
        addToCart(getProductFromButton(button));
      });
    });

    list.querySelectorAll(".remove-btn").forEach((button) => {
      button.addEventListener("click", () => {
        removeFromWishlist(button.dataset.id);
      });
    });
  }

  function setupSearchPage() {
    const form = document.querySelector(".main-search-box, #search-form");
    const input = document.querySelector("#search-input, .main-search-box input, .search-input");
    const result = document.querySelector("#search-result, .search-result");

    const savedKeyword = localStorage.getItem("searchKeyword");

    if (input && savedKeyword) {
      input.value = savedKeyword;
    }

    function runSearch() {
      if (!input) return;

      const keyword = input.value.trim().toLowerCase();

      if (!keyword) return;

      if (!result) {
        localStorage.setItem("searchKeyword", keyword);
        return;
      }

      const allProducts = [
        ...SAMPLE_PRODUCTS,
        ...getStorage("wishlist", []),
        ...getStorage("cart", [])
      ];

      const unique = Array.from(
        new Map(allProducts.map((item) => [item.id, item])).values()
      );

      const filtered = unique.filter((item) => {
        return item.name.toLowerCase().includes(keyword);
      });

      if (filtered.length === 0) {
        result.innerHTML = `<p>No products found.</p>`;
        return;
      }

      result.innerHTML = filtered.map((item) => `
        <article class="search-product">
          <img src="${item.image}" alt="${item.name}">

          <div>
            <h3>${item.name}</h3>
            <p>$${Number(item.price || 0).toFixed(2)}</p>

            <button
              type="button"
              class="add-cart"
              data-id="${item.id}"
              data-name="${item.name}"
              data-price="${item.price}"
              data-color="${item.color}"
              data-size="${item.size}"
              data-image="${item.image}"
            >
              ADD TO CART
            </button>
          </div>
        </article>
      `).join("");

      setupCartWishlistButtons();
    }

    form?.addEventListener("submit", function (event) {
      event.preventDefault();
      runSearch();
    });

    document.querySelectorAll(".trend-chip, .trend-item").forEach((chip) => {
      chip.addEventListener("click", function (event) {
        event.preventDefault();

        const text = chip.querySelector("span")?.textContent || chip.textContent;

        if (input) {
          input.value = text.trim();
        }

        runSearch();
      });
    });

    if (input && result && input.value.trim()) {
      runSearch();
    }
  }

  function setupCheckout() {
    document.querySelectorAll(".delivery-card").forEach((card) => {
      card.addEventListener("click", function () {
        document.querySelectorAll(".delivery-card").forEach((item) => {
          item.classList.remove("active");
        });

        card.classList.add("active");

        const radio = card.querySelector("input[type='radio']");

        if (radio) {
          radio.checked = true;
        }
      });
    });

    document.querySelector("#place-order, .place-order-btn")?.addEventListener("click", function () {
      if (getStorage("cart", []).length === 0) {
        alert("Giỏ hàng đang trống.");
        return;
      }

      alert("Đặt hàng thành công.");
      localStorage.removeItem("cart");
      window.location.href = "men.html";
    });
  }

document.addEventListener("DOMContentLoaded", () => {
  const cartItems = document.querySelectorAll(".cart-item");
  const summaryBox = document.querySelector(".summary-box");
  const totalItemsCount = summaryBox.querySelector(".summary-header strong");
  const itemsSubtotalText = summaryBox.querySelectorAll(".summary-row span")[1];
  const orderSubtotalText = summaryBox.querySelectorAll(".summary-row span")[5];
  const orderTotalText = summaryBox.querySelectorAll(".total-row strong")[1];

  // Hàm tính toán và cập nhật lại toàn bộ bảng Order Summary
  const updateOrderSummary = () => {
    let totalItems = 0;
    let totalAmount = 0;

    // Duyệt qua từng sản phẩm hiện có trong giỏ để gom dữ liệu
    document.querySelectorAll(".cart-item").forEach((item) => {
      const qtySpan = item.querySelector(".quantity-box span");
      const priceText = item.querySelector(".product-price").textContent;
      
      const quantity = parseInt(qtySpan.textContent);
      const unitPrice = parseFloat(priceText.replace(/[^0-9.-]+/g, ""));

      totalItems += quantity;
      totalAmount += unitPrice * quantity;
    });

    // Cập nhật text hiển thị lên giao diện cột phải
    totalItemsCount.textContent = `${totalItems} Item(s)`;
    itemsSubtotalText.textContent = `$${totalAmount.toFixed(2)}`;
    orderSubtotalText.textContent = `$${totalAmount.toFixed(2)}`;
    orderTotalText.textContent = `$${totalAmount.toFixed(2)}`;
  };

  cartItems.forEach((item) => {
    // 2. Định vị các phần tử UI con bên trong từng sản phẩm
    const btnMinus = item.querySelector(".quantity-box button:first-of-type");
    const btnPlus = item.querySelector(".quantity-box button:last-of-type");
    const qtySpan = item.querySelector(".quantity-box span");
    
    const priceText = item.querySelector(".product-price").textContent;
    const subtotalBold = item.querySelector(".subtotal b");

    // Trích xuất giá trị số từ chuỗi tiền tệ (Ví dụ: "$49.90" -> 49.90)
    const unitPrice = parseFloat(priceText.replace(/[^0-9.-]+/g, ""));

    // Hàm cập nhật thành tiền (Subtotal) của riêng sản phẩm này
    const updateItemSubtotal = (quantity) => {
      const currentSubtotal = unitPrice * quantity;
      subtotalBold.textContent = `$${currentSubtotal.toFixed(2)}`;
    };

    // 3. Lắng nghe sự kiện click cho nút Cộng (+)
    btnPlus.addEventListener("click", () => {
      let currentQty = parseInt(qtySpan.textContent);
      currentQty++;
      qtySpan.textContent = currentQty;
      
      updateItemSubtotal(currentQty);
      updateOrderSummary(); // Cập nhật lại hóa đơn tổng
    });

    // 4. Lắng nghe sự kiện click cho nút Trừ (-)
    btnMinus.addEventListener("click", () => {
      let currentQty = parseInt(qtySpan.textContent);
      
      if (currentQty > 1) {
        currentQty--;
        qtySpan.textContent = currentQty;
        
        updateItemSubtotal(currentQty);
        updateOrderSummary(); // Cập nhật lại hóa đơn tổng
      }
    });
  });

  // Chạy tính toán lại một lần khi vừa tải trang để đồng bộ số liệu chuẩn ban đầu
  updateOrderSummary();
});

  function injectSidebarCSS() {
    if (document.querySelector("#sidebar-style")) return;

    const style = document.createElement("style");
    style.id = "sidebar-style";

    style.textContent = `
      .sidebar {
        position: fixed;
        top: 0;
        right: -340px;
        width: 320px;
        height: 100vh;
        background: #fff;
        z-index: 9999;
        padding: 26px 24px;
        box-shadow: -4px 0 18px rgba(0, 0, 0, 0.16);
        transition: right 0.3s ease;
        color: #111;
      }

      .sidebar.active {
        right: 0;
      }

      .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
      }

      .sidebar-header h2 {
        font-size: 26px;
        font-weight: 800;
      }

      .sidebar-close {
        border: none;
        background: none;
        font-size: 24px;
        cursor: pointer;
      }

      .sidebar-nav {
        display: flex;
        flex-direction: column;
      }

      .sidebar-nav a {
        padding: 15px 0;
        border-bottom: 1px solid #ddd;
        font-size: 17px;
        color: #111;
        text-decoration: none;
      }

      .sidebar-user {
        margin-top: 36px;
      }

      .sidebar-user p {
        font-size: 13px;
        margin-bottom: 14px;
        color: #555;
      }

      .sidebar-user button {
        width: 100%;
        height: 44px;
        border: none;
        border-radius: 999px;
        background: #000;
        color: #fff;
        font-size: 15px;
        cursor: pointer;
      }

      .sidebar-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: rgba(0, 0, 0, 0.35);
        z-index: 9998;
        display: none;
      }

      .sidebar-overlay.active {
        display: block;
      }
    `;

    document.head.appendChild(style);
  }

  window.changeQuantity = changeQuantity;
  window.removeFromCart = removeFromCart;
  window.removeFromWishlist = removeFromWishlist;

  document.addEventListener("DOMContentLoaded", function () {
    initDefaultData();
    injectSidebarCSS();
    createSidebar();
    setupSidebarButtons();
    setupHeaderLinks();
    setupLogin();
    setupRegister();
    setupPasswordToggle();
    setupPasswordRules();
    setupProductCardClick();
    setupOrderPage();
    setupCartWishlistButtons();
    setupSearchPage();
    setupCheckout();
    renderCart();
    renderWishlist();
    updateCartCount();
  });
})();
