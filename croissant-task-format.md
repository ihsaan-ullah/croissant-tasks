# 🥐 Croissant Task Format

```json
{
  "task_definition": {
    "@type": "croissant:Task",
    "name": "TASK_NAME",
    "description": "TASK_DESCRIPTION",
    "url": "TASK_URL",
    "license": "LICENSE_URL"
  },
  
  "task_type": {
    "@type": "croissant:TaskType",
    "task_type": "TASK_TYPE(e.g. Competition, Benchmark, ModelEvaluation etc.)",
    "description": "TASK_TYPE_DESCRIPTION"
  },

  "input_data": {
    "@type": "croissant:InputData",
    "name": "INPUT_DATA_NAME",
    "description": "INPUT_DATA_DESCRIPTION",
    "format": "FORMAT(e.g. JPEG)",
    "source": "SOURCE_URL",
    "size": "10MB",
  },

  "output_data": {
    "@type": "croissant:OutputData",
    "name": "OUTPUT_DATA_NAME",
    "description": "OUTPUT_DATA_DESCRIPTION",
    "format": "FORMAT(e.g. JSON)",
    "source": "SOURCE_URL",
    "size": "2MB",
  },

  "implementation": {
    "@type": "croissant:Implementation",
    "description": "IMPLEMENTATION_DESCRIPTION",
    "model_url": "https://example.com/models/insect-classifier",
    "framework": "TensorFlow",
    "version": "2.4.0"
  },

  "execution": {
    "@type": "croissant:Execution",
    "hardware_requirements": [
      "GPU (NVIDIA A100, 40GB VRAM)",
      "16GB RAM"
    ],
    "dependencies": [
      "tensorflow>=2.4",
      "numpy>=1.19"
    ],
    "execution_environment": {
      "docker_image":"example image"
    },
    "execution_time": "30mins"
  },
  
  "evaluation": {
    "@type": "croissant:Evaluation",
    "metrics": [
      {
        "name": "accuracy",
        "type": "percentage",
        "description": "The percentage of correct predictions."
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
