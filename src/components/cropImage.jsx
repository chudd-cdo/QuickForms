const getCroppedImg = async (imageSrc, pixelCrop) => {
    try {
        const image = new Image();
        image.src = imageSrc;
        await new Promise((resolve) => (image.onload = resolve)); // Ensure image is loaded

        // Create canvas and set dimensions
        const canvas = document.createElement("canvas");
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext("2d");

        // Draw the cropped image onto the canvas
        ctx.drawImage(
            image,
            pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
            0, 0, pixelCrop.width, pixelCrop.height
        );

        // Convert canvas to Blob and return as File
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Canvas is empty"));
                    return;
                }
                resolve(new File([blob], "cropped-image.jpg", { type: "image/jpeg" }));
            }, "image/jpeg");
        });
    } catch (error) {
        console.error("Error cropping image:", error);
        return null;
    }
};

export default getCroppedImg;
