import styled, { css } from 'styled-components';

const ButtonBase = styled.button`
  display: inline-block;
  padding: 10px 15px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  /* Primary button - blue */
  &.btn-primary {
    background-color: #2563eb;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #1d4ed8;
    }
  }
  
  /* Secondary button - gray */
  &.btn-secondary {
    background-color: #6b7280;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #4b5563;
    }
  }
  
  /* Success button - green */
  &.btn-success {
    background-color: #10b981;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #059669;
    }
  }
  
  /* Danger button - red */
  &.btn-danger {
    background-color: #ef4444;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #dc2626;
    }
  }
  
  /* Outline button */
  &.btn-outline {
    background-color: transparent;
    border: 1.5px solid #2563eb;
    color: #2563eb;
    
    &:hover:not(:disabled) {
      background-color: #2563eb;
      color: white;
    }
  }
`;

const Button = ({ children, className, ...props }) => {
  return (
    <ButtonBase className={className} {...props}>
      {children}
    </ButtonBase>
  );
};

export default Button;