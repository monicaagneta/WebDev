document.addEventListener('DOMContentLoaded', function () {

    // Get all elements for js
    const elements = {
        addBookBtn: document.getElementById('add-book-btn'),
        bookModal: document.getElementById('book-modal'),
        detailModal: document.getElementById('detail-modal'),
        bookForm: document.getElementById('book-form'),
        mainShelf: document.getElementById('main-shelf'),
        searchInput: document.getElementById('search'),
        filterSelect: document.getElementById('filter'),
        closeButtons: document.querySelectorAll('.close-btn'),
        ratingStars: document.querySelectorAll('.rating-stars i'),
        bookCoverInput: document.getElementById('book-cover'),
        bookTitle: document.getElementById('book-title'),
        bookAuthor: document.getElementById('book-author'),
        bookGenre: document.getElementById('book-genre'),
        bookRating: document.getElementById('book-rating'),
        imageCitation: document.getElementById('book-image-citation')
    };

    // get library from localStorage or empty array
    let myLibrary = JSON.parse(localStorage.getItem('myLibrary')) || []; // skill stretch = local storage API for saving data through refreshes: https://www.w3schools.com/jsref/prop_win_localstorage.asp
    let currentBookId = null;

    // log loaded elements to console
    console.log("Elements loaded:", {
        addBookBtn: elements.addBookBtn,
        bookForm: elements.bookForm,
        mainShelf: elements.mainShelf
    });
    
   
    renderLibrary(); // render books
    setupEventListeners(); // set up event listeners

    function setupEventListeners() {
        // open modal when add book button is clicked
        if (elements.addBookBtn) {
            elements.addBookBtn.addEventListener('click', function() {
                console.log("Add book button clicked");
                openBookModal(); 
            });
        }
        
        // close modals when close button is clicked
        elements.closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                console.log("Close button clicked");
                closeModal();
            });
        });
        
        // close modals when clicking outside of feature
        window.addEventListener('click', function(e) {
            if (e.target === elements.bookModal || e.target === elements.detailModal) {
                closeModal();
            }
        });
        
        // register star rating clicks
        elements.ratingStars.forEach(star => {
            star.addEventListener('click', handleRating);
        });
        
        // preview book cover image when file is selected
        if (elements.bookCoverInput) {
            elements.bookCoverInput.addEventListener('change', previewCover);
        }
        
        // form submission to save book
        if (elements.bookForm) {
            elements.bookForm.addEventListener('submit', function(e) {
                console.log("Form submitted");
                saveBook(e);
            });
        }
        
        // search input
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', renderLibrary);
        }
        
        if (elements.filterSelect) {
            elements.filterSelect.addEventListener('change', renderLibrary);
        }
        
        // edit and delete buttons for book
        const editBtn = document.querySelector('.edit-btn');
        const deleteBtn = document.querySelector('.delete-btn');
        
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                prepareBookForEdit(currentBookId); // edit book data
                closeModal();
                openBookModal();
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                deleteBook(currentBookId); // delete current book
                closeModal();
            });
        }
    }

    function openBookModal() { // resets form to add new book
        resetForm();
        if (elements.bookModal) {
            elements.bookModal.style.display = 'block';
        }
    }

    function closeModal() {
        if (elements.bookModal) elements.bookModal.style.display = 'none';
        if (elements.detailModal) elements.detailModal.style.display = 'none';
        resetForm(); 
    }
    

    function handleRating(event) {
        const rating = event.target.dataset.rating; // get star rating value
        if (elements.bookRating) {
            elements.bookRating.value = rating; //update rating
        }
        elements.ratingStars.forEach(star => {
            star.classList.toggle('active', star.dataset.rating <= rating);
        });
    }

    function previewCover(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const coverPreview = document.querySelector('.cover-preview');
            if (coverPreview) {
                coverPreview.innerHTML = `<img src="${e.target.result}" alt="Book Cover">`;
            }
        };
        reader.readAsDataURL(file);
    }

    function saveBook(event) { //save new or edited book
        event.preventDefault();
        console.log("Saving book...");
        
        // form values
        const title = elements.bookTitle.value;
        const author = elements.bookAuthor.value;
        const genre = elements.bookGenre.value;
        const rating = elements.bookRating.value;
        const coverImg = document.querySelector('.cover-preview img');
        const coverSrc = coverImg ? coverImg.src : '';
        const citation = elements.imageCitation ? elements.imageCitation.value : '';
        
        console.log("Book data:", { title, author, genre, rating, hasCover: !!coverSrc });
        
        const bookData = {
            id: currentBookId || Date.now(),
            title: title,
            author: author,
            genre: genre,
            rating: rating,
            cover: coverSrc,
            citation: citation,
            dateAdded: new Date().toISOString()
        };
        
        if (currentBookId) {
            updateBook(bookData);
        } else {
            myLibrary.push(bookData);
        }
        
        // save locally
        localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
        
    
        resetForm();
        closeModal();
        renderLibrary();
    }

    function updateBook(updatedBook) { //update existing book
        const index = myLibrary.findIndex(book => book.id === currentBookId);
        if (index !== -1) {
            myLibrary[index] = { ...myLibrary[index], ...updatedBook };
        }
    }

    function deleteBook(bookId) { //delete book
        myLibrary = myLibrary.filter(book => book.id !== bookId);
        localStorage.setItem('myLibrary', JSON.stringify(myLibrary)); // skill stretch = local storage API for saving data through refreshes: https://www.w3schools.com/jsref/prop_win_localstorage.asp
        renderLibrary();
    }

    function prepareBookForEdit(bookId) { // editing book details
        const book = myLibrary.find(book => book.id === bookId);
        if (!book) return;
        
        elements.bookTitle.value = book.title; // set form with current data
        elements.bookAuthor.value = book.author;
        elements.bookGenre.value = book.genre;
        elements.bookRating.value = book.rating;
        if (elements.imageCitation) {
            elements.imageCitation.value = book.citation || '';
        }
        
        // set rating
        elements.ratingStars.forEach(star => {
            star.classList.toggle('active', star.dataset.rating <= book.rating);
        });
        
        // show book cover
        if (book.cover) {
            document.querySelector('.cover-preview').innerHTML = `<img src="${book.cover}" alt="Book Cover">`;
        }
        
        currentBookId = bookId;
    }

    function renderLibrary() { // load library
        if (!elements.mainShelf) {
            console.error("Main shelf element not found");
            return;
        }
        
        elements.mainShelf.innerHTML = '';
        
        const searchValue = elements.searchInput ? elements.searchInput.value.toLowerCase() : '';
        const genreFilter = elements.filterSelect ? elements.filterSelect.value : 'all';
        
        console.log("Rendering library with:", { 
            booksCount: myLibrary.length,
            searchValue,
            genreFilter 
        });
        
        const filteredBooks = myLibrary.filter(book => // filter books
            (book.title.toLowerCase().includes(searchValue) || 
            book.author.toLowerCase().includes(searchValue)) &&
            (genreFilter === 'all' || book.genre === genreFilter)
        );
        
        if (filteredBooks.length) {
            filteredBooks.forEach(renderBook);
        } else {
            displayEmptyMessage();
        }
    }

    function renderBook(book) { // render books on shelf
        console.log("Rendering book:", book.title);
        
        const bookElement = document.createElement('div');
        bookElement.className = 'book';
        bookElement.style.backgroundColor = getBookColor(book.genre);
        
        // maintain book size
        bookElement.style.width = '45px';
        bookElement.style.minWidth = '45px';
        bookElement.style.maxWidth = '45px';
        
        bookElement.innerHTML = `<div class='book-title'>${book.title}</div>`;
        bookElement.addEventListener('click', () => showBookDetails(book));
        elements.mainShelf.appendChild(bookElement);
    }

    function displayEmptyMessage() { // message if library empty
        elements.mainShelf.innerHTML = `
            <p style="color: var(--light-text); font-style: italic; text-align: center; width: 100%;">
                ${myLibrary.length ? 'No books match your search.' : 'Your bookshelf is currently empty'}
            </p>`;
    }

    function showBookDetails(book) { // present book details
        currentBookId = book.id;
        
        const detailTitle = document.getElementById('detail-title');
        const detailAuthor = document.getElementById('detail-author');
        const detailGenre = document.getElementById('detail-genre');
        const detailCover = document.getElementById('detail-cover');
        const detailCitation = document.getElementById('detail-citation');
        const detailRating = document.querySelector('.detail-rating');
        
        if (detailTitle) detailTitle.textContent = book.title;
        if (detailAuthor) detailAuthor.textContent = book.author;
        if (detailGenre) detailGenre.textContent = book.genre;
        
        if (detailCover) {
            detailCover.src = book.cover || '';
            detailCover.style.display = book.cover ? 'block' : 'none';
        }
        
        if (detailCitation) {
            detailCitation.textContent = book.citation || '';
        }
        
        // Display stars for rating
        if (detailRating) {
            detailRating.innerHTML = '';
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('i');
                star.className = `fas fa-star ${i <= book.rating ? 'active' : ''}`;
                detailRating.appendChild(star);
            }
        }
        
        if (elements.detailModal) {
            elements.detailModal.style.display = 'block';
        }
    }

    function resetForm() { // reset all form fields
        if (elements.bookForm) elements.bookForm.reset();
        
        const coverPreview = document.querySelector('.cover-preview');
        if (coverPreview) coverPreview.innerHTML = '';
        
        if (elements.bookRating) elements.bookRating.value = 0;
        
        elements.ratingStars.forEach(star => {
            star.classList.remove('active');
        });
        
        currentBookId = null;
    }

    function getBookColor(genre) { // diff colors for diff genres
        const colors = {
            'fiction': '#f5b0cb', 
            'non-fiction': '#a5d8e6', 
            'fantasy': '#c792ea', 
            'romance': '#ff9a9e'
        };
        return colors[genre] || '#f8d7e8';
    }
});