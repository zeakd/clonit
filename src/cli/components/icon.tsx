import React from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';

const names = {
  failure: () => <Text color='red'>✖️</Text>,
  success: () => <Text color='green'>✔️</Text>,
  pending: () => <Spinner />,
  // canceled: () => <Text color='gray'>-</Text>,
};

export type IconName = keyof typeof names;

type Props = {
  name: IconName | string;
}

const getIcon = (name) => names[name] || (() => ' ');

const Icon: React.FC<Props> = ({ name }) => {
  return (
    <Text>{React.createElement(getIcon(name))}</Text>
  );
};

export { Icon };
