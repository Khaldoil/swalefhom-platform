import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { cn } from '../utils/cn';

interface LinkProps extends RouterLinkProps {
  className?: string;
  children: React.ReactNode;
}

export default function Link({ className, children, onClick, ...props }: LinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    
    // Scroll to top when link is clicked
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <RouterLink
      className={cn(
        'transition-colors duration-300',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </RouterLink>
  );
}