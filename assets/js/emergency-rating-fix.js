/**
 * Emergency rating fix script
 * This is a direct intervention to fix star rating selection
 */
(function() {
    // Function to immediately fix all star ratings
    function emergencyRatingFix() {
        console.log("🚨 Emergency rating fix running");
        
        // Find all star containers
        const starContainers = document.querySelectorAll('.stars-input');
        console.log(`Found ${starContainers.length} star containers`);
        
        if (starContainers.length === 0) {
            console.log("No star containers found, will retry later");
            setTimeout(emergencyRatingFix, 500);
            return;
        }
        
        // Process each container
        starContainers.forEach((container, idx) => {
            console.log(`Processing container ${idx+1}`);
            
            // Get all stars and validate
            const stars = container.querySelectorAll('i');
            console.log(`Container has ${stars.length} stars`);
            
            if (stars.length === 0) {
                console.log(`No stars found in container ${idx+1}, skipping`);
                return;
            }
            
            // Create a direct DOM overlay for the stars to ensure they're clickable
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.display = 'flex';
            overlay.style.zIndex = '9999';
            overlay.style.backgroundColor = 'transparent';
            container.style.position = 'relative';
            
            // Create 5 clickable star areas
            for (let i = 1; i <= 5; i++) {
                const starArea = document.createElement('div');
                starArea.style.flex = '1';
                starArea.style.cursor = 'pointer';
                starArea.style.display = 'flex';
                starArea.style.justifyContent = 'center';
                starArea.style.alignItems = 'center';
                starArea.setAttribute('data-rating', i);
                
                // Create visible star element
                const starIcon = document.createElement('i');
                starIcon.className = 'far fa-star';
                starIcon.style.fontSize = '24px';
                starIcon.style.color = '#ddd';
                starArea.appendChild(starIcon);
                
                // Click handler to set rating
                starArea.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const rating = parseInt(this.getAttribute('data-rating'));
                    console.log(`Emergency star clicked: ${rating}`);
                    
                    // Update visual appearance of all stars
                    overlay.querySelectorAll('div').forEach(area => {
                        const areaRating = parseInt(area.getAttribute('data-rating'));
                        const icon = area.querySelector('i');
                        if (areaRating <= rating) {
                            icon.className = 'fas fa-star';
                            icon.style.color = '#FFC107';
                        } else {
                            icon.className = 'far fa-star';
                            icon.style.color = '#ddd';
                        }
                    });
                    
                    // Store rating in the form
                    const form = container.closest('form');
                    if (form) {
                        let hiddenInput = form.querySelector('input[name="emergency_rating"]');
                        if (!hiddenInput) {
                            hiddenInput = document.createElement('input');
                            hiddenInput.type = 'hidden';
                            hiddenInput.name = 'emergency_rating';
                            form.appendChild(hiddenInput);
                        }
                        // Ensure rating is a valid number
                        const numericRating = parseInt(rating);
                        if (!isNaN(numericRating) && numericRating > 0 && numericRating <= 5) {
                            hiddenInput.value = numericRating;
                            console.log(`Set emergency rating to ${numericRating}`);
                        } else {
                            console.error(`Invalid rating value: ${rating}`);
                        }
                    }
                    
                    return false;
                });
                
                // Hover effects
                starArea.addEventListener('mouseover', function() {
                    const rating = parseInt(this.getAttribute('data-rating'));
                    
                    // Update visual appearance on hover
                    overlay.querySelectorAll('div').forEach(area => {
                        const areaRating = parseInt(area.getAttribute('data-rating'));
                        const icon = area.querySelector('i');
                        if (areaRating <= rating) {
                            icon.className = 'fas fa-star';
                            icon.style.color = '#FFC107';
                        }
                    });
                });
                
                overlay.appendChild(starArea);
            }
            
            // Handle mouseleave on the overlay
            overlay.addEventListener('mouseleave', function() {
                // Find the stored rating
                const form = container.closest('form');
                let savedRating = 0;
                
                if (form) {
                    const hiddenInput = form.querySelector('input[name="emergency_rating"]');
                    if (hiddenInput && hiddenInput.value) {
                        savedRating = parseInt(hiddenInput.value);
                    }
                }
                
                // Reset stars based on saved rating
                overlay.querySelectorAll('div').forEach(area => {
                    const areaRating = parseInt(area.getAttribute('data-rating'));
                    const icon = area.querySelector('i');
                    if (areaRating <= savedRating) {
                        icon.className = 'fas fa-star';
                        icon.style.color = '#FFC107';
                    } else {
                        icon.className = 'far fa-star';
                        icon.style.color = '#ddd';
                    }
                });
            });
            
            // Add overlay to container
            container.appendChild(overlay);
            console.log(`Added overlay to container ${idx+1}`);
        });
    }
    
    // Call our fix after a short delay to ensure DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(emergencyRatingFix, 100);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(emergencyRatingFix, 100);
        });
    }
    
    // Also add a window load handler as a fallback
    window.addEventListener('load', function() {
        setTimeout(emergencyRatingFix, 500);
    });
})();
