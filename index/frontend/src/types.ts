export interface TaskCategories {
  topics: string[];
  data_types: string[];
  model_types: string[];
  metrics: string[];
  verified: boolean;
}

export interface TaskSummary {
  id: string;
  name: string;
  description: string;
  url: string; // Code URL
  openreview_url?: string;
  pdf_url?: string;
  task_categories?: TaskCategories;
}

export interface TaskDetail {
  "@graph": any[];
  "cr:TaskProblem": {
    name: string;
    description: string;
    url: string;
    task_categories?: TaskCategories;
    "cr:implementation": {
      "cr:input": { "@id": string }[];
      "cr:output": { "@id": string };
    };
    [key: string]: any;
  };
}
