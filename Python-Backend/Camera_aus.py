import requests
import time
import numpy as np
import cv2
 
class MerakiCamera(object):
    """
    Class for interacting with Meraki Cameras
    """
 
    def __init__(self, serial, api_key):
        """
        Initialize MerakiCamera object
        - Arguments
            serial: str, serial number of camera
            api_key: str, API key associated with a Cisco Account
        """
        self.serial = serial
        self.api_key = api_key
        self.headers = {
            "Content-Type": "application/json",
            "X-Cisco-Meraki-API-Key": api_key,
        }
 
    def get_snapshot(self):
        """
        API Endpoint URL for generating snapshots
        - Returns
            snapshot_img: bytes, image data
        """
        url = f"https://api.meraki.com/api/v1/devices/{self.serial}/camera/generateSnapshot"
        response = requests.post(url, headers=self.headers, timeout=10)
        response.raise_for_status()  # Raise an error for bad response status
        img_url = response.json()["url"]
        time.sleep(10)  # Wait for the snapshot to be ready
        snapshot_img = requests.get(img_url, timeout=30)
        return snapshot_img.content
    def capture_snapshot(self):
        """
        Capture snapshot and return it as a NumPy array (in memory)
        Returns:
            image: numpy.ndarray, decoded image data
        """
        snapshot_bytes = self.get_snapshot()  # Get image bytes
        np_arr = np.frombuffer(snapshot_bytes, np.uint8)  # Convert to NumPy array
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)     # Decode image
        return image
 
    def get_snapshot_url(self):
        """
        API Endpoint URL for generating snapshots
        - Returns
            img_url: str, URL of snapshot
        """
        url = f"https://api.meraki.com/api/v1/devices/{self.serial}/camera/generateSnapshot"
        response = requests.request("POST", url, headers=self.headers)
        img_url = response.json()["url"]
        return img_url
 
    def save_snapshot(self, path):
        """
        API Endpoint URL for generating snapshots
        - Arguments
            path: str, path to save snapshot
        """
        with open(path, "wb") as f:
            f.write(self.get_snapshot())
 
    def get_serial(self):
        """
        Get serial number of camera
        - Returns
            serial: str, serial number of camera
        """
        return self.serial
 
    def get_api_key(self):
        """
        Get API key associated with a Cisco Account
        - Returns
            api_key: str, API key associated with a Cisco Account
        """
        return self.api_key
 
 