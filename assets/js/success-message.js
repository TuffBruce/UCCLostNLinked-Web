function showSuccessMessage(disappear) {
    const successMessage = document.getElementById('success-message');
    successMessage.classList.remove('hidden');

    // clear after 3 seconds
    if (disappear) {
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 3000);
    }
}


export { showSuccessMessage };


