export interface TodoTask {
    id: string;
    text: string;
    done: boolean;
  }
  
  export interface TodoCategory {
    id: string;
    name: string;
    tasks: TodoTask[];
  }