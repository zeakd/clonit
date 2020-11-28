import React from 'react';
import { Box, Newline } from 'ink';
import BigText from 'ink-big-text';

const Layout: React.FC = ({ children }) => {
  return (
    <>
      <Box width={60} justifyContent='center'>
        <BigText text='Clonit' font='simple'/>
      </Box>
      {children}
      <Newline />
    </>
  );
};

export { Layout };
