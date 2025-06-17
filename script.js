let properties = [];
let userProperties = JSON.parse(localStorage.getItem("userProperties")) || [];

fetch('properties.json')
    .then(res => res.json())
    .then(data => {
        properties = [...userProperties, ...data];
        displayProperties(properties, 12);
    });


const propertyList = document.getElementById("propertyList");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("modal");
const modalDetails = document.getElementById("modalDetails");
const closeBtn = document.querySelector(".close");


const uploadModal = document.getElementById("uploadModal");
const openFormBtn = document.getElementById("openFormBtn");
const closeUploadModal = document.getElementById("closeUploadModal");

function displayProperties(props, limit = null) {
    propertyList.innerHTML = "";
    const toDisplay = limit ? props.slice(0, limit) : props;

    toDisplay.forEach((prop) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${prop.image}" alt="${prop.title}" />
            <div class="info">
              <h3>${prop.title}</h3>
              <p>${prop.location}</p>
              <p>${prop.price}</p>
              <button onclick="showModal(${prop.id})">Contact</button>
               ${prop.type === "User Submitted" ? `<button onclick="deleteProperty(${prop.id})">Delete</button>` : ""}
            </div>
        `;
        propertyList.appendChild(card);
    });
}

function deleteProperty(id) {

    if (!confirm("Are you sure you want to delete this property?")) return;


    userProperties = userProperties.filter(p => p.id !== id);
    localStorage.setItem("userProperties", JSON.stringify(userProperties));


    properties = [...userProperties, ...properties.filter(p => p.type !== "User Submitted")];
    displayProperties(properties.slice(0, 12));
}


function showModal(id) {
    const prop = properties.find(p => p.id === id);
    modalDetails.innerHTML = `
        <h2>${prop.title}</h2>
        <p><strong>Location:</strong> ${prop.location}</p>
        <p><strong>Type:</strong> ${prop.type || "N/A"}</p>
        <p><strong>Price:</strong> ${prop.price}</p>
        <p><strong>Description:</strong> ${prop.description}</p>
        <div class="gallery">
            ${prop.gallery?.map((img, i) => `<img src="${img}" alt="Gallery Image">`).join("") || ""}
        </div>
        <p><strong>Contact Info:</strong><br>${prop.contact}</p>
    `;
    modal.classList.remove("hidden");
}

const contactClose = document.getElementById("contactClose");
contactClose.onclick = () => modal.classList.add("hidden");


openFormBtn.addEventListener("click", () => {
    uploadModal.classList.remove("hidden");
});

closeUploadModal.addEventListener("click", () => {
    uploadModal.classList.add("hidden");
});

window.onclick = (e) => {
    if (e.target === modal) modal.classList.add("hidden");
    if (e.target === uploadModal) uploadModal.classList.add("hidden");
};


searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const query = searchInput.value.toLowerCase().trim();
        if (query) {
            const filtered = properties.filter(
                (p) =>
                    p.title.toLowerCase().includes(query) ||
                    p.location.toLowerCase().includes(query) ||
                    (p.type || "").toLowerCase().includes(query)
            );
            displayProperties(filtered);
        } else {
            displayProperties(properties.slice(0, 12));
        }
    }
});

const suggestionsBox = document.getElementById("suggestions");

searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    suggestionsBox.innerHTML = "";

    if (!query) {
        suggestionsBox.style.display = "none";
        return;
    }

    const matches = properties
        .filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.location.toLowerCase().includes(query)
        )
        .slice(0, 6);

    if (matches.length === 0) {
        suggestionsBox.style.display = "none";
        return;
    }

    suggestionsBox.style.display = "block";

    matches.forEach(p => {
        const div = document.createElement("div");
        div.textContent = `${p.title} – ${p.location}`;
        div.onclick = () => {
            searchInput.value = p.title;
            suggestionsBox.innerHTML = "";
            suggestionsBox.style.display = "none";
            searchInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        };
        suggestionsBox.appendChild(div);
    });
});



document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.innerHTML = "";
        suggestionsBox.style.display = "none";
    }
});



const uploadForm = document.getElementById("uploadForm");
if (uploadForm) {
    uploadForm.addEventListener("submit", function (e) {
        e.preventDefault();


        const newProperty = {
            id: Date.now(),
            title: document.getElementById("title").value,
            location: document.getElementById("location").value,
            price: document.getElementById("price").value,
            image: document.getElementById("image").value,
            description: document.getElementById("description").value,
            contact: document.getElementById("contact").value,
            type: "User Submitted",
            gallery: []
        };

        userProperties.unshift(newProperty);
        localStorage.setItem("userProperties", JSON.stringify(userProperties));

        properties = [...userProperties, ...properties.filter(p => !userProperties.some(up => up.id === p.id))];
        displayProperties(properties.slice(0, 12));

        uploadForm.reset();
        uploadModal.classList.add("hidden");
        alert("Your property has been submitted!");
    });
}