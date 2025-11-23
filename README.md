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

This repository includes a web-based Task Index UI (`index/`) that provides a searchable and filterable interface for browsing Croissant tasks. The UI displays tasks from NeurIPS 2025 submissions with filtering by topics, data types, model types, metrics, and verification status.

### What is this?

The Task Index UI is a React-based web application that:
- Displays a paginated list of Croissant tasks
- Provides search and filtering capabilities
- Shows task details including implementation graphs
- Allows browsing tasks by various categories

### How to Run

#### Quick Start (Development)

**Option 1: Use the start script (recommended)**
```bash
cd index
./start.sh
```
This script will:
- Check and generate task data if needed
- Install dependencies if needed
- Start both backend and frontend dev servers
- Open http://localhost:5173 in your browser

To stop the servers, use `./stop.sh` from the `index/` directory.

**Option 2: Manual start**
1. **Generate task data from CSV:**
   ```bash
   python3 scripts/generate_data.py
   ```

2. **Start the backend server:**
   ```bash
   cd index/backend
   pip install -r ../../requirements.txt
   python3 -m uvicorn main:app --reload
   ```

3. **Start the frontend dev server (in another terminal):**
   ```bash
   cd index/frontend
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

#### Production Deployment

**EC2 Setup Script**

Use the provided setup script for EC2 deployment:

```bash
cd index
./setup_ec2.sh
```

This script will:
1. Install system dependencies (Python 3, Node.js, npm)
2. Install Python requirements
3. Generate task JSONs from the CSV file
4. Build the frontend

After setup, start the server:
```bash
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

For production, consider using a process manager like `systemd` or `supervisor` to keep the server running.

### Data Source

The Task Index reads task data from JSON files in `data/tasks/`. These files are generated from `data/neurips2025_db_croissants.csv` using the `scripts/generate_data.py` script. The script:
- Parses the CSV file
- Verifies GitHub repositories (with rate limiting)
- Extracts metadata tags (topics, data types, model types, metrics)
- Generates Croissant-formatted JSON files

</details>
