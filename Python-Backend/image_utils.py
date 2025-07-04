from PIL import Image
import subprocess
import tempfile
import os
import cv2
import numpy as np
import requests
from pylibdmtx.pylibdmtx import decode as dmtx_decode
import configparser
import os
import sys

# 1. build absolute paths to all the config.ini files you care about
base_dir = os.path.dirname(__file__)
ini_paths = [
    os.path.join(base_dir, "file_aus",     "config.ini"),
    os.path.join(base_dir, "file_austest", "config.ini"),
]

# 2. filter out any that don’t actually exist
ini_paths = [p for p in ini_paths if os.path.isfile(p)]
if not ini_paths:
    print("❌ No config.ini found in file_aus/ or file_austest/")
    sys.exit(1)

# 3. read them *in order* (later files override earlier ones if they share sections/keys)
config = configparser.ConfigParser()
config.read(ini_paths)

# 4. now just grab your value
try:
    brcli_path = config["Paths"]["barcode_reader_exe"]
except KeyError as e:
    print(f"❌ Missing key in merged config: {e}")
    sys.exit(1) 
 
class ImageProcessor:
    """Class for processing images, including resizing and text extraction."""
 
    def __init__(self, image_path: str):
        """Initialize the image processor with the path to the image.
 
        - Arguments:
            image_path: str, the file path of the image to be processed.
        """
        self.image_path = image_path  # Store the image path
 
    def resize_image_and_extract_text(
        self, target_width: int, target_height: int
    ) -> str:
        """Resize the image to the target dimensions and extract text using BarcodeReaderCLI.
 
        - Arguments:
            target_width: int, the desired width of the resized image.
            target_height: int, the desired height of the resized image.
 
        - Returns:
            str: The extracted text from the image, or an empty string if no text is found.
        """
        # Open the image file using PIL
        image = Image.open(self.image_path)
        # Convert the image to a NumPy array for OpenCV processing
        image_np = np.array(image)
        # Resize the image to the target dimensions
        resized_image = cv2.resize(
            image_np, (target_width, target_height), interpolation=cv2.INTER_AREA
        )
        # Convert the resized NumPy array back to a PIL Image
        resized_image_pil = Image.fromarray(resized_image)
 
        # Create a temporary file to save the resized image
        with tempfile.NamedTemporaryFile(
            suffix=".png", delete=False
        ) as temp_image_file:
            resized_image_pil.save(temp_image_file.name)  # Save the image to the temp file
 
            exe_path = brcli_path # Path to the CLI executable for text extraction
            try:
                # Run the CLI executable with the temporary image file as an argument
                cp = subprocess.run(
                    [exe_path, temp_image_file.name],
                    universal_newlines=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                )
                output = cp.stdout  # Capture the standard output from the CLI
                # Find the extracted text in the output
                start_index = output.find('"text": "') + len('"text": "')
                end_index = output.find('"', start_index)
                text = output[start_index:end_index]
 
                # Return the extracted text unless it equals "sions"
                if text != "sions":
                    return text
                else:
                    return ""
            except subprocess.CalledProcessError as e:
                # Handle any errors that occur when running the subprocess
                print(f"Error running subprocess: {e}")
                return ""
            #finally:
                # Clean up the temporary file after processing
                # os.unlink(temp_image_file.name)
 
 
class ImageDecoder:
    """Class for decoding images to extract text information."""
 
    def __init__(self, image_path: str):
        """Initialize the image decoder with the path to the image.
 
        - Arguments:
            image_path: str, the file path of the image to be processed.
        """
        self.image_path = image_path  # Store the image path
 
    def process_images(self, target_width: int, target_height: int) -> str:
        """Resize the image and extract text from it using BarcodeReaderCLI.
 
        - Arguments:
            target_width: int, the desired width of the resized image.
            target_height: int, the desired height of the resized image.
 
        - Returns:
            str: The extracted text from the image, or an empty string if no text is found.
        """
        # Open the image file using PIL
        image = Image.open(self.image_path)
        # Convert the image to a NumPy array for OpenCV processing
        image_np = np.array(image)
        # Resize the image to the target dimensions
        resized_image = cv2.resize(
            image_np, (target_width, target_height), interpolation=cv2.INTER_AREA
        )
        # Convert the resized NumPy array back to a PIL Image
        resized_image_pil = Image.fromarray(resized_image)
 
        # Create a temporary file to save the resized image
        with tempfile.NamedTemporaryFile(
            suffix=".png", delete=False
        ) as temp_image_file:
            resized_image_pil.save(temp_image_file.name)  # Save the image to the temp file
 
            exe_path = brcli_path  # Path to the BarcodeReaderCLI executable
            # Run the executable with the original image file as an argument
            process = subprocess.Popen(
                [exe_path, self.image_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            stdout, stderr = process.communicate()  # Capture standard output and error
            if stderr:
                # Print any errors encountered during processing
                print("Error for", self.image_path, ":", stderr.decode("utf-8"))
                return ""  # Return empty string if there's an error
            else:
                # Decode the standard output to extract QR code text
                qr_code_text = stdout.decode("utf-8").strip()
                if qr_code_text:
                    # Extract the relevant text from the output
                    start_index = qr_code_text.find('"text": "') + len('"text": "')
                    end_index = qr_code_text.find('"', start_index)
                    text = qr_code_text[start_index:end_index]
                    # Return the extracted text unless it equals "sions"
                    if text != "ssions" and text != "sions":
                        return text
 
        # If no text is found in the BarcodeReaderCLI output, call pylibmtx
        return self.decode_with_pylibdmtx(self.image_path)
 
    @staticmethod
    def decode_with_pylibdmtx(image_path: str) -> str:
        try:
            image = Image.open(image_path)
            decoded = dmtx_decode(image)
            if decoded:
                results = ", ".join(code.data.decode("utf-8") for code in decoded)
                # print(f"[pylibdmtx] {os.path.basename(image_path)} decoded: {results}")
                return results
            else:
                return ""
                #print(f"[pylibdmtx] {os.path.basename(image_path)}: No Data Matrix code found.")
        except Exception as e:
            print(f"[pylibdmtx] Failed to process {os.path.basename(image_path)}: {e}")
        return ""
 
    def process(self, target_width: int, target_height: int) -> str:
        result = self.process_images(target_width, target_height)
        if result:
            return result
 
        return self.decode_with_pylibdmtx(self.image_path)
        if result:
            return result
 
 
 
 
 