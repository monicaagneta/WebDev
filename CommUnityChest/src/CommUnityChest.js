"use strict";

/*
 * Connections between TypeScript and HTML:
 * - Interfaces form field IDs and data-attributes
 * - initializers attaches to buttons, forms, and modals of each listing page
 * - Event listeners correspond to user interactions defined by classes/IDs in HTML
 * - DOM manipulation functions update the .listings-grid container in HTML.
 */

// helper functions for local storage
function loadListings(key) {
  var json = localStorage.getItem(key);
  return json ? JSON.parse(json) : [];
}
function saveListings(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}
// demonstrate use of functions
function capitalize(s) {
  //returns capitalized string
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function showModal(modal) {
  modal.style.display = "block";
} //display modal
function hideModal(modal) {
  modal.style.display = "none";
}

// make modals close when "x" button clicked = Event Driven Behaviors
document.querySelectorAll('.modal .close, .close-success-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    // find the parent .modal of whatever button was clicked
    var modal = btn.closest('.modal');
    if (modal) hideModal(modal);
  });
});
function initMarketplace() {
  //initializes for marketplace functions
  var STORAGE_KEY = 'marketplaceListings';
  var listingModal = document.getElementById("listingModal"); //create new
  var successModal = document.getElementById("successModal"); //show successful
  var createBtn = document.getElementById("createListingBtn"); //open listing modal
  var form = document.getElementById("listingForm");
  var searchBtn = document.getElementById("searchBtn"); //button for search
  var searchInput = document.getElementById("searchInput"); //input field for search

  loadListings(STORAGE_KEY).forEach(addListing); // show persisted listings

  function createCard(data) {
    //creates DOM card for listing
    var card = document.createElement("div");
    card.className = "listing-card";
    card.dataset.category = data.category;
    card.innerHTML = "\n      <div class=\"listing-image\">\n        <img src=\"".concat(data.imageUrl || '/api/placeholder/300/200', "\" alt=\"").concat(data.title, "\">\n      </div>\n      <div class=\"listing-content\">\n        <span class=\"listing-category\">").concat(capitalize(data.category), "</span>\n        <h3>").concat(data.title, "</h3>\n        <p>").concat(data.description, "</p>\n        <div class=\"listing-meta\">\n          <span><i class=\"fas fa-map-marker-alt\"></i> ").concat(data.location, "</span>\n          <span><i class=\"fas fa-calendar\"></i> Just now</span>\n        </div>\n        <button class=\"btn-small contact-btn\">I'm Interested</button>\n      </div>\n    "); // creates card with listing details and interest button
    return card;
  }
  function addListing(data) {
    var grid = document.querySelector(".listings-grid");
    var card = createCard(data);

    // add delete button to new posts
    var deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", function () {
      // load current array
      var all = loadListings(STORAGE_KEY);
      var remaining = all.filter(function (item) {
        return JSON.stringify(item) !== JSON.stringify(data);
      });
      saveListings(STORAGE_KEY, remaining);
      // remove post from page
      card.remove();
    });
    card.appendChild(deleteBtn);
    grid.appendChild(card);
  }

  // modal open/close + submit
  createBtn.addEventListener("click", function () {
    return showModal(listingModal);
  });
  form.addEventListener("submit", function (e) {
    // handle for new listing
    e.preventDefault();
    var d = {
      // gather form data
      title: document.getElementById("itemTitle").value,
      category: document.getElementById("itemCategory").value,
      description: document.getElementById("itemDescription").value,
      location: document.getElementById("itemLocation").value,
      contactName: document.getElementById("contactName").value,
      contactEmail: document.getElementById("contactEmail").value,
      contactPhone: document.getElementById("contactPhone").value || undefined,
      imageUrl: undefined
    };
    hideModal(listingModal); // close listing modal after submission
    addListing(d); // add listing to page
    var all = loadListings(STORAGE_KEY); // add to local storage
    all.push(d);
    saveListings(STORAGE_KEY, all);
    document.getElementById("successMessage").textContent = "Your listing has been posted successfully.";
    showModal(successModal); // show success
    form.reset();
  });

  // search/filter = demonstrate logical structures and operators
  searchBtn.addEventListener("click", function () {
    // search button click
    var q = searchInput.value.toLowerCase(); // for case insensitivity
    document.querySelectorAll(".listing-card").forEach(function (c) {
      // go through all listings
      var txt = c.textContent.toLowerCase();
      c.style.display = txt.includes(q) ? "flex" : "none"; //show cards based on match to search
    });
  });

  // category filter
  var categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.addEventListener("change", function () {
    var cat = this.value;
    document.querySelectorAll(".listing-card").forEach(function (card) {
      card.style.display = cat === "all" || card.dataset.category === cat ? "flex" : "none";
    });
  });
}
function initResources() {
  //initializes resource functions
  var STORAGE_KEY = 'resourceListings';
  var resourceModal = document.getElementById("resourceModal"); // add resource
  var borrowModal = document.getElementById("borrowModal"); // request borrow
  var successModal = document.getElementById("successModal"); // show success
  var createBtn = document.getElementById("createResourceBtn"); // open modal
  var resForm = document.getElementById("resourceForm");
  var borrowForm = document.getElementById("borrowForm");
  var categorySelect = document.getElementById("resourceCategory"); //dropdown menu
  var searchBtn = document.getElementById("searchBtn"); //search button
  var searchInput = document.getElementById("searchInput"); //input to search

  loadListings(STORAGE_KEY).forEach(addResource);
  function createCard(r) {
    //create DOM card for resource
    var card = document.createElement("div");
    card.className = "listing-card";
    card.dataset.category = r.category;
    card.innerHTML = "\n      <div class=\"listing-image\">\n        <img src=\"".concat(r.imageUrl || '/api/placeholder/300/200', "\" alt=\"").concat(r.title, "\">\n      </div>\n      <div class=\"listing-content\">\n        <span class=\"listing-category\">").concat(capitalize(r.category), "</span>\n        <h3>").concat(r.title, "</h3>\n        <p>").concat(r.description, "</p>\n        <div class=\"listing-meta\">\n          <span><i class=\"fas fa-map-marker-alt\"></i> ").concat(r.location, "</span>\n          <span><i class=\"fas fa-calendar\"></i> Currently Available</span>\n        </div>\n        <div class=\"resource-status available\">\n          <i class=\"fas fa-check-circle\"></i> Available Now\n        </div>\n        <button class=\"btn-small borrow-btn\">Request to Borrow</button>\n      </div>\n    ");
    return card;
  }
  function addResource(r) {
    var grid = document.querySelector(".listings-grid");
    var card = createCard(r);

    // add delete button for post
    var deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", function () {
      var all = loadListings(STORAGE_KEY);
      var remaining = all.filter(function (item) {
        return JSON.stringify(item) !== JSON.stringify(r);
      });
      saveListings(STORAGE_KEY, remaining);
      card.remove();
    });
    card.appendChild(deleteBtn);
    grid.appendChild(card);
  }

  // open/close modals
  createBtn.addEventListener("click", function () {
    return showModal(resourceModal);
  }); //open resource modal on click
  window.addEventListener("click", function (e) {
    if (e.target === resourceModal) hideModal(resourceModal);
    if (e.target === borrowModal) hideModal(borrowModal);
    if (e.target === successModal) hideModal(successModal);
  });

  // add resource form
  resForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var r = {
      //collect form data
      title: document.getElementById("resourceTitle").value,
      category: document.getElementById("resourceFormCategory").value,
      description: document.getElementById("resourceDescription").value,
      terms: document.getElementById("resourceTerms").value,
      location: document.getElementById("resourceLocation").value,
      contactName: document.getElementById("contactName").value,
      contactEmail: document.getElementById("contactEmail").value,
      contactPhone: document.getElementById("contactPhone").value || undefined,
      imageUrl: undefined
    };
    hideModal(resourceModal);
    addResource(r); // add to page
    var all = loadListings(STORAGE_KEY);
    all.push(r);
    saveListings(STORAGE_KEY, all);
    document.getElementById("successMessage").textContent = "Your item has been added to the resource library.";
    showModal(successModal);
    resForm.reset();
  });

  // interest form
  borrowForm.addEventListener("submit", function (e) {
    e.preventDefault();
    hideModal(borrowModal);
    document.getElementById("successMessage").textContent = "Your borrow request has been sent.";
    showModal(successModal);
    borrowForm.reset();
  });

  // filter/search resource
  categorySelect.addEventListener("change", function () {
    var cat = this.value;
    document.querySelectorAll(".listing-card").forEach(function (c) {
      c.style.display = cat === "all" || c.dataset.category === cat ? "flex" : "none";
    });
  });
  searchBtn.addEventListener("click", function () {
    var q = searchInput.value.toLowerCase();
    document.querySelectorAll(".listing-card").forEach(function (c) {
      var txt = c.textContent.toLowerCase();
      c.style.display = txt.includes(q) ? "flex" : "none";
    });
  });

  // open borrow modal when borrow button clicked
  document.querySelectorAll(".borrow-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var title = btn.closest(".listing-content").querySelector("h3").textContent;
      document.getElementById("borrowItemName").innerHTML = "Item: <strong>".concat(title, "</strong>");
      showModal(borrowModal);
    });
  });
}
function initServices() {
  //initializes services functions
  var STORAGE_KEY = 'serviceListings';
  var serviceModal = document.getElementById("serviceModal"); //create listing
  var contactModal = document.getElementById("contactModal"); //modal for contact form
  var successModal = document.getElementById("successModal"); //show success
  var createBtn = document.getElementById("createServiceBtn"); //open service modal
  var svcForm = document.getElementById("serviceForm"); //form to post
  var cntForm = document.getElementById("contactForm"); //contact form
  var categorySel = document.getElementById("serviceCategory"); //dropdown 
  var searchBtn = document.getElementById("searchBtn"); //search button
  var searchInput = document.getElementById("searchInput"); //input search

  loadListings(STORAGE_KEY).forEach(addService);
  function createCard(s) {
    // create DOM card for service
    var card = document.createElement("div");
    card.className = "listing-card";
    card.dataset.category = s.category;
    card.innerHTML = "\n      <div class=\"listing-image service-listing\">\n        <i class=\"fas fa-briefcase\"></i>\n      </div>\n      <div class=\"listing-content\">\n        <span class=\"listing-category\">".concat(capitalize(s.category), "</span>\n        <h3>").concat(s.title, "</h3>\n        <p><strong>Offering:</strong> ").concat(s.offering, "</p>\n        <p><strong>Seeking:</strong> ").concat(s.seeking, "</p>\n        <div class=\"listing-meta\">\n          <span><i class=\"fas fa-map-marker-alt\"></i> ").concat(s.location, "</span>\n          <span><i class=\"fas fa-calendar\"></i> Just now</span>\n        </div>\n        <button class=\"btn-small contact-btn\">I'm Interested</button>\n      </div>\n    "); // create card HTML
    return card;
  }
  function addService(s) {
    var grid = document.querySelector(".listings-grid");
    var card = createCard(s);

    // delete button for added posts
    var deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", function () {
      var all = loadListings(STORAGE_KEY);
      var remaining = all.filter(function (item) {
        return JSON.stringify(item) !== JSON.stringify(s);
      });
      saveListings(STORAGE_KEY, remaining);
      card.remove();
    });
    card.appendChild(deleteBtn);
    grid.appendChild(card);
  }
  createBtn.addEventListener("click", function () {
    return showModal(serviceModal);
  }); //open service modal
  window.addEventListener("click", function (e) {
    if (e.target === serviceModal) showModal(serviceModal); // keep open
    if (e.target === contactModal) hideModal(contactModal);
    if (e.target === successModal) hideModal(successModal);
  });

  // post new service
  svcForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var s = {
      //gather data
      title: document.getElementById("serviceTitle").value,
      category: document.getElementById("serviceFormCategory").value,
      offering: document.getElementById("serviceOffering").value,
      seeking: document.getElementById("serviceSeeking").value,
      location: document.getElementById("serviceLocation").value,
      contactName: document.getElementById("contactName").value,
      contactEmail: document.getElementById("contactEmail").value,
      contactPhone: document.getElementById("contactPhone").value || undefined
    };
    hideModal(serviceModal);
    addService(s);
    var all = loadListings(STORAGE_KEY);
    all.push(s);
    saveListings(STORAGE_KEY, all);
    document.getElementById("successMessage").textContent = "Your service exchange has been posted successfully.";
    showModal(successModal);
    svcForm.reset();
  });

  // interest form
  cntForm.addEventListener("submit", function (e) {
    e.preventDefault();
    hideModal(contactModal);
    document.getElementById("successMessage").textContent = "Your contact information has been sent to the service provider.";
    showModal(successModal);
    cntForm.reset();
  });

  // filter/search
  categorySel.addEventListener("change", function () {
    var cat = this.value;
    document.querySelectorAll(".listing-card").forEach(function (c) {
      c.style.display = cat === "all" || c.dataset.category === cat ? "flex" : "none";
    });
  });
  searchBtn.addEventListener("click", function () {
    var q = searchInput.value.toLowerCase();
    document.querySelectorAll(".listing-card").forEach(function (c) {
      var txt = c.textContent.toLowerCase();
      c.style.display = txt.includes(q) ? "flex" : "none";
    });
  });

  // show contact form when interest button clicked
  document.querySelectorAll(".contact-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var title = btn.closest(".listing-content").querySelector("h3").textContent;
      document.getElementById("contactServiceName").innerHTML = "Service: <strong>".concat(title, "</strong>");
      showModal(contactModal);
    });
  });
}
document.addEventListener("DOMContentLoaded", function () {
  //wait for DOM content to load
  var body = document.body;
  if (body.classList.contains("marketplace-page")) initMarketplace(); //intiializes features of page when on that page
  else if (body.classList.contains("resources-page")) initResources();else if (body.classList.contains("services-page")) initServices();
});