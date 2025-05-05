import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';
import Button from '../common/Button';
import FormField from '../common/FormField';

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

const RegisterForm = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const success = await register({
        username: values.username,
        email: values.email,
        password: values.password,
      });

      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      setServerError(error.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Create an Account</h2>
      {serverError && <div className="error-message">{serverError}</div>}
      
      <Formik
        initialValues={{
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormField
              label="Username"
              name="username"
              type="text"
              placeholder="Enter your username"
            />
            
            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
            />
            
            <FormField
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
            />
            
            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
            />
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              fullWidth
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RegisterForm;