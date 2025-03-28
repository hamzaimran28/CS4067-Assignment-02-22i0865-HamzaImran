document.addEventListener("DOMContentLoaded", function () {
  // Determine environment based on the current hostname.
  // If running under Docker, window.location.hostname is "host.docker.internal".
  // Otherwise, assume you’re using Kubernetes with your DNS (e.g. hamzaimran.example.com).
  const isDocker = window.location.hostname === "host.docker.internal";

  // Set service URLs based on environment.
  const USER_SERVICE_URL = isDocker
    ? "http://host.docker.internal:3000/users"
    : "http://hamzaimran.example.com/users";
  const EVENT_SERVICE_URL = isDocker
    ? "http://host.docker.internal:3001/events"
    : "http://hamzaimran.example.com/events";
  const BOOKING_SERVICE_URL = isDocker
    ? "http://host.docker.internal:3002/bookings"
    : "http://hamzaimran.example.com/bookings";
  const PAYMENT_SERVICE_URL = isDocker
    ? "http://host.docker.internal:3003/payments"
    : "http://hamzaimran.example.com/payments";
  const NOTIFICATION_SERVICE_URL = isDocker
    ? "http://host.docker.internal:3004/notifications"
    : "http://hamzaimran.example.com/notifications";

  // --- TAB SWITCHING FOR LOGIN/REGISTER ---
  const tabButtons = document.querySelectorAll(".tab-button");
  if (tabButtons.length > 0) {
    tabButtons.forEach((button) => {
      button.addEventListener("click", function () {
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        const tabContents = document.querySelectorAll(".tab-content");
        tabContents.forEach((content) => content.classList.remove("active"));

        const tab = this.getAttribute("data-tab");
        document.getElementById(tab).classList.add("active");
      });
    });
  }

  // --- SESSION HANDLING & REDIRECTION ---
  const pathParts = window.location.pathname.split("/");
  let currentPage = pathParts[pathParts.length - 1] || "index.html";
  const user = localStorage.getItem("user");

  if (user && currentPage === "index.html") {
    window.location.href = "dashboard.html";
    return;
  }

  if (!user && currentPage !== "index.html") {
    window.location.href = "index.html";
    return;
  }

  // --- LOGOUT FUNCTIONALITY ---
  document.querySelectorAll("#logoutLink").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("user");
      window.location.href = "index.html";
    });
  });

  // --- AUTHENTICATION (Login and Register) ---
  // Handle Login
  if (document.getElementById("loginForm")) {
    document
      .getElementById("loginForm")
      .addEventListener("submit", async function (e) {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;
        try {
          const response = await fetch(`${USER_SERVICE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          const data = await response.json();
          if (response.ok) {
            localStorage.setItem("user", JSON.stringify(data));
            window.location.href = "dashboard.html";
          } else {
            document.getElementById("loginResponse").innerText =
              "Login failed: " + data.error;
          }
        } catch (error) {
          document.getElementById("loginResponse").innerText =
            "Error during login: " + error;
        }
      });
  }

  // Handle Registration
  if (document.getElementById("registerForm")) {
    document
      .getElementById("registerForm")
      .addEventListener("submit", async function (e) {
        e.preventDefault();
        const username = document.getElementById("regUsername").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;
        const payload = { username, email, password };

        try {
          const response = await fetch(`${USER_SERVICE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await response.json();
          if (response.ok) {
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "dashboard.html";
          } else {
            document.getElementById("registerResponse").innerText =
              "Registration failed: " + data.error;
          }
        } catch (err) {
          document.getElementById("registerResponse").innerText =
            "Error during registration: " + err;
        }
      });
  }

  // --- DASHBOARD: Set Username ---
  const currentUsernameElem = document.getElementById("currentUsername");
  if (currentUsernameElem && user) {
    const userObj = JSON.parse(user);
    currentUsernameElem.innerText = userObj.username;
  }

  // --- CREATE EVENT ---
  if (document.getElementById("createEventForm")) {
    document
      .getElementById("createEventForm")
      .addEventListener("submit", async function (e) {
        e.preventDefault();
        const name = document.getElementById("eventName").value;
        const dateInput = document.getElementById("eventDate").value;
        const date = new Date(dateInput).toISOString();
        const venue = document.getElementById("eventVenue").value;
        const availableTickets = parseInt(
          document.getElementById("availableTickets").value
        );
        const payload = { name, date, venue, availableTickets };

        try {
          const response = await fetch(`${EVENT_SERVICE_URL}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await response.json();
          document.getElementById("eventResponse").innerText = response.ok
            ? "Event created with ID: " + data.event._id
            : "Error: " + data.error;
        } catch (err) {
          document.getElementById("eventResponse").innerText = "Error: " + err;
        }
      });
  }

  // --- LIST EVENTS ---
  if (document.getElementById("fetchEventsBtn")) {
    document
      .getElementById("fetchEventsBtn")
      .addEventListener("click", async function () {
        try {
          const response = await fetch(`${EVENT_SERVICE_URL}`);
          const events = await response.json();
          const list = document.getElementById("eventsList");
          list.innerHTML = "";
          events.forEach(function (event) {
            const card = document.createElement("div");
            card.className = "log-card";
            card.innerHTML = `<h3>${event.name}</h3>
            <p><strong>ID:</strong> ${event._id}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p><strong>Date:</strong> ${new Date(
              event.date
            ).toLocaleString()}</p>
            <p><strong>Tickets:</strong> ${event.availableTickets}</p>`;
            list.appendChild(card);
          });
        } catch (err) {
          alert("Error fetching events: " + err);
        }
      });
  }

  // --- BOOK EVENT ---
  if (document.getElementById("createBookingForm")) {
    document
      .getElementById("createBookingForm")
      .addEventListener("submit", async function (e) {
        e.preventDefault();
        const userObj = JSON.parse(localStorage.getItem("user"));
        if (!userObj || !userObj._id) {
          alert("Please login first.");
          return;
        }
        const eventId = document.getElementById("bookingEventId").value.trim();
        const tickets = parseInt(
          document.getElementById("bookingTickets").value
        );
        const amount = parseFloat(
          document.getElementById("bookingAmount").value
        );
        const payload = { userId: userObj._id, eventId, tickets, amount };
        try {
          const response = await fetch(`${BOOKING_SERVICE_URL}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await response.json();
          document.getElementById("bookingResponse").innerText = response.ok
            ? "Booking confirmed with ID: " + data.booking._id
            : "Error: " + data.error;
        } catch (err) {
          document.getElementById("bookingResponse").innerText =
            "Error: " + err;
        }
      });
  }

  // --- FETCH NOTIFICATIONS ---
  if (document.getElementById("fetchNotificationsBtn")) {
    document
      .getElementById("fetchNotificationsBtn")
      .addEventListener("click", async function () {
        const userObj = JSON.parse(localStorage.getItem("user"));
        if (!userObj || !userObj._id) {
          alert("Please login first.");
          return;
        }
        try {
          const response = await fetch(
            `${NOTIFICATION_SERVICE_URL}?userId=${userObj._id}`
          );
          const notifications = await response.json();
          const list = document.getElementById("notificationsList");
          list.innerHTML = "";
          // Create table for notifications
          const table = document.createElement("table");
          table.className = "log-table";
          // Create header row
          const thead = document.createElement("thead");
          thead.innerHTML = `<tr>
            <th>Booking ID</th>
            <th>Status</th>
            <th>Time</th>
          </tr>`;
          table.appendChild(thead);
          // Create table body
          const tbody = document.createElement("tbody");
          notifications.forEach(function (notif) {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${notif.bookingId}</td>
                             <td>${notif.status}</td>
                             <td>${new Date(
                               notif.timestamp
                             ).toLocaleString()}</td>`;
            tbody.appendChild(row);
          });
          table.appendChild(tbody);
          list.appendChild(table);
        } catch (err) {
          alert("Error fetching notifications: " + err);
        }
      });
  }

  // --- FETCH PAYMENT LOGS ---
  if (document.getElementById("fetchPaymentsBtn")) {
    document
      .getElementById("fetchPaymentsBtn")
      .addEventListener("click", async function () {
        const userObj = JSON.parse(localStorage.getItem("user"));
        if (!userObj || !userObj._id) {
          alert("Please login first.");
          return;
        }
        try {
          const response = await fetch(
            `${PAYMENT_SERVICE_URL}?userId=${userObj._id}`
          );
          const payments = await response.json();
          const list = document.getElementById("paymentsList");
          list.innerHTML = "";
          // Create table for payment logs
          const table = document.createElement("table");
          table.className = "log-table";
          // Create header row
          const thead = document.createElement("thead");
          thead.innerHTML = `<tr>
            <th>Amount</th>
            <th>Status</th>
            <th>Time</th>
          </tr>`;
          table.appendChild(thead);
          // Create table body
          const tbody = document.createElement("tbody");
          payments.forEach(function (pay) {
            const row = document.createElement("tr");
            row.innerHTML = `<td>$${pay.amount}</td>
                             <td>${pay.status}</td>
                             <td>${new Date(
                               pay.timestamp
                             ).toLocaleString()}</td>`;
            tbody.appendChild(row);
          });
          table.appendChild(tbody);
          list.appendChild(table);
        } catch (err) {
          alert("Error fetching payment details: " + err);
        }
      });
  }
});
