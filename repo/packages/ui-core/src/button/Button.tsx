import { forwardRef } from 'react';
import type { ButtonProps } from './Button.types';
import './Button.styles.scss';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, children, ...rest }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className="ui-button"
        data-variant={variant}
        data-size={size}
        data-loading={loading}
        disabled={isDisabled}
        {...rest}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
