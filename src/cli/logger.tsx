import React from 'react';
import { Text, render } from 'ink';
import App from './components/app';
import { Task } from './types';

class Logger {
  private tasks: Array<Task> = [];
  private messages: Array<React.ReactNode> = [];

  warn(message: string): void {
    this.messages = [...this.messages, <Text color='yellow'>{message}</Text>];
    this.render();
  }
  
  error(message: string): void {
    this.messages = [...this.messages, <Text color='red'>{message}</Text>];
    this.render();
  }

  addTask(task: Task): void {
    this.tasks.push(task);
    this.render();
  }

  updateTask(name: string, data: Partial<Task>): void {
    const cloned = [...this.tasks];
    const idx = cloned.findIndex(task => task.name === name);
    const task = cloned[idx];
    
    cloned[idx] = { ...task, ...data };
    this.tasks = cloned;

    this.render();
  }

  render(): void {
    render(<App 
      messages={this.messages}
      tasks={this.tasks}
    />);
  }
}

export { Logger };
