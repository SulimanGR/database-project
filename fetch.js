// Wait for the DOM to fully load before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Registration function
    document.getElementById('register-button')?.addEventListener('click', () => {
        const fullname = document.getElementById('fullname').value;
        const phone = document.getElementById('phone').value; // Use phone number instead of username
        const password = document.getElementById('password').value;

        // Client-side validation
        if (!fullname || fullname.trim() === '') {
            alert('Full name is required!');
            return;
        }

        const phoneRegex = /^[0-9]{10}$/; // Validate if the phone number is 10 digits
        if (!phone || !phoneRegex.test(phone)) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }

        fetch('http://localhost:2000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullname, phone, password }) // Send phone instead of username
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                window.location.href = 'login.html'; // Redirect to login page
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // Login function
    document.getElementById('login-button')?.addEventListener('click', () => {
        const phone = document.getElementById('phone').value; // Use phone number for login
        const password = document.getElementById('password').value;

        fetch('http://localhost:2000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone, password }) // Send phone number instead of username
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('token', data.token);
                window.location.href = 'index.html'; // Redirect to restricted page
            } else {
                document.getElementById('error-message').style.display = 'block';
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // Logout function
    document.getElementById('logout-button')?.addEventListener('click', () => {
        localStorage.removeItem('token'); // Clear the token from local storage
        window.location.href = 'login.html'; // Redirect to the login page
    });

    // Check if the user is logged in when accessing protected pages
    const token = localStorage.getItem('token');
    if (window.location.pathname.endsWith('calcPage.html') || window.location.pathname.endsWith('index.html')) {
        if (!token) {
            alert('You need to log in first!');
            window.location.href = 'login.html'; // Redirect to login page
        }
    }

    // Function to fetch data with pagination
    function fetchPaginatedData(page = 1, calories = '', protein = '', carbohydrates = '') {
        const url = new URL(`http://localhost:2000/data`);
        url.searchParams.append('page', page);
        if (calories) url.searchParams.append('calories', calories);
        if (protein) url.searchParams.append('protein', protein);
        if (carbohydrates) url.searchParams.append('carbohydrates', carbohydrates);

        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}` // Include token for authentication
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.data && Array.isArray(data.data)) {
                renderData(data.data); // Render the fetched data
                updatePaginationControls(page, data.totalPages, calories, protein, carbohydrates);
            } else {
                console.error('Invalid data format received from server');
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

    // Function to fetch all data initially
    function fetchData() {
        fetchPaginatedData(); // Fetch the first page by default
    }

    // Function to handle search with pagination
    function handleSearch() {
        const calories = document.getElementsByName('calories')[0].value;
        const protein = document.getElementsByName('protein')[0].value;
        const carbohydrates = document.getElementsByName('carbohydrates')[0].value;
        fetchPaginatedData(1, calories, protein, carbohydrates); // Search from the first page
    }

    // Render function to display data
function renderData(data) {
    const dataContainer = document.getElementById('dataContainer');
    dataContainer.innerHTML = '';

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        
        itemDiv.onclick = () => {
            showPopup(); // Show the popup when an item is clicked
            // You can add additional logic here if needed, such as storing item details
        };

        const itemName = document.createElement('h2');
        itemName.textContent = item.name;

        const itemCalories = document.createElement('p');
        itemCalories.textContent = `Calories: ${item.calories}`;

        const itemCarbohydrates = document.createElement('p');
        itemCarbohydrates.textContent = `Carbohydrates: ${item.carbohydrates}`;

        const itemProtein = document.createElement('p');
        itemProtein.textContent = `Protein: ${item.protein}`;

        const itemSource = document.createElement('p');
        itemSource.textContent = `Source: ${item.source}`;

        itemDiv.appendChild(itemName);
        itemDiv.appendChild(itemCalories);
        itemDiv.appendChild(itemCarbohydrates);
        itemDiv.appendChild(itemProtein);
        itemDiv.appendChild(itemSource);

        dataContainer.appendChild(itemDiv);
    });
}


    // Pagination controls
    document.getElementById('prevPage').addEventListener('click', () => {
        let currentPage = parseInt(document.getElementById('currentPage').textContent.split(' ')[1]);
        if (currentPage > 1) {
            const { calories, protein, carbohydrates } = getCurrentSearchParams();
            fetchPaginatedData(currentPage - 1, calories, protein, carbohydrates);
            document.getElementById('currentPage').textContent = `Page ${currentPage - 1}`;
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        let currentPage = parseInt(document.getElementById('currentPage').textContent.split(' ')[1]);
        const { calories, protein, carbohydrates } = getCurrentSearchParams();
        fetchPaginatedData(currentPage + 1, calories, protein, carbohydrates);
        document.getElementById('currentPage').textContent = `Page ${currentPage + 1}`;
    });

    // Function to get current search parameters
    function getCurrentSearchParams() {
        const calories = document.getElementsByName('calories')[0].value;
        const protein = document.getElementsByName('protein')[0].value;
        const carbohydrates = document.getElementsByName('carbohydrates')[0].value;
        return { calories, protein, carbohydrates };
    }

    // Function to update pagination controls based on current page, total pages, and search parameters
    function updatePaginationControls(currentPage, totalPages, calories, protein, carbohydrates) {
        document.getElementById('prevPage').disabled = currentPage <= 1;
        document.getElementById('nextPage').disabled = currentPage >= totalPages;

        document.getElementById('currentPage').textContent = `Page ${currentPage}`;
        document.getElementsByName('calories')[0].value = calories;
        document.getElementsByName('protein')[0].value = protein;
        document.getElementsByName('carbohydrates')[0].value = carbohydrates;
    }

    // Add event listener to search button
    document.getElementById('search').addEventListener('click', handleSearch);

    // Add event listeners to search bars for "Enter" key press
    document.getElementsByName('calories')[0].addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    document.getElementsByName('protein')[0].addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    document.getElementsByName('carbohydrates')[0].addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Fetch all data initially when the page loads
    fetchData();
});