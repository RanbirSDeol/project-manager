// dbLoad | Nov 21, 2024
// Loads the database into cards to display

async function fetchProjects() {
  try {
    const response = await fetch('http://localhost:5000/projects');
    if (!response.ok) throw new Error('Failed to Fetch Projects');
    
    const data = await response.json();
    const projectList = document.getElementById('project-list');

    // Sort projects by date_created in descending order
    data.projects.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));

    // Clear existing project cards before reloading
    projectList.innerHTML = '';

    // Loop through the projects and create their cards
    data.projects.forEach((project) => {
      const projectCard = document.createElement('div');
      projectCard.classList.add('project-card');

      // Set the content of the card dynamically
      projectCard.innerHTML = `
        <div class="edit-nav">
          <a href="#" class="edit-button">
              <i class="fa-regular fa-pen-to-square"></i>
          </a>
          <a href="#" class="favorite-button">
              <i class="fa-regular fa-star"></i>
          </a>
        </div>
        <img src="${project.image}" alt="Project Image" />
        <h3>${project.title}</h3>
        <p>Date Created: ${new Date(project.date_created).toLocaleDateString()}</p>
        <p>Progress: <span id="progress-text">${project.progress}%</span></p>
        <div class="progress-container">
          <div class="progress-bar" style="width: ${project.progress}%"></div>
        </div>
        <div class="controller-container">
          <a href="${project.githubLink}" target="_blank">
            <i class="fa-brands fa-github"></i> GitHub
          </a>
          <a href="#" class="delete-button" data-id="${project.id}" project-name="${project.title}">
            <i class="fa-solid fa-trash"></i>
          </a>
        </div>
      `;

      // Attach the `openEditModal` to the edit button
      const editButton = projectCard.querySelector('.edit-button');
      editButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent the default anchor behavior
        openEditModal(project); // Pass the project object to the modal
      });

      // Update the progress bar color dynamically
      const progressBar = projectCard.querySelector('.progress-bar');
      if (project.progress < 30) {
        progressBar.style.backgroundColor = '#ff6666';
      } else if (project.progress >= 30 && project.progress < 60) {
        progressBar.style.backgroundColor = 'yellow';
      } else if (project.progress >= 60 && project.progress < 100) {
        progressBar.style.backgroundColor = '#66ff33';
      } else {
        progressBar.style.backgroundColor = 'cyan';
      }

      // Append the project card to the project list container
      projectList.appendChild(projectCard);
    });
  } catch (error) {
    console.error('Error Fetching Projects:', error);
    document.getElementById('project-list').innerHTML = `<p>ERROR: Failed to load projects, please try again later</p>`;
  }
}

function openEditModal(project) {
  const modal = document.getElementById('edit-modal');
  const modalContent = document.getElementById('edit-modal-content');

  modalContent.innerHTML = `
    <h1>Edit Project</h1>
    <form id="edit-project-form" data-project-id="${project.id}" enctype="multipart/form-data">
      <label for="title">Title</label>
      <input type="text" id="title" name="title" value="${project.title}" required />

      <label for="progress">Progress</label>
      <input type="number" id="progress" name="progress" value="${project.progress}" min="0" max="100" required />

      <label for="image">Image</label>
      <input type="file" id="image" name="image" />
      <img src="${project.image}" alt="Current Project Image" id="current-image" style="max-width: 100px; margin-top: 10px;" />

      <label for="githubLink">GitHub Link</label>
      <input type="url" id="githubLink" name="githubLink" value="${project.githubLink}" required />

      <label for="isFavorite">Favorite</label>
      <input type="checkbox" id="isFavorite" name="isFavorite" ${project.isFavorite ? 'checked' : ''} />

      <button type="submit">Save</button>
    </form>
  `;

  modal.style.display = 'block'; // Show the modal

  // Handle form submission
  const form = document.getElementById('edit-project-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updatedProject = {
      title: form.title.value,
      progress: form.progress.value,
      githubLink: form.githubLink.value,
      isFavorite: form.isFavorite.checked,
    };

    // If the user uploads a new image, add it to the updatedProject
    const imageInput = form.querySelector('input[type="file"]');
    if (imageInput.files.length > 0) {
      updatedProject.image = imageInput.files[0];
    }

    const projectId = form.dataset.projectId; // Get the project ID from the form's data attribute

    // Send the PUT request to update the project
    const formData = new FormData();
    formData.append('title', updatedProject.title);
    formData.append('progress', updatedProject.progress);
    formData.append('githubLink', updatedProject.githubLink);
    formData.append('isFavorite', updatedProject.isFavorite);

    // Only append the image if it's changed
    if (updatedProject.image) {
      formData.append('image', updatedProject.image);
    }

    try {
      const response = await fetch(`http://localhost:5000/projects/${projectId}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Updated Project:', data);
        modal.style.display = 'none'; // Close the modal
        
        // Refresh the project list to reflect the changes
        fetchProjects();
      } else {
        console.error('Error updating project:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
}

// Close the modal when the close button is clicked
document.getElementById('close-edit-modal').addEventListener('click', () => {
document.getElementById('edit-modal').style.display = 'none';
});

// Initial call to load the projects when the page loads
fetchProjects();