import { FaTimes } from 'react-icons/fa';
import '../../styles/CategorySelector.css';

const CategorySelector = ({ categories, selectedIds = [], onChange }) => {
  
  const toggleCategory = (categoryId) => {
    let newSelected;
    
    if (selectedIds.includes(categoryId)) {
      
      newSelected = selectedIds.filter(id => id !== categoryId);
    } else {
      
      newSelected = [...selectedIds, categoryId];
    }
    
    
    if (onChange) {
      onChange(newSelected);
    }
  };

  return (
    <div className="category-selector">
      <div className="category-chips">
        {categories.map((category) => (
          <div
            key={category._id}
            className={`category-chip ${selectedIds.includes(category._id) ? 'selected' : ''}`}
            onClick={() => toggleCategory(category._id)}
          >
            {category.name}
            {selectedIds.includes(category._id) && (
              <span className="chip-selected-indicator">✓</span>
            )}
          </div>
        ))}
      </div>
      
      {selectedIds.length > 0 && (
        <div className="selected-categories">
          <h4>Selected Categories:</h4>
          <div className="selected-chips">
            {selectedIds.map((id) => {
              const category = categories.find(c => c._id === id);
              return category ? (
                <div key={id} className="selected-chip">
                  {category.name}
                  <button 
                    className="remove-chip" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(id);
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;