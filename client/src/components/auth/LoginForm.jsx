import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';
import Button from '../common/Button';
import FormField from '../common/FormField';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const LoginForm = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const success = await login({
        email: values.email,
        password: values.password,
      });

      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      setServerError(error.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Login to Your Account</h2>
      {serverError && <div className="error-message">{serverError}</div>}
      
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
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
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              fullWidth
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginForm;