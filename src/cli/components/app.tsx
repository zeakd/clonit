import React from 'react';
import { Text, Newline } from 'ink';
import { Layout } from './layout';
import { Step } from './step';
import { Task } from '../types';

type Props = {
  messages: React.ReactNode;
  tasks: Array<Task>;
}

const App: React.FC<Props> = ({
  messages,
  tasks,
}) => {
  return (
    <Layout>
      {React.Children.map(messages, m => {
        return <Text>  {m}</Text>;
      })}
      <Newline />
      {tasks.map((task, index) => {
        return (
          <Step 
            key={index}
            status={task.status}
            title={task.title}
            message={task.message}
          />
        );
      })}
    </Layout>
  );
};

export default App;
