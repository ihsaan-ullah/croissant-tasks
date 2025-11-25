# 🥐 Croissant Tasks Repository  

This repository provides standardized Croissant Task descriptions for various machine learning tasks. The goal is to create a structured and interoperable format for defining tasks that can be used across different ML platforms and benchmarks.

## Task Format  

The **Croissant Task Format** ensures consistency and completeness when defining machine learning tasks. It covers input/output data, evaluation methods, and execution requirements.  

**[Croissant Task Format](croissant-task-format.md)** – The standardized format for defining Croissant tasks.  

## Example Task

To help understand how to define tasks using the Croissant format for **Codabench Tasks**, we provide the following example:  

 **[Insects Classification Task](croissant-task-example.md)** – A Croissant-formatted task for an image classification benchmark.  

## How to Use  

**Read the format guide** – Learn the structure of Croissant task descriptions from [croissant-task-format.md](croissant-task-format.md) and use it for your own tasks.

<details>
<summary><h2>Task Index UI</h2></summary>

A web-based interface for browsing and searching Croissant tasks from NeurIPS 2025 submissions. Features filtering by topics, data types, model types, metrics, and verification status.

**Live Example:** [http://52.20.245.242/](http://52.20.245.242/)  (test only, small cpu ec2 machine)

### Setup and Run

**One-time setup:**
```bash
cd index
./setup.sh
```

**Start the application:**
```bash
./start.sh          # Production mode
./start.sh dev      # Development mode (hot reload)
```

**Stop the application:**
```bash
./stop.sh
```

### Production Deployment

**With Nginx (recommended):**
```bash
sudo ./setup-nginx.sh
./start.sh
```

The app will be accessible on port 80. Make sure your EC2 security group allows inbound traffic on port 80.

**Without Nginx:**
```bash
./start.sh
```

The app will be accessible on port 8000. Make sure your EC2 security group allows inbound traffic on port 8000.

### Data Source

Task data is generated from `data/neurips2025_db_croissants.csv` using `scripts/generate_data.py`. The script verifies GitHub repositories and extracts metadata to create Croissant-formatted JSON files in `data/tasks/`.

</details>
