import os
import sys
import argparse


module_dir = os.path.dirname(os.path.realpath(__file__))
root_dir_name = os.path.dirname(module_dir)

parser = argparse.ArgumentParser(
    description="This is script to run ingestion program for the competition"
)
parser.add_argument(
    "--codabench",
    help="True when running on Codabench",
    action="store_true",
)

if __name__ == "__main__":

    print("\n----------------------------------------------")
    print("[✔] Ingestion Program strated!")
    print("----------------------------------------------\n")

    args = parser.parse_args()

    from ingestion import Ingestion

    if not args.codabench:
        input_dir = os.path.join(root_dir_name, "input_data")
        output_dir = os.path.join(root_dir_name, "sample_result_submission")
        submission_dir = os.path.join(root_dir_name, "sample_code_submission")
        program_dir = os.path.join(root_dir_name, "ingestion_program")
    else:
        input_dir = "/app/data"
        output_dir = "/app/output"
        submission_dir = "/app/ingested_program"
        program_dir = "/app/program"

    sys.path.append(program_dir)
    sys.path.append(submission_dir)

    from model import Model

    ingestion = Ingestion()

    # Start timer
    ingestion.start_timer()

    ingestion.load_data(input_dir)

    # initialize submission
    ingestion.init_submission(Model)

    # fit submission
    ingestion.fit_submission()

    # predict submission
    ingestion.predict_submission()

    # save result
    ingestion.save_predictions(output_dir)

    # Stop timer
    ingestion.stop_timer()

    # Show duration
    print("\n------------------------------------")
    print(f"[✔] Total duration: {ingestion.get_duration()}")
    print("------------------------------------")

    ingestion.save_duration(output_dir)

    print("\n----------------------------------------------")
    print("[✔] Ingestion Program executed successfully!")
    print("----------------------------------------------\n\n")
