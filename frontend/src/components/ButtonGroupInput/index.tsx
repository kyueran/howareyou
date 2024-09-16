import { Button } from 'antd';
import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface ButtonGroupInputProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
}

const ButtonGroupInput: React.FC<ButtonGroupInputProps> = ({
  options = [],
  value = '',
  onChange,
}) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map((option) => (
        <Button
          key={option.value}
          type={value === option.value ? 'primary' : 'default'}
          onClick={() => onChange?.(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default ButtonGroupInput;
