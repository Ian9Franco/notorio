document.addEventListener('DOMContentLoaded', function () {
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    
    // Set the initial theme based on saved preference or default to dark mode
    const savedTheme = localStorage.getItem('theme') || 'dark-mode';
    document.body.classList.add(savedTheme);

    // Set the initial icon based on the saved theme
    if (savedTheme === 'dark-mode') {
        themeToggleIcon.classList.add('fa-sun'); // Set to sun icon for dark mode
        themeToggleIcon.classList.remove('fa-moon');
    } else {
        themeToggleIcon.classList.add('fa-moon'); // Set to moon icon for light mode
        themeToggleIcon.classList.remove('fa-sun');
    }

    // Add click event listener to the icon to toggle dark/light mode
    themeToggleIcon.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) {
            // Switch to light mode
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            themeToggleIcon.classList.remove('fa-sun');
            themeToggleIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light-mode'); // Save preference
        } else {
            // Switch to dark mode
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            themeToggleIcon.classList.remove('fa-moon');
            themeToggleIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark-mode'); // Save preference
        }

        // Optionally reload notes or adjust UI elements for the new theme
        loadNotes();
    });
});
