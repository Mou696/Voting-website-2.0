const credentials = {
    USER: "USER",
    ADMIN: "ADMIN"
};

let pollResults = [
    {
        pollName: "Mikä on lempieläimesi?",
        options: [
            { option: "Kissa", votes: 89 },
            { option: "Koira", votes: 54 },
            { option: "Lintu", votes: 20 }
        ]
    },
    {
        pollName: "Mikä on paras ohjelmointikieli?",
        options: [
            { option: "Python", votes: 33 },
            { option: "JavaScript", votes: 12 },
            { option: "C", votes: 83 },
            { option: "Scratch", votes: 96 }
        ]
    },
    {
        pollName: "Aiotko äänestää?",
        options: [
            { option: "Kyllä", votes: 76 },
            { option: "En", votes: 16 },
            { option: "Ehkä", votes: 27 }
        ]
    }
];

let isLoggedIn = false;
let currentRole = null;

// Toggle Menu Functionality
function toggleMenu() {
    const sideMenu = document.getElementById("side-menu");
    sideMenu.classList.toggle("hidden");
    sideMenu.classList.toggle("translate-x-0");
    sideMenu.classList.toggle("-translate-x-full");
}

const menuButton = document.getElementById('hamburger-button');
const sideMenu = document.getElementById('side-menu');
const closeButton = document.getElementById('close-button');

menuButton.addEventListener('click', () => {
    sideMenu.classList.toggle('visible'); // Toggle visibility class
    document.body.classList.toggle('menu-open'); // Prevent background scrolling
});

closeButton.addEventListener('click', () => {
    sideMenu.classList.remove('visible'); // Close the menu
    document.body.classList.remove('menu-open'); // Allow background scrolling again
});


// Event Listeners on Window Load
window.onload = function() {
    document.getElementById('hamburger-button').addEventListener('click', toggleMenu);
    document.getElementById('close-button').addEventListener('click', toggleMenu);
    document.getElementById("logout-button").addEventListener("click", handleLogout);
    document.getElementById("createPollForm").addEventListener("submit", handlePollCreation);
    document.getElementById("create-poll-button").addEventListener("click", showModal);
    document.getElementById("login-submit-button").addEventListener("click", handleLogin);
    document.getElementById("login-button").addEventListener("click", showLoginModal);
    displayPolls();
};

// Display polls
function displayPolls() {
    const pollsContainer = document.getElementById("polls-container");
    pollsContainer.innerHTML = '';

    pollResults.forEach((poll, pollIndex) => {
        const pollCard = `
            <div class="card shadow-lg bg-base-100 my-5 p-5">
                <h3 class="text-2xl font-semibold mb-4">${poll.pollName}</h3>
                <form id="vote-form-${pollIndex}" onsubmit="handleVote(event, ${pollIndex})">
                    ${poll.options.map(option => `
                        <div class="flex items-center mb-2">
                            <input type="radio" name="vote-option-${pollIndex}" value="${option.option}" class="radio radio-primary mr-2" required aria-label="${option.option}">
                            <label class="label cursor-pointer">${option.option}</label>
                        </div>
                    `).join('')}
                    <button type="submit" class="btn btn-primary w-full mt-4">Äänestä</button>
                </form>
                <div id="results-container-${pollIndex}" class="hidden mt-4"></div>
            </div>
        `;
        pollsContainer.innerHTML += pollCard;
    });
}

// Handle Login
function handleLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (credentials[username] && credentials[username] === password) {
        isLoggedIn = true;
        currentRole = username;

        // Show/hide buttons based on login status
        document.getElementById("logout-button").classList.remove("hidden");
        document.getElementById("login-button").classList.add("hidden");

        // Display user role
        const roleDisplay = document.getElementById("role-display");
        roleDisplay.textContent = currentRole; // Set the role text
        roleDisplay.classList.remove("hidden"); // Show the role display

        if (currentRole === "ADMIN") {
            document.getElementById("create-poll-button").classList.remove("hidden");
        }

        closeLoginModal();
        displayPolls();
        document.getElementById("username").value = '';
        document.getElementById("password").value = '';
        showAlert("Kirjauduttu sisään onnistuneesti!", "alert-success");
    } else {
        showAlert("Virheellinen käyttäjätunnus tai salasana!", "alert-error");
    }
}


// Handle Logout
function handleLogout() {
    isLoggedIn = false;
    currentRole = null;
    document.getElementById("logout-button").classList.add("hidden");
    document.getElementById("login-button").classList.remove("hidden");
    document.getElementById("create-poll-button").classList.add("hidden");

    // Hide role display
    const roleDisplay = document.getElementById("role-display");
    roleDisplay.classList.add("hidden"); // Hide the role display

    showAlert("Kirjauduttu ulos onnistuneesti!", "alert-success");

    console.log('Logging out...');
}


