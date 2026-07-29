import React from 'react';
import { Clock, Send } from 'lucide-react';

export default function Sidebar({
  questions,
  currentIdx,
  answers,
  timeLeft,
  totalTime,
  onQuestionSelect,
  onSubmit,
}) {
  // Format thời gian thành MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Xác định trạng thái cảnh báo thời gian
  let timerClass = 'timer-countdown';
  if (timeLeft < 300) { // Dưới 5 phút
    timerClass += ' danger';
  }

  // Hàm kiểm tra xem câu hỏi đã được làm chưa
  const isQuestionAnswered = (idx, q) => {
    const ans = answers[idx];
    if (ans === undefined || ans === null) return false;
    
    if (q.type === 'single_choice') {
      return typeof ans === 'number';
    }
    if (q.type === 'multiple_choice') {
      return Array.isArray(ans) && ans.length > 0;
    }
    if (q.type === 'essay_text') {
      return ans.text && ans.text.trim() !== '';
    }
    if (q.type === 'essay_code') {
      return typeof ans === 'string' && ans.trim() !== '' && ans.trim() !== q.starter_code?.trim();
    }
    return false;
  };

  return (
    <aside className="sidebar">
      {/* Logo / Header */}
      <div className="logo-container" style={{ marginBottom: '1.5rem' }}>
        <span>📝</span>
        <span className="logo-text">Bài Kiểm Tra</span>
      </div>

      {/* Timer Widget */}
      <div className="timer-widget">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock size={15} />
          <span className="timer-label">Thời gian</span>
        </div>
        <div className={timerClass}>{formatTime(timeLeft)}</div>
      </div>

      {/* Chú giải trạng thái */}
      <div style={{ marginBottom: '1rem', fontSize: '11pt' }}>
        <p style={{ fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Trạng thái:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }} />
            <span>Chưa làm</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--success)' }} />
            <span>Đã làm (Xanh lá)</span>
          </div>
        </div>
      </div>

      {/* Lưới câu hỏi */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <p style={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: '12pt', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem' }}>
          Danh sách câu hỏi
        </p>
        <div className="question-grid">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIdx;
            const isAnswered = isQuestionAnswered(idx, q);
            
            let itemClass = 'grid-item';
            if (isCurrent) itemClass += ' active';
            if (isAnswered) itemClass += ' answered'; // Sẽ chuyển sang màu xanh lá theo yêu cầu 3

            return (
              <button
                key={idx}
                type="button"
                className={itemClass}
                onClick={() => onQuestionSelect(idx)}
                title={`Câu ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nút nộp bài */}
      <button 
        type="button" 
        className="btn btn-danger"
        style={{ width: '100%', marginTop: '1.5rem', gap: '0.4rem', fontSize: '13pt' }}
        onClick={onSubmit}
      >
        <Send size={15} /> Nộp bài
      </button>
    </aside>
  );
}
