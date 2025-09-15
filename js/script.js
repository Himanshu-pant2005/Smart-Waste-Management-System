// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Dummy data for complaints
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

    // Dummy data for vehicles
    window.vehicleData = [
        {
            id: "Vehicle-101",
            location: { lat: 28.6159, lng: 77.2110 },
            status: "available"
        },
        {
            id: "Vehicle-102",
            location: { lat: 28.6259, lng: 77.2150 },
            status: "busy"
        },
        {
            id: "Vehicle-103",
            location: { lat: 28.6200, lng: 77.2180 },
            status: "busy"
        }
    ];

    // Initialize map if it exists on the page
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        initMap();
    }

    // Initialize forms and tables based on the current page
    if (document.querySelector('.citizen-portal')) {
        initCitizenPortal();
    } else if (document.querySelector('.admin-portal')) {
        initAdminPortal();
    } else if (document.querySelector('.vehicle-portal')) {
        initVehiclePortal();
    }
});

// Initialize Map
function initMap() {
    const map = L.map('map').setView([28.6139, 77.2090], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add complaint markers
    if (window.complaintData) {
        window.complaintData.forEach(complaint => {
            const markerColor = complaint.status === 'pending' ? 'red' : 
                               complaint.status === 'assigned' ? 'orange' : 'green';
            
            const marker = L.marker([complaint.location.lat, complaint.location.lng])
                .addTo(map)
                .bindPopup(`<b>Complaint #${complaint.id}</b><br>${complaint.description}<br>Status: ${complaint.status}`);
        });
    }

    // Add vehicle markers
    if (window.vehicleData) {
        window.vehicleData.forEach(vehicle => {
            const marker = L.marker([vehicle.location.lat, vehicle.location.lng], {
                icon: L.divIcon({
                    className: 'vehicle-marker',
                    html: '<i class="fas fa-truck" style="color: #16A34A;"></i>',
                    iconSize: [30, 30]
                })
            }).addTo(map)
            .bindPopup(`<b>${vehicle.id}</b><br>Status: ${vehicle.status}`);
        });
    }

    return map;
}

// Citizen Portal Functions
function initCitizenPortal() {
    // Display user complaints
    displayUserComplaints();
    
    // Handle complaint form submission
    const complaintForm = document.getElementById('complaint-form');
    if (complaintForm) {
        complaintForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const description = document.getElementById('complaint-description').value;
            const latitude = document.getElementById('latitude').value;
            const longitude = document.getElementById('longitude').value;
            
            // Create new complaint
            const newComplaint = {
                id: window.complaintData.length + 1,
                description: description,
                location: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
                status: "pending",
                photo: "images/new-complaint.jpg", // Placeholder
                date: new Date().toISOString().split('T')[0]
            };
            
            // Add to data
            window.complaintData.unshift(newComplaint);
            
            // Update display
            displayUserComplaints();
            
            // Reset form
            complaintForm.reset();
            
            // Show success message
            alert('Complaint submitted successfully!');
        });
    }

    // Get current location button
    const locationBtn = document.getElementById('get-location');
    if (locationBtn) {
        locationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    document.getElementById('latitude').value = position.coords.latitude;
                    document.getElementById('longitude').value = position.coords.longitude;
                });
            } else {
                alert('Geolocation is not supported by this browser.');
            }
        });
    }
}

function displayUserComplaints() {
    const complaintsContainer = document.getElementById('my-complaints');
    if (!complaintsContainer) return;
    
    let html = '';
    
    window.complaintData.forEach(complaint => {
        const statusClass = complaint.status.toLowerCase();
        html += `
            <div class="card complaint-card">
                <div class="complaint-header">
                    <h3>Complaint #${complaint.id}</h3>
                    <span class="status ${statusClass}">${complaint.status}</span>
                </div>
                <div class="complaint-body">
                    <div class="complaint-image">
                        <img src="${complaint.photo}" alt="Complaint Photo" onerror="this.src='images/placeholder.jpg'">
                    </div>
                    <div class="complaint-details">
                        <p><strong>Description:</strong> ${complaint.description}</p>
                        <p><strong>Date:</strong> ${complaint.date}</p>
                        <p><strong>Location:</strong> ${complaint.location.lat.toFixed(4)}, ${complaint.location.lng.toFixed(4)}</p>
                        ${complaint.assignedTo ? `<p><strong>Assigned To:</strong> ${complaint.assignedTo}</p>` : ''}
                        ${complaint.resolvedDate ? `<p><strong>Resolved Date:</strong> ${complaint.resolvedDate}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    complaintsContainer.innerHTML = html;
}

// Admin Portal Functions
function initAdminPortal() {
    // Display all complaints
    displayAllComplaints();
    
    // Handle complaint assignment
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('assign-btn')) {
            const complaintId = parseInt(e.target.getAttribute('data-id'));
            const vehicleSelect = document.getElementById(`vehicle-select-${complaintId}`);
            const vehicleId = vehicleSelect.value;
            
            // Update complaint status
            const complaint = window.complaintData.find(c => c.id === complaintId);
            if (complaint) {
                complaint.status = "assigned";
                complaint.assignedTo = vehicleId;
                
                // Update display
                displayAllComplaints();
                
                // Show success message
                alert(`Complaint #${complaintId} assigned to ${vehicleId}`);
            }
        }
    });
}

