import type { ReactNode, ComponentProps } from 'react';
import { tokens } from '../../styles/design-tokens';

interface CardProps extends ComponentProps<'div'> {
  children: ReactNode;
  hover?: boolean;
}

export const Card = ({ children, hover = false, className, ...props }: CardProps) => {
  return (
    <div
      className={`${tokens.card} ${hover ? tokens.cardHover : ''} ${className ?? ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardSectionProps extends ComponentProps<'div'> {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export const CardSection = ({ title, icon, action, children, className, ...props }: CardSectionProps) => {
  return (
    <div className={`${tokens.listSection} ${className ?? ''}`} {...props}>
      {title && (
        <div className={tokens.listSectionHeader}>
          {icon && <span className="text-slate-400">{icon}</span>}
          <h3 className={tokens.listSectionTitle}>{title}</h3>
          {action && <div className="ml-auto">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
