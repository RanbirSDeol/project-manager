// Main Frontend Script
// Nov 24, 2024

const disabled_connection = false;

// | MAIN |
// Function that fetches all of the projects from our backend
async function fetchProjects() {
  try {
    // Handling the response from the backend
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

      // Add the 'favorite' class if the project is marked as a favorite
      if (project.isFavorite == true || project.isFavorite == "true") {
        projectCard.classList.add("favorite");

        // Set the content of the card dynamically for favorite projects
        projectCard.innerHTML = `
          <div class="progress-container">
            <div class="progress-bar" style="width: ${project.progress}%"></div>
          </div>
          <div class="image-container" style="position: relative; display: inline-block; margin-bottom: -4px;">
            <i class="fa-solid fa-star" style="position: absolute; top: -10px; right: 30px; color: gold; font-size: 2rem; z-index: 1; background: none;"></i>
            <img src="${project.image}" height="200" width="200" alt="Project Image" style="display: block; border-radius: 8px;">
          </div>
          <p>${project.title}</p>
        `;
      } else {
        // Set the content of the card dynamically for non-favorite projects
        projectCard.innerHTML = `
          <div class="progress-container">
            <div class="progress-bar" style="width: ${project.progress}%"></div>
          </div>
          <img id="project-image" src="${project.image}" height="200" width="200" alt="Project Image" style="display: block; border-radius: 8px;">
          <p>${project.title}</p>
        `;
      }

      // Updating the progress bar's color based on progress
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

    // Add event listener for the favorite toggle switch
    document
      .getElementById("favorite-toggle")
      .addEventListener("change", function () {
        const projectCards = document.querySelectorAll(".project-card");

        if (this.checked) {
          // When the switch is ON, only show the "favorite" cards
          projectCards.forEach((card) => {
            if (!card.classList.contains("favorite")) {
              card.style.display = "none"; // Hide non-favorite projects
            } else {
              card.style.display = "block"; // Show favorite projects
            }
          });
        } else {
          // When the switch is OFF, show all project cards
          projectCards.forEach((card) => {
            card.style.display = "block"; // Show all projects
          });
        }
      });
  } catch (error) {
    // Error handling
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

  let favorite =
    project.isFavorite === true || project.isFavorite === "true"
      ? "favorite"
      : "unfavorite";

  // Set the content of the modal dynamically
  infoModal.innerHTML = `
    <div class="modal-content"> 
      <div class="info-container">
        <img src="${project.image}" height="200" width="200" alt="Project Image" id="projectImage">
        <div class="info-display">
          <div class="name-display">
            <h2>
              ${project.title}
            </h2>
            <button id="putRequestButton" style="border: none; background: none; cursor: pointer;">
              <i class="fa-regular fa-star fa-2xl ${favorite}" id="star-icon"></i>
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
            <i class="fa-solid fa-trash fa-2xl delete-info" style="margin-left: 170px; margin-top: 10px;"></i>
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
    if (event.target === infoModal) {
      closeModal();
    }
  });

  const editButton = document.querySelector(".edit-info");
  if (editButton) {
    editButton.addEventListener("click", function (event) {
      event.preventDefault();
      console.log("Editing:", project.id);
      openEdit(project); // Open the edit form with the current project data
    });
  }

  // Favorite Toggle
  document.getElementById("star-icon").addEventListener("click", () => {
    const starIcon = document.getElementById("star-icon");

    // Send fetch request to toggle favorite status
    fetch(`http://localhost:5000/projects/favorite/${project.id}`, {
      method: "PUT",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update favorite status");
        }
        return response.json();
      })
      .then((updatedProject) => {
        // Add or remove the "favorite" class based on the new status
        if (
          updatedProject.isFavorite == false ||
          updatedProject.isFavorite == "false"
        ) {
          starIcon.classList.add("favorite"); // Add "favorite" class
          starIcon.classList.remove("unfavorite"); // Remove "unfavorite" class
        } else {
          starIcon.classList.add("unfavorite"); // Add "unfavorite" class
          starIcon.classList.remove("favorite"); // Remove "favorite" class
        }
        fetchProjects();
      })
      .catch((error) => {
        console.error("Error updating project favorite status:", error);
      });
  });

  // Add event listener for the delete button
  const deleteButton = document.querySelector(".delete-info");
  if (deleteButton) {
    deleteButton.addEventListener("click", function (event) {
      event.preventDefault();

      const projectId = project.id;
      const projectName = event.target
        .closest(".delete-info")
        .getAttribute("project-name");

      const confirmDelete = confirm(
        `Are you sure you want to delete the project: ${projectName}?`
      );
      if (confirmDelete) {
        fetch(`/projects/${projectId}`, { method: "DELETE" })
          .then((response) => {
            if (response.ok) {
              alert(`Project ${projectName} deleted successfully.`);
              fetchProjects();
              closeModal();

              const successBar = document.getElementById("success-message");
              successBar.classList.add("show");

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

function openEdit(project) {
  // Create the edit modal or use existing one
  let editModal = document.getElementById("editModal");

  if (!editModal) {
    editModal = document.createElement("div");
    editModal.classList.add("modal");
    editModal.id = "editModal";

    document.body.appendChild(editModal);
  }

  // Set the content for the edit modal
  editModal.innerHTML = `
    <div class="edit-modal-content">
      <i class="fa-solid fa-diagram-project fa-xl"></i>
      <form id="editForm">
        <label style="margin-top: 10px;" for="editTitle">Project Title:</label>
        <input type="text" id="editTitle" value="${project.title}" required>
        
        <label for="editLink">GitHub Link:</label>
        <input type="url" id="editLink" value="${project.githubLink}" required>
        
        <label for="editProgress">Progress:</label>
        <input type="number" id="editProgress" value="${project.progress}" min="0" max="100" required>
        
        <button type="submit">Save Changes</button>
        <button type="button" id="closeEditModal">Cancel</button>
      </form>
    </div>
  `;

  editModal.style.display = "block";

  // Close the edit modal
  document.getElementById("closeEditModal").addEventListener("click", () => {
    editModal.style.display = "none";
  });

  // Handle the form submission
  document.getElementById("editForm").addEventListener("submit", (event) => {
    event.preventDefault();

    // Prepare form data
    const updatedProjectData = {
      id: project.id,
      title: document.getElementById("editTitle").value,
      githubLink: document.getElementById("editLink").value,
      progress: document.getElementById("editProgress").value,
    };

    // Send updated data (using a PUT request)
    fetch(`/projects/${project.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProjectData),
    })
      .then((projectUpdated) => {
        if (projectUpdated.ok) {
          alert("Project updated successfully!");
          fetchProjects(); // Re-fetch the projects to show the updated data
          editModal.style.display = "none";

          // Get the info of the project again, and display
          fetch(`http://localhost:5000/projects/${project.id}`)
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
        } else {
          alert("Failed to update project.");
        }
      })
      .catch((error) => {
        console.error("Error updating project:", error);
        alert("An error occurred while updating the project.");
      });
  });
}

// Function to close the modal
function closeModal() {
  const infoModal = document.getElementById("infoModal");
  if (infoModal) {
    // Hide the modal by setting its display to 'none'
    infoModal.style.display = "none";
  }
}
