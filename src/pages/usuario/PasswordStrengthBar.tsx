import React from 'react';

import './css/barra.css'

interface PasswordStrengthBarProps {
  entropy: number; 
}

const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ entropy }) => {
  const getStrengthClass = () => {
    if (entropy === 0) {
      return null;
    }
    if(entropy >= 80) {
      entropy = 100;
      return 'password-strength-strong';

    }
    else if (entropy >= 70) {
      return 'password-strength-strong';
    } else if (entropy >= 40) {
      return 'password-strength-moderate';
    } else {
      return 'password-strength-weak';
    }
  };

  if (entropy === 0) {
    return null;
  }

  return (
    <div className="password-strength-bar">
      <div className={`password-strength-progress ${getStrengthClass()}`} style={{ width: `${entropy}%` }}></div>
    </div>
  );
};

export default PasswordStrengthBar;