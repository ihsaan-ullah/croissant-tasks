# ------------------------------------------
# Imports
# ------------------------------------------
import os
import json
import numpy as np
import pandas as pd
from datetime import datetime as dt
from skimage.io import imread
from sklearn.model_selection import train_test_split


# ------------------------------------------
# Ingestion Class
# ------------------------------------------
class Ingestion:
    """
    Class for handling the ingestion process.

    Attributes:
        * start_time (datetime): The start time of the ingestion process.
        * end_time (datetime): The end time of the ingestion process.
        * model (object): The model object.
        * data (object): The data object.
    """

    def __init__(self):
        """
        Initialize the Ingestion class.

        """
        self.start_time = None
        self.end_time = None
        self.model = None
        self.data = {}

    def start_timer(self):
        """
        Start the timer for the ingestion process.
        """
        self.start_time = dt.now()

    def stop_timer(self):
        """
        Stop the timer for the ingestion process.
        """
        self.end_time = dt.now()

    def get_duration(self):
        """
        Get the duration of the ingestion process.

        Returns:
            timedelta: The duration of the ingestion process.
        """
        if self.start_time is None:
            print("[-] Timer was never started. Returning None")
            return None

        if self.end_time is None:
            print("[-] Timer was never stopped. Returning None")
            return None

        return self.end_time - self.start_time

    def load_data(self, input_dir=None):
        """
        Loads training and test data.

        Args:
            input_dir (str): The input directory to load data from.
        """
        def load_images(images_folder, file_names):
            images = []
            for file_name in file_names:
                img_path = os.path.join(images_folder, file_name)
                try:
                    img = imread(img_path)  # Read image using skimage
                    images.append(img)
                except Exception as e:
                    print(f"[!] Warning: Unable to read image {img_path} - {e}")
            return np.array(images, dtype=np.float32)

        print("[*] Loading data")
        labels_file = os.path.join(input_dir, 'labels.csv')
        images_folder = os.path.join(input_dir, 'images')

        # Load labels file
        df = pd.read_csv(labels_file)
        # Split into train and test
        train_df, test_df = train_test_split(df, test_size=0.3, random_state=42, stratify=df['CATEGORY'])

        self.data["X_Train"] = load_images(images_folder, train_df["FILE_NAME"])
        self.data["Y_Train"] = train_df["CATEGORY"]
        self.data["X_Test"] = load_images(images_folder, test_df["FILE_NAME"])
        self.data["Y_Test"] = test_df["CATEGORY"]

    def init_submission(self, Model):
        """
        Initialize the submitted model.

        Args:
            Model (object): The model class.
        """
        print("[*] Initializing Submmited Model")

        self.model = Model()

    def fit_submission(self):
        """
        Fit the submitted model.
        """
        print("[*] Fitting Submmited Model")
        self.model.fit(
            X_Train=self.data["X_Train"],
            Y_Train=self.data["Y_Train"]
        )

    def predict_submission(self):
        """
        Make predictions using the submitted model.

        """
        print("[*] Calling predict method of submitted model")
        self.data["Y_Pred"] = self.model.predict(
            X_Test=self.data["X_Test"]
        )

    def save_predictions(self, output_dir=None):
        """
        Save the ingestion result to files.

        Args:
            output_dir (str): The output directory to save the result files.
        """
        predictions_file = os.path.join(output_dir, "predictions.txt")
        ground_truth_file = os.path.join(output_dir, "ground_truth.txt")

        with open(predictions_file, "w") as f:
            for pred in self.data["Y_Pred"]:
                f.write(f"{pred}\n")

        with open(ground_truth_file, "w") as f:
            for true_label in self.data["Y_Test"]:
                f.write(f"{true_label}\n")

    def save_duration(self, output_dir=None):
        """
        Save the duration of the ingestion process to a file.

        Args:
            output_dir (str): The output directory to save the duration file.
        """
        duration = self.get_duration()
        duration_in_mins = int(duration.total_seconds() / 60)
        duration_file = os.path.join(output_dir, "ingestion_duration.json")
        if duration is not None:
            with open(duration_file, "w") as f:
                f.write(json.dumps({"ingestion_duration": duration_in_mins}, indent=4))
