# Insects Classification Task

This is an example Codabench task that consists of:  

- `ingestion program`
- `scoring program`
- `input data`

This taks uses the micro version of Meta-Album INS dataset. The goal is to classify insects into different classes/categories. Submitted models are supplied a train set for training and a test set for predictions. The predictions are saved along with the test ground truth. During evaluation Balanced accuracy and F1 scores are computed.

## How to run this task

To run this task follow the instructions below:

### Run ingestion

You first need to run the ingestion program that uses the `input data` and the `sample code submission`. The sample code submission has an example model that trains on the train set and predicts on the test set. The ingestion program is responsible for loading the data, splitting it into train and test and supplying these to the code submissions for training and predictions. The ingestion program saves the test set predictions and test set ground truth along with the run time to `sample_result_submission`.

Use the following command to run the ingestion program

```bash
python3 ingestion_program/run_ingestion.py
```

### Run scoring

After the ingestion program runs successfully and generates predictions, you need to run the scoring program. The scoring program loads the predictions and ground truth from `sample_result_submission` to compute `Balanced Accuracy Score` and `F1 Score`. The scoring program saves the scores to `scores.json` file in `scoring_output`.

Use the following command to run the scoring program

```bash
python3 scoring_program/run_scoring.py
```

## How to upload this task to Codabench

To upload this task to codabench, zip the following files together:

1. `task.yaml`
2. `insects-classification-ingestion-program.zip`
3. `insects-classification-input-data.zip`
4. `insects-classification-scoring-program.zip`

You can upload this one zip as a codabench task here https://www.codabench.org/tasks/ in the Tasks tab.