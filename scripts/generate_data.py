import pandas as pd
import json
import os
import requests
import time
from urllib.parse import urlparse

# Limit API calls to avoid rate limits (Unauthenticated limit is 60/hr)
# Increase limit for better coverage if token available, keeping conservative for unauth
API_LIMIT = 50 
CALLS_MADE = 0

# Heuristic Lists - Expanded
TOPICS = [
    'Healthcare', 'Medical', 'Robotics', 'Finance', 'Education', 'Agriculture', 'Climate', 
    'Gaming', 'Physics', 'Biology', 'Chemistry', 'Astronomy', 'Geology', 'Neuroscience',
    'Computer Vision', 'NLP', 'Natural Language', 'Speech', 'Audio', 'Music'
]
DATA_TYPES = [
    'Image', 'Images', 'Text', 'Video', 'Audio', 'Graph', 'Graphs', 'Time-series', 
    'Time series', 'Tabular', '3D', 'Point Cloud', 'Mesh', 'Spectrogram', 'Waveform'
]
MODEL_TYPES = [
    'LLM', 'Large Language Model', 'Transformer', 'Diffusion', 'GNN', 'Graph Neural Network',
    'CNN', 'Convolutional', 'RNN', 'LSTM', 'GRU', 'Reinforcement Learning', 'RL',
    'GAN', 'VAE', 'BERT', 'GPT', 'ResNet', 'VGG', 'EfficientNet'
]
METRICS = [
    'Accuracy', 'F1', 'F1-score', 'BLEU', 'ROUGE', 'MSE', 'MAE', 'RMSE',
    'Precision', 'Recall', 'AUC', 'ROC', 'mAP', 'IoU', 'Dice', 'Perplexity',
    'R-squared', 'Pearson', 'Spearman', 'NDCG'
]

def check_github_files(repo_url):
    global CALLS_MADE
    if CALLS_MADE >= API_LIMIT:
        return {}
    
    try:
        path = urlparse(repo_url).path.strip('/')
        parts = path.split('/')
        if len(parts) < 2:
            return {}
        owner, repo = parts[0], parts[1]
        
        api_url = f"https://api.github.com/repos/{owner}/{repo}/contents"
        
        print(f"checking {api_url}...")
        response = requests.get(api_url, timeout=5)
        CALLS_MADE += 1
        
        if response.status_code == 200:
            files = [f['name'] for f in response.json() if isinstance(f, dict)]
            return {
                'has_requirements': 'requirements.txt' in files or 'environment.yml' in files or 'pyproject.toml' in files,
                'entry_points': [f for f in files if f.endswith('.py') and ('run' in f or 'main' in f or 'eval' in f or 'train' in f)],
                'verified': True
            }
        elif response.status_code == 403:
            print("Rate limit hit!")
            return {'verified': False, 'error': 'rate_limit'}
    except Exception as e:
        print(f"Error checking {repo_url}: {e}")
    
    return {'verified': False}

def extract_tags(text, heuristic_list):
    if not isinstance(text, str):
        return []
    found = []
    text_lower = text.lower()
    for item in heuristic_list:
        # Use word boundaries for better matching
        item_lower = item.lower()
        # Check for exact word match or phrase match
        if item_lower in text_lower:
            # Prefer shorter, more specific matches first
            found.append(item)
    # Remove duplicates while preserving order
    seen = set()
    unique_found = []
    for item in found:
        if item.lower() not in seen:
            seen.add(item.lower())
            unique_found.append(item)
    return unique_found

