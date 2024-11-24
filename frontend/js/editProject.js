const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-project-form");
const editProgressBar = document.getElementById("edit-progress");
const editProgressText = document.getElementById("edit-progress-text");

// Function to open the edit modal and populate it with data
function openEditModal(project) {
    document.getElementById("edit-title").value = project.title;
    document.getElementById("edit-progress").value = project.progress;
    document.getElementById("edit-progress-text").textContent = `${project.progress}%`;
    document.getElementById("edit-githubLink").value = project.githubLink;
    document.getElementById("edit-date_created").value = project.date_created;
    document.getElementById("edit-isFavorite").checked = project.isFavorite;

    editModal.style.display = "flex";
}

// Function to close the edit modal
function closeEditModal() {
    editModal.style.display = "none";
}

// Update progress bar color dynamically in the edit modal
editProgressBar.addEventListener("input", () => {
    editProgressText.textContent = `${editProgressBar.value}%`;
});

// Handle form submission
editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const projectId = "some_project_id"; // Replace with actual project ID
    const formData = new FormData(editForm);

    const response = await fetch(`http://localhost:5000/projects/${projectId}`, {
        method: "PUT", // Using PUT for editing
        body: formData,
    });

    if (response.ok) {
        alert("Project updated successfully!");
        closeEditModal();
        // Reload or refresh the project list
    } else {
        const result = await response.json();
        alert("Error: " + result.message);
    }
});