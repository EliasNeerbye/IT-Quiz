import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openItem, setOpenItem] = useState(null);
  
  
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/faq');
        setFaqs(response.data.faqs || []);
        
        
        if (response.data.faqs && response.data.faqs.length > 0) {
          setOpenItem(response.data.faqs[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch FAQs:', err);
        setError('Failed to load FAQ content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFaqs();
  }, []);
  
  
  const toggleItem = (id) => {
    setOpenItem(openItem === id ? null : id);
  };
  
  return (
    <div className="container py-lg">
      <div className="faq-page">
        <div className="text-center mb-lg">
          <h1>Frequently Asked Questions</h1>
          <p className="lead">
            Find answers to the most common questions about QuITz.
          </p>
        </div>
        
        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : faqs.length === 0 ? (
          <div className="empty-state card text-center py-lg">
            <FaQuestionCircle size={48} className="text-light mb-md" />
            <h3>No FAQs Available</h3>
            <p>
              There are no frequently asked questions available at the moment.
              Please check back later.
            </p>
          </div>
        ) : (
          <div className="faq-accordion">
            {faqs.map((faq) => (
              <div
                key={faq._id}
                className={`faq-accordion-item ${openItem === faq._id ? 'active' : ''}`}
              >
                <div
                  className="faq-accordion-header"
                  onClick={() => toggleItem(faq._id)}
                >
                  <h3 className="faq-accordion-title">
                    <FaQuestionCircle className="faq-icon" /> {faq.question}
                  </h3>
                  {openItem === faq._id ? (
                    <FaChevronUp className="faq-toggle" />
                  ) : (
                    <FaChevronDown className="faq-toggle" />
                  )}
                </div>
                
                {openItem === faq._id && (
                  <div className="faq-accordion-body">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="faq-contact mt-xl">
          <div className="card text-center py-lg">
            <h3>Still Have Questions?</h3>
            <p>
              If you couldn't find the answer to your question, please feel free
              to contact us.
            </p>
            <a href="mailto:contact@it-quiz.com" className="btn btn-primary">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;