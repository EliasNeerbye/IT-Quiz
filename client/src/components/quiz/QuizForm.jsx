import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { quizService } from '../../services/api';
import FormField from '../common/FormField';
import Button from '../common/Button';
import { toast } from 'react-toastify';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FormHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  color: #1e293b;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  color: #1e293b;
  margin-bottom: 1rem;
`;

const QuestionContainer = styled.div`
  background-color: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const QuestionTitle = styled.h4`
  font-size: 1rem;
  color: #1e293b;
`;

const AnswerContainer = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  settings: Yup.object().shape({
    private: Yup.boolean(),
    multiplayer: Yup.boolean(),
    default_time_limit: Yup.number().min(10, 'Minimum time is 10 seconds').required('Time limit is required'),
  }),
  questions: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required('Question title is required'),
      text: Yup.string().required('Question text is required'),
      type: Yup.string().required('Question type is required'),
      answers: Yup.array().of(
        Yup.object().shape({
          text: Yup.string().required('Answer text is required'),
          isCorrect: Yup.boolean(),
        })
      ).min(2, 'At least 2 answers are required'),
      time_limit: Yup.number().min(0, 'Time limit cannot be negative'),
      max_points: Yup.number().min(1, 'Points must be at least 1'),
    })
  ).min(1, 'At least one question is required'),
});

const QuizForm = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await quizService.getCategories();
        setCategories(res.data.categories);
      } catch (error) {
        toast.error('Failed to load categories');
      }
    };
    
    fetchCategories();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      await quizService.createQuiz(values);
      toast.success('Quiz created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create quiz');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const initialValues = {
    title: '',
    description: '',
    settings: {
      private: false,
      multiplayer: true,
      default_time_limit: 60,
    },
    questions: [
      {
        title: '',
        text: '',
        type: 'multiple-choice',
        answers: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
        ],
        time_limit: 0,
        max_points: 1000,
        image: null,
      },
    ],
  };

  return (
    <FormContainer>
      <FormHeader>
        <FormTitle>Create a New Quiz</FormTitle>
      </FormHeader>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting }) => (
          <Form>
            <FormSection>
              <SectionTitle>Basic Information</SectionTitle>
              <FormField
                label="Quiz Title"
                name="title"
                placeholder="Enter a title for your quiz"
              />
              
              <FormField
                label="Description"
                name="description"
                type="textarea"
                placeholder="Describe what your quiz is about"
              />
              
              <FormField
                label="Category"
                name="category"
                type="select"
                placeholder="Select a category"
                options={categories.map(cat => ({
                  value: cat._id,
                  label: cat.name,
                }))}
              />
            </FormSection>

            <FormSection>
              <SectionTitle>Quiz Settings</SectionTitle>
              
              <FormField
                label="Private Quiz"
                name="settings.private"
                type="checkbox"
              />
              
              <FormField
                label="Enable Multiplayer"
                name="settings.multiplayer"
                type="checkbox"
              />
              
              <FormField
                label="Default Time Limit (seconds)"
                name="settings.default_time_limit"
                type="number"
                min="10"
              />
            </FormSection>

            <FormSection>
              <SectionTitle>Questions</SectionTitle>
              
              <FieldArray name="questions">
                {({ push, remove }) => (
                  <>
                    {values.questions.map((question, index) => (
                      <QuestionContainer key={index}>
                        <QuestionHeader>
                          <QuestionTitle>Question {index + 1}</QuestionTitle>
                          
                          {values.questions.length > 1 && (
                            <Button
                              type="button"
                              className="btn-danger"
                              onClick={() => remove(index)}
                            >
                              <FaTrash /> Remove
                            </Button>
                          )}
                        </QuestionHeader>
                        
                        <FormField
                          label="Question Title"
                          name={`questions.${index}.title`}
                          placeholder="Enter a title for this question"
                        />
                        
                        <FormField
                          label="Question Text"
                          name={`questions.${index}.text`}
                          type="textarea"
                          placeholder="Enter the question text"
                        />
                        
                        <FormField
                          label="Question Type"
                          name={`questions.${index}.type`}
                          type="select"
                          options={[
                            { value: 'multiple-choice', label: 'Multiple Choice' },
                            { value: 'true-false', label: 'True/False' },
                            { value: 'correct-order', label: 'Correct Order' },
                            { value: 'image-reveal', label: 'Image Reveal' },
                          ]}
                        />
                        
                        <FormField
                          label="Time Limit (seconds, 0 for default)"
                          name={`questions.${index}.time_limit`}
                          type="number"
                          min="0"
                        />
                        
                        <FormField
                          label="Points"
                          name={`questions.${index}.max_points`}
                          type="number"
                          min="1"
                        />
                        
                        <SectionTitle>Answers</SectionTitle>
                        
                        <FieldArray name={`questions.${index}.answers`}>
                          {({ push: pushAnswer, remove: removeAnswer }) => (
                            <>
                              {question.answers.map((answer, answerIndex) => (
                                <AnswerContainer key={answerIndex}>
                                  <FormField
                                    label={`Answer ${answerIndex + 1}`}
                                    name={`questions.${index}.answers.${answerIndex}.text`}
                                    placeholder="Enter answer text"
                                  />
                                  
                                  <FormField
                                    label="Correct Answer"
                                    name={`questions.${index}.answers.${answerIndex}.isCorrect`}
                                    type="checkbox"
                                  />
                                  
                                  {question.answers.length > 2 && (
                                    <Button
                                      type="button"
                                      className="btn-danger"
                                      onClick={() => removeAnswer(answerIndex)}
                                    >
                                      <FaTrash />
                                    </Button>
                                  )}
                                </AnswerContainer>
                              ))}
                              
                              <Button
                                type="button"
                                className="btn-secondary"
                                onClick={() => pushAnswer({ text: '', isCorrect: false })}
                              >
                                <FaPlus /> Add Answer
                              </Button>
                            </>
                          )}
                        </FieldArray>
                      </QuestionContainer>
                    ))}
                    
                    <Button
                      type="button"
                      className="btn-primary"
                      onClick={() => push({
                        title: '',
                        text: '',
                        type: 'multiple-choice',
                        answers: [
                          { text: '', isCorrect: true },
                          { text: '', isCorrect: false },
                        ],
                        time_limit: 0,
                        max_points: 1000,
                        image: null,
                      })}
                    >
                      <FaPlus /> Add Question
                    </Button>
                  </>
                )}
              </FieldArray>
            </FormSection>

            <ButtonGroup>
              <Button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Creating...' : 'Create Quiz'}
              </Button>
            </ButtonGroup>
          </Form>
        )}
      </Formik>
    </FormContainer>
  );
};

export default QuizForm;