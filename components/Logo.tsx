/**
 * Mechasense Logo Component
 * Professional logo with ML chip, robot, and motor icons
 */

export function MechasenseLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icons */}
      <div className="flex items-center gap-1">
        {/* ML Chip Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
          <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <text x="12" y="15" fontSize="8" fontWeight="bold" textAnchor="middle" fill="currentColor">ML</text>
          <circle cx="4" cy="8" r="1" fill="currentColor"/>
          <circle cx="4" cy="12" r="1" fill="currentColor"/>
          <circle cx="4" cy="16" r="1" fill="currentColor"/>
          <circle cx="20" cy="8" r="1" fill="currentColor"/>
          <circle cx="20" cy="12" r="1" fill="currentColor"/>
          <circle cx="20" cy="16" r="1" fill="currentColor"/>
        </svg>
        
        {/* Robot Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
          <rect x="7" y="8" width="10" height="10" rx="5" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="10" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="14" cy="12" r="1.5" fill="currentColor"/>
          <path d="M 10 15 Q 12 16 14 15" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <circle cx="6" cy="12" r="1" fill="currentColor"/>
          <circle cx="18" cy="12" r="1" fill="currentColor"/>
          <rect x="11" y="4" width="2" height="3" rx="1" fill="currentColor"/>
        </svg>
        
        {/* Motor/Gear Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M 12 3 L 12 7" stroke="currentColor" strokeWidth="2"/>
          <path d="M 12 17 L 12 21" stroke="currentColor" strokeWidth="2"/>
          <path d="M 3 12 L 7 12" stroke="currentColor" strokeWidth="2"/>
          <path d="M 17 12 L 21 12" stroke="currentColor" strokeWidth="2"/>
          <path d="M 5.6 5.6 L 8.5 8.5" stroke="currentColor" strokeWidth="2"/>
          <path d="M 15.5 15.5 L 18.4 18.4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
      
      {/* Text Logo */}
      <div className="flex flex-col leading-none">
        <span className="text-2xl font-bold text-primary" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          Mechasense
        </span>
      </div>
    </div>
  );
}

