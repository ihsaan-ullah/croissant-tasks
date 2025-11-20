# 🥐 Croissant Task Example -- Insects Classification
This example defines important parts of the task definition and then uses them in the sub tasks

### Context
```json
"@context": {
  "cr": "http://mlcommons.org/croissant/",
  "sc": "https://schema.org/"
},
```
***

### Task pieces
Defining task pieces e.g. task solution, inputs, outputs etc to reference them in the task.

#### Inputs
This includes inputs to ingestion and scoring, task solution is also one of the inputs
```json
{
  "@type": "sc:SoftwareSourceCode",
  "@id": "ingestion-input-1-program",
  "name": "Ingestion Program",
  "description": "Loads input data, splits it into train/test, and supplies them to the code submissions for training and predictions. Saves predictions and ground truth to result submission.",
  "url": "https://github.com/ihsaan-ullah/croissant-tasks/tree/master/InsectsClassificationTask/ingestion_program"
},

{
  "@type": "sc:Dataset",
  "@id": "ingestion-input-2-dataset",
  "name": "Input Data — Meta-Album INS Micro",
  "description": "Preprocessed insect dataset derived from the original National Museum of Natural History (Paris) collection. Images resized to 128x128 using OpenCV.",
  "url": "https://meta-album.github.io/datasets/INS.html"
},

{
  "@type": "cr:TaskSolution",
  "@id": "ingestion-input-3-submission",
  "name": "Sample Code Submission — Insects Classification Task Solution",
  "description": "The sample code submission has an example model that trains on the train set and predicts on the test set. NOTE: This submission is a sample solution for this task, In a competition this part is missing and participants are supposed to provide their own models/submissions to test their models using this task and get a good rank on the leaderboard.",
  "url": "https://github.com/ihsaan-ullah/croissant-tasks/tree/master/InsectsClassificationTask/sample_code_submission"
},

{
  "@type": "sc:SoftwareSourceCode",
  "@id": "scoring-input-1-program",
  "name": "Scoring Program",
  "description": "Computes Balanced Accuracy and F1 Score from predictions and ground truth, saving results to `scores.json`.",
  "url": "https://github.com/ihsaan-ullah/croissant-tasks/tree/master/InsectsClassificationTask/scoring_program"
},
```

#### Outputs
These consists of all the outputs e.g. output of ingestion and scoring
```json
{
  "@type": "cr:OutputSpec",
  "@id": "ingestion-output",
  "name": "Ingestion Output - Predictions and Ground Truth",
  "description": "Ingestion output consists of two files predictions.txt and ground_truth.txt.",
  "cr:fileObject": [
    {
      "@type": "cr:FileObject",
      "name": "predictions.txt",
      "cr:encodingFormat": "text/csv",
    },
    {
      "@type": "cr:FileObject",
      "name": "ground_truth.txt",
      "cr:encodingFormat": "text/csv",
    }
  ]
},
{
  "@type": "cr:OutputSpec",
  "@id": "scoring-output",
  "name": "Scoring Output",
  "description": "A scores.json is the output of this task that shows f1-score and balanced accuracy score",
  "cr:fileObject": {
    "@type": "cr:FileObject",
    "name": "scores.json",
    "cr:encodingFormat": "application/json",
    "field": [
      { "name": "f1", "dataType": "sc:Number" },
      { "name": "balanced_acc", "dataType": "sc:Number" }
    ]
  }
},
```
#### Execution
This is the execution spec. This can be used for both ingestion and scoring
```json
{
  "@type": "cr:ExecutionSpec",
  "@id": "execution-spec",
  "name": "Execution Requirements to run this task",
  "description": "Task can be run in a Python environment or containerized environment with Python 3+.",
  "sc:softwareRequirements": "Python 3+, virtual environment",
  "sc:requirements": "CPU, 4GB RAM",
  "docker_container_image": "ihsaanullah/auto_survey:latest",
},
```
***

### Task Definition
Putting together all the pieces defined above and some more.
```json
  "cr:TaskProblem": {
    "@type": "cr:TaskProblem",
    "@id": "task-problem",
    "name": "Insects Classification",
    "description": "This Insect Classification task uses the micro version of the Meta-Album INS dataset. The goal is to classify insects into different classes/categories. Submitted models are given a train set for training and a test set for predictions. Predictions are saved along with the test ground truth. During evaluation, Balanced Accuracy and F1 scores are computed. This task is implemented using the required format of Codabaench. It consists of an ingestion program, and evaluating/scoring program and input data. A code submission (classification model) is required to run the task.",
    "license": "No License, Free to use",
    "url": "https://github.com/ihsaan-ullah/croissant-tasks/InsectsClassificationTask",
    
    "cr:implementation": {
      "@type": "cr:Implementation",
      "name": "Task Implementation: Ingestion program implementation",
      "description": "Implementation of the task ingestion program",
      "cr:input": [
        {"@id": "ingestion-input-1-program"},
        {"@id": "ingestion-input-2-dataset"},
        {"@id": "ingestion-input-3-submission"}
      ],
      "cr:output": {"@id": "ingestion-output"},
    },

    "cr:execution": {"@id": "execution-spec"},

    "cr:evaluation": {
      "@type": "cr:EvaluationSpec",
      "name": "Insects Classification Evaluation",
      "description": "Evaluation uses Balanced Accuracy and F1 Score metrics computed from the scoring program.",
      
      "cr:input": {"@id": "ingestion-ingestion-output"},
      
      "cr:output": {"@id": "scoring-output"},
      
      "cr:execution": {"@id": "execution-spec"},
    },
}
```

***

### NOTE:
Complete task meta-data json is here: [Task Meta-Data JSON](croissant-task-example.json)
