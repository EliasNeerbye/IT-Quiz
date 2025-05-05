import { Field, ErrorMessage } from 'formik';
import styled from 'styled-components';

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
`;

const Input = styled(Field)`
  width: 100%;
  padding: 10px 15px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
`;

const TextArea = styled(Field)`
  width: 100%;
  padding: 10px 15px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  min-height: 120px;
  resize: vertical;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
`;

const SelectField = styled(Field)`
  width: 100%;
  padding: 10px 15px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  transition: border-color 0.3s ease;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>');
  background-repeat: no-repeat;
  background-position: right 10px center;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
`;

const ErrorText = styled.div`
  color: #dc2626;
  font-size: 14px;
  margin-top: 5px;
`;

const FormField = ({ label, name, type = 'text', placeholder = '', options = [], ...props }) => {
  return (
    <FormGroup>
      {label && <Label htmlFor={name}>{label}</Label>}
      
      {type === 'textarea' ? (
        <TextArea
          name={name}
          as="textarea"
          placeholder={placeholder}
          {...props}
        />
      ) : type === 'select' ? (
        <SelectField as="select" name={name} {...props}>
          <option value="">{placeholder || 'Select an option'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      ) : (
        <Input
          type={type}
          name={name}
          placeholder={placeholder}
          {...props}
        />
      )}
      
      <ErrorMessage name={name} component={ErrorText} />
    </FormGroup>
  );
};

export default FormField;