class ResizablePanels {
    constructor(leftPanelSelector, rightPanelSelector, resizeBarSelector, minWidth = 100) {
        this.leftPanel = document.querySelector(leftPanelSelector);
        this.rightPanel = document.querySelector(rightPanelSelector);
        this.resizeBar = document.querySelector(resizeBarSelector);
        this.minWidth = minWidth;  // Minimum width for the left panel

        this.isResizing = false;
        this.lastDownX = 0;

        this.init();
    }

    init() {
        // Start resizing when clicking on the resize bar
        this.resizeBar.addEventListener('mousedown', (e) => this.startResizing(e));

        // Load panel width from localStorage on page load
        window.addEventListener('DOMContentLoaded', () => this.loadPanelWidth());

        // Adjust layout when the window is resized
        window.addEventListener('resize', () => this.onWindowResize());
    }

    startResizing(e) {
        this.isResizing = true;
        this.lastDownX = e.clientX;
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.stopResizing());
    }

    handleMouseMove(e) {
        if (this.isResizing) {
            let offset = e.clientX - this.lastDownX; // Calculate the change in position
            let leftPanelWidth = this.leftPanel.offsetWidth + offset;

            // Ensure the left panel's width is within the minWidth and max bounds
            if (leftPanelWidth >= this.minWidth && leftPanelWidth <= window.innerWidth - this.minWidth) {
                let parentNode = this.leftPanel.parentNode;
                let parentWidth = parentNode.offsetWidth;
                let rightPanelWidth = parentWidth - leftPanelWidth - 10; // 10px space between panels

                // If the right panel width becomes smaller than minWidth, adjust left panel width
                if (rightPanelWidth < this.minWidth) {
                    leftPanelWidth = parentWidth - this.minWidth - 10; // Adjust left panel to maintain minWidth for right panel
                    rightPanelWidth = this.minWidth; // Set right panel to minWidth
                }

                // Set the new widths for the panels
                this.leftPanel.style.width = leftPanelWidth + 'px';
                this.rightPanel.style.width = rightPanelWidth + 'px';
                this.lastDownX = e.clientX;

                // Save the new width of the left panel in localStorage
                localStorage.setItem('leftPanelWidth', leftPanelWidth);
            }
        }
    }

    stopResizing() {
        this.isResizing = false;
        document.removeEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.removeEventListener('mouseup', () => this.stopResizing());
    }

    loadPanelWidth() {
        let savedLeftPanelWidth = localStorage.getItem('leftPanelWidth');
        
        if (savedLeftPanelWidth) {
            // If a saved width exists, apply it
            const leftPanelWidth = parseInt(savedLeftPanelWidth, 10);
            let parentNode = this.leftPanel.parentNode;
            let parentWidth = parentNode.offsetWidth;
            let rightPanelWidth = parentWidth - leftPanelWidth - 10;

            // Ensure that right panel's width is not less than minWidth
            if (rightPanelWidth < this.minWidth) {
                rightPanelWidth = this.minWidth;
                leftPanelWidth = parentWidth - rightPanelWidth - 10; // Adjust left panel width accordingly
            }

            // Adjust the panels based on the saved width
            this.leftPanel.style.width = leftPanelWidth + 'px';
            this.rightPanel.style.width = rightPanelWidth + 'px';
        }
    }

    onWindowResize() {
        // Recalculate the panel widths based on the new window size
        let savedLeftPanelWidth = localStorage.getItem('leftPanelWidth');
        
        if (savedLeftPanelWidth) {
            let leftPanelWidth = parseInt(savedLeftPanelWidth, 10);
            let parentNode = this.leftPanel.parentNode;
            let parentWidth = parentNode.offsetWidth;
            let rightPanelWidth = parentWidth - leftPanelWidth - 10;

            // If right panel width becomes less than minWidth, adjust left panel width
            if (rightPanelWidth < this.minWidth) {
                rightPanelWidth = this.minWidth;
                leftPanelWidth = parentWidth - rightPanelWidth - 10;
            }

            // Adjust the panels
            this.leftPanel.style.width = leftPanelWidth + 'px';
            this.rightPanel.style.width = rightPanelWidth + 'px';
        }
    }
}

// Instantiate the class with the panel selectors and a minimum width
const resizablePanels = new ResizablePanels('.left-panel', '.right-panel', '.resize-bar', 200);
