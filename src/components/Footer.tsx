import React from 'react';

interface FooterProps {
  onOpenArchitecture: () => void;
  onOpenShortcuts: () => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenArchitecture,
  onOpenShortcuts,
  onOpenPrivacy,
}) => {
  return (
    <footer className="w-full border-t border-[#E8DFD4] bg-[#FAF7F2] py-8 mt-12 transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#6C6975]">
        
        {/* Left copyright & processing guarantee */}
        <div className="flex items-center gap-2 flex-wrap text-center md:text-left">
          <span className="font-semibold text-[#191C21]">CozyCraft Studio</span>
          <span>•</span>
          <span>© 2024 CozyCraft Studio. 100% Client-Side & Local Browser Processing.</span>
        </div>

        {/* Right navigation links */}
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <button
            onClick={onOpenPrivacy}
            className="hover:text-[#191C21] transition-colors focus:outline-none"
          >
            Privacy Policy
          </button>
          <button
            onClick={onOpenArchitecture}
            className="hover:text-[#191C21] transition-colors focus:outline-none"
          >
            Local Architecture
          </button>
          <button
            onClick={onOpenShortcuts}
            className="hover:text-[#191C21] transition-colors focus:outline-none"
          >
            Shortcut Keys
          </button>
          <button
            onClick={onOpenArchitecture}
            className="hover:text-[#191C21] transition-colors focus:outline-none"
          >
            Support Guide
          </button>
        </div>

      </div>
    </footer>
  );
};
