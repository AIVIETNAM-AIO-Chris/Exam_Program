import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const questionsDir = path.join(rootDir, 'questions');
const examplesDir = path.join(rootDir, 'examples');
const outputDir = path.join(rootDir, 'src', 'data');
const outputFile = path.join(outputDir, 'questions_bundle.json');

console.log('--- BẮT ĐẦU GỘP CÂU HỎI (BUNDLING QUESTIONS) ---');

try {
  // Đảm bảo thư mục đầu ra tồn tại
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let questions = [];

  // Đọc thư mục questions/
  if (fs.existsSync(questionsDir)) {
    const files = fs.readdirSync(questionsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json') && file !== 'package.json');

    console.log(`Tìm thấy ${jsonFiles.length} file JSON câu hỏi.`);

    for (const file of jsonFiles) {
      const filePath = path.join(questionsDir, file);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const questionData = JSON.parse(fileContent);
        // Nếu là mảng câu hỏi
        if (Array.isArray(questionData)) {
          questions.push(...questionData);
        } else {
          // Nếu là một câu hỏi đơn lẻ
          questions.push(questionData);
        }
      } catch (err) {
        console.error(`❌ Lỗi khi đọc hoặc parse file ${file}:`, err.message);
      }
    }
  }

  // Nếu không tìm thấy câu hỏi nào trong thư mục questions/, nạp câu hỏi từ example_question.json để làm demo
  if (questions.length === 0) {
    console.log('⚠️ Không tìm thấy câu hỏi nào trong thư mục questions/. Đang nạp từ examples/example_question.json...');
    const examplePath = path.join(examplesDir, 'example_question.json');
    if (fs.existsSync(examplePath)) {
      try {
        const exampleContent = fs.readFileSync(examplePath, 'utf-8');
        const exampleData = JSON.parse(exampleContent);
        if (Array.isArray(exampleData)) {
          questions.push(...exampleData);
        } else {
          questions.push(exampleData);
        }
        console.log(`Đã nạp thành công ${questions.length} câu hỏi mẫu để demo.`);
      } catch (err) {
        console.error('❌ Lỗi khi đọc file câu hỏi mẫu:', err.message);
      }
    } else {
      console.warn('⚠️ File examples/example_question.json không tồn tại.');
    }
  }

  // Ghi mảng câu hỏi gộp ra file bundle
  fs.writeFileSync(outputFile, JSON.stringify(questions, null, 2), 'utf-8');
  console.log(`✅ Đã gộp thành công ${questions.length} câu hỏi vào: src/data/questions_bundle.json`);

} catch (error) {
  console.error('❌ Có lỗi xảy ra trong quá trình gộp câu hỏi:', error.message);
  process.exit(1);
}
