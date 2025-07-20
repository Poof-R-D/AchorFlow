
import React from 'react';
import { ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-ui-base border-t border-ui-accent py-8 px-8">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left side - Poof Labs branding */}
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/6c5b65dc-07c7-45d4-b3e2-2c71ffbf96b4.png" 
              alt="Poof Labs" 
              className="h-6 w-auto"
            />
            <div className="text-text-secondary text-sm">
              © 2024 Poof Labs. Building the future of Solana development.
            </div>
          </div>
          
          {/* Right side - Links */}
          <div className="flex items-center space-x-6">
            <a
              href="https://pooflabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              <span>Website</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://x.com/PoofLabs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              <span>Twitter</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
