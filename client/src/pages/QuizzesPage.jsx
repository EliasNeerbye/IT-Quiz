import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { quizService } from '../services/api';
import QuizCard from '../components/quiz/QuizCard';
import { toast } from 'react-toastify';

const QuizzesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const QuizzesHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  color: #64748b;
  margin-bottom: 2rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SearchBar = styled.div`
  flex: 1;
  min-width: 250px;
  position: relative;
  
  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
    }
  }
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
  }
`;

const FilterDropdown = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

const QuizGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #1e293b;
`;

const EmptyStateText = styled.p`
  color: #64748b;
  margin-bottom: 1.5rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#3b82f6' : '#e5e7eb'};
  background-color: ${props => props.active ? '#3b82f6' : 'white'};
  color: ${props => props.active ? 'white' : '#1e293b'};
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? '#2563eb' : '#f9fafb'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesRes = await quizService.getCategories();
        setCategories(categoriesRes.data.categories);
        
        // Fetch quizzes with filters
        const params = {
          page,
          limit: 12,
          sortBy,
          search: searchTerm,
        };
        
        if (selectedCategory) {
          params.category = selectedCategory;
        }
        
        const quizzesRes = await quizService.getQuizzes(params);
        setQuizzes(quizzesRes.data.quizzes);
        
        // Set total pages based on pagination info from API
        // This depends on your backend implementation
        setTotalPages(quizzesRes.data.totalPages || 1);
        
      } catch (error) {
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [page, searchTerm, selectedCategory, sortBy]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };
  
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1); // Reset to first page when changing category
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1); // Reset to first page when changing sort
  };
  
  return (
    <QuizzesContainer>
      <QuizzesHeader>
        <Title>Browse Quizzes</Title>
        <Subtitle>Discover and take quizzes created by the community</Subtitle>
      </QuizzesHeader>
      
      <FiltersContainer>
        <SearchBar>
          <FaSearch />
          <input 
            type="text" 
            placeholder="Search quizzes..." 
            value={searchTerm}
            onChange={handleSearch}
          />
        </SearchBar>
        
        <FilterDropdown 
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </FilterDropdown>
        
        <FilterDropdown 
          value={sortBy}
          onChange={handleSortChange}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Most Popular</option>
        </FilterDropdown>
      </FiltersContainer>
      
      {loading ? (
        <p>Loading quizzes...</p>
      ) : (
        <>
          {quizzes.length === 0 ? (
            <EmptyState>
              <EmptyStateTitle>No quizzes found</EmptyStateTitle>
              <EmptyStateText>
                Try adjusting your search or filters to find quizzes.
              </EmptyStateText>
            </EmptyState>
          ) : (
            <QuizGrid>
              {quizzes.map(quiz => (
                <QuizCard key={quiz._id} quiz={quiz} />
              ))}
            </QuizGrid>
          )}
          
          {totalPages > 1 && (
            <Pagination>
              <PageButton 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </PageButton>
              
              {[...Array(totalPages).keys()].map(num => (
                <PageButton
                  key={num + 1}
                  active={page === num + 1}
                  onClick={() => setPage(num + 1)}
                >
                  {num + 1}
                </PageButton>
              ))}
              
              <PageButton
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </QuizzesContainer>
  );
};

export default QuizzesPage;