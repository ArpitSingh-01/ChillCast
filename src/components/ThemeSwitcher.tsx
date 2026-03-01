import { useState } from "react";
import { useTheme, themes, ThemeColor } from "@/contexts/ThemeContext";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = [
    { key: 'purple', name: 'Purple Dream', color: '#8B5CF6' },
    { key: 'blue', name: 'Ocean Blue', color: '#3B82F6' },
    { key: 'green', name: 'Forest Green', color: '#10B981' },
    { key: 'orange', name: 'Sunset Orange', color: '#F97316' },
    { key: 'pink', name: 'Bubblegum Pink', color: '#EC4899' },
    { key: 'red', name: 'Ruby Red', color: '#EF4444' },
    { key: 'cyan', name: 'Cyber Cyan', color: '#06B6D4' },
  ];

  return (
    <>
      {/* Theme Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: themeOptions.find(t => t.key === theme)?.color || '#8B5CF6',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        🎨
      </button>

      {/* Theme Menu */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            borderRadius: '16px',
            minWidth: '280px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 1000,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <h3 style={{ 
            color: 'white', 
            marginBottom: '16px', 
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            🎨 Choose Your Theme
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {themeOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  setTheme(option.key as ThemeColor);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: theme === option.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border: theme === option.key ? `2px solid ${option.color}` : '2px solid transparent',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (theme !== option.key) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (theme !== option.key) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: option.color,
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {option.name}
                  </div>
                  {theme === option.key && (
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      ✓ Active
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}
    </>
  );
};

export default ThemeSwitcher;