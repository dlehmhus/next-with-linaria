'use client';
import { styled } from '@linaria/react';

const Button = styled.button`
  content: 'Linaria UiKit Button';
`;

export const UiKitButton: React.FC = () => {
  return (
    <Button
      data-testid="linaria-uikit-button"
      onClick={() =>
        window.alert('This button compes from the Ui-Kit packages')
      }
    >
      Linaria UiKit Button
    </Button>
  );
};
