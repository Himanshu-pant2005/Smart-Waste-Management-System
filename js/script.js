// ============================
// GLOBAL INITIALIZATION
// ============================
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));

        // Close menu on nav link click (mobile UX)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => navLinks.classList.remove('active'));
        });
    }

    // Dummy Complaints Data
    window.complaintData = [
        {
            id: 1,
            description: "Garbage not collected for 3 days",
            location: { lat: 28.6139, lng: 77.2090 },
            status: "pending",
            photo: "images/garbage1.jpg",
            date: "2023-07-15"
        },
        {
            id: 2,
            description: "Overflowing dumpster near market",
            location: { lat: 28.6229, lng: 77.2100 },
            status: "assigned",
            photo: "images/garbage2.jpg",
            assignedTo: "Vehicle-103",
            date: "2023-07-14"
        },
        {
            id: 3,
            description: "Waste scattered on street corner",
            location: { lat: 28.6339, lng: 77.2200 },
            status: "resolved",
            photo: "images/garbage3.jpg",
            resolvedPhoto: "images/resolved1.jpg",
            date: "2023-07-10",
            resolvedDate: "2023-07-12"
        }
    ];

    // Dummy Vehicle Data
    window.vehicleData = [
        { id: "Vehicle-101", driver: "Ramesh Singh", phone: "+91 9876500001", location: { lat: 28.6159, lng: 77.2110 }, status: "available" },
        { id: "Vehicle-102", driver: "Priya Sharma", phone: "+91 9876500002", location: { lat: 28.6259, lng: 77.2150 }, status: "busy" },
        { id: "Vehicle-103", driver: "John Doe", phone: "+91 9876543210", location: { lat: 28.6200, lng: 77.2180 }, status: "busy" },
        { id: "Vehicle-104", driver: "Anjali Verma", phone: "+91 9876500004", location: { lat: 28.6300, lng: 77.2220 }, status: "maintenance" }
    ];

    // Initialize correct portal
    if (document.querySelector('.citizen-portal')) initCitizenPortal();
    if (document.querySelector('.admin-portal')) initAdminPortal();
    if (document.querySelector('.vehicle-portal')) initVehiclePortal();

    // Initialize map if present
    if (document.getElementById('map')) initMap();

    // Init animations & scroll effects
    initScrollAnimations();

    // Add Scroll to Top Button
    initScrollToTop();
});

// ============================
// MAP INITIALIZATION
// ============================
function initMap() {
    const map = L.map('map').setView([28.6139, 77.2090], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Complaints Markers
    window.complaintData.forEach(c => {
        const color = c.status === 'pending' ? 'red' : c.status === 'assigned' ? 'orange' : 'green';
        L.marker([c.location.lat, c.location.lng], {
            icon: L.divIcon({
                className: 'complaint-marker',
                html: `<i class="fas fa-trash" style="color:${color};"></i>`,
                iconSize: [30, 30]
            })
        }).addTo(map).bindPopup(`<b>Complaint #${c.id}</b><br>${c.description}<br>Status: ${c.status}`);
    });

    // Vehicles Markers
    window.vehicleData.forEach(v => {
        const statusColor = v.status === "available" ? "#16A34A" : v.status === "busy" ? "#E67E22" : "#E74C3C";
        L.marker([v.location.lat, v.location.lng], {
            icon: L.divIcon({
                className: 'vehicle-marker',
                html: `<i class="fas fa-truck" style="color:${statusColor};"></i>`,
                iconSize: [30, 30]
            })
        }).addTo(map).bindPopup(`<b>${v.id}</b><br>Driver: ${v.driver}<br>Status: ${v.status}`);
    });

    return map;
}

// ============================
// CITIZEN PORTAL
// ============================
function initCitizenPortal() {
    displayUserComplaints();

    const form = document.getElementById('complaint-form');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const description = document.getElementById('complaint-description').value;
            const lat = parseFloat(document.getElementById('latitude').value);
            const lng = parseFloat(document.getElementById('longitude').value);

            const newComplaint = {
                id: window.complaintData.length + 1,
                description,
                location: { lat, lng },
                status: "pending",
                photo: "images/new-complaint.jpg",
                date: new Date().toISOString().split('T')[0]
            };
            window.complaintData.unshift(newComplaint);
            displayUserComplaints();
            form.reset();
            notify("Complaint submitted successfully ✅");
        });
    }

    const locationBtn = document.getElementById('get-location');
    if (locationBtn) {
        locationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    document.getElementById('latitude').value = pos.coords.latitude;
                    document.getElementById('longitude').value = pos.coords.longitude;
                });
            } else {
                notify("Geolocation not supported ❌", true);
            }
        });
    }
}

