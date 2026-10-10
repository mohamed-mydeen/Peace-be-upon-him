import { AlertCircle, RefreshCw } from 'lucide-react';
import './FriendlyError.css';

export default function FriendlyError({ 
  title, 
  message, 
  onRetry, 
  isRetrying = false,
  actionLabel = "Try again",
  secondaryAction,
  secondaryActionLabel,
  secondaryIcon: SecondaryIcon,
  icon: Icon = AlertCircle 
}) {
  return (
    <div className="friendly-error-card" role="alert" aria-live="assertive">
      <div className="friendly-error-icon-wrap" aria-hidden="true">
        <Icon size={24} />
      </div>
      <div className="friendly-error-content">
        <h3 className="friendly-error-title">{title || "Something went wrong"}</h3>
        <p className="friendly-error-message">{message || "We couldn't load this content right now. Please try again."}</p>
        
        <div className="friendly-error-actions">
          {onRetry && (
            <button 
              className="btn btn-secondary btn-sm friendly-error-retry" 
              onClick={onRetry} 
              disabled={isRetrying}
            >
              <RefreshCw size={14} className={isRetrying ? 'spinning' : ''} />
              {isRetrying ? 'Retrying...' : actionLabel}
            </button>
          )}
          {secondaryAction && (
            <button 
              className="btn btn-primary btn-sm" 
              onClick={secondaryAction}
            >
              {SecondaryIcon && <SecondaryIcon size={14} />}
              {secondaryActionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
