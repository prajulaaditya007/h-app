import React from 'react';
import './FooterStyles.css';

export const Footer: React.FC = () => {
  return (
    <footer className="minimal-footer">
      <span className="footer-text">
        &copy; {new Date().getFullYear()} Hierarchy App &bull; Enterprise Territory Management
      </span>
    </footer>
  );
};