function displayUserComplaints() {
    const container = document.getElementById('my-complaints');
    if (!container) return;

    container.innerHTML = window.complaintData.map(c => `
        <div class="card complaint-card hidden">
            <div class="complaint-header">
                <h3>Complaint #${c.id}</h3>
                <span class="status ${c.status}">${c.status}</span>
            </div>
            <div class="complaint-body">
                <img src="${c.photo}" alt="Complaint Photo" onerror="this.onerror = null;">
                <div class="complaint-details">
                    <p><strong>Description:</strong> ${c.description}</p>
                    <p><strong>Date:</strong> ${c.date}</p>
                    <p><strong>Location:</strong> ${c.location.lat.toFixed(4)}, ${c.location.lng.toFixed(4)}</p>
                    ${c.assignedTo ? `<p><strong>Assigned To:</strong> ${c.assignedTo}</p>` : ""}
                    ${c.resolvedDate ? `<p><strong>Resolved Date:</strong> ${c.resolvedDate}</p>` : ""}
                </div>
            </div>
        </div>
    `).join('');
}

// ============================
// ADMIN PORTAL
// ============================
function initAdminPortal() {
    displayAllComplaints();

    document.addEventListener('click', e => {
        if (e.target.classList.contains('assign-btn')) {
            const id = parseInt(e.target.dataset.id);
            const select = document.getElementById(`vehicle-select-${id}`);
            const vehicleId = select.value;
            const complaint = window.complaintData.find(c => c.id === id);

            if (complaint) {
                complaint.status = "assigned";
                complaint.assignedTo = vehicleId;
                displayAllComplaints();
                notify(`Complaint #${id} assigned to ${vehicleId} 🚛`);
            }
        }
    });
}

function displayAllComplaints() {
    const container = document.getElementById('complaints-table');
    if (!container) return;

    container.innerHTML = `
        <table class="hidden">
            <thead>
                <tr><th>ID</th><th>Photo</th><th>Description</th><th>Location</th><th>Date</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
                ${window.complaintData.map(c => `
                    <tr>
                        <td>#${c.id}</td>
                        <td><img src="${c.photo}" class="thumbnail" onerror="this.onerror=null;"></td>
                        <td>${c.description}</td>
                        <td>${c.location.lat.toFixed(4)}, ${c.location.lng.toFixed(4)}</td>
                        <td>${c.date}</td>
                        <td><span class="status ${c.status}">${c.status}</span></td>
                        <td>
                            ${c.status === "pending" ? `
                                <select id="vehicle-select-${c.id}">
                                    ${window.vehicleData.filter(v => v.status !== "maintenance")
                                        .map(v => `<option value="${v.id}">${v.id} (${v.status})</option>`).join("")}
                                </select>
                                <button class="btn primary assign-btn" data-id="${c.id}">Assign</button>
                            ` : c.status === "assigned" ? `<p>Assigned to: ${c.assignedTo}</p>` : `<p>Resolved on: ${c.resolvedDate}</p>`}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ============================
// VEHICLE PORTAL
// ============================
function initVehiclePortal() {
    displayAssignedComplaints();

    document.addEventListener('click', e => {
        if (e.target.classList.contains('resolve-btn')) {
            const id = parseInt(e.target.dataset.id);
            const complaint = window.complaintData.find(c => c.id === id);

            if (complaint) {
                complaint.status = "resolved";
                complaint.resolvedDate = new Date().toISOString().split('T')[0];
                complaint.resolvedPhoto = "images/resolved1.jpg";
                displayAssignedComplaints();
                notify(`Complaint #${id} marked as resolved ✅`);
            }
        }
    });
}

function displayAssignedComplaints() {
    const container = document.getElementById('assigned-complaints');
    if (!container) return;

    const assigned = window.complaintData.filter(c => c.status === "assigned");
    container.innerHTML = assigned.length ? assigned.map(c => `
        <div class="card complaint-card hidden">
            <div class="complaint-header">
                <h3>Complaint #${c.id}</h3>
                <span class="status assigned">Assigned</span>
            </div>
            <div class="complaint-body">
                <img src="${c.photo}" onerror="this.onerror= null;">
                <div class="complaint-details">
                    <p><strong>Description:</strong> ${c.description}</p>
                    <p><strong>Date:</strong> ${c.date}</p>
                    <p><strong>Location:</strong> ${c.location.lat.toFixed(4)}, ${c.location.lng.toFixed(4)}</p>
                    <p><strong>Assigned To:</strong> ${c.assignedTo}</p>
                    <input type="file" accept="image/*">
                    <button class="btn primary resolve-btn" data-id="${c.id}">Mark as Resolved</button>
                </div>
            </div>
        </div>
    `).join('') : `<div class="card"><p>No complaints assigned currently.</p></div>`;
}

// ============================
// UTILITIES
// ============================
function notify(message, isError = false) {
    const box = document.createElement('div');
    box.className = `notify ${isError ? 'error' : 'success'} hidden`;
    box.textContent = message;
    document.body.appendChild(box);
    setTimeout(() => box.classList.remove('hidden'), 50);
    setTimeout(() => box.remove(), 3000);
}

// ============================
// SCROLL ANIMATIONS
// ============================
function initScrollAnimations() {
    const elements = document.querySelectorAll('.feature-card, .complaint-card, table, .card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    elements.forEach(el => observer.observe(el));
}

// ============================
// SCROLL TO TOP BUTTON
// ============================
function initScrollToTop() {
    const btn = document.createElement('button');
    btn.className = 'scroll-top hidden';
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
