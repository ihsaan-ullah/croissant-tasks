# ------------------------------------------
# Imports
# ------------------------------------------
import os
import json
import numpy as np
from datetime import datetime as dt
from sklearn.metrics import balanced_accuracy_score, f1_score


class Scoring:
    """
    This class is used to compute the scores for the competition.

    Atributes:
        * start_time (datetime): The start time of the scoring process.
        * end_time (datetime): The end time of the scoring process.
        * predictions (list): The ingestion results.
        * ground_truth (list): The ingestion results.
        * ingestion_duration (float): The ingestion duration.
        * scores_dict (dict): The scores dictionary.

    """

    def __init__(self, name=""):
        # Initialize class variables
        self.start_time = None
        self.end_time = None
        self.predictions = None
        self.ground_truth = None
        self.ingestion_duration = None
        self.scores_dict = {}

    def start_timer(self):
        self.start_time = dt.now()

    def stop_timer(self):
        self.end_time = dt.now()

    def get_duration(self):
        if self.start_time is None:
            print("[-] Timer was never started. Returning None")
            return None

        if self.end_time is None:
            print("[-] Timer was never stoped. Returning None")
            return None

        return self.end_time - self.start_time

    def load_ingestion_duration(self, prediction_dir):
        """
        Load the ingestion duration.

        Args:
            prediction_dir (str): The prediction directory where ingestion duration is saved.
        """
        print("[*] Reading ingestion duration")
        ingestion_duration_file = os.path.join(prediction_dir, "ingestion_duration.json")
        with open(ingestion_duration_file) as f:
            self.ingestion_duration = json.load(f)["ingestion_duration"]

    def load_predictions(self, prediction_dir):
        """
        Load the predictions.

        Args:
            prediction_dir (str): The prediction directory where predictions are saved.
        """
        print("[*] Reading predictions")
        predictions_file = os.path.join(prediction_dir, "predictions.txt")
        with open(predictions_file) as f:
            self.predictions = f.readlines()

    def load_ground_truth(self, reference_dir):
        """
        Load the ground truth.

        Args:
            reference_dir (str): The reference directory where ground truth are saved.
        """
        print("[*] Reading ground truth")
        ground_truth_file = os.path.join(reference_dir, "ground_truth.txt")
        with open(ground_truth_file) as f:
            self.ground_truth = f.readlines()

    def compute_scores(self):
        """
        Compute the scores
        """

        print("[*] Computing scores")

        balanced_acc = balanced_accuracy_score(self.ground_truth, self.predictions)
        f1 = f1_score(self.ground_truth, self.predictions, average="macro")

        print(f"\tBalanced Accuracy: {round(balanced_acc, 3)}")
        print(f"\tF1 Score: {round(f1, 3)}")

        self.scores_dict = {
            "balanced_acc": balanced_acc,
            "f1": f1,
            "ingestion_duration": self.ingestion_duration
        }

    def write_scores(self, output_dir):
        """
        Write scores to file
        """

        print("[*] Writing scores")
        score_file = os.path.join(output_dir, "scores.json")
        with open(score_file, "w") as f:
            f.write(json.dumps(self.scores_dict, indent=4))
