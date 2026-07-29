import React from 'react';
import { renderMarkdownWithMath } from '../utils/katex-renderer';

export default function QuestionCard({ question, questionNumber }) {
  if (!question) return null;

  const htmlContent = renderMarkdownWithMath(question.question);

  return (
    <div className="card">
      <div style={{ fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
        Câu {questionNumber}
      </div>

      <div 
        className="question-text"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Hiển thị ảnh minh họa câu hỏi nếu có */}
      {question.images && question.images.length > 0 && (
        <div className="illustration-images" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {question.images.map((imgUrl, idx) => (
            <img 
              key={idx} 
              src={imgUrl} 
              alt={`Hình minh họa ${idx + 1} cho câu hỏi`}
              style={{ maxWidth: '100%', borderRadius: 'var(--radius-sm)' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
