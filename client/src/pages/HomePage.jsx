import { useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowRight, FaGamepad, FaQuestionCircle, FaBrain } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const HeroSection = styled.section`
  background-color: #1e293b;
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 0.5rem;
  margin-bottom: 3rem;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: white;
  
  span {
    color: #3b82f6;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  color: #e2e8f0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #2563eb;
    color: white;
    transform: translateY(-2px);
  }
  
  &.secondary {
    background-color: transparent;
    border: 2px solid #3b82f6;
    color: #3b82f6;
    
    &:hover {
      background-color: rgba(59, 130, 246, 0.1);
    }
  }
`;

const FeaturesSection = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  color: #3b82f6;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: #64748b;
  margin-bottom: 0;
`;

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return (
    <div className="container">
      <HeroSection>
        <HeroTitle>
          Welcome to IT<span>Quiz</span>
        </HeroTitle>
        <HeroSubtitle>
          Test your IT knowledge, create custom quizzes, and challenge your friends in multiplayer games.
          A modern quiz platform for students and IT enthusiasts.
        </HeroSubtitle>
        <ButtonGroup>
          {isAuthenticated ? (
            <>
              <CTAButton to="/dashboard">
                Go to Dashboard <FaArrowRight />
              </CTAButton>
              <CTAButton to="/create-quiz" className="secondary">
                Create Quiz <FaGamepad />
              </CTAButton>
            </>
          ) : (
            <>
              <CTAButton to="/register">
                Get Started <FaArrowRight />
              </CTAButton>
              <CTAButton to="/login" className="secondary">
                Login
              </CTAButton>
            </>
          )}
        </ButtonGroup>
      </HeroSection>

      <FeaturesSection>
        <SectionTitle>Why choose ITQuiz?</SectionTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>
              <FaBrain />
            </FeatureIcon>
            <FeatureTitle>Learn IT Concepts</FeatureTitle>
            <FeatureDescription>
              Access a wide range of quizzes covering various IT topics including programming, networking, security, and more.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <FaGamepad />
            </FeatureIcon>
            <FeatureTitle>Multiplayer Mode</FeatureTitle>
            <FeatureDescription>
              Challenge your friends or classmates with real-time multiplayer quizzes. Compete for the highest score!
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <FaQuestionCircle />
            </FeatureIcon>
            <FeatureTitle>Create Custom Quizzes</FeatureTitle>
            <FeatureDescription>
              Create your own quizzes with various question types including multiple choice, true/false, and more.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>
    </div>
  );
};

export default HomePage;