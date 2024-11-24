// Main Frontend Script
// Nov 24, 2024

const disabled_connection = false;

// | MAIN |
// Function that fetches all of projects from our backend
async function fetchProjects() {
  try {
    // Handling a response
    const response = await fetch("http://localhost:5000/projects");
    if (!response.ok) throw new Error("Failed to Fetch Projects");

    const data = await response.json(); // Our data
    const projectList = document.getElementById("project-list");

    // Sort projects by date_created in descending order
    data.projects.sort(
      (a, b) => new Date(b.date_created) - new Date(a.date_created)
    );

    // Clear existing project cards
    projectList.innerHTML = "";

    // Loop through each project and create their card
    data.projects.forEach((project) => {
      const projectCard = document.createElement("div");
      projectCard.classList.add("project-card");
      projectCard.id = project.id; // Add the ID to each card for referencing

      // Set the content of the card dynamically
      projectCard.innerHTML = `
        <div class="progress-container">
          <div class="progress-bar" style="width: ${project.progress}%"></div>
        </div>
        <img src="${project.image}" height="200" width="200" alt="Project Image">
        <p>${project.title}</p>
      `;

      // Updating the progress bar's color
      const progressBar = projectCard.querySelector(".progress-bar");
      if (project.progress < 30) {
        progressBar.style.backgroundColor = "#ff6666";
      } else if (project.progress >= 30 && project.progress < 60) {
        progressBar.style.backgroundColor = "yellow";
      } else if (project.progress >= 60 && project.progress < 100) {
        progressBar.style.backgroundColor = "#66ff33";
      } else {
        progressBar.style.backgroundColor = "cyan";
      }

      // Append the project card to the project list container
      projectList.appendChild(projectCard);

      projectCard.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevent the event from propagating to the parent element
        // Query the ID, and make the edit modal display
        // Fetch the project details using the project ID
        fetch(`http://localhost:5000/projects/${projectCard.id}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch project data");
            }
            return response.json();
          })
          .then((projectData) => {
            openModal(projectData); // Open the modal with the project data
          })
          .catch((error) => {
            console.error("Error fetching project details:", error);
          });
      });
    });
  } catch (error) {
    // Error
    console.error("Error Fetching Projects:", error);
    document.getElementById(
      "project-list"
    ).innerHTML = `<p>ERROR: Failed to load projects, please try again later</p>`;
  }
}

// Initial fetch of projects when the page loads
if (!disabled_connection) {
  fetchProjects();
}

// | UI |

// Function to open the info modal with project data from JSON
function openModal(project) {
  console.log("Project Data:", project); // Print the project data JSON to the console

  // Check if the modal already exists
  let infoModal = document.getElementById("infoModal");

  // If it doesn't exist, create a new one
  if (!infoModal) {
    infoModal = document.createElement("div");
    infoModal.classList.add("modal");
    infoModal.id = "infoModal"; // Add the ID to the modal for referencing

    // Append the modal to the body
    document.body.appendChild(infoModal);
  }

  // Set the content of the modal dynamically
  infoModal.innerHTML = `
    <div class="modal-content"> 
      <div class="info-container">
        <img src="${project.image}" height="200" width="200" alt="Project Image">
        <div class="info-display">
          <div class="name-display">
            <h2>
              ${project.title}
            </h2>
            <button id="putRequestButton" style="border: none; background: none; cursor: pointer;">
              <i class="fa-regular fa-star fa-2xl unfavorited" id="star-icon"></i>
            </button>
          </div>
          <p>Created ${project.date_created}</p>
          <a href="${project.githubLink}" id="github-icon" target="_blank">
            <i class="fa-brands fa-github" id="github-icon"></i> 
            GitHub
          </a>
          <div class="progress-container" style="margin-left: 15px;">
            <div class="progress-bar" style="width: ${project.progress}%"></div>
            <p style="margin-top: 10px;">Progress: ${project.progress}%</p>
          </div>
          <div class="edit-info-nav">
            <i class="fa-solid fa-pen-to-square fa-2xl edit-info" style="margin-top: 25px;"></i>
            <a href="#" class="delete-button" data-id="${project.id}" project-name="${project.title}">
              <i class="fa-solid fa-trash fa-2xl" style="margin-left: 170px;"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  // Make the modal visible
  infoModal.style.display = "block";

  // Updating the progress bar's color
  const progressBar = infoModal.querySelector(".progress-bar");
  if (project.progress < 30) {
    progressBar.style.backgroundColor = "#ff6666";
  } else if (project.progress >= 30 && project.progress < 60) {
    progressBar.style.backgroundColor = "yellow";
  } else if (project.progress >= 60 && project.progress < 100) {
    progressBar.style.backgroundColor = "#66ff33";
  } else {
    progressBar.style.backgroundColor = "cyan";
  }

  // Add a click event listener to the modal background to close the modal
  infoModal.addEventListener("click", function (event) {
    // Close the modal if the user clicks outside the modal-content
    if (event.target === infoModal) {
      closeModal();
    }
  });

  // Add event listener for the delete button
  const deleteButton = document.querySelector(".delete-button");
  if (deleteButton) {
    deleteButton.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default link behavior

      const projectId = project.id; // Get project ID
      const projectName = event.target
        .closest(".delete-button")
        .getAttribute("project-name"); // Get project name

      // Confirm the deletion
      const confirmDelete = confirm(
        `Are you sure you want to delete the project: ${projectName}?`
      );
      if (confirmDelete) {
        // Send DELETE request to the server
        fetch(`/projects/${projectId}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              alert(`Project ${projectName} deleted successfully.`);
              fetchProjects();
              closeModal(); // Close the modal after deletion

              const successBar = document.getElementById("success-message");
              successBar.classList.add("show"); // Make the success bar slide down

              // Hide the success message after 3 seconds
              setTimeout(() => {
                successBar.classList.remove("show");
              }, 3000);
            } else {
              alert("Failed to delete the project.");
            }
          })
          .catch((error) => {
            console.error("Error deleting project:", error);
            alert("An error occurred while deleting the project.");
          });
      }
    });
  }
}

// Function to close the modal
function closeModal() {
  const infoModal = document.getElementById("infoModal");
  if (infoModal) {
    // Hide the modal by setting its display to 'none'
    infoModal.style.display = "none";
  }
}

// |||| ADD QUERY ||||
document.getElementById("star-icon").addEventListener("click", () => {
  const starIcon = document.getElementById("star-icon");

  // Toggle between 'favorited' and 'unfavorited'
  if (starIcon.classList.contains("unfavorited")) {
    starIcon.classList.remove("unfavorited");
    starIcon.classList.add("favorited");
    console.log("Star is now favorited");
  } else {
    starIcon.classList.remove("favorited");
    starIcon.classList.add("unfavorited");
    console.log("Star is now unfavorited");
  }
});
