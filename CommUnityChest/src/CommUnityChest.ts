/*
 * Connections between TypeScript and HTML:
 * - Interfaces form field IDs and data-attributes
 * - initializers attaches to buttons, forms, and modals of each listing page
 * - Event listeners correspond to user interactions defined by classes/IDs in HTML
 * - DOM manipulation functions update the .listings-grid container in HTML.
 */

// helper functions for local storage
function loadListings<T>(key: string): T[] {
  const json = localStorage.getItem(key);
  return json ? JSON.parse(json) as T[] : [];
}

function saveListings<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

interface ListingPayload { // Data Type Declarations
  title: string;
  category: string;
  description: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  imageUrl?: string;
}
interface ResourcePayload extends ListingPayload { //extension specific for resources
  terms: string;
}
interface ServicePayload { //specific to services
  title: string;
  category: string;
  offering: string;
  seeking: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
}

// demonstrate use of functions
function capitalize(s: string) { //returns capitalized string
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function showModal(modal: HTMLElement)   { modal.style.display = "block"; } //display modal
function hideModal(modal: HTMLElement)   { modal.style.display = "none"; }

// make modals close when "x" button clicked = Event Driven Behaviors
document.querySelectorAll<HTMLElement>('.modal .close, .close-success-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // find the parent .modal of whatever button was clicked
    const modal = btn.closest('.modal') as HTMLElement | null;
    if (modal) hideModal(modal);
  });
});

function initMarketplace() { //initializes for marketplace functions
  const STORAGE_KEY   = 'marketplaceListings';
  const listingModal = document.getElementById("listingModal")! as HTMLElement; //create new
  const successModal = document.getElementById("successModal")! as HTMLElement; //show successful
  const createBtn    = document.getElementById("createListingBtn")! as HTMLButtonElement; //open listing modal
  const form         = document.getElementById("listingForm")! as HTMLFormElement; 
  const searchBtn    = document.getElementById("searchBtn")! as HTMLButtonElement; //button for search
  const searchInput  = document.getElementById("searchInput")! as HTMLInputElement; //input field for search

  loadListings<ListingPayload>(STORAGE_KEY).forEach(addListing); // show persisted listings

  function createCard(data: ListingPayload) { //creates DOM card for listing
    const card = document.createElement("div");
    card.className = "listing-card";
    card.dataset.category = data.category;
    card.innerHTML = `
      <div class="listing-image">
        <img src="${data.imageUrl||'/api/placeholder/300/200'}" alt="${data.title}">
      </div>
      <div class="listing-content">
        <span class="listing-category">${capitalize(data.category)}</span>
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <div class="listing-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${data.location}</span>
          <span><i class="fas fa-calendar"></i> Just now</span>
        </div>
        <button class="btn-small contact-btn">I'm Interested</button>
      </div>
    `; // creates card with listing details and interest button
    return card;
  }
  function addListing(data: ListingPayload) {
    const grid = document.querySelector(".listings-grid")! as HTMLElement;
    const card = createCard(data);
  
    // add delete button to new posts
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";         
    deleteBtn.classList.add("delete-btn");   
    
    deleteBtn.addEventListener("click", () => {
      // load current array
      const all = loadListings<ListingPayload>(STORAGE_KEY);
      const remaining = all.filter(item =>
        JSON.stringify(item) !== JSON.stringify(data)
      );
      saveListings<ListingPayload>(STORAGE_KEY, remaining);
      // remove post from page
      card.remove();
    });

    card.appendChild(deleteBtn);
    grid.appendChild(card);
  }
  
  // modal open/close + submit
  createBtn.addEventListener("click", () => showModal(listingModal));
  form.addEventListener("submit", e => { // handle for new listing
    e.preventDefault();
    const d: ListingPayload = { // gather form data
      title:        (document.getElementById("itemTitle")       as HTMLInputElement).value,
      category:     (document.getElementById("itemCategory")    as HTMLSelectElement).value,
      description:  (document.getElementById("itemDescription") as HTMLTextAreaElement).value,
      location:     (document.getElementById("itemLocation")    as HTMLInputElement).value,
      contactName:  (document.getElementById("contactName")     as HTMLInputElement).value,
      contactEmail: (document.getElementById("contactEmail")    as HTMLInputElement).value,
      contactPhone: (document.getElementById("contactPhone")    as HTMLInputElement).value || undefined,
      imageUrl:     undefined
    };
    hideModal(listingModal); // close listing modal after submission
    addListing(d); // add listing to page
    const all = loadListings<ListingPayload>(STORAGE_KEY); // add to local storage
    all.push(d);
    saveListings<ListingPayload>(STORAGE_KEY, all);
    (document.getElementById("successMessage")!).textContent = "Your listing has been posted successfully.";
    showModal(successModal); // show success
    form.reset();
  });

  // search/filter = demonstrate logical structures and operators
  searchBtn.addEventListener("click", () => { // search button click
    const q = searchInput.value.toLowerCase(); // for case insensitivity
    document.querySelectorAll<HTMLDivElement>(".listing-card").forEach(c => { // go through all listings
      const txt = c.textContent!.toLowerCase();
      c.style.display = txt.includes(q) ? "flex" : "none"; //show cards based on match to search
    });
  });

  
  // category filter
const categoryFilter = document.getElementById("categoryFilter")! as HTMLSelectElement;
categoryFilter.addEventListener("change", function() {
  const cat = this.value;
  document.querySelectorAll<HTMLDivElement>(".listing-card").forEach(card => {
    card.style.display = (cat === "all" || card.dataset.category === cat)
      ? "flex"
      : "none";
  });
});
}

