document.addEventListener("click", (event) => {
  // Check if the clicked element or any of its parents is a delete-button
  const button = event.target.closest(".delete-button");
  if (button) {
    event.preventDefault(); // Prevent default behavior (navigation)

    const projectId = button.getAttribute("data-id"); // Get the project ID
    const projectName = button.getAttribute("project-name");
    const modal = document.getElementById("delete-modal");
    const message = document.getElementById("delete-message");
    const deleteYes = document.getElementById("delete-yes");
    const deleteNo = document.getElementById("delete-no");

    // Display the modal and set the message
    message.textContent = `Are You Sure You Want To Delete [${projectName}]?`;
    modal.style.display = "flex";

    // When 'Yes' is clicked, send the DELETE request
    deleteYes.addEventListener("click", () => {
      fetch(`/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(response => {
          if (response.ok) {
            button.closest(".project-card")?.remove(); // Remove the project card from the DOM

            // Show the success message
            const successBar = document.getElementById("success-message");
            successBar.classList.add("show"); // Make the success bar slide down

            // Hide the success message after 3 seconds
            setTimeout(() => {
              successBar.classList.remove("show");
            }, 3000);
          }
          modal.style.display = "none"; // Close the modal after action
        })
        .catch(error => {
          console.error("Error:", error);
          modal.style.display = "none"; // Close the modal on error
        });
    });

    // When 'No' is clicked, just close the modal
    deleteNo.addEventListener("click", () => {
      modal.style.display = "none"; // Close the modal without doing anything
    });
  }
});
