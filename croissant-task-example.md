# 🥐 Croissant Task Example -- Insects Classification

```json
{
  "@context": {
    "cr": "http://mlcommons.org/croissant/",
    "schema": "https://schema.org/"
  },

  "cr:TaskProblem": {
    "@type": "cr:TaskProblem",
    "@id": "TODO",
    "name": "Insects Classification",
    "description": "This Insect Classification task uses the micro version of the Meta-Album INS dataset. The goal is to classify insects into different classes/categories. Submitted models are given a train set for training and a test set for predictions. Predictions are saved along with the test ground truth. During evaluation, Balanced Accuracy and F1 scores are computed.",
    "license": "No License, Free to use",
    "url": "https://github.com/ihsaan-ullah/croissant-tasks/InsectsClassificationTask",
  },

  "cr:input": [
    {
      "@type": "schema:Dataset",
      "name": "Input Data — Meta-Album INS Micro",
      "description": "Preprocessed insect dataset derived from the original National Museum of Natural History (Paris) collection. Images resized to 128x128 using OpenCV.",
      "url": "https://meta-album.github.io/datasets/INS.html"
    }
  ],

  "cr:output": [
    {
      "@type": "cr:OutputSpec",
      "name": "Scoring Output",
      "description": "A scores.json is the output of this task that shows f1-score and balanced accuracy score",
      "cr:schema": {
        "@type": "cr:RecordSet",
        "field": [
          { "name": "f1", "dataType": "schema:Number" },
          { "name": "balanced_acc", "dataType": "schema:Number" }
        ]
      }
    }
  ],

  "cr:implementation": {
    "@type": "cr:Implementation",
    "name": "Task Implementation: Ingestion and Scoring programs",
    "description": "This task is implemented using the required format of Codabaench. It consists of an ingestion program, scoring program and input data. A code submission (classification model) is required to run the task.",
    "cr:input": [
      {
        "@type": "schema:SoftwareSourceCode",
        "name": "Ingestion Program",
        "description": "Loads input data, splits it into train/test, and supplies them to the code submissions for training and predictions. Saves predictions and ground truth to result submission.",
        "url": "https://github.com/ihsaan-ullah/croissant-tasks/tree/master/InsectsClassificationTask/ingestion_program"
      },
      {
        "@type": "schema:SoftwareSourceCode",
        "name": "Scoring Program",
        "description": "Computes Balanced Accuracy and F1 Score from predictions and ground truth, saving results to `scores.json`.",
        "url": "https://github.com/ihsaan-ullah/croissant-tasks/tree/master/InsectsClassificationTask/scoring_program"
      }
    ]
  },

  "cr:execution": {
    "@type": "cr:ExecutionInfo",
    "name": "Execution Requirements to run this task",
    "description": "Task can be run in a Python environment or containerized environment with Python 3+.",
    "schema:softwareRequirements": "Python 3+, virtual environment",
    "schema:requirements": "CPU, 4GB RAM"
  },

  "cr:evaluation": {
    "@type": "cr:EvaluationSpec",
    "name": "Insects Classification Evaluation",
    "description": "Evaluation uses Balanced Accuracy and F1 Score metrics computed from the scoring program.",
    "fields": [
        {
            "@type": "Field",
            "name": "Balanced Accuracy",
            "key": "balanced_acc",
            "dataType": "sc:Float"
        },
        {
            "@type": "Field",
            "name": "F1 Score",
            "key": "f1",
            "dataType": "sc:Float"
        }
    ]
  },

  "cr:TaskSolution": {
    "@type": "cr:TaskSolution",
    "@id": "TODO",
    "name": "Sample Code Submission — Insects Classification Task Solution",
    "description": "The sample code submission has an example model that trains on the train set and predicts on the test set. NOTE: This submission is a sample solution for this task, In a competition this part is missing and participants are supposed to provide their own models/submissions to test their models using this task and get a good rank on the leaderboard.",
    "cr:input": {
      "@type": "schema:SoftwareSourceCode",
      "name": "Insects Classification Sample Model",
      "url": "https://github.com/ihsaan-ullah/croissant-tasks/tree/master/InsectsClassificationTask/sample_code_submission"
    }
  }
}
```
