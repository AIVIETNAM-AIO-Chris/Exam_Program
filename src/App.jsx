import React, { useState, useEffect, useRef } from 'react';
import questionsData from './data/questions_bundle.json';
import configData from '../exam_config.json';
import Sidebar from './components/Sidebar';
import QuestionCard from './components/QuestionCard';
import AnswerInput from './components/AnswerInput';
import ResultScreen from './components/ResultScreen';
import { ChevronLeft, ChevronRight, Play, Flag, Trash2 } from 'lucide-react';

const config = configData || {
  exam_title: "Kiểm tra Đại số tuyến tính",
  timer_minutes: 60,
  shuffle_questions: true,
  shuffle_options: true,
  show_result_after_submit: true
};

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function cleanOptionText(text) {
  if (!text) return '';
  return text.replace(/^[A-Z][\.\:\)]\s*/, '');
}

function prepareQuestionsData(rawQuestions, config) {
  let questions = rawQuestions.map(q => {
    if ((q.type === 'single_choice' || q.type === 'multiple_choice') && q.options) {
      return {
        ...q,
        options: q.options.map(opt => ({
          ...opt,
          text: cleanOptionText(opt.text)
        }))
      };
    }
    return q;
  });

  if (config.shuffle_questions) {
    questions = shuffleArray(questions);
  }

  if (config.shuffle_options) {
    questions = questions.map(q => {
      if ((q.type === 'single_choice' || q.type === 'multiple_choice') && q.options) {
        const mappedOptions = q.options.map((opt, originalIdx) => ({
          ...opt,
          originalIdx
        }));
        const shuffledOptions = shuffleArray(mappedOptions);
        
        let newAnswer;
        if (q.type === 'single_choice') {
          newAnswer = shuffledOptions.findIndex(opt => opt.originalIdx === q.answer);
        } else if (q.type === 'multiple_choice') {
          const originalAnswers = Array.isArray(q.answer) ? q.answer : [];
          newAnswer = shuffledOptions
            .map((opt, shuffledIdx) => originalAnswers.includes(opt.originalIdx) ? shuffledIdx : -1)
            .filter(idx => idx !== -1)
            .sort((a, b) => a - b);
        }

        return {
          ...q,
          options: shuffledOptions,
          answer: newAnswer
        };
      }
      return q;
    });
  }

  return questions;
}

