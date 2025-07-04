
from image_utils import ImageProcessor, ImageDecoder
import os
import configparser
 
 
def main(config_file_path):
    config = configparser.ConfigParser()
    config.read(config_file_path)
    code_type = config["Codetype"]["type"]
 
    # Specify the folder containing the images
    images_folder = "predict"
 
    # Get a list of all image files in the folder
    image_files = [f for f in os.listdir(images_folder) if f.endswith(".png")]
 
    for image_file in image_files:
        # Construct the full path to each image
        image_path = os.path.join(images_folder, image_file)
 
        if code_type == "Barcode":
            # Initialize the ImageProcessor with the image path
            image_processor = ImageProcessor(image_path)
 
            # Resize the image and extract text
            text_result = image_processor.resize_image_and_extract_text(377, 102)
            if text_result != "":
                print(f"Text result for {image_file}: {text_result}")
 
        elif code_type == "QRcode":
            # Initialize the ImageDecoder with the image path
            image_decoder = ImageDecoder(image_path)
 
            # Process the image and extract QR code
            qr_result = image_decoder.process_images(377, 102)
            if qr_result:
                print(f"QR code result for {image_file}: {qr_result}")
 
 
def confi_file(config_file_path):
    """Read config file and call the main function"""
    main(config_file_path)
 
 
if __name__ == "__main__":
    config_folder_path = "file"
 
    # Loop through all files in the folder
    for file_name in os.listdir(config_folder_path):
        if file_name.endswith(".ini"):  # Adjust the file extension if needed
            config_file_path = os.path.join(config_folder_path, file_name)
            confi_file(config_file_path)
