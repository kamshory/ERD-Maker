const resizeBar = document.querySelector('.resize-bar');
const leftPanel = document.querySelector('.left-panel');
const rightPanel = document.querySelector('.right-panel');
let isResizing = false;
let lastDownX = 0;

// Start resizing when clicking on the resize bar
resizeBar.addEventListener('mousedown', (e) => {
    isResizing = true;
    lastDownX = e.clientX;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
});

// Function to handle mouse move during resize
function handleMouseMove(e) {
    if (isResizing) {
        const offset = e.clientX - lastDownX; // Calculate the change in position
        const leftPanelWidth = leftPanel.offsetWidth + offset;

        // Set the new widths for the panels, with minimum and maximum width constraints
        if (leftPanelWidth >= 100 && leftPanelWidth <= window.innerWidth - 100) {
            leftPanel.style.width = leftPanelWidth + 'px';
            lastDownX = e.clientX;
        }
    }
}

// Stop resizing when mouse is released
function stopResizing() {
    isResizing = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
}
