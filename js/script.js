
const vehicles = {
    hatchback: { name: "Economy Hatchback", price: 450 },
    sedan: { name: "Family Sedan", price: 550 },
    suv: { name: "Family SUV", price: 750 },
    premium: { name: "Premium Sedan", price: 900 }
};

// Sample unavailable dates for demonstration

const unavailableDates = {
    hatchback: ["2026-12-10", "2026-12-11"],
    sedan: ["2026-12-15"],
    suv: ["2026-12-20", "2026-12-21"],
    premium: ["2026-12-24", "2026-12-25"]
};

function todayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function dateNumber(value) {
    return Date.parse(value + "T00:00:00Z");
}

function isUnavailable(vehicleId, startDate, endDate) {
    return unavailableDates[vehicleId].some(function (date) {
        return date >= startDate && date < endDate;
    });
}

function validRentalDates(startDate, endDate) {
    return startDate &&
        endDate &&
        startDate >= todayString() &&
        endDate > startDate;
}

// Vehicle Availability Checker

document.addEventListener("DOMContentLoaded", function () {

    const availabilityForm =
        document.getElementById("availabilityForm");

    if (!availabilityForm) {
        return;
    }

    const vehicleSelect =
        document.getElementById("rentalVehicle");

    const pickupInput =
        document.getElementById("pickupDate");

    const returnInput =
        document.getElementById("returnDate");

    const result =
        document.getElementById("availabilityResult");

    function clearResult() {
        result.textContent = "";
    }

    pickupInput.min = todayString();
    returnInput.min = todayString();

    pickupInput.addEventListener("change", function () {
        returnInput.min = pickupInput.value || todayString();
        clearResult();
    });

    returnInput.addEventListener("change", clearResult);
    vehicleSelect.addEventListener("change", clearResult);

    const carButtons =
        document.querySelectorAll(".select-car");

    carButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            vehicleSelect.value = button.dataset.vehicle;
            clearResult();

            document.getElementById(
                "availabilitySection"
            ).scrollIntoView({
                behavior: "smooth"
            });

            vehicleSelect.focus();
        });
    });

    availabilityForm.addEventListener("submit", function (event) {

        event.preventDefault();
        clearResult();

        const vehicleId = vehicleSelect.value;
        const pickup = pickupInput.value;
        const returnDate = returnInput.value;

        if (!vehicles[vehicleId]) {
            result.textContent = "Please select a vehicle.";
            return;
        }

        if (!validRentalDates(pickup, returnDate)) {
            result.textContent =
                "Choose a collection date from today onwards " +
                "and a later return date.";
            return;
        }

        if (isUnavailable(vehicleId, pickup, returnDate)) {
            result.textContent =
                "This vehicle is unavailable for the selected dates. " +
                "Please choose different dates or another vehicle.";
            return;
        }

        const days = Math.round(
            (dateNumber(returnDate) - dateNumber(pickup)) / 86400000
        );

        const vehicle = vehicles[vehicleId];
        const total = days * vehicle.price;

        const heading = document.createElement("h3");
        heading.textContent = "Vehicle Available (Demonstration)";

        const details = document.createElement("p");
        details.textContent =
            vehicle.name + " | " +
            days + " day(s) | Estimated total: R" +
            total.toLocaleString("en-ZA");

        const explanation = document.createElement("p");
        explanation.textContent =
            "Continue to the booking form. " +
            "This does not reserve the vehicle.";

        const link = document.createElement("a");

        const params = new URLSearchParams({
            vehicle: vehicleId,
            startDate: pickup,
            endDate: returnDate
        });

        link.href = "enquiry.html?" + params.toString();
        link.textContent = "Continue to Booking";

        result.appendChild(heading);
        result.appendChild(details);
        result.appendChild(explanation);
        result.appendChild(link);
    });
});

// Booking Form

