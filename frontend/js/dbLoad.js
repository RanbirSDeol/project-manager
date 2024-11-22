// dbLoad | Nov 21, 2024
// Loads the database into cards to display

async function fetchProjects(params) {
  try {
    // Lets fetch our projects from the backend
    const response = await fetch('http://localhost:5000/projects');

    // If the response is not ok, throw an error
    if (!response.ok) {
      throw new Error('Failed to Fetch Projects');
    }

    // Parse the response JSON
    const data = await response.json();

    // Get the container where we'll display the projects
    const projectList = document.getElementById('project-list');

    // Sort the projects by date_created in descending order (most recent first)
    data.projects.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));

    // Loop through the projects and display them on the page
    data.projects.forEach(project => {
      // Create a new card element for the project
      const projectCard = document.createElement('div');
      projectCard.classList.add('project-card');

      // Add the content of the card
      projectCard.innerHTML = `
        <img src="${project.image}" alt="Project Image" />
        <h3>${project.title}</h3>
        <p>Date Created: ${new Date(project.date_created).toLocaleDateString()}</p>
        <p>Progress: <span id="progress-text">${project.progress}%</span></p>
        <div class="progress-container">
          <div class="progress-bar" style="width: ${project.progress}%"></div>
        </div>
        <div class="controller-container">
          <a href="${project.githubLink}" target="_blank">
            <i class="fa-brands fa-github"></i>
            GitHub
          </a>
          <a href="#" class="delete-button" data-id="${project.id}" project-name="${project.title}">
            <i class="fa-solid fa-trash"></i>
          </a>
        </div>
      `;

      // Now we select the progress bar element within the card
      const progressBar = projectCard.querySelector('.progress-bar');

      // Set the appropriate color based on the progress percentage
      if (project.progress < 30) {
        progressBar.style.backgroundColor = '#ff6666';
      } else if (project.progress >= 30 && project.progress < 60) {
        progressBar.style.backgroundColor = 'yellow';
      } else if (project.progress >= 60 && project.progress < 100) {
        progressBar.style.backgroundColor = '#66ff33';
      } else {
        progressBar.style.backgroundColor = 'cyan';
      }

      // Append the project card to the list
      projectList.appendChild(projectCard);
    });
  } catch (error) {
    console.log('Error Fetching Projects:', error);
    // Display an error message if fetching fails
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = `<p>ERROR: Failed to load projects, please try again later</p>`;
  }
}

fetchProjects();