// Show alert messages
function showAlert(message, type) {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert ${type} shadow-lg mt-4`;
    alertContainer.textContent = message;
    document.body.prepend(alertContainer);
    setTimeout(() => {
        alertContainer.remove();
    }, 2000);
}

// Handle vote submission
function handleVote(event, pollIndex) {
    event.preventDefault();
    if (!isLoggedIn) {
        showAlert("Sinun on kirjauduttava äänestääksesi!", "alert-error");
        return;
    }

    const selectedOption = document.querySelector(`input[name="vote-option-${pollIndex}"]:checked`);
    pollResults[pollIndex].options.forEach(option => {
        if (option.option === selectedOption.value) {
            option.votes += 1;
        }
    });

    const voteForm = document.getElementById(`vote-form-${pollIndex}`);
    voteForm.classList.add("hidden");
    displayResults(pollIndex);
}

// Display poll results
function displayResults(pollIndex) {
    const resultsContainer = document.getElementById(`results-container-${pollIndex}`);
    const selectedOption = document.querySelector(`input[name="vote-option-${pollIndex}"]:checked`).value;

    const resultsHTML = pollResults[pollIndex].options.map(option => {
        const percentage = ((option.votes / getTotalVotes(pollIndex)) * 100).toFixed(1);
        const progressColor = option.option === selectedOption ? 'bg-success' : 'bg-gray-400';

        return `
            <div class="w-full bg-gray-300 rounded-full h-6 mb-2 overflow-hidden">
                <div class="h-full ${progressColor}" style="width: ${percentage}%"></div>
            </div>
            <p class="text-sm">${option.option}: ${percentage}% (${option.votes} ääntä)</p>
        `;
    }).join('');

    resultsContainer.innerHTML = resultsHTML;
    resultsContainer.classList.remove("hidden");
}

// Helper function to get the total number of votes for a poll
function getTotalVotes(pollIndex) {
    return pollResults[pollIndex].options.reduce((total, option) => total + option.votes, 0);
}

// Add new poll option
function addPollOption() {
    const optionsContainer = document.getElementById("options-container");
    const newOptionInput = document.createElement('input');
    newOptionInput.setAttribute('type', 'text');
    newOptionInput.setAttribute('placeholder', 'Vaihtoehto');
    newOptionInput.classList.add("input", "input-bordered", "w-full", "mb-2");
    newOptionInput.setAttribute('required', 'required');
    optionsContainer.appendChild(newOptionInput);
}

// Handle new poll creation
function handlePollCreation(event) {
    event.preventDefault();
    if (currentRole !== "ADMIN") {
        showAlert("Sinun on oltava ADMIN, jotta voit luoda uuden äänestyksen!", "alert-error");
        return;
    }

    const pollName = document.getElementById("pollName").value;
    const options = Array.from(document.querySelectorAll('#options-container input'))
        .map(input => input.value.trim())
        .filter(option => option !== '');

    if (options.length < 2) {
        showAlert("Äänestyksessä on oltava vähintään kaksi vaihtoehtoa!", "alert-error");
        return;
    }

    const newPoll = {
        pollName,
        options: options.map(option => ({ option, votes: Math.floor(Math.random() * 100) }))
    };

    pollResults.push(newPoll);
    displayPolls();
    closeModal();
}

const modal = document.getElementById('login-modal');

const slidingMenu = document.getElementById('side-menu');

// Function to open sliding menu
function openSlidingMenu() {
    slidingMenu.classList.add('visible');
    document.body.classList.add('modal-open'); // Prevent background scrolling
}

// Function to close sliding menu
function closeSlidingMenu() {
    slidingMenu.classList.remove('visible');
    document.body.classList.remove('modal-open'); // Allow background scrolling
}


// Function to open modal
function openModal() {
    modal.classList.add('active'); // or however you manage visibility
    document.body.classList.add('modal-open'); // Prevent scrolling when modal is open
}

// Function to close modal
function closeModal() {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open'); // Allow scrolling when modal is closed
}


// Show modal for creating a new poll
function showModal() {
    document.getElementById("poll-modal").classList.add("modal-open");
}

// Close the modal
function closeModal() {
    document.getElementById("poll-modal").classList.remove("modal-open");
    document.getElementById("createPollForm").reset();
    document.getElementById("options-container").innerHTML = '';
}

// Show login modal
function showLoginModal() {
    const loginModal = document.getElementById("login-modal");
    loginModal.classList.remove("hidden"); // Show the modal
    loginModal.classList.add("modal-open"); // Add open class if needed
}



// Close login modal
function closeLoginModal() {
    document.getElementById("login-modal").classList.add("hidden");
    document.getElementById("username").value = '';
    document.getElementById("password").value = '';
}