document.addEventListener("DOMContentLoaded", function () {

    const bookingForm =
        document.getElementById("bookingForm");

    if (!bookingForm) {
        return;
    }

    const vehicleInput =
        document.getElementById("bookingVehicle");

    const startInput =
        document.getElementById("bookingStartDate");

    const endInput =
        document.getElementById("bookingEndDate");

    const result =
        document.getElementById("bookingResult");

    const params =
        new URLSearchParams(window.location.search);

    const selectedVehicle = params.get("vehicle");

    if (selectedVehicle && vehicles[selectedVehicle]) {
        vehicleInput.value = selectedVehicle;
    }

    if (params.get("startDate")) {
        startInput.value = params.get("startDate");
    }

    if (params.get("endDate")) {
        endInput.value = params.get("endDate");
    }

    startInput.min = todayString();
    endInput.min = startInput.value || todayString();

    startInput.addEventListener("change", function () {
        endInput.min = startInput.value || todayString();
        result.textContent = "";
    });

    bookingForm.addEventListener("input", function () {
        result.textContent = "";
    });

    bookingForm.addEventListener("reset", function () {
        result.textContent = "";
    });

    function showLine(label, value) {
        const paragraph = document.createElement("p");
        paragraph.textContent = label + ": " + value;
        result.appendChild(paragraph);
    }

    bookingForm.addEventListener("submit", function (event) {

        event.preventDefault();
        result.textContent = "";

        if (!bookingForm.reportValidity()) {
            return;
        }

        const name =
            document.getElementById("bookingName").value.trim();

        const email =
            document.getElementById("bookingEmail").value.trim();

        const phone =
            document.getElementById("bookingPhone").value.trim();

        const branch =
            document.getElementById("pickupBranch").value;

        const vehicleId = vehicleInput.value;
        const startDate = startInput.value;
        const endDate = endInput.value;

        if (!name || !email || !phone ||
            !branch || !vehicles[vehicleId]) {

            result.textContent =
                "Please complete all required booking details.";
            return;
        }

        if (!validRentalDates(startDate, endDate)) {
            result.textContent =
                "Please select valid rental dates.";
            return;
        }

        if (isUnavailable(vehicleId, startDate, endDate)) {
            result.textContent =
                "This vehicle is unavailable for the selected dates. " +
                "Please choose another date or vehicle.";
            return;
        }

        const days = Math.round(
            (dateNumber(endDate) - dateNumber(startDate)) / 86400000
        );

        const vehicle = vehicles[vehicleId];
        const total = days * vehicle.price;

        const heading = document.createElement("h3");
        heading.textContent = "Booking Summary";
        result.appendChild(heading);

        showLine("Customer", name);
        showLine("Email", email);
        showLine("Phone", phone);
        showLine("Vehicle", vehicle.name);
        showLine("Collection Branch", branch);
        showLine("Collection Date", startDate);
        showLine("Return Date", endDate);
        showLine("Rental Days", String(days));

        showLine(
            "Daily Price",
            "R" + vehicle.price.toLocaleString("en-ZA")
        );

        showLine(
            "Estimated Total",
            "R" + total.toLocaleString("en-ZA")
        );

        const notice = document.createElement("p");
        notice.textContent =
            "Your booking summary is ready. " +
            "This is a demonstration only. " +
            "No reservation, payment or email has been submitted.";

        result.appendChild(notice);
    });
});

// Vehicle Search and Price Filtering

