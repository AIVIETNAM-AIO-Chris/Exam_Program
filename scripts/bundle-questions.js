import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const questionsDir = path.join(rootDir, 'questions');
const examplesDir = path.join(rootDir, 'examples');
const imagesDir = path.join(rootDir, 'images');
const publicDir = path.join(rootDir, 'public');
const publicImagesDir = path.join(publicDir, 'images');
const outputDir = path.join(rootDir, 'src', 'data');
const outputFile = path.join(outputDir, 'questions_bundle.json');

console.log('--- BẮT ĐẦU GỘP CÂU HỎI VÀ ĐỒNG BỘ NGUYÊN LIỆU ---');

try {
  // 1. Đồng bộ thư mục images/ -> public/images/ để Vite copy vào dist/ khi build
  if (fs.existsSync(imagesDir)) {
    if (!fs.existsSync(publicImagesDir)) {
      fs.mkdirSync(publicImagesDir, { recursive: true });
    }
    fs.cpSync(imagesDir, publicImagesDir, { recursive: true });
    console.log('✅ Đã đồng bộ thư mục images/ vào public/images/');
  }

  // 2. Đảm bảo thư mục đầu ra src/data/ tồn tại
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let questions = [];

  // 3. Đọc thư mục questions/
  if (fs.existsSync(questionsDir)) {
    const files = fs.readdirSync(questionsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json') && file !== 'package.json');

    console.log(`Tìm thấy ${jsonFiles.length} file JSON câu hỏi.`);

    for (const file of jsonFiles) {
      const filePath = path.join(questionsDir, file);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const questionData = JSON.parse(fileContent);
        const items = Array.isArray(questionData) ? questionData : [questionData];

        for (const item of items) {
          // Bỏ qua câu hỏi thiếu các trường bắt buộc (id, type, question)
          if (!item.id || !item.type || !item.question) {
            console.warn(`⚠️ Bỏ qua câu hỏi trong ${file}: thiếu trường bắt buộc (id, type, hoặc question).`);
            continue;
          }
          questions.push(item);
        }
      } catch (err) {
        console.error(`❌ Lỗi khi đọc hoặc parse file ${file}:`, err.message);
      }
    }
  }

  // 4. Dự phòng nếu chưa có câu hỏi
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
    }
  }

  // 5. Ghi file bundle
  fs.writeFileSync(outputFile, JSON.stringify(questions, null, 2), 'utf-8');
  console.log(`✅ Đã gộp thành công ${questions.length} câu hỏi vào: src/data/questions_bundle.json`);

} catch (error) {
  console.error('❌ Có lỗi xảy ra trong quá trình gộp câu hỏi:', error.message);
  process.exit(1);
}
