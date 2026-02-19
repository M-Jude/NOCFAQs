/**
 * Application Entry Point
 * 
 * Main entry point for the React frontend application.
 * Initializes React, sets up routing, and renders the root App component.
 * 
 * @module index
 * @requires react
 * @requires react-dom
 * @requires react-router-dom
 * @requires App
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// ============================================================================
// RENDER APPLICATION
// ============================================================================

/**
 * Create root React element and render application
 * 
 * Features:
 * - StrictMode enabled for development checks
 * - BrowserRouter for client-side routing
 * - Root element targeting the 'root' div in index.html
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
