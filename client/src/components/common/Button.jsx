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
  
  ${props => props.$fullWidth && css`
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
  
  /* Other button styles remain the same */
`;

const Button = ({ children, className, fullWidth, ...props }) => {
  return (
    <ButtonBase className={className} $fullWidth={fullWidth} {...props}>
      {children}
    </ButtonBase>
  );
};

export default Button;