document.addEventListener("DOMContentLoaded", function () {

    const searchInput =
        document.getElementById("carSearch");

    const priceFilter =
        document.getElementById("priceFilter");

    const filterMessage =
        document.getElementById("filterMessage");

    if (!searchInput || !priceFilter || !filterMessage) {
        return;
    }

    const carCards =
        document.querySelectorAll(".car-card");

    function filterCars() {

        const searchText =
            searchInput.value.toLowerCase().trim();

        const maxPrice = priceFilter.value;

        let visibleCount = 0;

        carCards.forEach(function (card) {

            const vehicleName =
                card.querySelector("h3").textContent.trim();

            const matchesSearch =
                card.textContent.toLowerCase().includes(searchText);

            const vehicle = Object.values(vehicles).find(
                function (item) {
                    return item.name === vehicleName;
                }
            );

            const matchesPrice =
                maxPrice === "all" ||
                (vehicle && vehicle.price <= Number(maxPrice));

            if (matchesSearch && matchesPrice) {
                card.style.display = "";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (visibleCount === 0) {
            filterMessage.textContent =
                "No vehicles match your search. Try another option.";
        } else {
            filterMessage.textContent =
                visibleCount + " vehicle(s) found.";
        }
    }

    searchInput.addEventListener("input", filterCars);
    priceFilter.addEventListener("change", filterCars);

    filterCars();
});

// Interactive Vehicle Image Lightbox

document.addEventListener("DOMContentLoaded", function () {

    const lightbox =
        document.getElementById("vehicleLightbox");

    const lightboxImage =
        document.getElementById("lightboxImage");

    const lightboxCaption =
        document.getElementById("lightboxCaption");

    const closeButton =
        document.getElementById("closeLightbox");

    if (!lightbox || !lightboxImage ||
        !lightboxCaption || !closeButton) {
        return;
    }

    const vehiclePictures =
        document.querySelectorAll(".car-card picture");

    let previousFocus = null;

    function openLightbox(picture) {

        const image = picture.querySelector("img");
        const card = picture.closest(".car-card");

        previousFocus = document.activeElement;

        lightboxImage.src = image.getAttribute("src");
        lightboxImage.alt = image.alt;

        lightboxCaption.textContent =
            card.querySelector("h3").textContent;

        lightbox.classList.add("active");
        lightbox.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";
        closeButton.focus();
    }

    function closeLightbox() {

        lightbox.classList.remove("active");
        lightbox.setAttribute("aria-hidden", "true");

        lightboxImage.removeAttribute("src");
        document.body.style.overflow = "";

        if (previousFocus) {
            previousFocus.focus();
        }
    }

    vehiclePictures.forEach(function (picture) {

        picture.setAttribute("tabindex", "0");
        picture.setAttribute("role", "button");

        picture.setAttribute(
            "aria-label",
            "Enlarge " +
            picture.closest(".car-card")
                .querySelector("h3").textContent +
            " image"
        );

        picture.addEventListener("click", function () {
            openLightbox(picture);
        });

        picture.addEventListener("keydown", function (event) {

            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLightbox(picture);
            }
        });
    });

    closeButton.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", function (event) {

        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", function (event) {

        if (!lightbox.classList.contains("active")) {
            return;
        }

        if (event.key === "Escape") {
            closeLightbox();
        }

        if (event.key === "Tab") {
            event.preventDefault();
            closeButton.focus();
        }
    });
});

// Contact Form Validation and Email Preparation

document.addEventListener("DOMContentLoaded", function () {

    const contactForm =
        document.getElementById("contactForm");

    if (!contactForm) {
        return;
    }

    const contactMessage =
        document.getElementById("contactMessage");

    contactForm.addEventListener("submit", function (event) {

        event.preventDefault();
        contactMessage.textContent = "";

        if (!contactForm.reportValidity()) {
            contactMessage.textContent =
                "Please complete the required fields correctly.";
            return;
        }

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const messageType =
            document.getElementById("messageType").value;

        const message =
            document.getElementById("message").value.trim();

        if (name.length < 2 || message.length < 10) {
            contactMessage.textContent =
                "Please enter a valid name and a message " +
                "with at least 10 characters.";
            return;
        }

        const subject =
            "DreamDrive SA - " + messageType;

        const body =
            "Full Name: " + name + "\n" +
            "Email: " + email + "\n" +
            "Phone: " + (phone || "Not provided") + "\n" +
            "Message Type: " + messageType + "\n\n" +
            "Message:\n" + message;

        const emailLink =
            "mailto:info@dreamdrivesa.co.za" +
            "?subject=" + encodeURIComponent(subject) +
            "&body=" + encodeURIComponent(body);

        contactMessage.textContent =
            "Your email is ready. Your email application " +
            "should open so you can review and send it.";

        window.location.href = emailLink;
    });

    contactForm.addEventListener("reset", function () {
        contactMessage.textContent = "";
    });
});
