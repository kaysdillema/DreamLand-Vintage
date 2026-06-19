document.addEventListener("DOMContentLoaded", () => {
    // --- 1. CORE DOM SELECTIONS ---
    const menButton = document.querySelector(".MenOption");
    const womenButton = document.querySelector(".WomenOption");
    const sizeSelect = document.getElementById("sizeFilter");
    const priceSelect = document.getElementById("priceSort");
    const productGrid = document.getElementById("productGrid");
    
    // Save backup copies of the store grid layout cards
    const originalOrder = Array.from(document.querySelectorAll(".ItemCard"));
    let itemCards = [...originalOrder];
    let activeGender = null;

    // --- 2. GRID FILTERING & SORTING ENGINE ---
    function applyFilters() {
        const selectedSize = sizeSelect ? sizeSelect.value : "all";
        originalOrder.forEach(card => {
            const cardGender = card.getAttribute("data-category");
            const cardSize = card.getAttribute("data-size");
            const matchesGender = !activeGender || cardGender === activeGender;
            const matchesSize = selectedSize === "all" || cardSize === selectedSize;

            if (matchesGender && matchesSize) {
                card.classList.remove("hide");
            } else {
                card.classList.add("hide");
            }
        });
    }

    function applySorting() {
        if (!priceSelect || !productGrid) return;
        const sortValue = priceSelect.value;
        if (sortValue === "default") {
            originalOrder.forEach(card => productGrid.appendChild(card));
            return;
        }
        itemCards.sort((a, b) => {
            const priceA = parseFloat(a.getAttribute("data-price"));
            const priceB = parseFloat(b.getAttribute("data-price"));
            return sortValue === "low-high" ? priceA - priceB : priceB - priceA;
        });
        itemCards.forEach(card => productGrid.appendChild(card));
    }

    function handleGenderClick(gender, button) {
        if (activeGender === gender) {
            activeGender = null;
            if (button) button.classList.remove("active-filter");
        } else {
            if (menButton) menButton.classList.remove("active-filter");
            if (womenButton) womenButton.classList.remove("active-filter");
            activeGender = gender;
            if (button) button.classList.add("active-filter");
        }
        applyFilters();
    }

    if (menButton) menButton.addEventListener("click", () => handleGenderClick("Mens", menButton));
    if (womenButton) womenButton.addEventListener("click", () => handleGenderClick("Womens", womenButton));
    if (sizeSelect) sizeSelect.addEventListener("change", applyFilters);
    if (priceSelect) priceSelect.addEventListener("change", applySorting);

    // --- 3. SHOPPING CART ENGINE SYSTEM  ---
    const cartContainer = document.querySelector(".CartContentcontainer");
    const cartTotalDisplay = document.querySelector(".totalrow h3:last-child");
    const emptyCartBtn = document.querySelector(".cartactions .secondary");

    // Function to save the current cart state into the computer memory
    function saveCartToStorage() {
        if (!cartContainer) return;
        // Collect all items currently sitting in the cart html structure
        const cartItems = document.querySelectorAll(".CartContent");
        let cartData = [];

        cartItems.forEach(item => {
            const img = item.querySelector("img").src;
            const title = item.querySelector("h3").innerText;
            const desc = item.querySelector("p").innerHTML;
            const price = item.querySelector(".price").innerText;

            cartData.push({ img, title, desc, price });
        });

        // Convert the array into text string format and into the localStorage
        localStorage.setItem("dreamlandCart", JSON.stringify(cartData));
    }

    // function to extract saved items out of computer memory and rebuild the HTML
    function loadCartFromStorage() {
        if (!cartContainer) return;
        const savedCart = localStorage.getItem("dreamlandCart");
        
        if (savedCart) {
            const cartData = JSON.parse(savedCart);
            cartContainer.innerHTML = ""; // Clear existing empty placeholders

            cartData.forEach(item => {
                const markup = `
                    <div class="CartContent">
                        <img src="${item.img}" alt="${item.title}">
                        <div class="itemdetails">
                            <h3>${item.title}</h3>
                            <p>${item.desc}</p>
                            <span class="price">${item.price}</span>
                        </div>
                        <button class="remove">&times;</button>
                    </div>
                `;
                cartContainer.insertAdjacentHTML("beforeend", markup);
            });
        }
        calculateCartTotal();
    }

    function calculateCartTotal() {
        if (!cartTotalDisplay) return;
        const cartItems = document.querySelectorAll(".CartContent");
        let total = 0;

        cartItems.forEach(item => {
            const priceSpan = item.querySelector(".price");
            if (priceSpan) {
                const priceValue = parseFloat(priceSpan.innerText.replace(/[^\d.]/g, ""));
                if (!isNaN(priceValue)) total += priceValue;
            }
        });
        cartTotalDisplay.innerText = `R${total}`;
    }

    // Handles removal mechanics
    if (cartContainer) {
        cartContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("remove")) {
                const itemRow = e.target.closest(".CartContent");
                if (itemRow) {
                    itemRow.remove();
                    calculateCartTotal();
                    saveCartToStorage(); // Save updated state after removal
                }
            }
        });
    }

    // Completely wipes out the list elements inside panel wrapper
    if (emptyCartBtn) {
        emptyCartBtn.addEventListener("click", () => {
            if (cartContainer) {
                cartContainer.innerHTML = "";
                calculateCartTotal();
                saveCartToStorage(); // Save empty array state
            }
        });
    }

    // --- 4. DETAIL PRODUCT MODAL & INJECTION BACKBONE ---
    const modal = document.getElementById("productModal");
    const closeModalBtn = document.querySelector(".close-modal");
    const modalAddToCartBtn = document.getElementById("modalAddToCartBtn");
    
    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalCategory = document.getElementById("modalCategory");
    const modalSize = document.getElementById("modalSize");
    const modalPrice = document.getElementById("modalPrice");
    const modalDetails = document.getElementById("modalDetails");

    let activeModalData = null; 

    originalOrder.forEach(card => {
        const productImg = card.querySelector("img");
        if (productImg) {
            productImg.style.cursor = "pointer";
            productImg.addEventListener("click", () => {
                const imgSource = productImg.src;
                const titleText = card.querySelector("h3") ? card.querySelector("h3").innerText : "Product Title";
                const categoryText = card.getAttribute("data-category") || "Vintage";
                
                const pElements = card.querySelectorAll(".ItemInfo p");
                const sizeText = pElements.length > 1 ? pElements[1].innerText : "Size: N/A";
                const priceText = card.querySelector(".price") ? card.querySelector(".price").innerText : "R0";
                const fullDescription = card.getAttribute("data-description") || "Hand-selected authentic vintage wear curated by DreamLand Vintage.";

                activeModalData = { imgSource, titleText, categoryText, sizeText, priceText };

                modalImg.src = imgSource;
                modalTitle.innerText = titleText;
                modalCategory.innerText = categoryText;
                modalSize.innerText = sizeText;
                modalPrice.innerText = priceText;
                modalDetails.innerText = fullDescription;

                modal.classList.add("open");
            });
        }
    });

    // Injects new markup data variables onto checkout sidebar wrapper list
    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener("click", () => {
            if (activeModalData && cartContainer) {
                const newCartItemMarkup = `
                    <div class="CartContent">
                        <img src="${activeModalData.imgSource}" alt="${activeModalData.titleText}">
                        <div class="itemdetails">
                            <h3>${activeModalData.titleText}</h3>
                            <p><em>${activeModalData.categoryText}</em> | <em>${activeModalData.sizeText}</em></p>
                            <span class="price">${activeModalData.priceText}</span>
                        </div>
                        <button class="remove">&times;</button>
                    </div>
                `;
                
                cartContainer.insertAdjacentHTML("beforeend", newCartItemMarkup);
                
                calculateCartTotal();
                saveCartToStorage(); // Save item instantly to browser memory
                modal.classList.remove("open");
                
                // Open side cart panel automatically
                window.location.hash = "cart-popup";
            }
        });
    }

    if (closeModalBtn) closeModalBtn.addEventListener("click", () => modal.classList.remove("open"));
    if (modal) {
        modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");});}
    
    // --- 5. INITIALIZE PAGE LOADING BY READING STORAGE CACHE ---//
    loadCartFromStorage();});

        // --- 6. GENERAL CONTACT MESSAGE VALIDATION & EMAIL COMPILER ENGINE ---
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Stop raw website link loading actions

            // Select node form fields
            const nameField = document.getElementById("clientName");
            const emailField = document.getElementById("clientEmail");
            const typeField = document.getElementById("messageType");
            const messageField = document.getElementById("clientMessage");

            let isFormValid = true;

            // Helper evaluation logic that toggles warning flags
            function checkField(field, condition) {
                const parent = field.closest(".form-group");
                if (condition) {
                    parent.classList.remove("invalid");
                } else {
                    parent.classList.add("invalid");
                    isFormValid = false;
                }
            }

            // 1. Name Check
            checkField(nameField, nameField.value.trim() !== "");

            // 2. Email Check
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            checkField(emailField, emailPattern.test(emailField.value.trim()));

            // 3. Dropdown Check
            checkField(typeField, typeField.value !== "");

            // 4. Message Area Check
            checkField(messageField, messageField.value.trim() !== "");

            // Stop calculation workflow here if checks register an invalid value
            if (!isFormValid) return;

            // Compile the form information into standard encoded email parameters
            const businessRecipient = "DreamLandVintage@gmail.com";
            const emailSubject = encodeURIComponent(`[${typeField.value}] New Message from Website`);
            
            // Build the body paragraph text block
            const emailBody = encodeURIComponent(
                `Customer Name: ${nameField.value.trim()}\n` +
                `Customer Contact Email: ${emailField.value.trim()}\n` +
                `Category: ${typeField.value}\n\n` +
                `Message Detail:\n${messageField.value.trim()}`
            );

            
            window.location.href = `mailto:${businessRecipient}?subject=${emailSubject}&body=${emailBody}`;
            
            // This wipes out fields cleanly after launching the email process
            contactForm.reset();
        });
    }

    // --- 7. REVIEWS STAR RATING FILTER ENGINE ---
    const starButtons = document.querySelectorAll(".ItemNavigations .stars");
    const reviewCards = document.querySelectorAll(".ReviewList .ReviewCard");

    if (starButtons.length > 0 && reviewCards.length > 0) {
        starButtons.forEach(button => {
            button.addEventListener("click", () => {
                // 1. Strip the styling off all buttons
                starButtons.forEach(btn => btn.classList.remove("active-filter"));
                
                // 2. Lock the color directly onto the clicked button node
                button.classList.add("active-filter");

                const targetStars = button.getAttribute("data-stars");

                // 3. Re-evaluate grid list visibility states
                reviewCards.forEach(card => {
                    const cardRating = card.getAttribute("data-rating");

                    if (targetStars === "all" || cardRating === targetStars) {
                        card.classList.remove("hide");
                    } else {
                        card.classList.add("hide");
                    }
                });
            });
        });
    }

        // --- 8. DYNAMIC HOME STOREFRONT ENQUIRY ENGINE ---
    const homeEnquiryForm = document.getElementById("homeEnquiryForm");

    if (homeEnquiryForm) {
        homeEnquiryForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const nameInput = document.getElementById("enquiryName");
            const purposeInput = document.getElementById("enquiryPurpose");
            const detailsInput = document.getElementById("enquiryDetails");

            const feedbackBox = document.getElementById("enquiryFeedbackBox");
            const headlineOutput = document.getElementById("feedbackHeadline");
            const textOutput = document.getElementById("feedbackSummaryText");
            const costBadgeOutput = document.getElementById("feedbackCostBadge");

            let isEnquiryValid = true;

            // Evaluation Pipeline Checks
            function validateField(nodeElement) {
                const formGroup = nodeElement.closest(".enquiry-group");
                if (nodeElement.value.trim() !== "") {
                    formGroup.classList.remove("invalid");
                } else {
                    formGroup.classList.add("invalid");
                    isEnquiryValid = false;
                }
            }

            validateField(nameInput);
            validateField(purposeInput);
            validateField(detailsInput);

            // Exit early if input parameters fail boundary requirements
            if (!isEnquiryValid) return;

            const clientName = nameInput.value.trim();
            const choice = purposeInput.value;

            // Dynamic Context Switch Logic processing simulation algorithms
            let calculatedHeadline = "";
            let calculatedDescription = "";
            let displayCostText = "";

            if (choice === "Sourcing") {
                calculatedHeadline = `🎉 ASSESSMENT CREATED FOR ${clientName.toUpperCase()}`;
                calculatedDescription = `Thank you for your request. A search through local Cape Town collections in order to locate your specific retro items will be done. Processing slots take 3-5 business days.`;
                displayCostText = "R550 Sourcing Deposit";
            } else if (choice === "Sponsor") {
                calculatedHeadline = `🤝 PROPOSAL REGISTERED: ${clientName.toUpperCase()}`;
                calculatedDescription = `Excellent! DreamLand Vintage actively partners with local sustainable organizations and creators. Your collaboration brief notes have been packaged for review by our team. No upfront application cost applies.`;
                displayCostText = "R0 (Free Application)";
            } else if (choice === "Wholesale") {
                calculatedHeadline = `📦 WHOLESALE INVENTORY PROFILE SUMMARY: ${clientName.toUpperCase()}`;
                calculatedDescription = `Bulk inventory processing approved for evaluation. Your requests qualify for tiered bulk rate distributions. Our catalog managers will dispatch our active wholesale price breakdown catalog indices to your email link.`;
                displayCostText = "R2500 Minimum Order Limit";
            }

            // Populate text parameters inside the response box and fade open visually
            headlineOutput.innerText = calculatedHeadline;
            textOutput.innerText = calculatedDescription;
            costBadgeOutput.innerText = displayCostText;

            feedbackBox.classList.add("active");
            
            // This cleans inputs fields safely after computing processing outcomes
            homeEnquiryForm.reset();
        });
    }
// Security Measures    
// Prevents Cross-Site Scripting code execution
    let userNameInput = document.getElementById('clientName').value;
let feedbackBox = document.getElementById('feedbackSummaryText');

// textContent safely neutralizes script brackets
feedbackBox.textContent = userNameInput;

