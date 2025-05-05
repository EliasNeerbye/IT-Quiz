import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaCalendarAlt, FaTag } from 'react-icons/fa';

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const Title = styled(Link)`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  text-decoration: none;
  
  &:hover {
    color: #3b82f6;
  }
`;

const Description = styled.p`
  margin-top: 0.75rem;
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardContent = styled.div`
  padding: 1rem 1.5rem;
`;

const QuizMeta = styled.div`
  display: flex;
  justify-content: space-between;
  color: #64748b;
  font-size: 0.875rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CategoryTag = styled.span`
  background-color: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const CardFooter = styled.div`
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const QuizStats = styled.div`
  display: flex;
  gap: 1rem;
`;

const StatItem = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

const QuizCard = ({ quiz }) => {
  const {
    _id,
    title,
    description,
    creator,
    createdAt,
    category,
    questions,
    settings
  } = quiz;
  
  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString();
  
  return (
    <Card>
      <CardHeader>
        <Title to={`/quiz/${_id}`}>{title}</Title>
        <Description>{description}</Description>
      </CardHeader>
      
      <CardContent>
        <QuizMeta>
          <MetaItem>
            <FaUser />
            {creator?.username || 'Unknown'}
          </MetaItem>
          
          <MetaItem>
            <FaCalendarAlt />
            {formattedDate}
          </MetaItem>
          
          <MetaItem>
            <FaTag />
            {category?.map(cat => (
              <CategoryTag key={cat._id}>
                {cat.name}
              </CategoryTag>
            )) || <CategoryTag>General</CategoryTag>}
          </MetaItem>
        </QuizMeta>
      </CardContent>
      
      <CardFooter>
        <QuizStats>
          <StatItem>{questions?.length || 0} Questions</StatItem>
          {settings?.multiplayer && <StatItem>Multiplayer Enabled</StatItem>}
        </QuizStats>
        
        <Link to={`/quiz/${_id}`} className="btn-primary">
          Take Quiz
        </Link>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;