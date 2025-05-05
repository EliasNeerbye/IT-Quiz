import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaImage, FaCheck, FaTimes, FaClock, FaSort, FaEye, FaChevronLeft, FaChevronRight, FaTrophy } from 'react-icons/fa';
import { quizService } from '../../services/api';
import FormField from '../common/FormField';
import Button from '../common/Button';
import { toast } from 'react-toastify';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0;
`;

const FormStepper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

const Step = styled.div`
  flex: 1;
  text-align: center;
  padding: 1rem;
  background-color: ${props => props.$active ? '#3b82f6' : '#f8fafc'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: ${props => props.$active ? '600' : '400'};
  
  &:first-child {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }
  
  &:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  
  &:hover {
    background-color: ${props => props.$active ? '#2563eb' : '#f1f5f9'};
  }
`;

const FormSection = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const FormTitle = styled.h2`
  font-size: 1.75rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const FormSubtitle = styled.p`
  color: #64748b;
`;

const BasicInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const QuestionContainer = styled.div`
  background-color: #1e293b;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: white;
  
  &:hover {
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const QuestionNumber = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const QuestionActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const AnswersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
`;

// Answer colors consistent with Kahoot
const answerColors = [
  '#ef4444', // Red
  '#10b981', // Green
  '#3b82f6', // Blue
  '#f59e0b', // Yellow
];

const AnswerContainer = styled.div`
  background-color: ${props => props.$color};
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  }
`;

const AnswerInput = styled.input`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  outline: none;
  padding: 0.75rem;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    border-color: rgba(255, 255, 255, 0.5);
    background-color: rgba(255, 255, 255, 0.15);
  }
`;

// Fixed component to avoid DOM warning
const CorrectBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: ${props => props.$isCorrect ? '#10b981' : 'transparent'};
  color: white;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const RemoveAnswerButton = styled.button`
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${AnswerContainer}:hover & {
    opacity: 1;
  }
`;

const AddAnswerButton = styled.button`
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px dashed rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
  width: 100%;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

const TimeControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 8px;
`;

const TimeOption = styled.button`
  background-color: ${props => props.$selected ? 'white' : 'transparent'};
  color: ${props => props.$selected ? '#1e293b' : 'white'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: ${props => props.$selected ? '600' : '400'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$selected ? 'white' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const PointsControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 8px;
`;

const ImagePreview = styled.div`
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.2);
  
  img {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const PreviewContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const PreviewTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const PreviewQuiz = styled.div`
  margin-bottom: 2rem;
`;

const PreviewQuestion = styled.div`
  background-color: #1e293b;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const PreviewQuestionTitle = styled.h4`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: white;
`;

const PreviewAnswers = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const PreviewAnswer = styled.div`
  background-color: ${props => props.$color};
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  position: relative;
  
  ${props => props.$isCorrect && `
    &::after {
      content: "✓";
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      color: white;
    }
  `}
`;

const QuestionTypeSelector = styled.div`
  margin-bottom: 1.5rem;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 8px;
`;

const TypeOption = styled.button`
  background-color: ${props => props.$selected ? 'white' : 'transparent'};
  color: ${props => props.$selected ? '#1e293b' : 'white'};
  border: ${props => props.$selected ? 'none' : '1px solid rgba(255, 255, 255, 0.3)'};
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: ${props => props.$selected ? '600' : '400'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$selected ? 'white' : 'rgba(255, 255, 255, 0.1)'};
  }
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
      type: Yup.string()
        .oneOf(['multiple-choice', 'true-false'], 'Invalid question type')
        .required('Question type is required'),
      answers: Yup.array().of(
        Yup.object().shape({
          text: Yup.string().required('Answer text is required'),
          isCorrect: Yup.boolean().required('isCorrect field is required'),
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
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  
  // State for image upload preview
  const [previewImages, setPreviewImages] = useState({});

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
      
      // Prepare data for backend - remove extra fields not needed by backend
      const preparedValues = {
        ...values,
        questions: values.questions.map(q => ({
          title: q.title,
          text: q.text,
          type: q.type,
          answers: q.answers.map(a => ({
            text: a.text,
            isCorrect: a.isCorrect
          })),
          time_limit: q.time_limit,
          max_points: q.max_points,
          image: q.image
        }))
      };
      
      await quizService.createQuiz(preparedValues);
      toast.success('Quiz created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error(error.response?.data?.error || 'Failed to create quiz');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleImageUpload = (e, setFieldValue, questionIndex) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImages({
        ...previewImages,
        [questionIndex]: reader.result
      });
    };
    reader.readAsDataURL(file);
    
    // Here you would typically upload the image to your server
    // For now, we'll just store the file name
    setFieldValue(`questions.${questionIndex}.image`, file.name);
  };

  // Default values for a new question based on type
  const getDefaultAnswersForType = (type) => {
    switch (type) {
      case 'true-false':
        return [
          { text: 'True', isCorrect: true, color: answerColors[0] },
          { text: 'False', isCorrect: false, color: answerColors[1] }
        ];
      case 'multiple-choice':
      default:
        return [
          { text: '', isCorrect: true, color: answerColors[0] },
          { text: '', isCorrect: false, color: answerColors[1] },
          { text: '', isCorrect: false, color: answerColors[2] },
          { text: '', isCorrect: false, color: answerColors[3] }
        ];
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
        title: 'Question 1', // Set a default title for the backend
        text: 'Question 1',  // This will be displayed to the user
        type: 'multiple-choice',
        answers: getDefaultAnswersForType('multiple-choice'),
        time_limit: 30,
        max_points: 1000,
        image: null
      },
    ],
  };

  // Handle next step
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle previous step
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle question type change
  const handleQuestionTypeChange = (type, questionIndex, values, setFieldValue) => {
    // If changing to true-false, we need to reset answers
    if (type === 'true-false' && values.questions[questionIndex].type !== 'true-false') {
      setFieldValue(`questions.${questionIndex}.answers`, [
        { text: 'True', isCorrect: true, color: answerColors[0] },
        { text: 'False', isCorrect: false, color: answerColors[1] }
      ]);
    } 
    // If changing from true-false to multiple-choice
    else if (type === 'multiple-choice' && values.questions[questionIndex].type === 'true-false') {
      setFieldValue(`questions.${questionIndex}.answers`, [
        { text: '', isCorrect: true, color: answerColors[0] },
        { text: '', isCorrect: false, color: answerColors[1] },
        { text: '', isCorrect: false, color: answerColors[2] },
        { text: '', isCorrect: false, color: answerColors[3] }
      ]);
    }
    
    setFieldValue(`questions.${questionIndex}.type`, type);
  };

  return (
    <FormContainer>
      <FormStepper>
        <Step $active={currentStep === 1} onClick={() => setCurrentStep(1)}>
          1. Basic Info
        </Step>
        <Step $active={currentStep === 2} onClick={() => setCurrentStep(2)}>
          2. Questions
        </Step>
        <Step $active={currentStep === 3} onClick={() => setCurrentStep(3)}>
          3. Preview
        </Step>
      </FormStepper>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form>
            {currentStep === 1 && (
              <FormSection>
                <FormHeader>
                  <FormTitle>Create a New Quiz</FormTitle>
                  <FormSubtitle>Start by setting up basic information about your quiz</FormSubtitle>
                </FormHeader>
                
                <BasicInfoContainer>
                  <FormField
                    label="Quiz Title"
                    name="title"
                    placeholder="Enter a catchy title for your quiz"
                  />
                  
                  <FormField
                    label="Description"
                    name="description"
                    type="textarea"
                    placeholder="What is your quiz about? Give a brief description."
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
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Quiz Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Private Quiz"
                        name="settings.private"
                        type="checkbox"
                        description="Only you can access this quiz"
                      />
                      
                      <FormField
                        label="Enable Multiplayer"
                        name="settings.multiplayer"
                        type="checkbox"
                        description="Allow multiple users to play together"
                      />
                    </div>
                    
                    <FormField
                      label="Default Time Limit (seconds)"
                      name="settings.default_time_limit"
                      type="number"
                      min="10"
                      description="Time allowed to answer each question"
                    />
                  </div>
                </BasicInfoContainer>
                
                <NavigationButtons>
                  <Button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="button"
                    className="btn-primary"
                    onClick={goToNextStep}
                  >
                    Next <FaChevronRight />
                  </Button>
                </NavigationButtons>
              </FormSection>
            )}

            {currentStep === 2 && (
              <FormSection>
                <FormHeader>
                  <FormTitle>Create Questions</FormTitle>
                  <FormSubtitle>Design your quiz questions and answers</FormSubtitle>
                </FormHeader>
                
                <FieldArray name="questions">
                  {({ push, remove }) => (
                    <>
                      {values.questions.map((question, index) => (
                        <QuestionContainer key={index}>
                          <QuestionHeader>
                            <QuestionNumber>{index + 1}</QuestionNumber>
                            
                            <QuestionActions>
                              {values.questions.length > 1 && (
                                <Button
                                  type="button"
                                  className="btn-danger"
                                  onClick={() => remove(index)}
                                >
                                  <FaTrash /> Remove
                                </Button>
                              )}
                            </QuestionActions>
                          </QuestionHeader>
                          
                          {/* Hidden field for question title (backend requirement) */}
                          <input
                            type="hidden"
                            name={`questions.${index}.title`}
                            value={`Question ${index + 1}`}
                            onChange={(e) => setFieldValue(`questions.${index}.title`, e.target.value)}
                          />
                          
                          <FormField
                            label="Question Text"
                            name={`questions.${index}.text`}
                            placeholder="Ask your question here..."
                            style={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '4px',
                              fontSize: '1.25rem',
                              padding: '1rem'
                            }}
                          />
                          
                          {/* Question Type Selector */}
                          <QuestionTypeSelector>
                            <label style={{ color: 'white', marginBottom: '0.5rem', display: 'block' }}>
                              Question Type
                            </label>
                            <div>
                              <TypeOption
                                type="button"
                                $selected={question.type === 'multiple-choice'}
                                onClick={() => handleQuestionTypeChange('multiple-choice', index, values, setFieldValue)}
                              >
                                Multiple Choice
                              </TypeOption>
                              <TypeOption
                                type="button"
                                $selected={question.type === 'true-false'}
                                onClick={() => handleQuestionTypeChange('true-false', index, values, setFieldValue)}
                              >
                                True/False
                              </TypeOption>
                            </div>
                          </QuestionTypeSelector>
                          
                          <div style={{ marginTop: '1rem' }}>
                            <label style={{ color: 'white', marginBottom: '0.5rem', display: 'block' }}>
                              <FaImage /> Add Image (Optional)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, setFieldValue, index)}
                              style={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                width: '100%'
                              }}
                            />
                            
                            {previewImages[index] && (
                              <ImagePreview>
                                <img src={previewImages[index]} alt="Question" />
                              </ImagePreview>
                            )}
                          </div>
                          
                          <TimeControls>
                            <FaClock style={{ color: 'white' }} />
                            <span style={{ color: 'white' }}>Time Limit:</span>
                            
                            {[10, 20, 30, 60, 90, 120].map((time) => (
                              <TimeOption
                                key={time}
                                type="button"
                                $selected={question.time_limit === time}
                                onClick={() => setFieldValue(`questions.${index}.time_limit`, time)}
                              >
                                {time}s
                              </TimeOption>
                            ))}
                          </TimeControls>
                          
                          <PointsControls>
                            <FaTrophy style={{ color: 'white' }} />
                            <span style={{ color: 'white' }}>Points:</span>
                            
                            {[500, 1000, 2000].map((points) => (
                              <TimeOption
                                key={points}
                                type="button"
                                $selected={question.max_points === points}
                                onClick={() => setFieldValue(`questions.${index}.max_points`, points)}
                              >
                                {points}
                              </TimeOption>
                            ))}
                          </PointsControls>
                          
                          <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ color: 'white', marginBottom: '0.5rem', display: 'block' }}>
                              Answers
                            </label>
                            
                            <FieldArray name={`questions.${index}.answers`}>
                              {({ push: pushAnswer, remove: removeAnswer }) => (
                                <>
                                  <AnswersGrid>
                                    {question.answers.map((answer, answerIndex) => (
                                      <AnswerContainer
                                        key={answerIndex}
                                        $color={answer.color}
                                      >
                                        <AnswerInput
                                          value={answer.text}
                                          placeholder={`Answer ${answerIndex + 1}`}
                                          onChange={(e) => setFieldValue(`questions.${index}.answers.${answerIndex}.text`, e.target.value)}
                                          disabled={question.type === 'true-false'}
                                        />
                                        
                                        <CorrectBadge
                                          $isCorrect={answer.isCorrect}
                                          onClick={() => {
                                            // Only allow one correct answer for multiple choice
                                            if (question.type === 'multiple-choice' || question.type === 'true-false') {
                                              question.answers.forEach((_, i) => {
                                                setFieldValue(`questions.${index}.answers.${i}.isCorrect`, i === answerIndex);
                                              });
                                            } else {
                                              setFieldValue(`questions.${index}.answers.${answerIndex}.isCorrect`, !answer.isCorrect);
                                            }
                                          }}
                                        >
                                          {answer.isCorrect ? <FaCheck /> : <FaTimes />}
                                        </CorrectBadge>
                                        
                                        {question.answers.length > 2 && question.type !== 'true-false' && (
                                          <RemoveAnswerButton
                                            onClick={() => removeAnswer(answerIndex)}
                                          >
                                            <FaTrash />
                                          </RemoveAnswerButton>
                                        )}
                                      </AnswerContainer>
                                    ))}
                                    
                                    {question.answers.length < 4 && question.type !== 'true-false' && (
                                      <AddAnswerButton
                                        type="button"
                                        onClick={() => pushAnswer({ 
                                          text: '', 
                                          isCorrect: false,
                                          color: answerColors[question.answers.length % answerColors.length]
                                        })}
                                      >
                                        <FaPlus /> Add Answer
                                      </AddAnswerButton>
                                    )}
                                  </AnswersGrid>
                                </>
                              )}
                            </FieldArray>
                          </div>
                        </QuestionContainer>
                      ))}
                      
                      <Button
                        type="button"
                        className="btn-primary"
                        onClick={() => push({
                          title: `Question ${values.questions.length + 1}`, // Backend title
                          text: `Question ${values.questions.length + 1}`, // Display text
                          type: 'multiple-choice',
                          answers: getDefaultAnswersForType('multiple-choice'),
                          time_limit: 30,
                          max_points: 1000,
                          image: null
                        })}
                      >
                        <FaPlus /> Add Question
                      </Button>
                    </>
                  )}
                </FieldArray>
                
                <NavigationButtons>
                  <Button
                    type="button"
                    className="btn-secondary"
                    onClick={goToPrevStep}
                  >
                    <FaChevronLeft /> Back
                  </Button>
                  
                  <Button
                    type="button"
                    className="btn-primary"
                    onClick={goToNextStep}
                  >
                    Next <FaChevronRight />
                  </Button>
                </NavigationButtons>
              </FormSection>
            )}

            {currentStep === 3 && (
              <FormSection>
                <FormHeader>
                  <FormTitle>Preview & Submit</FormTitle>
                  <FormSubtitle>Review your quiz before submitting</FormSubtitle>
                </FormHeader>
                
                <PreviewContainer>
                  <PreviewTitle>{values.title}</PreviewTitle>
                  <p style={{ marginBottom: '2rem', textAlign: 'center' }}>{values.description}</p>
                  
                  <PreviewQuiz>
                    {values.questions.map((question, index) => (
                      <PreviewQuestion key={index}>
                        <PreviewQuestionTitle>
                          {question.text}
                        </PreviewQuestionTitle>
                        
                        <div style={{ color: 'white', marginBottom: '0.5rem' }}>
                          Type: {question.type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}
                        </div>
                        
                        {previewImages[index] && (
                          <div style={{ marginBottom: '1rem' }}>
                            <img 
                              src={previewImages[index]} 
                              alt="Question" 
                              style={{ maxHeight: '200px', margin: '0 auto', borderRadius: '8px' }}
                            />
                          </div>
                        )}
                        
                        <div style={{ 
                          color: 'white', 
                          textAlign: 'center', 
                          marginBottom: '1rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          padding: '0.5rem',
                          borderRadius: '4px'
                        }}>
                          <FaClock /> {question.time_limit} seconds | {question.max_points} points
                        </div>
                        
                        <PreviewAnswers>
                          {question.answers.map((answer, answerIndex) => (
                            <PreviewAnswer
                              key={answerIndex}
                              $color={answer.color}
                              $isCorrect={answer.isCorrect}
                            >
                              {answer.text || `Answer ${answerIndex + 1}`}
                            </PreviewAnswer>
                          ))}
                        </PreviewAnswers>
                      </PreviewQuestion>
                    ))}
                  </PreviewQuiz>
                </PreviewContainer>
                
                <NavigationButtons>
                  <Button
                    type="button"
                    className="btn-secondary"
                    onClick={goToPrevStep}
                  >
                    <FaChevronLeft /> Back
                  </Button>
                  
                  <Button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? 'Creating...' : 'Create Quiz'}
                  </Button>
                </NavigationButtons>
              </FormSection>
            )}
          </Form>
        )}
      </Formik>
    </FormContainer>
  );
};

export default QuizForm;