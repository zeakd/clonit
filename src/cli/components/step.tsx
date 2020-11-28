import React from 'react';
import { Newline, Text } from 'ink';
import { Icon } from './icon';

export type Status = 'pending' | 'success' | 'failure';

type Props = {
  status: Status;
  title: React.ReactNode;
  message: React.ReactNode;
}

const titleColors: { [status: string]: string } = {
  pending: 'white',
  success: 'gray',
  failure: 'red',
};

const getTitleColor = (name: string) => titleColors[name];

const Step: React.FC<Props> = ({
  status,
  title,
  message,
}) => {
  return (
    <Text color='gray'>
      <Icon name={status} />
      {' '}
      <Text 
        color={getTitleColor(status)} 
      >
        {title}
      </Text>
      {React.Children.map(message, m => m && (
        <>
          <Newline />
          {'  '}<Text>-</Text>{' '}
          <Text>{m}</Text>
        </>
      ))}
    </Text>
  );
};

export { Step };
