const fs = require('fs');
const path = require('path');

const createBigFile = (size) => {
  const file = fs.createWriteStream(
    path.join(__dirname, 'linariaComponents.tsx'),
  );
  file.write(`import { styled } from '@linaria/react';`);
  for (let i = 0; i <= size; i++) {
    file.write(`
        export const StyledDiv${i} = styled.div\`
            background: #fff;
            border: 1px solid #000;
            padding: 10px;
            content: 'StyledDiv${i}';
        \`;
    `);
  }

  file.end();
};

createBigFile(3_000);
