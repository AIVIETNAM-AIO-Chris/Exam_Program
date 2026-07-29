import React, { useRef } from 'react';
import { renderMarkdownWithMath } from '../utils/katex-renderer';
import { Upload, X, RotateCcw, Code } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism-tomorrow.css';

export default function AnswerInput({ question, value, onChange }) {
  const fileInputRef = useRef(null);

  if (!question) return null;

  // 1. Trắc nghiệm chọn một (single_choice)
  if (question.type === 'single_choice') {
    const selectedIdx = value !== undefined && value !== null ? parseInt(value) : null;
    
    return (
      <div className="options-list fade-in">
        {question.options && question.options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          const optionHtml = option.text ? renderMarkdownWithMath(option.text) : '';
          
          return (
            <div 
              key={idx}
              className={`option-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onChange(idx)}
            >
              <div className="option-indicator" />
              <div className="option-content">
                {option.image ? (
                  <img src={option.image} alt={`Đáp án ${String.fromCharCode(65 + idx)}`} />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: optionHtml }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 2. Trắc nghiệm chọn nhiều (multiple_choice)
  if (question.type === 'multiple_choice') {
    const selectedIndices = Array.isArray(value) ? value : [];

    const handleToggle = (idx) => {
      let newValue;
      if (selectedIndices.includes(idx)) {
        newValue = selectedIndices.filter(i => i !== idx);
      } else {
        newValue = [...selectedIndices, idx].sort((a, b) => a - b);
      }
      onChange(newValue);
    };

    return (
      <div className="options-list multiple-choice fade-in">
        {question.options && question.options.map((option, idx) => {
          const isSelected = selectedIndices.includes(idx);
          const optionHtml = option.text ? renderMarkdownWithMath(option.text) : '';

          return (
            <div 
              key={idx}
              className={`option-item multiple-choice ${isSelected ? 'selected' : ''}`}
              onClick={() => handleToggle(idx)}
            >
              <div className="option-indicator" />
              <div className="option-content">
                {option.image ? (
                  <img src={option.image} alt={`Đáp án ${String.fromCharCode(65 + idx)}`} />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: optionHtml }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 3. Tự luận nhập văn bản & tải ảnh (essay_text)
  if (question.type === 'essay_text') {
    // Trạng thái giá trị tự luận: object { text: String, image: Base64/ObjectUrl }
    const essayValue = value && typeof value === 'object' ? value : { text: '', image: null, imageName: '' };

    const handleTextChange = (e) => {
      onChange({ ...essayValue, text: e.target.value });
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange({ 
            ...essayValue, 
            image: reader.result, // Base64 string
            imageName: file.name
          });
        };
        reader.readAsDataURL(file);
      }
    };

    const handleRemoveImage = (e) => {
      e.stopPropagation();
      onChange({ ...essayValue, image: null, imageName: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    return (
      <div className="fade-in">
        <textarea
          className="essay-textarea"
          placeholder="Nhập câu trả lời tự luận của bạn tại đây (Hỗ trợ định dạng Markdown)..."
          value={essayValue.text || ''}
          onChange={handleTextChange}
        />

        {question.allow_image_upload && (
          <div>
            <input 
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />

            {!essayValue.image ? (
              <div 
                className="upload-container"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <Upload className="upload-icon" size={32} />
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Tải lên ảnh bài làm</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Kéo thả hoặc nhấp để chọn ảnh chụp lời giải trên giấy
                </p>
              </div>
            ) : (
              <div className="uploaded-image-preview">
                <img src={essayValue.image} alt="Ảnh bài làm đã tải lên" />
                <button 
                  type="button"
                  className="btn-remove-image"
                  onClick={handleRemoveImage}
                  title="Xóa ảnh"
                >
                  <X size={14} />
                </button>
                <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ✓ Đã đính kèm ảnh: {essayValue.imageName || 'bai_lam.png'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 4. Tự luận viết code (essay_code)
  if (question.type === 'essay_code') {
    const codeValue = typeof value === 'string' ? value : (question.starter_code || '');
    const lang = (question.code_language || 'python').toLowerCase();

    // Map language name to Prism grammar
    const getGrammar = (language) => {
      const map = {
        python: Prism.languages.python,
        javascript: Prism.languages.javascript,
        js: Prism.languages.javascript,
        c: Prism.languages.c,
        cpp: Prism.languages.cpp,
        'c++': Prism.languages.cpp,
        java: Prism.languages.java,
      };
      return map[language] || Prism.languages.python;
    };

    const getLangName = (language) => {
      const map = {
        python: 'python',
        javascript: 'javascript',
        js: 'javascript',
        c: 'c',
        cpp: 'cpp',
        'c++': 'cpp',
        java: 'java',
      };
      return map[language] || 'python';
    };

    const handleCodeChange = (code) => {
      onChange(code);
    };

    const handleReset = () => {
      if (window.confirm('Bạn có chắc chắn muốn reset lại code ban đầu? Mọi chỉnh sửa của bạn sẽ bị mất.')) {
        onChange(question.starter_code || '');
      }
    };

    return (
      <div className="code-editor-container fade-in">
        <div className="code-editor-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code size={16} />
            <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>Trình soạn thảo ({question.code_language || 'code'})</span>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
            onClick={handleReset}
            title="Reset code về ban đầu"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
        <Editor
          value={codeValue}
          onValueChange={handleCodeChange}
          highlight={code => Prism.highlight(code, getGrammar(lang), getLangName(lang))}
          padding={16}
          className="code-editor-highlighted"
          style={{
            fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
            fontSize: '12pt',
            lineHeight: 1.5,
            minHeight: '200px',
            backgroundColor: '#2d2d2d',
            color: '#ccc',
            caretColor: '#ffffff',
          }}
          placeholder="// Viết mã nguồn của bạn ở đây..."
        />
      </div>
    );
  }

  return null;
}