def generate_task_json(row, file_info):
    paper_id = row['paper_id']
    title = row['title']
    abstract = row['abstract']
    code_url = row['code_url']
    croissant_url = row['croissant_url']
    pdf_url = row['pdf_url']
    
    # Verification Info
    entry_points = file_info.get('entry_points', [])
    if entry_points:
        main_script = entry_points[0]
        impl_name = f"Implementation ({main_script})"
        impl_desc = f"Verified Python script: {main_script}"
        impl_url = f"{code_url}/blob/main/{main_script}" 
    else:
        impl_name = "Reference Implementation (Repo Root)"
        impl_desc = "Repository root (Exact entry point not automatically detected)"
        impl_url = code_url

    verified = file_info.get('verified', False)
    
    # Extract Metadata Tags from abstract, title, and keywords
    keywords_str = str(row.get('keywords', '')) if pd.notna(row.get('keywords')) else ''
    text_to_scan = f"{title} {abstract} {keywords_str}"
    
    # Extract tags
    topics = extract_tags(text_to_scan, TOPICS)
    data_types = extract_tags(text_to_scan, DATA_TYPES)
    model_types = extract_tags(text_to_scan, MODEL_TYPES)
    metrics = extract_tags(text_to_scan, METRICS)
    
    # Also parse keywords column (semicolon-separated)
    if keywords_str:
        keyword_list = [k.strip() for k in keywords_str.split(';') if k.strip()]
        # Add keywords as additional topics if they don't match existing categories
        for kw in keyword_list:
            kw_lower = kw.lower()
            # Check if it's already categorized
            already_categorized = any(kw_lower in t.lower() for t in topics + data_types + model_types + metrics)
            if not already_categorized and len(kw) > 2:
                topics.append(kw)
    
    tags = {
        'topics': topics[:10],  # Limit to top 10
        'data_types': data_types[:5],
        'model_types': model_types[:5],
        'metrics': metrics[:5],
        'verified': verified
    }
    
    task_json = {
        "@graph": [
            {
                "@type": "sc:SoftwareSourceCode",
                "@id": "implementation-code",
                "name": impl_name,
                "description": impl_desc,
                "url": impl_url
            },
            {
                "@type": "sc:Dataset",
                "@id": "input-dataset",
                "name": "Input Data Croissant",
                "description": "The dataset associated with this task.",
                "url": croissant_url
            },
            {
                "@type": "cr:OutputSpec",
                "@id": "output-artifacts",
                "name": "Output Artifacts",
                "description": "Expected outputs (predictions, etc.)",
                "cr:fileObject": [{"@type": "cr:FileObject", "name": "predictions.csv"}]
            }
        ],
        "@context": {
            "cr": "http://mlcommons.org/croissant/",
            "sc": "https://schema.org/"
        },
        "cr:TaskProblem": {
            "@type": "cr:TaskProblem",
            "@id": f"neurips-2025-{paper_id}",
            "name": title,
            "description": abstract if pd.notna(abstract) else "",
            "url": code_url,
            "openreview_url": f"https://openreview.net/forum?id={paper_id}",
            "pdf_url": pdf_url,
            "task_categories": tags,
            "cr:implementation": {
                "@type": "cr:Implementation",
                "cr:input": [
                    {"@id": "input-dataset"},
                    {"@id": "implementation-code"}
                ],
                "cr:output": {"@id": "output-artifacts"}
            }
        }
    }
    return task_json

def main():
    csv_path = os.path.join(os.path.dirname(__file__), '../data/neurips2025_db_croissants.csv')
    output_dir = os.path.join(os.path.dirname(__file__), '../data/tasks')
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    df = pd.read_csv(csv_path)
    valid_tasks = df[df['code_url'].notna() & df['croissant_url'].notna()]
    
    print(f"Processing {len(valid_tasks)} candidates (Limit: {API_LIMIT} checks)...")
    
    count = 0
    for _, row in valid_tasks.iterrows():
        file_info = {}
        if count < API_LIMIT and "github.com" in str(row['code_url']):
            file_info = check_github_files(row['code_url'])
            time.sleep(0.5) 
        
        task_json = generate_task_json(row, file_info)
        paper_id = row['paper_id']
        
        with open(os.path.join(output_dir, f"croissant-task-{paper_id}.json"), 'w') as f:
            json.dump(task_json, f, indent=2)
            
        count += 1
        if count % 20 == 0:
            print(f"Generated {count} tasks...")

if __name__ == "__main__":
    main()
