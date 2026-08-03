import * as XLSX from 'xlsx';

/**
 * Tự động xuất file Excel (.xlsx) chứa danh sách câu hỏi tự luận, bài làm và đáp án/gợi ý.
 * Cột A: Câu hỏi
 * Cột B: Phần trả lời
 * Cột C: Đáp án hoặc gợi ý (nếu không có đáp án)
 */
export function exportEssayToExcel(questions, answers, studentName = 'student') {
  const essayQuestions = questions
    .map((q, idx) => ({ q, ans: answers[idx] }))
    .filter(({ q }) => q.type === 'essay_text' || q.type === 'essay_code');

  if (essayQuestions.length === 0) return false;

  const data = [
    ["Câu hỏi", "Phần trả lời", "Đáp án / Gợi ý"]
  ];

  essayQuestions.forEach(({ q, ans }) => {
    let studentAnsText = '';

    if (q.type === 'essay_text') {
      const textPart = ans?.text || '';
      const imagePart = ans?.image ? '[Có đính kèm ảnh bài làm]' : '';
      studentAnsText = [textPart, imagePart].filter(Boolean).join('\n') || '(Bỏ trống)';
    } else if (q.type === 'essay_code') {
      studentAnsText = typeof ans === 'string' && ans.trim() !== '' ? ans : '(Bỏ trống)';
    } else {
      studentAnsText = '(Bỏ trống)';
    }

    // Ưu tiên lấy q.answer, nếu không có thì lấy q.explanation (gợi ý), nếu không có cả 2 thì dùng thông báo mặc định
    const answerOrHint = q.answer || q.explanation || 'Không có đáp án/gợi ý';

    // Loại bỏ thẻ HTML thừa nếu có trong nội dung câu hỏi
    const cleanQuestion = q.question ? q.question.replace(/<[^>]*>/g, '') : '';

    data.push([
      cleanQuestion,
      studentAnsText,
      answerOrHint
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Đặt độ rộng cho các cột Excel
  worksheet['!cols'] = [
    { wch: 45 }, // Cột A: Câu hỏi
    { wch: 55 }, // Cột B: Phần trả lời
    { wch: 45 }  // Cột C: Đáp án / Gợi ý
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tu_Luan");

  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
  const safeName = (studentName || 'student').replace(/\s+/g, '_');
  const fileName = `Tu_Luan_${safeName}_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, fileName);
  return true;
}
