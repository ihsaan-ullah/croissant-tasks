# 🥐 Croissant Task Example -- Insects Classification

```json
{
  "task_definition": {
    "@type": "croissant:Task",
    "name": "Insects Classification",
    "description": "This Insect Classification task uses the micro version of Meta-Album INS dataset. The goal is to classify insects into different classes/categories. Submitted models are supplied a train set for training and a test set for predictions. The predictions are saved along with the test ground truth. During evaluation Balanced accuracy and F1 scores are computed.",
    "url": "https://github.com/ihsaan-ullah/croissant-tasks/tree/master/InsectsClassificationTask",
    "license": "No License, Free to use"
  },
  
  "task_type": {
    "@type": "croissant:TaskType",
    "task_type": "Image Classification",
    "description": "This is an image classification, model evaluation and benchmarking task"
  },

  "input_data": [
    {
      "@type": "croissant:InputData",
      "name": "Input Data -- Meta-Album INS Micro",
      "description": "The original Insects dataset is created by the National Museum of Natural History, Paris (https://www.mnhn.fr/fr). It has more than 290 000 images in different sizes and orientations. The dataset has hierarchical classes which are listed from top to bottom as Order, Super-Family, Family, and Texa. Each image contains an insect in its natural environment or habitat, i.e, either on a flower or near to vegetation. The images are collected by the researchers and hundreds of volunteers from SPIPOLL Science project(https://www.spipoll.org/). The images are uploaded to a centralized server either by using the SPIPOLL website, Android application or IOS application. The preprocessed insect dataset is prepared from the original Insects dataset by carefully preprocessing the images, i.e., cropping the images from either side to make squared images. These cropped images are then resized into 128x128 using Open-CV with an anti-aliasing filter.",
      "format": "Images (JPG)",
      "source": "https://meta-album.github.io/datasets/INS.html",
      "size": "7.6 MB",
    },
    {
      "@type": "croissant:InputData",
      "name": "Ingestion Program -- Insects Classification Ingestion Program",
      "description": "Ingestion program uses the `input data` and the `sample code submission`. The ingestion program is responsible for loading the input data, splitting it into train and test and supplying these to the code submissions for training and predictions. The ingestion program saves the test set predictions and test set ground truth along with the run time to `sample_result_submission`",
      "format": "Python script",
      "source": "https://github.com/ihsaan-ullah/croissant-tasks/tree/master/InsectsClassificationTask/ingestion_program",
      "size": "3 KB",
    },
    {
      "@type": "croissant:InputData",
      "name": "Scoring Program -- Insects Classification Scoring Program",
      "description": "The scoring program loads the predictions and ground truth from `sample_result_submission` to compute `Balanced Accuracy Score` and `F1 Score`. The scoring program saves the scores to `scores.json` file in `scoring_output`.",
      "format": "Python script",
      "source": "https://github.com/ihsaan-ullah/croissant-tasks/tree/master/InsectsClassificationTask/scoring_program",
      "size": "2 KB",
    },
    {
      "@type": "croissant:InputData",
      "name": "Submission -- Insects Classification Sample Code Submission",
      "description": "The sample code submission has an example model that trains on the train set and predicts on the test set. NOTE: This submission is a sample solution for this task, In a competition this part is missing and participants are supposed to provide their own models/submissions to test their models using this task and get a good rank on the leaderboard.",
      "format": "Python script",
      "source": "https://github.com/ihsaan-ullah/croissant-tasks/tree/master/InsectsClassificationTask/sample_code_submission",
      "size": "7 KB",
    },
  ],

  "output_data": {
    "@type": "croissant:OutputData",
    "name": "Classification Scores",
    "description": "A scores.json is the output of this task that shows f1-score and balanced accuracy score",
    "format": "JSON",
    "source": "https://github.com/ihsaan-ullah/croissant-tasks/tree/master/InsectsClassificationTask/scoring_output",
    "size": "6 KB",
  },

  "implementation": {
    "@type": "croissant:Implementation",
    "description": "This task is implemented using the required format of Codabaench. It consists of an ingestion program, scoring program and input data. A code submission (classification model) is required to run the task.",
    "model_url": "https://github.com/ihsaan-ullah/croissant-tasks/tree/master/InsectsClassificationTask/sample_code_submission",
    "framework": "This task can be run inside a docker container or a virtual environment with python 3+"
  },

  "execution": {
    "@type": "croissant:Execution",
    "hardware_requirements": [
      "CPU",
      "4 GB RAM",
      "Python environment",
      "notebook or bash"
    ],
    "dependencies": [
      "numpy",
      "pandas",
      "skimage",
      "sklearn"
    ],
    "execution_environment": {
      "venv":"python venv with python 3+"
    },
    "execution_time": "5 mins"
  },
  
  "evaluation": {
    "@type": "croissant:Evaluation",
    "metrics": [
      {
        "name": "balanced accuracy",
        "type": "float",
        "description": "The balanced accuracy for the classification task."
      },
      {
        "name": "F1-score",
        "type": "float",
        "description": "The F1-score for the classification task."
      }
    ]
  }
}
```
