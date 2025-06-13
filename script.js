// DOM Elements
let uploadImage = document.querySelector(".image");
let button = document.querySelector("#chooseFile");
let displayResult = document.querySelector(".displayFileResult");
let CropButton = document.querySelector("#cropImage");
let resultCropImage = document.querySelector(".imagecrop");
let UploadCropImage = document.querySelector("#uploadCropImage");
let imageSrc, fileInput, cropper, croppedCanva, croppedCanvaURL;

// Show loading status
function showLoading(element) {
    element.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div>';
}

// Show error message
function showError(element, message) {
    element.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i><p>${message}</p></div>`;
}

// Initialize the page
function init() {
    // Set initial state for image containers
    uploadImage.innerHTML = '<div class="placeholder-icon"><i class="fas fa-cloud-upload-alt"></i><p>No image selected</p></div>';
    resultCropImage.innerHTML = '<div class="placeholder-text">Cropped image will appear here</div>';
    
    // Disable crop and upload buttons initially
    CropButton.disabled = true;
    CropButton.classList.add('disabled');
    UploadCropImage.disabled = true;
    UploadCropImage.classList.add('disabled');
}

// Run initialization
init();

// Choose file button functionality
button.addEventListener("click", function() {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'mediaFile[]';
    fileInput.multiple = true;
    fileInput.accept = 'image/*';

    // Trigger the file input
    fileInput.click();

    // Handle the file input events
    fileInput.addEventListener('change', function(event) {
        uploadImage.innerHTML = "";
        const file = event.target.files[0]; // Get the selected files
        
        if (!file) {
            showError(uploadImage, "No file selected");
            return;
        }
        
        const fileType = file.type; // Getting the file type
        
        if (fileType.startsWith('image/')) {
            // Show loading state
            showLoading(uploadImage);
            
            const img = document.createElement("img"); // Creating the img tag
            imageSrc = URL.createObjectURL(file); // Object URL stored in variable
            img.src = imageSrc;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.objectFit = 'cover';
            
            // Enable crop button
            CropButton.disabled = false;
            CropButton.classList.remove('disabled');
            
            img.onload = function() {
                // Clear loading state and append the image
                uploadImage.innerHTML = '';
                uploadImage.appendChild(img);
                
                // To find the actual size of the image we have to create the image object
                const image = new Image();
                image.src = img.src; // Source of the image
                
                image.onload = function() { // onload find the actual size of image
                    const width = image.width;
                    const height = image.height;
                    
                    // Finding the file size
                    const fileSize = file.size;
                    let MB = (fileSize / 1048576).toFixed(2);
                    
                    const ImageRatio = (width / height).toFixed(2);
                    
                    // Create table with image details
                    createTable([
                        ["Image Size:", `${MB} MB`],
                        ["Image Type:", `${fileType.split('/')[1].toUpperCase()}`],
                        ["Image Height:", `${height} px`],
                        ["Image Width:", `${width} px`],
                        ["Image Ratio:", `${ImageRatio}`]
                    ]);
                    
                    // Initialize the cropper
                    if (cropper) {
                        cropper.destroy(); // Destroy previous cropper
                    }
                    
                    cropper = new Cropper(img, {
                        aspectRatio: 1, // 1:1 square form
                        viewMode: 1,
                        autoCropArea: 0.8,
                        scalable: false,
                        zoomable: true,
                        movable: true,
                        guides: true,
                        highlight: true,
                        cropBoxResizable: true,
                        dragMode: 'move',
                        toggleDragModeOnDblclick: true,
                        ready: function() {
                            // Add a success message
                            const successMsg = document.createElement('div');
                            successMsg.className = 'success-message';
                            successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Image loaded successfully';
                            displayResult.prepend(successMsg);
                            
                            // Remove the message after 3 seconds
                            setTimeout(() => {
                                successMsg.style.opacity = '0';
                                setTimeout(() => successMsg.remove(), 300);
                            }, 3000);
                        }
                    });
                };
                
                image.onerror = function() {
                    showError(uploadImage, "Failed to load image dimensions");
                };
            };
            
            img.onerror = function() {
                showError(uploadImage, "Failed to load image");
            };
            
        } else {
            showError(uploadImage, "Please select an image file");
        }
    });
});

// Function to create and display the data
function createTable(data) {
    displayResult.innerHTML = "";
    
    // Create header for the table
    const header = document.createElement('div');
    header.className = 'table-header';
    header.innerHTML = '<i class="fas fa-info-circle"></i> Image Information';
    displayResult.appendChild(header);
    
    let table = document.createElement("table");
    table.className = 'info-table';
    
    // Loop for each rows and column
    data.forEach(rowData => {
        let tr = document.createElement("tr");
        
        rowData.forEach((cellData, index) => {
            let td = document.createElement("td");
            td.textContent = cellData;
            
            if (index === 0) {
                td.className = 'label-cell';
            } else {
                td.className = 'value-cell';
            }
            
            tr.appendChild(td);
        });
        
        table.appendChild(tr);
    });
    
    displayResult.appendChild(table);
}

// Crop button click to crop and display the image
CropButton.addEventListener("click", function() {
    if (cropper) {
        // Show loading state
        showLoading(resultCropImage);
        
        // Add a slight delay to show the loading effect
        setTimeout(() => {
            try {
                const croppedCanvas = cropper.getCroppedCanvas({
                    width: 600,
                    height: 600
                });
                
                const croppedImage = document.createElement("img");
                croppedCanvaURL = croppedCanvas.toDataURL("image/jpeg");
                croppedImage.src = croppedCanvaURL;
                croppedImage.style.maxHeight = "100%";
                croppedImage.style.maxWidth = "100%";
                croppedImage.style.objectFit = "cover";
                
                resultCropImage.innerHTML = ""; // Clear previous results if needed
                resultCropImage.appendChild(croppedImage);
                
                // Enable upload button
                UploadCropImage.disabled = false;
                UploadCropImage.classList.remove('disabled');
                
                // Show success message
                const successNotification = document.createElement('div');
                successNotification.className = 'success-notification';
                successNotification.innerHTML = '<i class="fas fa-check-circle"></i> Image cropped successfully';
                document.querySelector('.imagecropped').appendChild(successNotification);
                
                // Remove the notification after 3 seconds
                setTimeout(() => {
                    successNotification.style.opacity = '0';
                    setTimeout(() => successNotification.remove(), 300);
                }, 3000);
                
            } catch (error) {
                showError(resultCropImage, "Error cropping image. Please try again.");
                console.error("Cropping error:", error);
            }
        }, 500);
        
    } else {
        showError(resultCropImage, "Please select and upload an image before cropping.");
    }
});

// Upload cropped image button functionality
UploadCropImage.addEventListener("click", function() {
    if (!croppedCanvaURL) {
        showError(resultCropImage, "Please crop an image first");
        return;
    }
    
    // Show loading state on button
    const originalText = UploadCropImage.innerHTML;
    UploadCropImage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    UploadCropImage.disabled = true;
    
    // Sent the crop image to backend for modifying the image
    fetch("http://127.0.0.1:5000/process-image", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({image: croppedCanvaURL})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        // Save the processed image URL to session storage
        sessionStorage.setItem("processedImageURL", data.processed_image);
        
        // Create success popup before redirect
        const successPopup = document.createElement('div');
        successPopup.className = 'success-popup';
        successPopup.innerHTML = `
            <div class="popup-content">
                <i class="fas fa-check-circle"></i>
                <h3>Success!</h3>
                <p>Your image has been processed successfully.</p>
                <p>Redirecting to results page...</p>
            </div>
        `;
        document.body.appendChild(successPopup);
        
        // Redirect after showing success message
        setTimeout(() => {
            window.location.href = "displayfinalphoto.html";
        }, 1500);
    })
})
