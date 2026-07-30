import React from 'react';
import { renderMarkdownWithMath } from '../utils/katex-renderer';
import { Download, FileText, ChevronDown } from 'lucide-react';

export default function ResultScreen({ questions, answers, onRestart, config, studentName }) {
  // 1. Tính toán điểm số (chỉ tính cho trắc nghiệm)
  let totalChoiceQuestions = 0;
  let correctChoiceAnswers = 0;
  let wrongChoiceAnswers = 0;
  let unansweredChoiceAnswers = 0;
  let totalEssayQuestions = 0;

  questions.forEach((q, idx) => {
    const ans = answers[idx];
    const isChoice = q.type === 'single_choice' || q.type === 'multiple_choice';

    if (isChoice) {
      totalChoiceQuestions++;
      if (ans === undefined || ans === null || (Array.isArray(ans) && ans.length === 0)) {
        unansweredChoiceAnswers++;
      } else if (q.type === 'single_choice') {
        if (parseInt(ans) === q.answer) {
          correctChoiceAnswers++;
        } else {
          wrongChoiceAnswers++;
        }
      } else if (q.type === 'multiple_choice') {
        const userAnswers = Array.isArray(ans) ? ans : [];
        const correctAnswers = Array.isArray(q.answer) ? q.answer : [];
        const isCorrect = userAnswers.length === correctAnswers.length && 
                          userAnswers.every(val => correctAnswers.includes(val));
        if (isCorrect) {
          correctChoiceAnswers++;
        } else {
          wrongChoiceAnswers++;
        }
      }
    } else {
      totalEssayQuestions++;
    }
  });

  const score = totalChoiceQuestions > 0 
    ? parseFloat(((correctChoiceAnswers / totalChoiceQuestions) * 10).toFixed(2)) 
    : null;

  // 2. Hàm xuất file kết quả Báo cáo
  const handleExportReport = (format) => {
    const examReport = {
      exam_title: document.title || "Bài thi Đại số tuyến tính",
      timestamp: new Date().toLocaleString('vi-VN'),
      summary: {
        score_10: score,
        correct_choices: `${correctChoiceAnswers}/${totalChoiceQuestions}`,
        total_essays_submitted: totalEssayQuestions
      },
      student_name: studentName || "Khai báo nặc danh",
      details: questions.map((q, idx) => {
        const userAns = answers[idx];
        let status = 'Chưa làm';
        
        if (q.type === 'single_choice' || q.type === 'multiple_choice') {
          let isCorrect = false;
          if (userAns !== undefined && userAns !== null) {
            if (q.type === 'single_choice') {
              isCorrect = parseInt(userAns) === q.answer;
            } else {
              const uArr = Array.isArray(userAns) ? userAns : [];
              const cArr = Array.isArray(q.answer) ? q.answer : [];
              isCorrect = uArr.length === cArr.length && uArr.every(val => cArr.includes(val));
            }
            status = isCorrect ? 'Đúng' : 'Sai';
          }
          return {
            id: q.id,
            type: q.type,
            question: q.question,
            correct_answer: q.answer,
            user_answer: userAns ?? 'Không trả lời',
            status: status
          };
        } else {
          const textAnswer = q.type === 'essay_text' ? (userAns?.text || '') : (userAns || '');
          const hasImage = q.type === 'essay_text' && userAns?.image ? 'Có đính kèm ảnh' : 'Không có ảnh';
          return {
            id: q.id,
            type: q.type,
            question: q.question,
            user_answer_text: textAnswer,
            user_answer_image: hasImage,
            reference_answer: q.answer
          };
        }
      })
    };

    let fileContent = '';
    let fileName = `Bao_cao_bai_thi_${qFormatDate()}.`;
    
    if (format === 'json') {
      fileContent = JSON.stringify(examReport, null, 2);
      fileName += 'json';
    } else {
      fileContent = `BÁO CÁO KẾT QUẢ BÀI THI\n`;
      fileContent += `==========================\n`;
      fileContent += `Bài thi: ${examReport.exam_title}\n`;
      fileContent += `Thời gian nộp: ${examReport.timestamp}\n`;
      fileContent += `Điểm trắc nghiệm: ${score !== null ? score + '/10' : 'N/A'}\n`;
      fileContent += `Số câu trắc nghiệm đúng: ${examReport.summary.correct_choices}\n`;
      fileContent += `Số câu tự luận đã làm: ${examReport.summary.total_essays_submitted}\n\n`;
      fileContent += `CHI TIẾT BÀI LÀM:\n`;
      fileContent += `--------------------------\n`;
      
      examReport.details.forEach((d, i) => {
        fileContent += `Câu ${i + 1} [ID: ${d.id}]\n`;
        fileContent += `Đề bài: ${d.question}\n`;
        
        if (d.type.includes('choice')) {
          fileContent += `-> Trạng thái: ${d.status}\n`;
          fileContent += `-> Thí sinh chọn: ${JSON.stringify(d.user_answer)}\n`;
          fileContent += `-> Đáp án đúng: ${JSON.stringify(d.correct_answer)}\n`;
        } else {
          fileContent += `-> Lời giải của thí sinh:\n${d.user_answer_text || '(Bỏ trống)'}\n`;
          if (d.type === 'essay_text') {
            fileContent += `-> Đính kèm ảnh: ${d.user_answer_image}\n`;
          }
          fileContent += `-> Đáp án mẫu tham khảo:\n${d.reference_answer || 'Không có'}\n`;
        }
        fileContent += `--------------------------\n`;
      });
      fileName += 'txt';
    }

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 3. Hàm xuất file phần tự luận riêng (để gửi cho giảng viên chấm)
  const handleExportEssay = (format) => {
    const essayData = questions
      .map((q, idx) => ({ q, ans: answers[idx] }))
      .filter(({ q }) => q.type === 'essay_text' || q.type === 'essay_code')
      .map(({ q, ans }) => {
        let studentAnsText = '';
        let hasImage = false;

        if (q.type === 'essay_text') {
          studentAnsText = ans?.text || '(Bỏ trống)';
          hasImage = !!ans?.image;
        } else if (q.type === 'essay_code') {
          studentAnsText = typeof ans === 'string' ? ans : '(Bỏ trống)';
        }

        return {
          question_id: q.id,
          question_type: q.type === 'essay_code' ? `Code (${q.code_language || 'python'})` : 'Văn bản / Ảnh',
          question_title: q.question,
          student_answer: studentAnsText,
          has_attached_image: hasImage ? 'Có đính kèm ảnh' : 'Không',
          reference_answer: q.answer || 'Không có đáp án mẫu'
        };
      });

    if (essayData.length === 0) return;

    const payload = {
      exam_title: document.title || "Bài thi",
      student_name: studentName || "Khai báo nặc danh",
      timestamp: new Date().toLocaleString('vi-VN'),
      choice_score: score !== null ? `${score}/10` : 'N/A',
      essay_responses: essayData
    };

    let fileContent = '';
    let fileName = `Tu_luan_${(studentName || 'student').replace(/\s+/g, '_')}_${qFormatDate()}.`;

    if (format === 'json') {
      fileContent = JSON.stringify(payload, null, 2);
      fileName += 'json';
    } else {
      fileContent = `BÀI LÀM TỰ LUẬN\n`;
      fileContent += `==========================\n`;
      fileContent += `Bài thi: ${payload.exam_title}\n`;
      fileContent += `Thí sinh: ${payload.student_name}\n`;
      fileContent += `Thời gian nộp: ${payload.timestamp}\n`;
      fileContent += `Điểm trắc nghiệm: ${payload.choice_score}\n`;
      fileContent += `Tổng số câu tự luận: ${essayData.length}\n\n`;
      fileContent += `CHI TIẾT CÂU TRẢ LỜI TỰ LUẬN:\n`;
      fileContent += `--------------------------\n`;

      essayData.forEach((item, i) => {
        fileContent += `\nCâu ${i + 1} [ID: ${item.question_id}]\n`;
        fileContent += `Loại: ${item.question_type}\n`;
        fileContent += `Đề bài: ${item.question_title}\n`;
        fileContent += `\nBài làm của thí sinh:\n`;
        fileContent += `${item.student_answer}\n`;
        fileContent += `\nĐính kèm ảnh: ${item.has_attached_image}\n`;
        fileContent += `\nĐáp án mẫu tham khảo:\n${item.reference_answer}\n`;
        fileContent += `--------------------------\n`;
      });
      fileName += 'txt';
    }

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const qFormatDate = () => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <div className="content-body" style={{ paddingBottom: '5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '24pt', marginBottom: '0.5rem' }}>Kết Quả Kiểm Tra</h1>
        
        {score !== null ? (
          <div style={{ fontSize: '20pt', fontWeight: 'bold', margin: '1rem 0', color: 'var(--accent)' }}>
            Điểm trắc nghiệm: {score} / 10
          </div>
        ) : (
          <div style={{ fontSize: '14pt', fontWeight: 'bold', margin: '1rem 0', color: 'var(--success)' }}>
            Đã nộp bài tự luận thành công!
          </div>
        )}

        <div style={{ fontSize: '13pt', color: 'var(--text-secondary)' }}>
          Đúng: <strong style={{ color: 'var(--success)' }}>{correctChoiceAnswers}</strong> câu | 
          Sai: <strong style={{ color: 'var(--danger)' }}>{wrongChoiceAnswers}</strong> câu | 
          Chưa làm/Tự luận: <strong>{unansweredChoiceAnswers + totalEssayQuestions}</strong> câu
        </div>
      </div>

      {/* Xuất kết quả bài làm */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', textAlign: 'center', padding: '1.25rem' }}>
        <p style={{ fontWeight: 'bold' }}>Xuất kết quả bài làm</p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button type="button" className="btn btn-secondary" onClick={() => handleExportReport('txt')} style={{ fontSize: '12pt', padding: '0.4rem 0.8rem' }}>
            <FileText size={14} /> Tải báo cáo (.TXT)
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => handleExportReport('json')} style={{ fontSize: '12pt', padding: '0.4rem 0.8rem' }}>
            <Download size={14} /> Tải data (.JSON)
          </button>
        </div>

        {/* Nút tải riêng phần tự luận (chỉ hiển thị nếu có câu tự luận) */}
        {totalEssayQuestions > 0 && (
          <>
            <p style={{ fontWeight: 'bold', marginTop: '0.5rem', fontSize: '12pt', color: 'var(--text-secondary)' }}>Tải riêng phần tự luận (gửi cho giảng viên chấm bài):</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button type="button" className="btn btn-primary" onClick={() => handleExportEssay('txt')} style={{ fontSize: '12pt', padding: '0.4rem 0.8rem' }}>
                <FileText size={14} /> Tải tự luận (.TXT)
              </button>
              <button type="button" className="btn btn-primary" onClick={() => handleExportEssay('json')} style={{ fontSize: '12pt', padding: '0.4rem 0.8rem' }}>
                <Download size={14} /> Tải tự luận (.JSON)
              </button>
            </div>
          </>
        )}
      </div>

      {/* YÊU CẦU 5: Hiện lại danh sách tất cả câu hỏi và đáp án tương ứng.
         Các câu đúng có màu xanh lá, câu sai có màu đỏ. */}
      <h2 style={{ fontSize: '16pt', marginBottom: '1.25rem', marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        Chi tiết bài làm và đáp án
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {questions.map((q, idx) => {
          const userAns = answers[idx];
          const isChoice = q.type === 'single_choice' || q.type === 'multiple_choice';
          let isCorrect = false;
          let isUnanswered = userAns === undefined || userAns === null || (Array.isArray(userAns) && userAns.length === 0);

          if (isChoice && !isUnanswered) {
            if (q.type === 'single_choice') {
              isCorrect = parseInt(userAns) === q.answer;
            } else if (q.type === 'multiple_choice') {
              const uArr = Array.isArray(userAns) ? userAns : [];
              const cArr = Array.isArray(q.answer) ? q.answer : [];
              isCorrect = uArr.length === cArr.length && uArr.every(val => cArr.includes(val));
            }
          }

          let itemClass = 'review-question-item';
          if (!isChoice) itemClass += ' unanswered'; // tự luận
          else if (isUnanswered) itemClass += ' unanswered';
          else if (isCorrect) itemClass += ' correct'; // câu đúng màu xanh lá
          else itemClass += ' wrong'; // câu sai màu đỏ

          return (
            <details key={idx} className={itemClass} style={{ cursor: 'pointer' }}>
              {/* Tiêu đề câu hỏi */}
              <summary className="review-summary" style={{ fontWeight: 'bold', fontSize: '14pt', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', listStyle: 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Câu {idx + 1}</span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {isChoice ? (
                    isUnanswered ? (
                      <span style={{ color: 'var(--text-muted)' }}>Chưa làm</span>
                    ) : isCorrect ? (
                      <span style={{ color: 'var(--success)' }}>Đúng</span>
                    ) : (
                      <span style={{ color: 'var(--danger)' }}>Sai</span>
                    )
                  ) : (
                    <span style={{ color: 'var(--accent)' }}>Tự luận</span>
                  )}
                  <ChevronDown size={20} className="summary-chevron" />
                </div>
              </summary>
              <div style={{ marginTop: '1rem', cursor: 'default' }}>

              {/* Nội dung câu hỏi */}
              <div 
                className="question-text"
                style={{ marginBottom: '1rem' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(q.question) }}
              />

              {/* Ảnh minh họa câu hỏi nếu có */}
              {q.images && q.images.length > 0 && (
                <div className="illustration-images" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {q.images.map((img, i) => (
                    <img key={i} src={img} alt="Minh họa" style={{ maxWidth: '100%', borderRadius: 'var(--radius-sm)' }} />
                  ))}
                </div>
              )}

              {/* Đáp án lựa chọn trắc nghiệm */}
              {isChoice ? (
                <div className="options-list" style={{ pointerEvents: 'none' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelectedByCandidate = q.type === 'single_choice'
                      ? parseInt(userAns) === optIdx
                      : (Array.isArray(userAns) && userAns.includes(optIdx));
                    
                    const isCorrectOption = q.type === 'single_choice'
                      ? q.answer === optIdx
                      : (Array.isArray(q.answer) && q.answer.includes(optIdx));

                    let optClass = 'option-item result-option';
                    if (isCorrectOption) optClass += ' correct-choice'; // Viền xanh lá
                    else if (isSelectedByCandidate && !isCorrectOption) optClass += ' wrong-choice'; // Viền đỏ

                    return (
                      <div key={optIdx} className={optClass}>
                        <div className="option-indicator" />
                        <div className="option-content">
                          {opt.image ? <img src={opt.image} alt="Đáp án" /> : <div dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(opt.text) }} />}
                        </div>
                        {isCorrectOption && (
                          <span className="result-badge correct">Đáp án đúng</span>
                        )}
                        {isSelectedByCandidate && !isCorrectOption && (
                          <span className="result-badge wrong">Bạn chọn</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Hiển thị phần trả lời tự luận
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '13pt', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Bài làm của bạn:</p>
                  {q.type === 'essay_text' ? (
                    <>
                      <div 
                        style={{ whiteSpace: 'pre-wrap' }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(userAns?.text || '*(Bỏ trống)*') }}
                      />
                      {userAns?.image && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <img 
                            src={userAns.image} 
                            alt="Ảnh bài làm" 
                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <pre style={{ fontFamily: 'monospace', fontSize: '12pt', color: 'var(--text-primary)', background: 'var(--bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', overflowX: 'auto', whiteSpace: 'pre' }}>
                      {userAns || '// (Bỏ trống)'}
                    </pre>
                  )}

                  {/* Đáp án mẫu tham khảo */}
                  {q.answer && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '13pt', color: 'var(--accent)', marginBottom: '0.5rem' }}>Đáp án mẫu tham khảo:</p>
                      {q.type === 'essay_text' ? (
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(q.answer) }} />
                      ) : (
                        <pre style={{ fontFamily: 'monospace', fontSize: '12pt', color: 'var(--text-primary)', background: 'var(--bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', overflowX: 'auto' }}>
                          {q.answer}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Giải thích chi tiết */}
              {q.explanation && (
                <div className="explanation-box">
                  <div className="explanation-title">Giải thích chi tiết:</div>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(q.explanation) }} />
                </div>
              )}
              </div>
            </details>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button type="button" className="btn btn-primary" style={{ padding: '0.6rem 2rem' }} onClick={onRestart}>
          Làm bài thi mới
        </button>
      </div>
    </div>
  );
}
