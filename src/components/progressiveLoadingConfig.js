// Configuration for progressive loading behavior
export const PROGRESSIVE_LOADING_CONFIG = {
    // Threshold percentage (0.9 = 90%) that triggers loading of next component
    SCROLL_THRESHOLD: 0.9,
    
    // Delay in milliseconds before loading next component (for better UX)
    LOADING_DELAY: 500,
    
    // Root margin for intersection observer (triggers slightly before component is fully visible)
    ROOT_MARGIN: '0px 0px -5% 0px',
    
    // Thresholds for intersection observer (when to trigger progress updates)
    INTERSECTION_THRESHOLDS: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    
    // Component loading order (can be customized)
    COMPONENT_ORDER: [
        { name: 'Unsplash', priority: 1 },
        { name: 'Pixabay', priority: 2 },
        { name: 'Picsum', priority: 3 },
        { name: 'Pexels', priority: 4 }
    ],
    
    // Performance settings
    PERFORMANCE: {
        // Enable/disable progress tracking
        TRACK_PROGRESS: true,
        
        // Enable/disable loading animations
        SHOW_LOADING_ANIMATIONS: true,
        
        // Enable/disable progress indicators on components
        SHOW_PROGRESS_INDICATORS: true,
        
        // Enable/disable status dashboard
        SHOW_STATUS_DASHBOARD: true
    }
};

// Helper function to get component name by index
export const getComponentName = (index) => {
    return PROGRESSIVE_LOADING_CONFIG.COMPONENT_ORDER[index]?.name || `Component ${index}`;
};

// Helper function to get component priority by index
export const getComponentPriority = (index) => {
    return PROGRESSIVE_LOADING_CONFIG.COMPONENT_ORDER[index]?.priority || index + 1;
};

export default PROGRESSIVE_LOADING_CONFIG; 