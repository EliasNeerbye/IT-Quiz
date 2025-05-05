import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --color-primary: #2563eb;
    --color-primary-dark: #1d4ed8;
    --color-secondary: #64748b;
    --color-success: #10b981;
    --color-danger: #ef4444;
    --color-warning: #f59e0b;
    --color-info: #3b82f6;
    
    --color-bg: #f8fafc;
    --color-bg-dark: #1e293b;
    
    --color-text: #1e293b;
    --color-text-light: #64748b;
    --color-text-lighter: #94a3b8;
    
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    
    --border-radius-sm: 0.25rem;
    --border-radius-md: 0.5rem;
    --border-radius-lg: 0.75rem;
    
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-md: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--color-bg);
    color: var(--color-text);
    line-height: 1.5;
    font-size: var(--font-size-md);
  }
  
  a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--color-primary-dark);
      text-decoration: none;
    }
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: var(--space-md);
    font-weight: 600;
    line-height: 1.2;
  }
  
  h1 {
    font-size: var(--font-size-4xl);
  }
  
  h2 {
    font-size: var(--font-size-3xl);
  }
  
  h3 {
    font-size: var(--font-size-2xl);
  }
  
  h4 {
    font-size: var(--font-size-xl);
  }
  
  h5 {
    font-size: var(--font-size-lg);
  }
  
  h6 {
    font-size: var(--font-size-md);
  }
  
  p {
    margin-bottom: var(--space-md);
  }
  
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .content {
    flex: 1;
    padding: var(--space-xl);
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-md);
  }
  
  .section {
    margin-bottom: var(--space-2xl);
  }
  
  .card {
    background-color: white;
    border-radius: var(--border-radius-md);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: var(--space-xl);
    margin-bottom: var(--space-lg);
  }
  
  .auth-form {
    max-width: 480px;
    margin: 0 auto;
    padding: var(--space-xl);
    background-color: white;
    border-radius: var(--border-radius-md);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    
    h2 {
      text-align: center;
      margin-bottom: var(--space-xl);
    }
  }
  
  .error-message {
    color: var(--color-danger);
    background-color: rgba(239, 68, 68, 0.1);
    padding: var(--space-md);
    margin-bottom: var(--space-lg);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
  }
  
  .grid {
    display: grid;
    gap: var(--space-lg);
  }
  
  .grid-cols-1 {
    grid-template-columns: 1fr;
  }
  
  @media (min-width: 640px) {
    .grid-cols-2 {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 768px) {
    .grid-cols-3 {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .grid-cols-4 {
      grid-template-columns: repeat(4, 1fr);
    }
  }
`;

export default GlobalStyle;