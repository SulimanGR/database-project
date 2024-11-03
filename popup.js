function showPopup() {
    const popup = document.getElementById("popup");
    popup.style.display = "block";
}

function closePopup() {
    const popup = document.getElementById("popup");
    popup.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    const dataContainer = document.getElementById("dataContainer");

    // Assuming you fetch data and want to show items
    const items = ['Item 1', 'Item 2', 'Item 3']; // Example items
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `<h2>${item}</h2><p>Click to order</p>`;
        div.onclick = () => {
            showPopup();
        };
        dataContainer.appendChild(div);
    });
});
