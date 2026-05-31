// This script provides a universal "success message" 
// whenever a user completes a feature, 
// such as logging in or uploading a found item.

// Displays the success message
function showSuccessMessage(disappear) {
    // Querying the success message element from HTML
    const successMessage = document.getElementById('success-message');
    // The success message is displayed once the "hidden" class is removed
    successMessage.classList.remove('hidden');

    // Clear the message after 3 seconds
    if (disappear) {
        setTimeout(() => {
            // Add the "hidden" class back to hide the message
            successMessage.classList.add('hidden');
        }, 3000);
    }
}

// Export the function so other javascript files can use it
export { showSuccessMessage };