function checkIsAnswered(q, ans) {
  if (!q || ans === undefined || ans === null) return false;
  if (q.type === 'single_choice') {
    return typeof ans === 'number';
  }
  if (q.type === 'multiple_choice') {
    return Array.isArray(ans) && ans.length > 0;
  }
  if (q.type === 'essay_text') {
    return Boolean((ans.text && ans.text.trim() !== '') || ans.image);
  }
  if (q.type === 'essay_code') {
    return typeof ans === 'string' && ans.trim() !== '' && ans.trim() !== q.starter_code?.trim();
  }
  return false;
}

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [timeLeft, setTimeLeft] = useState(config.timer_minutes * 60);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [studentName, setStudentName] = useState('');

  const timerRef = useRef(null);

  useEffect(() => {
    const preparedQuestions = prepareQuestionsData(questionsData, config);
    setQuestions(preparedQuestions);
    document.documentElement.setAttribute('data-theme', 'light'); // Mặc định dùng light theme (vàng ấm)
  }, []);

  useEffect(() => {
    if (examStarted && !examSubmitted) {
      const storedStartTime = sessionStorage.getItem('exam_start_time');
      const durationSeconds = config.timer_minutes * 60;
      
      let initialTimeLeft = durationSeconds;

      if (storedStartTime) {
        const elapsedSeconds = Math.floor((Date.now() - parseInt(storedStartTime)) / 1000);
        initialTimeLeft = durationSeconds - elapsedSeconds;
        
        if (initialTimeLeft <= 0) {
          handleAutoSubmit();
          return;
        }
      } else {
        sessionStorage.setItem('exam_start_time', Date.now().toString());
      }

      setTimeLeft(initialTimeLeft);

      const storedAnswers = sessionStorage.getItem('exam_saved_answers');
      if (storedAnswers) {
        try {
          setAnswers(JSON.parse(storedAnswers));
        } catch (e) {
          console.error("Lỗi phục hồi đáp án", e);
        }
      }

      const storedFlags = sessionStorage.getItem('exam_saved_flags');
      if (storedFlags) {
        try {
          setFlaggedQuestions(JSON.parse(storedFlags));
        } catch (e) {
          console.error("Lỗi phục hồi cờ đánh dấu", e);
        }
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, examSubmitted]);

  const handleAnswerChange = (value) => {
    const newAnswers = { ...answers, [currentIdx]: value };
    setAnswers(newAnswers);
    sessionStorage.setItem('exam_saved_answers', JSON.stringify(newAnswers));
  };

  const handleClearAnswer = (idx) => {
    const newAnswers = { ...answers };
    delete newAnswers[idx];
    setAnswers(newAnswers);
    sessionStorage.setItem('exam_saved_answers', JSON.stringify(newAnswers));
  };

  const toggleFlag = (idx) => {
    const updatedFlags = {
      ...flaggedQuestions,
      [idx]: !flaggedQuestions[idx]
    };
    setFlaggedQuestions(updatedFlags);
    sessionStorage.setItem('exam_saved_flags', JSON.stringify(updatedFlags));
  };

  const startExam = () => {
    setAnswers({});
    setFlaggedQuestions({});
    setCurrentIdx(0);
    sessionStorage.removeItem('exam_saved_answers');
    sessionStorage.removeItem('exam_saved_flags');
    setExamStarted(true);
    sessionStorage.setItem('exam_start_time', Date.now().toString());
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleAutoSubmit = () => {
    alert('⏳ Đã hết thời gian làm bài! Hệ thống tự động nộp bài.');
    submitExam(true);
  };

  const submitExam = (force = false) => {
    if (force || window.confirm('Bạn có chắc chắn muốn nộp bài thi?')) {
      if (timerRef.current) clearInterval(timerRef.current);
      setExamSubmitted(true);
      sessionStorage.removeItem('exam_start_time');
      sessionStorage.removeItem('exam_saved_answers');
      sessionStorage.removeItem('exam_saved_flags');
    }
  };

  const restartExam = () => {
    if (window.confirm('Bạn muốn làm lại bài thi từ đầu?')) {
      setAnswers({});
      setFlaggedQuestions({});
      setCurrentIdx(0);
      setTimeLeft(config.timer_minutes * 60);
      setExamSubmitted(false);
      setExamStarted(false);
      sessionStorage.clear();
      
      const preparedQuestions = prepareQuestionsData(questionsData, config);
      setQuestions(preparedQuestions);
    }
  };

  // --- RENDER 1: MÀN HÌNH CHỜ (START SCREEN) ---
  if (!examStarted) {
    return (
      <div className="content-body" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="start-screen">
          <span style={{ fontSize: '3rem' }}>📝</span>
          <h1 className="start-title" style={{ fontSize: '28pt', margin: '1rem 0' }}>{config.exam_title}</h1>
          
          <div className="start-instructions">
            <h3 style={{ fontSize: '16pt', marginBottom: '0.75rem' }}>Thông tin bài thi:</h3>
            <ul style={{ paddingLeft: '1rem', fontSize: '14pt', lineHeight: 1.6 }}>
              <li>Tổng số câu hỏi: <strong>{questions.length} câu</strong></li>
              <li>Thời gian làm bài: <strong>{config.timer_minutes} phút</strong></li>
              <li>Loại câu hỏi bao gồm: Trắc nghiệm & Tự luận</li>
              <li>Tự động lưu bài làm và đếm tiếp thời gian khi reload trang.</li>
            </ul>
          </div>

          {config.require_student_info && (
            <div className="start-instructions" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '16pt', marginBottom: '0.75rem' }}>Thông tin thí sinh:</h3>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13pt', display: 'block', marginBottom: '0.25rem' }}>Họ và tên:</label>
                <input 
                  type="text" 
                  value={studentName} 
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Nhập họ và tên của bạn"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'var(--font-sans)', fontSize: '13pt' }}
                />
              </div>
            </div>
          )}

          <button 
            type="button" 
            className="btn btn-primary" 
            style={{ padding: '0.8rem 2.5rem', borderRadius: 'var(--radius-md)' }}
            onClick={startExam}
            disabled={config.require_student_info && !studentName.trim()}
          >
            <Play size={18} /> Bắt đầu làm bài
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER 2: MÀN HÌNH BÁO CÁO KẾT QUẢ (RESULTS SCREEN) ---
  if (examSubmitted) {
    return (
      <div className="app-container">
        <main className="main-content" style={{ width: '100%' }}>
          <ResultScreen 
            questions={questions}
            answers={answers}
            onRestart={restartExam}
            config={config}
            studentName={studentName}
          />
        </main>
      </div>
    );
  }

  // --- RENDER 3: MÀN HÌNH LÀM BÀI (EXAM SCREEN) ---
  const currentQuestion = questions[currentIdx];
  const isFlagged = !!flaggedQuestions[currentIdx];
  const isAnswered = checkIsAnswered(currentQuestion, answers[currentIdx]);

  return (
    <div className="app-container">
      {/* Sidebar bên trái */}
      <Sidebar 
        questions={questions}
        currentIdx={currentIdx}
        answers={answers}
        flaggedQuestions={flaggedQuestions}
        timeLeft={timeLeft}
        totalTime={config.timer_minutes * 60}
        onQuestionSelect={setCurrentIdx}
        onSubmit={() => submitExam(false)}
      />

      {/* Vùng nội dung làm bài thi */}
      <main className="main-content">
        <div className="header">
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '14pt' }}>
              Câu hỏi {currentIdx + 1} / {questions.length}
            </span>
          </div>

          <button
            type="button"
            className={`btn btn-flag ${isFlagged ? 'flagged' : ''}`}
            onClick={() => toggleFlag(currentIdx)}
            title={isFlagged ? 'Bỏ gắn cờ câu hỏi này' : 'Gắn cờ câu hỏi này để xem lại sau'}
          >
            <Flag 
              size={16} 
              fill={isFlagged ? 'var(--danger)' : 'none'} 
              color={isFlagged ? 'var(--danger)' : 'currentColor'} 
            />
            <span>{isFlagged ? 'Đã gắn cờ' : 'Gắn cờ'}</span>
          </button>
        </div>

        <div className="content-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            {/* Card hiển thị câu hỏi */}
            <QuestionCard 
              question={currentQuestion}
              questionNumber={currentIdx + 1}
            />

            {/* Vùng nhập đáp án/trả lời */}
            <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <p style={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: '13pt', margin: 0 }}>Bài làm của bạn:</p>
                {isAnswered && (
                  <button
                    type="button"
                    className="btn btn-clear-answer"
                    onClick={() => handleClearAnswer(currentIdx)}
                    title="Xoá đáp án đã chọn cho câu này"
                  >
                    <Trash2 size={14} /> Xoá đáp án
                  </button>
                )}
              </div>
              <AnswerInput 
                question={currentQuestion}
                value={answers[currentIdx]}
                onChange={handleAnswerChange}
              />
            </div>
          </div>

          {/* Thanh điều hướng */}
          <div className="nav-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={prevQuestion}
              disabled={currentIdx === 0}
              style={{ opacity: currentIdx === 0 ? 0.4 : 1, cursor: currentIdx === 0 ? 'not-allowed' : 'pointer' }}
            >
              Quay lại
            </button>
            
            {currentIdx < questions.length - 1 ? (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={nextQuestion}
              >
                Tiếp theo
              </button>
            ) : (
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={() => submitExam(false)}
              >
                Nộp bài
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