function initResources() { //initializes resource functions
  const STORAGE_KEY    = 'resourceListings';
  const resourceModal  = document.getElementById("resourceModal")! as HTMLElement; // add resource
  const borrowModal    = document.getElementById("borrowModal")! as HTMLElement; // request borrow
  const successModal   = document.getElementById("successModal")! as HTMLElement; // show success
  const createBtn      = document.getElementById("createResourceBtn")! as HTMLButtonElement; // open modal
  const resForm        = document.getElementById("resourceForm")! as HTMLFormElement; 
  const borrowForm     = document.getElementById("borrowForm")! as HTMLFormElement;
  const categorySelect = document.getElementById("resourceCategory")! as HTMLSelectElement; //dropdown menu
  const searchBtn      = document.getElementById("searchBtn")! as HTMLButtonElement; //search button
  const searchInput    = document.getElementById("searchInput")! as HTMLInputElement; //input to search

  loadListings<ResourcePayload>(STORAGE_KEY).forEach(addResource);

  function createCard(r: ResourcePayload) { //create DOM card for resource
    const card = document.createElement("div");
    card.className = "listing-card";
    card.dataset.category = r.category;
    card.innerHTML = `
      <div class="listing-image">
        <img src="${r.imageUrl||'/api/placeholder/300/200'}" alt="${r.title}">
      </div>
      <div class="listing-content">
        <span class="listing-category">${capitalize(r.category)}</span>
        <h3>${r.title}</h3>
        <p>${r.description}</p>
        <div class="listing-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${r.location}</span>
          <span><i class="fas fa-calendar"></i> Currently Available</span>
        </div>
        <div class="resource-status available">
          <i class="fas fa-check-circle"></i> Available Now
        </div>
        <button class="btn-small borrow-btn">Request to Borrow</button>
      </div>
    `;
    return card;
  }
  function addResource(r: ResourcePayload) {
    const grid = document.querySelector(".listings-grid")! as HTMLElement;
    const card = createCard(r);

    // add delete button for post
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => {
      const all = loadListings<ResourcePayload>(STORAGE_KEY);
      const remaining = all.filter(item => JSON.stringify(item) !== JSON.stringify(r));
      saveListings<ResourcePayload>(STORAGE_KEY, remaining);
      card.remove();
    });

    card.appendChild(deleteBtn);
    grid.appendChild(card);
  }

  // open/close modals
  createBtn.addEventListener("click", () => showModal(resourceModal)); //open resource modal on click
  window.addEventListener("click", e => {
    if (e.target === resourceModal) hideModal(resourceModal);
    if (e.target === borrowModal)   hideModal(borrowModal);
    if (e.target === successModal)  hideModal(successModal);
  });

  // add resource form
  resForm.addEventListener("submit", e => {
    e.preventDefault();
    const r: ResourcePayload = { //collect form data
      title:        (document.getElementById("resourceTitle")    as HTMLInputElement).value,
      category:     (document.getElementById("resourceFormCategory") as HTMLSelectElement).value,
      description:  (document.getElementById("resourceDescription")  as HTMLTextAreaElement).value,
      terms:        (document.getElementById("resourceTerms")       as HTMLTextAreaElement).value,
      location:     (document.getElementById("resourceLocation")    as HTMLInputElement).value,
      contactName:  (document.getElementById("contactName")         as HTMLInputElement).value,
      contactEmail: (document.getElementById("contactEmail")        as HTMLInputElement).value,
      contactPhone: (document.getElementById("contactPhone")        as HTMLInputElement).value || undefined,
      imageUrl:     undefined
    };
    hideModal(resourceModal);
    addResource(r); // add to page
    const all = loadListings<ResourcePayload>(STORAGE_KEY);
    all.push(r);
    saveListings<ResourcePayload>(STORAGE_KEY, all);
    (document.getElementById("successMessage")!).textContent = "Your item has been added to the resource library.";
    showModal(successModal);
    resForm.reset();
  });

  // interest form
  borrowForm.addEventListener("submit", e => {
    e.preventDefault();
    hideModal(borrowModal);
    (document.getElementById("successMessage")!).textContent = "Your borrow request has been sent.";
    showModal(successModal);
    borrowForm.reset();
  });

  // filter/search resource
  categorySelect.addEventListener("change", function() {
    const cat = this.value;
    document.querySelectorAll<HTMLDivElement>(".listing-card").forEach(c => {
      c.style.display = (cat === "all" || c.dataset.category === cat) ? "flex" : "none";
    });
  });
  searchBtn.addEventListener("click", () => {
    const q = searchInput.value.toLowerCase();
    document.querySelectorAll<HTMLDivElement>(".listing-card").forEach(c => {
      const txt = c.textContent!.toLowerCase();
      c.style.display = txt.includes(q) ? "flex" : "none";
    });
  });

  // open borrow modal when borrow button clicked
