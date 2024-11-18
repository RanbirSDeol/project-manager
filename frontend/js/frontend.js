// This function will be responsible for fetching the project data from the backend
async function fetchProjects() {
  try {
      // Fetch the list of projects from the backend
      const response = await fetch('http://localhost:5000/projects');
      
      // If the response is not ok, throw an error
      if (!response.ok) {
          throw new Error('Failed to fetch projects');
      }

      // Parse the response JSON
      const data = await response.json();

      // Get the container where we'll display the projects
      const projectList = document.getElementById('project-list');

      // Loop through the projects and display them on the page
      data.projects.forEach(project => {
          // Create a new card element for each project
          const projectCard = document.createElement('div');
          projectCard.classList.add('project-card');

          // Add the content of the card
          projectCard.innerHTML = `
              <img src="${project.image}" alt="Project Image" />
              <h3>${project.title}</h3>
              <p>${project.description}</p>
              <p>${project.progress}%</p>
              <a href="${project.githubLink}" target="_blank">View on GitHub</a>
          `;

          // Append the card to the project list container
          projectList.appendChild(projectCard);
      });
  } catch (error) {
      console.error('Error fetching projects:', error);
      // Display an error message if fetching fails
      const projectList = document.getElementById('project-list');
      projectList.innerHTML = `<p>Failed to load projects. Please try again later.</p>`;
  }
}

// Call the fetchProjects function when the page loads
fetchProjects();