import logging
import warnings
import cv2
import os
import shutil
import io
from Camera_aus import MerakiCamera
from pyzbar.pyzbar import decode
from image_utils import ImageDecoder
warnings.simplefilter("ignore")
from ultralytics import YOLO
import requests
import configparser
import datetime
import boto3
 
def run_for_config_file(config_file_path):
    config = configparser.ConfigParser()
    config.read(config_file_path)
    SERIAL_NUMBER = config["Camera"]["serial_number"]
    API_KEY = config["Camera"]["api_key"]
    MODEL_PATH = config["Paths"]["model_path"]
    GET_API_URL = config["API"]["get_api_url"]
    GET_API1_URL = config["API"]["get_api1_url"]
    PUT_API_URL = config["API"]["put_api_url"]
    POST_API_URL = config["API"]["post_api_url"]
    PREDICT_PATH = config["Paths"]["predict_path"]
    PREDICT1_PATH = config["Paths"]["predict1_path"]
    AWS_ACCESS_KEY = config["AWS"]["access_key"]
    AWS_SECRET_KEY = config["AWS"]["secret_key"]
    AWS_REGION = config["AWS"]["region"]
    S3_BUCKET = config["AWS"]["s3_bucket"]
    S3_FOLDER = config["AWS"]["predictions_folder"]
    S3_SNAPSHOT = config["AWS"]["snapshot_folder"]
 
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=AWS_REGION,
    )
 
    log_file_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "logfile.log"
    )
    logging.basicConfig(filename=log_file_path, level=logging.DEBUG)
 
    file_name = "snapshot.png"
 
    class DrugBoxCounter:
        def __init__(self, serial, api_key):
            self.serial = serial
            self.api_key = api_key
            self.camera = MerakiCamera(serial=self.serial, api_key=self.api_key)
 
        def get_prediction(self, input_image, file_name):
            model_path = MODEL_PATH
            model = YOLO(model_path)
           
            # Run YOLO prediction directly on the image array
            res = model.predict(input_image, save=False)
            result = res[0]
 
            # Use the input image (make a copy if you plan to draw on it)
            image = input_image.copy()
           
            # Draw bounding boxes on the image
            for box in result.boxes:
                cords = box.xyxy[0].tolist()
                cords = [round(x) for x in cords]
                class_id = result.names[box.cls[0].item()]
                conf = round(box.conf[0].item(), 3)
 
                # Draw rectangle and label
                cv2.rectangle(image, (cords[0], cords[1]), (cords[2], cords[3]), (0, 255, 0), 2)
                cv2.putText(image, f"{class_id} {conf}", (cords[0], cords[1] - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
 
            # Convert image to memory buffer (instead of saving locally)
            _, img_encoded = cv2.imencode(".jpg", image)
            img_bytes = io.BytesIO(img_encoded.tobytes())
 
            # Define S3 file key using the provided file_name
            s3_file_key = S3_FOLDER + file_name  # file_name should be a simple string filename
 
            # Upload directly to S3
            try:
                s3_client.upload_fileobj(img_bytes, S3_BUCKET, s3_file_key)
                logging.info(f"Uploaded image directly to S3: {s3_file_key}")
            except Exception as e:
                logging.error(f"Failed to upload to S3: {e}")
 
            # Process predictions for response
            output_predictions = []
            for box in result.boxes:
                cords = box.xyxy[0].tolist()
                cords = [round(x) for x in cords]
                conf = round(box.conf[0].item(), 3)
                prediction = {
                    "x": (cords[0] + cords[2]) / 2,
                    "y": (cords[1] + cords[3]) / 2,
                    "width": cords[2] - cords[0],
                    "height": cords[3] - cords[1],
                    "confidence": conf,
                    "class": result.names[box.cls[0].item()],
                    "class_id": int(box.cls[0].item()),
                }
                output_predictions.append(prediction)
 
            logging.info(f"Predictions: {output_predictions}")
            return output_predictions
 
 
        def filter_objects_by_class(self, results, target_class):
            filtered_objects = [
                val for val in results if val["class"].lower() == target_class.lower()
            ]
            filter_shelf = [val for val in results if val["class"].lower() == "shelf"]
            logging.info(f"filter_objects_by_class - {filtered_objects}")
            return filtered_objects, filter_shelf
 
       
 
        def save_image(self, file_name, image_with_box):
            # Local path where images are stored
            path_name = os.path.join(PREDICT_PATH, "predict")
 
            # If the folder exists and contains files, delete its contents
            if os.path.exists(path_name):
                for file in os.listdir(path_name):
                    file_path = os.path.join(path_name, file)
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)  # Delete file
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)  # Delete subdirectory
                logging.info("Cleared existing contents in 'predict' folder.")
 
            else:
                # Create the folder if it doesn't exist
                os.makedirs(path_name)
 
            # Local path where the image is saved
            img_out = os.path.join(path_name, file_name)
 
            # Save the image locally first
            cv2.imwrite(img_out, image_with_box)
 
            # Read the image and upload to S3
            try:
                with open(img_out, 'rb') as img_file:
                    s3_client.put_object(
                        Bucket=S3_BUCKET,
                        Key=f'predict/{file_name}',  # The file path in your S3 bucket
                        Body=img_file,
                        ContentType='image/jpeg'  # Adjust if you use a different image format
                    )
                logging.info(f"save_image - Image uploaded to S3 as {file_name}")
            except Exception as e:
                logging.error(f"Error uploading image to S3: {str(e)}")
                return False
            return True
 
        def decode_barcode(self, img_file_path):
            try:
                image = cv2.imread(img_file_path)
                gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                decoded_objects = decode(gray_image)
                if decoded_objects:
                    barcode_data_list = decoded_objects[0].data.decode("utf-8")
                    logging.info(f"decode_barcode - Barcode data: {barcode_data_list}")
                    return barcode_data_list
                else:
                    return ""
            except Exception as e:
                print(f"Error: {e}")
 
        def process_barcodes(self, image, predictions):
            n = 1
            decoded_objects = []
            barcodes = sorted(
                [val for val in predictions if val["class"].lower() == "barcode"],
                key=lambda x: x["x"],
            )
            for idx, val in enumerate(barcodes):
                x, y, width, height = val["x"], val["y"], val["width"], val["height"]
                x1 = max(0, int(x - width / 2))
                y1 = max(0, int(y - height / 2))
                x2 = min(image.shape[1], int(x + width / 2))
                y2 = min(image.shape[0], int(y + height / 2))
                start_point = (x1, y1)
                end_point = (x2, y2)
                color = (0, 255, 0)
                thickness = 2
                image_with_box = cv2.rectangle(
                    image.copy(), start_point, end_point, color, thickness
                )
                cropped_image = image[y1:y2, x1:x2]
                image_file = str(n) + "_bbox_" + file_name.split("\\")[-1]
                n += 1
                image_saved = self.save_image(image_file, cropped_image)
                if image_saved:
                    # Use the ImageProcessor class to decode barcode
                    image_processor = ImageDecoder(
                        os.path.join(PREDICT1_PATH, image_file)
                    )
                    barcode = image_processor.process_images(377, 102)
                    # print(barcode)
                    if barcode != "":
                        decoded_objects.append({"barcode": barcode, "x": x, "y": y})
            # print(decoded_objects, "decoded----")
            logging.info(f"process_barcodes - {decoded_objects}")
            return decoded_objects
       
        def process_trays_and_cobjects(self, predictions):
            target_class = "cobj"
            trays_results, _ = self.filter_objects_by_class(predictions, "tray")
            trays_and_cobjects_results = []
            for tray in trays_results:
                tray_x, tray_y = tray["x"], tray["y"]
                cobjects_in_tray, _ = self.filter_objects_by_class(
                    predictions, target_class
                )
                cobjects_in_current_tray = [
                    cobj
                    for cobj in cobjects_in_tray
                    if tray_x - tray["width"] / 2
                    < cobj["x"]
                    < tray_x + tray["width"] / 2
                    and tray_y - tray["height"] / 2
                    < cobj["y"]
                    < tray_y + tray["height"] / 2
                ]
                cobjects_count_adjusted = (
                    len(cobjects_in_current_tray)
                    if any(cobjects_in_current_tray)
                    else len(cobjects_in_current_tray)
                )
                trays_and_cobjects_results.append(
                    {
                        "tray_x": tray_x,
                        "tray_y": tray_y,
                        "cobjects_count": cobjects_count_adjusted,
                    }
                )
            return trays_and_cobjects_results
 
        def process_shelves_and_boxes(self, predictions):
            racks = [val for val in predictions if val["class"].lower() == "shelf"]
            barcodesArr = []
            arr = []
            finalArr = []
            for val in racks:
                x1 = val["x"] - int(val["width"] / 2)
                y1 = val["y"] - int(val["height"] / 2)
                x2 = val["x"] + int(val["width"] / 2)
                y2 = val["y"] + int(val["height"] / 2)
                filtered_predictions = [
                    obj
                    for obj in predictions
                    if x1 < obj["x"] < x2
                    and y1 < obj["y"] < y2
                    and obj["class"].lower() != "shelf"
                ]
                barcodesArr.append(filtered_predictions)
            for obj in barcodesArr:
                barCodes = sorted(
                    [
                        dict(
                            check,
                            **{
                                "x1": check["x"] - int(check["width"] / 2),
                                "x2": check["x"] + int(check["width"] / 2),
                            },
                        )
                        for check in obj
                        if check["class"].lower() == "barcode"
                    ],
                    key=lambda a: a["x"],
                )
                boxes = [
                    dict(
                        check,
                        **{
                            "x1": check["x"] - int(check["width"] / 2),
                            "x2": check["x"] + int(check["width"] / 2),
                        },
                    )
                    for check in obj
                    if check["class"].lower() in ["mbox", "box-bottle", "syrup","capsule"]
                ]
                halfBoxes = [
                    dict(
                        check,
                        **{
                            "x1": check["x"] - int(check["width"] / 2),
                            "x2": check["x"] + int(check["width"] / 2),
                        },
                    )
                    for check in obj
                    if check["class"].lower() == "half"
                ]
                updatedArr = []
                for idx, val in enumerate(barCodes):
                    checkedVal = list(
                        filter(
                            lambda item: (
                                item["x"] <= val["x2"]
                                and item["x"] >= barCodes[idx - 1]["x2"]
                                if idx == len(barCodes) - 1
                                else (
                                    item["x2"] >= val["x1"]
                                    and item["x2"] <= barCodes[idx + 1]["x1"]
                                    if idx > 0
                                    else item["x"] <= val["x2"]
                                )
                            ),
                            boxes,
                        )
                    )
                    arrCheck = [
                        {
                            **hb,
                            "hbCount": list(
                                filter(
                                    lambda item: item["x"] <= hb["x2"]
                                    and item["x"] >= hb["x1"],
                                    halfBoxes,
                                )
                            ),
                        }
                        for idx, hb in enumerate(checkedVal)
                    ]
                    updatedArr.append(
                        {
                            "boxes": arrCheck,
                            "count": len([v for v in arrCheck if len(v["hbCount"]) > 0])
                            > 0
                            and (len(arrCheck) - 0.5)
                            or len(arrCheck),
                            **val,
                        }
                    )
                arr.append(updatedArr)
            for val in arr:
                finalArr.extend(val)
            return finalArr
 
        def combine_results(self, finalArr, decoded_objects):
            combined_results = []
            for final_entry in finalArr:
                for barcode_entry in decoded_objects:
                    if (
                        final_entry["x"] == barcode_entry["x"]
                        and final_entry["y"] == barcode_entry["y"]
                    ):
                        combined_results.append(
                            {
                                "barcode": barcode_entry["barcode"],
                                "count": final_entry["count"],
                            }
                        )
            return combined_results
 
        def update_product_data(self, combined_results):
            # API endpoint for fetching product data
            get_api_url = GET_API_URL
            # API endpoint for the PUT request
            put_api_url = PUT_API_URL
            # Make a GET request to fetch product data
            response = requests.get(get_api_url)
            if response.status_code == 200:
                products = response.json()
                for product in products:
                    # Extract information from the product
                    imprest_product_id = str(product["id"])
                    product_id = product["Product"]["id"]
                    short_code = product["Product"]["short_code"]
 
                    found_camera = []
                    if len(product["cameras"]) > 0:
                        found_camera = [
                            obj
                            for obj in product["cameras"]
                            if SERIAL_NUMBER in obj.values()
                        ]
                    # print(found_camera, "============+++++++++==========")
                    count = next(
                        (
                            result["count"]
                            for result in combined_results
                            if result.get("barcode") == short_code
                            and product.get("imprest")
                            and len(found_camera) > 0
                            # and SERIAL_NUMBER == product["imprest"]["serialNo"]
                        ),
                        None,
                    )
                    if count is not None:
                        # Constructing the payload
                        payload = {"available_stock": float(count)}
                        # Constructing the PUT API endpoint for the specific product ID
                        put_url_for_product = f"{put_api_url}{imprest_product_id}"
                        # Making the PUT request
                        response_put = requests.put(put_url_for_product, json=payload)
                        # print(response_put.content) == response.text
                        # Checking the response status
                        if response_put.status_code == 200:
                            print(
                                f"Successfully updated product {short_code} with available_stock: {count}"
                            )
                        else:
                            print(response_put.content) == response.text
                            print(
                                f"Error updating product {short_code}. Status code: {response_put.status_code}"
                            )
                    else:
                        print(f"Count not found for product {short_code}")
            else:
                print("Error in fetching product data from the API.")
 
        def post_object_detected(self, SERIAL_NUMBER, total_cobjects_count):
            # API endpoint for the POST request
            post_api_url = POST_API_URL
            # Data for the POST request
            payload = {
                "serialNo": SERIAL_NUMBER,
                "data": {"count": total_cobjects_count, "shelf": 1},
            }
            # Making the POST request
            response_post = requests.post(post_api_url, json=payload)
            # Checking the response status
            if response_post.status_code == 200:
                print("Successfully posted object detection alert.")
            else:
                print(
                    f"Error posting object detection alert. Status code: {response_post.status_code}"
                )
 
        def get_imprest_name_from_api(self):
            get_api_imprest = GET_API1_URL
            # API endpoint for fetching imprest name
            response = requests.get(get_api_imprest)
            if response.status_code == 200:
                imprests = response.json()
                for imprest in imprests:
                    # Extract information from the product
                    name = imprest["name"]
                    cameras_list = imprest.get("camerasList", [])
 
                    for camera in cameras_list:
                        # Use 'camerasList' instead of 'cameraList'
                        camera_serial = camera.get("serial_number", "")
 
                        if camera_serial == SERIAL_NUMBER:
                            # If the camera serial number matches, use the imprest name
                            print(name)
                            return name
 
                print(
                    f"Camera with serial number {SERIAL_NUMBER} not found in any imprest."
                )
                return "default_imprest_name"
            else:
                print(
                    f"Error fetching imprest name from the API. Status code: {response.status_code}"
                )
                return "default_imprest_name"
    def upload_to_s3(image, s3_file_key):
        # Check if the image is valid
        if image is None:
            logging.error("upload_to_s3: Captured image is None!")
            return False
 
        # Encode the image to JPEG in memory
        success, img_encoded = cv2.imencode(".jpg", image)
        if not success:
            logging.error("upload_to_s3: Failed to encode image!")
            return False
 
        img_bytes = io.BytesIO(img_encoded.tobytes())
        size = len(img_bytes.getvalue())
        logging.info(f"upload_to_s3: Encoded image size: {size} bytes")
        logging.info(f"upload_to_s3: Uploading with key: {s3_file_key}")
 
        # Attempt to upload to S3
        try:
            s3_client.upload_fileobj(img_bytes, S3_BUCKET, s3_file_key)
            logging.info(f"upload_to_s3: Image successfully uploaded to S3: {s3_file_key}")
            return True
        except Exception as e:
            logging.error(f"upload_to_s3: Failed to upload to S3: {e}")
            return False
    def main():
        drugbox_counter = DrugBoxCounter(serial=SERIAL_NUMBER, api_key=API_KEY)
   
        # Fetch imprest data from the API
        imprest_name = drugbox_counter.get_imprest_name_from_api()
   
        # Create an instance of MerakiCamera with your specific values
        camera = MerakiCamera(serial=SERIAL_NUMBER, api_key=API_KEY)
   
        # Use the fetched imprest name as the snapshot name
        current_datetime = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"{imprest_name}_{SERIAL_NUMBER}_{current_datetime}.png"
   
        # Save a snapshot with the generated filename inside the folder
        # local_snapshot_path = os.path.join(folder_path, file_name)
        image=camera.capture_snapshot()
   
        # Upload the snapshot to S3
        s3_file_path = f"{S3_SNAPSHOT}/{file_name}"  # Path in S3
        upload_to_s3(image, s3_file_path)
        results = drugbox_counter.get_prediction(image, file_name)
        decoded_objects = drugbox_counter.process_barcodes(image, results)
        shelf_and_boxes_results = drugbox_counter.process_shelves_and_boxes(results)
        combined_results = drugbox_counter.combine_results(
            shelf_and_boxes_results, decoded_objects
        )
        trays_and_cobjects_results = drugbox_counter.process_trays_and_cobjects(results)
        total_cobjects_count = sum(
            tray["cobjects_count"] for tray in trays_and_cobjects_results
        )
        # print("Total Count of C-objects:", total_cobjects_count)
        print("Combined Results:")
        print(combined_results)
        target_class = "cobj"
        cobjects_results = drugbox_counter.filter_objects_by_class(
            results, target_class
        )
        # Update product data using the combined results
        drugbox_counter.update_product_data(combined_results)
        drugbox_counter.post_object_detected(SERIAL_NUMBER, total_cobjects_count)
        logging.info(f"Trays and Cobjects Results: {trays_and_cobjects_results}")
        logging.info(f"Total Count of C-objects: {total_cobjects_count}")
        logging.info(f"Combined Results: {combined_results}")
        logging.info(f"Cobjects Results: {cobjects_results}")
        logging.info("Update product data and post object detection complete.")
   
    if __name__ == "__main__":
        main()
   
if __name__ == "__main__":
    config_folder_path = "file_austest"
 
    # Loop through all files in the folder
    for file_name in os.listdir(config_folder_path):
        if file_name.endswith(".ini"):  # Adjust the file extension if needed
            config_file_path = os.path.join(config_folder_path, file_name)
            run_for_config_file(config_file_path)
 
 