import React, { memo } from 'react';
import styles from './ToolBar.module.css';

interface ToolBarProps {
  hintCount: number;
  shuffleCount: number;
  undoCount: number;
  onHint: () => void;
  onShuffle: () => void;
  onUndo: () => void;
}

const ToolBarComponent: React.FC<ToolBarProps> = ({
  hintCount,
  shuffleCount,
  undoCount,
  onHint,
  onShuffle,
  onUndo,
}) => {
  const tools = [
    { icon: '💡', label: '提示', count: hintCount, onClick: onHint, disabled: hintCount <= 0 },
    { icon: '🔀', label: '洗牌', count: shuffleCount, onClick: onShuffle, disabled: shuffleCount <= 0 },
    { icon: '↩️', label: '撤回', count: undoCount, onClick: onUndo, disabled: undoCount <= 0 },
  ];

  return (
    <div className={styles.toolBar}>
      {tools.map((tool) => (
        <button
          key={tool.label}
          className={`${styles.toolButton} ${tool.disabled ? styles.toolDisabled : ''}`}
          onClick={tool.disabled ? undefined : tool.onClick}
          disabled={tool.disabled}
          type="button"
        >
          <span className={styles.toolIcon}>{tool.icon}</span>
          <span className={styles.toolLabel}>{tool.label}</span>
          <span className={styles.toolCount}>{tool.count}</span>
        </button>
      ))}
    </div>
  );
};

export const ToolBar = memo(ToolBarComponent);
export default ToolBar;
