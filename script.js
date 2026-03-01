// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNc_n-_u44_vGJ8LYRhp3FQImv4TMS8bI",
  authDomain: "bussines-account-dfe93.firebaseapp.com",
  projectId: "bussines-account-dfe93",
  storageBucket: "bussines-account-dfe93.firebasestorage.app",
  messagingSenderId: "842112353395",
  appId: "1:842112353395:web:03ad33a1c01cb5e16d1606"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM Elements
const salePage = document.getElementById('salePage');
const udharPage = document.getElementById('udharPage');
const analyticsPage = document.getElementById('analyticsPage');
const saleList = document.getElementById('saleList');
const udharList = document.getElementById('udharList');
const cashTotal = document.getElementById('cashTotal');
const upiTotal = document.getElementById('upiTotal');
const grandTotal = document.getElementById('grandTotal');
const udharTotal = document.getElementById('udharTotal');
const currentDate = document.getElementById('currentDate');

// Set current date
currentDate.textContent = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Tab switching (Sale/Analytics)
window.switchTab = (tab) => {
  if (tab === 'sale') {
    salePage.classList.add('active');
    udharPage.classList.remove('active');
    analyticsPage.classList.remove('active');
    document.getElementById('tabSale').classList.add('active');
    document.getElementById('tabAnalytics').classList.remove('active');
  } else {
    analyticsPage.classList.add('active');
    salePage.classList.remove('active');    udharPage.classList.remove('active');
    document.getElementById('tabAnalytics').classList.add('active');
    document.getElementById('tabSale').classList.remove('active');
    calculateAnalytics();
  }
};

// Navigation between Sale and Udhar (for footer nav)
window.showSale = () => {
  salePage.classList.remove('hidden');
  udharPage.classList.add('hidden');
  document.getElementById('saleNavBtn').classList.add('active');
  document.getElementById('udharNavBtn').classList.remove('active');
};

window.showUdhar = () => {
  udharPage.classList.remove('hidden');
  salePage.classList.add('hidden');
  document.getElementById('udharNavBtn').classList.add('active');
  document.getElementById('saleNavBtn').classList.remove('active');
};

// Quantity dropdown logic
window.checkCustomQty = () => {
  const customQtyGroup = document.getElementById('customQtyGroup');
  const itemQty = document.getElementById('itemQty');
  customQtyGroup.style.display = itemQty.value === 'custom' ? 'block' : 'none';
};

// Save Sale
window.saveSale = () => {
  const itemName = document.getElementById('itemName');
  const itemPrice = document.getElementById('itemPrice');
  const itemQty = document.getElementById('itemQty');
  const customQty = document.getElementById('customQty');
  const paymentMethod = document.getElementById('paymentMethod');

  let qty = itemQty.value === 'custom' ? parseInt(customQty.value) : parseInt(itemQty.value);
  let price = parseFloat(itemPrice.value);

  if (!itemName.value || !price || !qty) {
    alert('Please fill all required fields!');
    return;
  }

  push(ref(db, "sales"), {
    name: itemName.value,
    price: price,
    qty: qty,
    total: price * qty,    payment: paymentMethod.value,
    time: new Date().toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true }),
    timestamp: Date.now()
  });

  // Reset form
  itemName.value = "";
  itemPrice.value = "";
  itemQty.value = "1";
  customQty.value = "";
  customQty.style.display = "none";
  itemName.focus();
};

// Load Sales (Today's only)
onValue(ref(db, "sales"), snap => {
  saleList.innerHTML = "";
  let cash = 0, upi = 0;

  let today = new Date().toISOString().split("T")[0];

  snap.forEach(child => {
    let key = child.key;
    let s = child.val();

    let saleDate = new Date(s.timestamp).toISOString().split("T")[0];
    if (saleDate !== today) return; // Only today's sales

    if (s.payment === "Cash") cash += s.total;
    else upi += s.total;

    const saleElement = document.createElement('div');
    saleElement.className = 'transaction-item';
    saleElement.innerHTML = `
      <div class="transaction-header">
        <div class="transaction-name">${s.name}</div>
        <div class="payment-tag tag-${s.payment.toLowerCase()}">${s.payment}</div>
      </div>
      <div class="transaction-amount">₹${s.total}</div>
      <div class="transaction-meta">₹${s.price} × ${s.qty} • ${s.time}</div>
      <div class="actions">
        <button class="btn-small btn-edit" onclick="openEditModal('${key}')">Edit</button>
        <button class="btn-small btn-delete" onclick="deleteSale('${key}')">Delete</button>
      </div>
    `;
    saleList.appendChild(saleElement);
  });

  cashTotal.textContent = `₹${cash}`;
  upiTotal.textContent = `₹${upi}`;  grandTotal.textContent = `₹${cash + upi}`;
});

// Delete Sale
window.deleteSale = (id) => {
  if (confirm('Delete this transaction?')) {
    remove(ref(db, "sales/" + id));
  }
};