function displayAllComplaints() {
    const complaintsTable = document.getElementById('complaints-table');
    if (!complaintsTable) return;
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Photo</th>
                    <th>Description</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    window.complaintData.forEach(complaint => {
        const statusClass = complaint.status.toLowerCase();
        
        html += `
            <tr>
                <td>#${complaint.id}</td>
                <td><img src="${complaint.photo}" alt="Complaint" class="thumbnail" onerror="this.src='images/placeholder.jpg'"></td>
                <td>${complaint.description}</td>
                <td>${complaint.location.lat.toFixed(4)}, ${complaint.location.lng.toFixed(4)}</td>
                <td>${complaint.date}</td>
                <td><span class="status ${statusClass}">${complaint.status}</span></td>
                <td>
        `;
        
        if (complaint.status === "pending") {
            html += `
                <select id="vehicle-select-${complaint.id}" class="vehicle-select">
                    ${window.vehicleData.map(v => `<option value="${v.id}">${v.id} (${v.status})</option>`).join('')}
                </select>
                <button class="btn primary assign-btn" data-id="${complaint.id}">Assign</button>
            `;
        } else if (complaint.status === "assigned") {
            html += `<p>Assigned to: ${complaint.assignedTo}</p>`;
        } else {
            html += `<p>Resolved on: ${complaint.resolvedDate}</p>`;
        }
        
        html += `
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    complaintsTable.innerHTML = html;
}

// Vehicle Portal Functions
function initVehiclePortal() {
    // Display assigned complaints
    displayAssignedComplaints();
    
    // Handle complaint resolution
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('resolve-btn')) {
            const complaintId = parseInt(e.target.getAttribute('data-id'));
            
            // Update complaint status
            const complaint = window.complaintData.find(c => c.id === complaintId);
            if (complaint) {
                complaint.status = "resolved";
                complaint.resolvedDate = new Date().toISOString().split('T')[0];
                complaint.resolvedPhoto = "images/resolved1.jpg"; // Placeholder
                
                // Update display
                displayAssignedComplaints();
                
                // Show success message
                alert(`Complaint #${complaintId} marked as resolved`);
            }
        }
    });
}

function displayAssignedComplaints() {
    const assignedContainer = document.getElementById('assigned-complaints');
    if (!assignedContainer) return;
    
    // Filter assigned complaints (in a real app, this would be filtered by the current vehicle ID)
    const assignedComplaints = window.complaintData.filter(c => c.status === "assigned");
    
    let html = '';
    
    if (assignedComplaints.length === 0) {
        html = '<div class="card"><p>No complaints assigned currently.</p></div>';
    } else {
        assignedComplaints.forEach(complaint => {
            html += `
                <div class="card complaint-card">
                    <div class="complaint-header">
                        <h3>Complaint #${complaint.id}</h3>
                        <span class="status assigned">Assigned</span>
                    </div>
                    <div class="complaint-body">
                        <div class="complaint-image">
                            <img src="${complaint.photo}" alt="Complaint Photo" onerror="this.src='images/placeholder.jpg'">
                        </div>
                        <div class="complaint-details">
                            <p><strong>Description:</strong> ${complaint.description}</p>
                            <p><strong>Date:</strong> ${complaint.date}</p>
                            <p><strong>Location:</strong> ${complaint.location.lat.toFixed(4)}, ${complaint.location.lng.toFixed(4)}</p>
                            <p><strong>Assigned To:</strong> ${complaint.assignedTo}</p>
                            
                            <div class="form-group">
                                <label for="after-photo-${complaint.id}">Upload After-Photo:</label>
                                <input type="file" id="after-photo-${complaint.id}" accept="image/*">
                            </div>
                            
                            <button class="btn primary resolve-btn" data-id="${complaint.id}">Mark as Resolved</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    assignedContainer.innerHTML = html;
}