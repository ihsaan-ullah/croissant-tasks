import argparse
import os
import sys

module_dir = os.path.dirname(os.path.realpath(__file__))
root_dir_name = os.path.dirname(module_dir)

parser = argparse.ArgumentParser(
    description="This is script to generate data for the HEP competition."
)

parser.add_argument(
    "--codabench",
    help="True when running on Codabench",
    action="store_true",
)

if __name__ == "__main__":

    print("\n----------------------------------------------")
    print("[✔] Scoring Program strated!")
    print("----------------------------------------------\n")

    args = parser.parse_args()

    if not args.codabench:
        prediction_dir = os.path.join(root_dir_name, "sample_result_submission")
        reference_dir = os.path.join(root_dir_name, "sample_result_submission")
        output_dir = os.path.join(root_dir_name, "scoring_output")
    else:
        prediction_dir = "/app/input/res"
        output_dir = "/app/output"
        reference_dir = "/app/input/ref"

    sys.path.append(prediction_dir)
    sys.path.append(output_dir)

    from score import Scoring

    # Init scoring
    scoring = Scoring()

    # Start timer
    scoring.start_timer()

    # Load ingestion duration
    scoring.load_ingestion_duration(prediction_dir)

    # Load predictions
    scoring.load_predictions(prediction_dir)

    # Load ground_truth
    scoring.load_ground_truth(reference_dir)

    # Compute scores
    scoring.compute_scores()

    # Write scores
    scoring.write_scores(output_dir)

    # Stop timer
    scoring.stop_timer()

    # Show duration
    print("\n---------------------------------")
    print(f"[✔] Total duration: {scoring.get_duration()}")
    print("---------------------------------")

    print("\n----------------------------------------------")
    print("[✔] Scoring Program executed successfully!")
    print("----------------------------------------------\n\n")