// Edit Modal
window.openEditModal = (id) => {
  onValue(ref(db, "sales/" + id), snap => {
    let s = snap.val();
    if (!s) return;

    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.right = "0";
    modal.style.bottom = "0";
    modal.style.background = "rgba(0,0,0,0.4)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "999";

    modal.innerHTML = `
      <div style="background:#fff;padding:20px;border-radius:16px;width:90%;max-width:350px;">
        <h3>Edit Sale</h3>
        
        <input id="editName" value="${s.name}" placeholder="Name"
          style="width:100%;padding:10px;margin-bottom:8px;border:1px solid #ddd;border-radius:8px;">

        <input id="editPrice" type="number" value="${s.price}" placeholder="Price"
          style="width:100%;padding:10px;margin-bottom:8px;border:1px solid #ddd;border-radius:8px;">

        <input id="editQty" type="number" value="${s.qty}" placeholder="Quantity"
          style="width:100%;padding:10px;margin-bottom:8px;border:1px solid #ddd;border-radius:8px;">

        <select id="editPayment"
          style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;border-radius:8px;">
          <option ${s.payment === "Cash" ? "selected" : ""}>Cash</option>
          <option ${s.payment === "UPI" ? "selected" : ""}>UPI</option>
        </select>

        <div style="display:flex;gap:10px;">
          <button id="saveEdit" style="flex:1;background:#111;color:#fff;padding:8px;border:none;border-radius:8px;">Save</button>
          <button id="closeEdit" style="flex:1;background:#ccc;padding:8px;border:none;border-radius:8px;">Cancel</button>        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#saveEdit").onclick = () => {
      let name = document.getElementById("editName").value;
      let price = parseFloat(document.getElementById("editPrice").value);
      let qty = parseInt(document.getElementById("editQty").value);
      let payment = document.getElementById("editPayment").value;

      if (!name || !price || !qty) return;

      update(ref(db, "sales/" + id), {
        name: name,
        price: price,
        qty: qty,
        total: price * qty,
        payment: payment
      });

      document.body.removeChild(modal);
    };

    modal.querySelector("#closeEdit").onclick = () => {
      document.body.removeChild(modal);
    };
  }, { onlyOnce: true });
};

// Save Udhaar
window.saveUdhar = () => {
  const udharName = document.getElementById('udharName');
  const udharAmount = document.getElementById('udharAmount');
  const udharPayment = document.getElementById('udharPayment');

  if (!udharName.value || !udharAmount.value) {
    alert('Please fill all required fields!');
    return;
  }

  push(ref(db, "udhar"), {
    name: udharName.value,
    amount: parseFloat(udharAmount.value),
    payment: udharPayment.value,
    time: new Date().toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true }),
    timestamp: Date.now()
  });
  // Reset form
  udharName.value = "";
  udharAmount.value = "";
};

// Load Udhaar
onValue(ref(db, "udhar"), snap => {
  udharList.innerHTML = "";
  let total = 0;

  snap.forEach(child => {
    let u = child.val();
    total += u.amount;

    const udharElement = document.createElement('div');
    udharElement.className = 'transaction-item';
    udharElement.innerHTML = `
      <div class="transaction-header">
        <div class="transaction-name">${u.name}</div>
        <div class="payment-tag tag-${u.payment.toLowerCase()}">${u.payment}</div>
      </div>
      <div class="transaction-amount">₹${u.amount}</div>
      <div class="transaction-meta">${u.time}</div>
    `;
    udharList.appendChild(udharElement);
  });

  udharTotal.textContent = `₹${total}`;
});

// Analytics Functions
let allSales = {};

onValue(ref(db, "sales"), snap => {
  allSales = snap.val() || {};
  if (document.getElementById('tabAnalytics').classList.contains('active')) {
    calculateAnalytics();
  }
});

function calculateAnalytics() {
  let cashSum = 0, upiSum = 0, totalQty = 0;
  let productCount = {};
  let dayCount = {};

  Object.values(allSales).forEach(sale => {
    if (sale.payment === 'Cash') cashSum += sale.total;
    else upiSum += sale.total;

    totalQty += sale.qty;
    const cleanName = sale.name.toLowerCase().trim();
    productCount[cleanName] = (productCount[cleanName] || 0) + sale.qty;

    const date = new Date(sale.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    dayCount[date] = (dayCount[date] || 0) + sale.total;
  });

  document.getElementById('aCash').textContent = `₹${cashSum}`;
  document.getElementById('aUpi').textContent = `₹${upiSum}`;
  document.getElementById('aGrand').textContent = `₹${cashSum + upiSum}`;

  let topProduct = Object.entries(productCount).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('mostProduct').textContent = topProduct ? `${topProduct[0]} (${topProduct[1]} sold)` : 'No data';

  let bestDayData = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('bestDay').textContent = bestDayData ? `${bestDayData[0]} (₹${bestDayData[1]})` : 'No data';

  const breakdownDiv = document.getElementById('dailyBreakdown');
  breakdownDiv.innerHTML = '';
  Object.entries(dayCount)
    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
    .forEach(([date, total]) => {
      const dayElement = document.createElement('div');
      dayElement.style.padding = '8px 0';
      dayElement.style.borderBottom = '1px solid var(--border)';
      dayElement.innerHTML = `<div style="display:flex; justify-content:space-between"><span>${date}</span><strong>₹${total}</strong></div>`;
      breakdownDiv.appendChild(dayElement);
    });
}
