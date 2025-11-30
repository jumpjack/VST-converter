// Main application initialization

// Global variables
let currentJSON = null;
let fileData = null;
let nodesListGlobal = [];
let sceneHierarchy = null;
let LODSdataGlobal = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    const pfbParser = new PFBParser();
    const sceneManager = new SceneManager();
    const uiManager = new UIManager();
    const hierarchyManager = new HierarchyManager();
    const exportManager = new ExportManager();

    // Setup event handlers
    uiManager.setupEventHandlers(pfbParser, sceneManager, hierarchyManager, exportManager);

    // Add wheel event listener to canvas
    const canvas = document.getElementById('babylonCanvas');
    canvas.addEventListener('wheel', function(event) {
        event.preventDefault();
    }, { passive: false });

    // Debug: stampa statistiche LOD dopo il parsing
    window.debugLODStats = function() {
        if (window.LODSdataGlobal) {
            const stats = hierarchyManager.getLODStatistics();
            console.log("LOD Statistics:", stats);
            const availableLevels = hierarchyManager.getAvailableLODLevels();
            console.log("Available LOD Levels:", availableLevels);
        }
    };

    console.log("PFB Parser initialized");
});