document.querySelectorAll<HTMLButtonElement>(".borrow-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const title = btn.closest(".listing-content")!
                     .querySelector("h3")!.textContent!;
    document.getElementById("borrowItemName")!
           .innerHTML = `Item: <strong>${title}</strong>`;
    showModal(borrowModal);
  });
});
}

function initServices() { //initializes services functions
  const STORAGE_KEY   = 'serviceListings';
  const serviceModal = document.getElementById("serviceModal")! as HTMLElement; //create listing
  const contactModal = document.getElementById("contactModal")! as HTMLElement; //modal for contact form
  const successModal = document.getElementById("successModal")! as HTMLElement; //show success
  const createBtn    = document.getElementById("createServiceBtn")! as HTMLButtonElement; //open service modal
  const svcForm      = document.getElementById("serviceForm")! as HTMLFormElement; //form to post
  const cntForm      = document.getElementById("contactForm")! as HTMLFormElement; //contact form
  const categorySel  = document.getElementById("serviceCategory")! as HTMLSelectElement; //dropdown 
  const searchBtn    = document.getElementById("searchBtn")! as HTMLButtonElement; //search button
  const searchInput  = document.getElementById("searchInput")! as HTMLInputElement; //input search

  loadListings<ServicePayload>(STORAGE_KEY).forEach(addService);

  function createCard(s: ServicePayload) { // create DOM card for service
    const card = document.createElement("div");
    card.className = "listing-card";
    card.dataset.category = s.category;
    card.innerHTML = `
      <div class="listing-image service-listing">
        <i class="fas fa-briefcase"></i>
      </div>
      <div class="listing-content">
        <span class="listing-category">${capitalize(s.category)}</span>
        <h3>${s.title}</h3>
        <p><strong>Offering:</strong> ${s.offering}</p>
        <p><strong>Seeking:</strong> ${s.seeking}</p>
        <div class="listing-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${s.location}</span>
          <span><i class="fas fa-calendar"></i> Just now</span>
        </div>
        <button class="btn-small contact-btn">I'm Interested</button>
      </div>
    `; // create card HTML
    return card;
  }
  function addService(s: ServicePayload) {
    const grid = document.querySelector(".listings-grid")! as HTMLElement;
    const card = createCard(s);

    // delete button for added posts
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => {
      const all = loadListings<ServicePayload>(STORAGE_KEY);
      const remaining = all.filter(item => JSON.stringify(item) !== JSON.stringify(s));
      saveListings<ServicePayload>(STORAGE_KEY, remaining);
      card.remove();
    });

    card.appendChild(deleteBtn);
    grid.appendChild(card);
  }

  createBtn.addEventListener("click", () => showModal(serviceModal)); //open service modal
  window.addEventListener("click", e => {
    if (e.target === serviceModal) showModal(serviceModal); // keep open
    if (e.target === contactModal) hideModal(contactModal);
    if (e.target === successModal) hideModal(successModal);
  });

  // post new service
  svcForm.addEventListener("submit", e => {
    e.preventDefault();
    const s: ServicePayload = { //gather data
      title:        (document.getElementById("serviceTitle")       as HTMLInputElement).value,
      category:     (document.getElementById("serviceFormCategory") as HTMLSelectElement).value,
      offering:     (document.getElementById("serviceOffering")    as HTMLTextAreaElement).value,
      seeking:      (document.getElementById("serviceSeeking")     as HTMLTextAreaElement).value,
      location:     (document.getElementById("serviceLocation")    as HTMLInputElement).value,
      contactName:  (document.getElementById("contactName")        as HTMLInputElement).value,
      contactEmail: (document.getElementById("contactEmail")       as HTMLInputElement).value,
      contactPhone: (document.getElementById("contactPhone")       as HTMLInputElement).value || undefined
    };
    hideModal(serviceModal);
    addService(s);
    const all = loadListings<ServicePayload>(STORAGE_KEY);
    all.push(s);
    saveListings<ServicePayload>(STORAGE_KEY, all);
    (document.getElementById("successMessage")!).textContent = "Your service exchange has been posted successfully.";
    showModal(successModal);
    svcForm.reset();
  });

  // interest form
  cntForm.addEventListener("submit", e => {
    e.preventDefault();
    hideModal(contactModal);
    (document.getElementById("successMessage")!).textContent = "Your contact information has been sent to the service provider.";
    showModal(successModal);
    cntForm.reset();
  });

  // filter/search
  categorySel.addEventListener("change", function() {
    const cat = this.value;
    document.querySelectorAll<HTMLDivElement>(".listing-card").forEach(c => {
      c.style.display = (cat === "all" || c.dataset.category === cat) ? "flex" : "none";
    });
  });
  searchBtn.addEventListener("click", () => {
    const q = searchInput.value.toLowerCase();
    document.querySelectorAll<HTMLDivElement>(".listing-card").forEach(c => {
      const txt = c.textContent!.toLowerCase();
      c.style.display = txt.includes(q) ? "flex" : "none";
    });
  });

  // show contact form when interest button clicked
  document.querySelectorAll<HTMLButtonElement>(".contact-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const title = (btn.closest(".listing-content")!.querySelector("h3")!).textContent!;
      document.getElementById("contactServiceName")!.innerHTML = `Service: <strong>${title}</strong>`;
      showModal(contactModal);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => { //wait for DOM content to load
  const body = document.body;
  if (body.classList.contains("marketplace-page")) initMarketplace(); //intiializes features of page when on that page
  else if (body.classList.contains("resources-page")) initResources();
  else if (body.classList.contains("services-page"))  initServices();
});