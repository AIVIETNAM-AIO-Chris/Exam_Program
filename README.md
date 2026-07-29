# 📝 Hệ Thống Làm Bài Thi & Soạn Đề (Exam Program)

Ứng dụng web Single Page Application (SPA) xây dựng bằng **React + Vite**, hỗ trợ hiển thị công thức toán học LaTeX, trình soạn thảo mã nguồn có tô màu cú pháp, đếm ngược thời gian làm bài và nộp kết quả trực tuyến qua Webhook / Google Sheets.

---

## 🚀 1. Các Tính Năng Nổi Bật

- **Đa dạng dạng câu hỏi**:
  - `single_choice`: Trắc nghiệm chọn 1 đáp án.
  - `multiple_choice`: Trắc nghiệm chọn nhiều đáp án.
  - `essay_text`: Tự luận nhập văn bản (hỗ trợ Markdown & đính kèm ảnh lời giải).
  - `essay_code`: Tự luận viết code có **Syntax Highlighting** (`react-simple-code-editor` + `PrismJS` cho Python, JavaScript, C, C++, Java).
- **Trải nghiệm người dùng**:
  - Giao diện phong cách giấy cổ (Vintage Sepia) nhỏ gọn, dễ nhìn.
  - Sidebar danh sách câu hỏi thu gọn linh hoạt, đổi màu xanh lá khi câu hỏi đã được trả lời.
  - Tự động đếm ngược thời gian làm bài (60 phút) và tự động nộp bài khi hết giờ.
  - Lưu tạm trạng thái bài làm và thời gian đếm ngược vào `sessionStorage` (chống mất bài khi F5 reload trang).
- **Trực quan hoá toán học & Markdown**:
  - Công thức LaTeX dạng `$inline$` và `$$block$$` được render siêu tốc bằng **KaTeX** (loại bỏ MathML trùng lặp).
  - Markdown chuẩn GFM render bằng **Marked**.
- **Màn hình báo cáo kết quả**:
  - Tự động chấm điểm phần trắc nghiệm theo thang điểm 10.
  - Danh sách xem lại bài làm ở dạng **Toggle/Accordion** (mặc định đóng, mở rộng với icon mũi tên xoay).
  - Đánh dấu màu xanh lá cho câu đúng, màu đỏ cho câu sai.
- **Giải pháp chấm bài tự luận tĩnh (GitHub Pages Support)**:
  - Cho phép thí sinh gửi trực tiếp bài làm về Google Sheets của Ban tổ chức qua Webhook (Google Apps Script).
  - Hỗ trợ xuất file báo cáo kết quả dạng `.TXT` hoặc file dữ liệu `.JSON` để gửi thủ công cho giảng viên.

---

## 📁 2. Cấu Trúc Thư Mục Dự Án

```text
Exam_Program/
│
├── questions/                    # Thư mục chứa các file JSON câu hỏi đơn lẻ
│   ├── q001.json                 # Mỗi file là một câu hỏi (tên file = id câu hỏi)
│   ├── q002.json
│   └── ...
│
├── images/                       # Thư mục lưu trữ hình ảnh tĩnh minh họa
│
├── scripts/                      # Các script tiện ích của dự án
│   ├── bundle-questions.js       # Auto script gộp tất cả json trong questions/ thành 1 file bundle
│   └── google_apps_script.js     # Script mẫu Google Apps Script để nhận bài làm về Google Sheets
│
├── src/                          # Mã nguồn Frontend (React + Vite)
│   ├── components/               # Các React Component:
│   │   ├── AnswerInput.jsx       # Nhập đáp án (Trắc nghiệm, Text, Code Editor)
│   │   ├── QuestionCard.jsx      # Hiển thị thẻ câu hỏi
│   │   ├── ResultScreen.jsx      # Màn hình kết quả, toggle accordion & xuất báo cáo
│   │   └── Sidebar.jsx           # Sidebar điều hướng ô vuông câu hỏi & đồng hồ
│   ├── data/
│   │   └── questions_bundle.json # File JSON gộp tự động (sinh ra bởi bundle script)
│   ├── utils/
│   │   └── katex-renderer.js     # Bộ biên dịch Markdown + KaTeX LaTeX
│   ├── App.jsx                   # Quản lý luồng chính (Start -> Exam -> Result)
│   ├── index.css                 # Design system tone màu vàng cổ (Vintage Paper)
│   └── main.jsx
│
├── exam_config.json              # File cấu hình chung cho bài thi
├── package.json
└── README.md
```

---

## ⚙️ 3. Cấu Hình Bài Thi (`exam_config.json`)

File `exam_config.json` ở thư mục gốc dùng để điều chỉnh các thiết lập của bài thi mà không cần sửa code:

```json
{
    "exam_title": "Kiểm tra Đại số tuyến tính",
    "timer_minutes": 60,
    "shuffle_questions": true,
    "shuffle_options": true,
    "show_result_after_submit": true,
    "essay_submit_url": "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
    "require_student_info": true
}
```

* **`timer_minutes`**: Thời gian làm bài tính bằng phút (mặc định 60).
* **`shuffle_questions` / `shuffle_options`**: Bật/tắt trộn ngẫu nhiên thứ tự câu hỏi và thứ tự các lựa chọn trắc nghiệm.
* **`require_student_info`**: Yêu cầu thí sinh nhập **Họ và tên** ở màn hình chờ trước khi bắt đầu làm bài.
* **`essay_submit_url`**: Webhook URL (Google Apps Script Web App) để tự động nhận bài làm trực tuyến. Nếu để trống `""`, nút nộp bài trực tuyến sẽ tự ẩn.

---

## 📊 4. Định Dạng File Câu Hỏi (`questions/*.json`)

Mỗi câu hỏi được lưu độc lập thành một file JSON trong thư mục `questions/`.

### 📑 Bảng Schema Chi Tiết:

| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `String` | **Có** | ID duy nhất của câu hỏi (trùng với tên file, ví dụ: `"q001"`) |
| `type` | `String` | **Có** | Một trong 4 loại: `"single_choice"`, `"multiple_choice"`, `"essay_text"`, `"essay_code"` |
| `difficulty` | `String` | **Có** | Độ khó: `"Easy"`, `"Medium"`, `"Hard"` |
| `author` | `String` | **Có** | Tên người soạn đề (dùng để quản lý dải ID) |
| `question` | `String` | **Có** | Nội dung câu hỏi (hỗ trợ Markdown & LaTeX) |
| `images` | `Array<String>` | Không | Danh sách đường dẫn ảnh minh họa (ví dụ: `["images/q001.png"]`) |
| `options` | `Array<Object>` | *Trắc nghiệm* | Mỗi phần tử có dạng `{ "text": "$$-2$$" }` hoặc `{ "image": "images/opt_a.png" }` |
| `answer` | *Nhiều kiểu* | **Có** | Index đúng (`0`), mảng index (`[0, 2]`), hoặc đáp án mẫu tự luận |
| `explanation` | `String` | Không | Lời giải chi tiết (hỗ trợ Markdown & LaTeX) |
| `tags` | `Array<String>` | Không | Thẻ chủ đề (ví dụ: `["Matrix", "Determinant"]`) |
| `allow_image_upload` | `Boolean` | Không | Cho phép thí sinh tải ảnh chụp lời giải (chỉ dùng với `essay_text`) |
| `code_language` | `String` | *essay_code* | Ngôn ngữ lập trình (`"python"`, `"javascript"`, `"cpp"`, `"java"`, `"c"`) |
| `starter_code` | `String` | Không | Mã nguồn mẫu ban đầu cung cấp sẵn cho thí sinh (`essay_code`) |

---

## 📝 5. Ví Dụ Cấu Trúc JSON Cho 4 Loại Câu Hỏi

### 5.1 Trắc nghiệm chọn một đáp án (`single_choice`)
```json
{
  "id": "q001",
  "type": "single_choice",
  "difficulty": "Easy",
  "author": "huy",
  "question": "Cho ma trận $A = \\begin{bmatrix} 1 & 3 \\\\ 2 & 4 \\end{bmatrix}$. Tính định thức $\\det(A)$.",
  "images": [],
  "options": [
    { "text": "$$-2$$" },
    { "text": "$$2$$" },
    { "text": "$$-10$$" },
    { "text": "$$10$$" }
  ],
  "answer": 0,
  "explanation": "$$\\det(A) = 1 \\times 4 - 3 \\times 2 = 4 - 6 = -2$$",
  "tags": ["Linear Algebra", "Matrix", "Determinant"]
}
```

### 5.2 Trắc nghiệm chọn nhiều đáp án (`multiple_choice`)
```json
{
  "id": "q002",
  "type": "multiple_choice",
  "difficulty": "Medium",
  "author": "nam",
  "question": "Chọn tất cả các ma trận khả nghịch bên dưới:",
  "options": [
    { "text": "$$\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$$" },
    { "text": "$$\\begin{bmatrix} 0 & 0 \\\\ 0 & 0 \\end{bmatrix}$$" },
    { "text": "$$\\begin{bmatrix} 2 & 4 \\\\ 1 & 2 \\end{bmatrix}$$" }
  ],
  "answer": [0],
  "explanation": "Ma trận đơn vị I có det(I) = 1 khác 0 nên khả nghịch.",
  "tags": ["Matrix", "Inverse"]
}
```

### 5.3 Tự luận văn bản & Nhập ảnh (`essay_text`)
```json
{
  "id": "q003",
  "type": "essay_text",
  "difficulty": "Hard",
  "author": "linh",
  "question": "Hãy giải thích ý nghĩa của phép biến đổi Gauss-Jordan.",
  "allow_image_upload": true,
  "answer": "Phép biến đổi Gauss-Jordan dùng để đưa ma trận về dạng hàng bậc thang thu gọn...",
  "explanation": "Xem tài liệu chương 2.",
  "tags": ["Linear Algebra"]
}
```

### 5.4 Tự luận viết code (`essay_code`)
```json
{
  "id": "q004",
  "type": "essay_code",
  "difficulty": "Medium",
  "author": "phuong",
  "question": "Viết hàm Python tính ma trận chuyển vị.",
  "code_language": "python",
  "starter_code": "def transpose(matrix: list[list[int]]) -> list[list[int]]:\n    # Viết code của bạn ở đây\n    pass",
  "answer": "def transpose(matrix):\n    return [list(row) for row in zip(*matrix)]",
  "explanation": "Sử dụng hàm zip(*matrix).",
  "tags": ["Programming", "Python"]
}
```

---

## 📬 6. Hướng Dẫn Tích Hợp Google Apps Script Chấm Bài Tự Luận

Vì dự án chạy tĩnh trên **GitHub Pages**, bạn có thể tạo một Webhook nhận bài hoàn toàn miễn phí bằng Google Sheets:

1. Mở một **Google Sheets** mới trên Google Drive.
2. Mở menu **Extensions (Mở rộng)** -> **Apps Script**.
3. Sao chép toàn bộ mã nguồn trong file `scripts/google_apps_script.js` và dán vào Apps Script Editor.
4. Nhấp nút **Deploy (Triển khai)** -> **New deployment (Triển khai mới)**:
   - Loại: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** *(Bắt buộc chọn Anyone)*
5. Sao chép đường dẫn **Web App URL** thu được và dán vào trường `"essay_submit_url"` trong file `exam_config.json`.
6. Tất cả bài nộp (thông tin thí sinh, câu trả lời tự luận văn bản/code, điểm trắc nghiệm) sẽ tự động ghi vào từng hàng của Google Sheet để giảng viên chấm thủ công.

---

## 🛠️ 7. Hướng Dẫn Chạy & Đóng Góp Mã Nguồn

### Yêu cầu môi trường:
- **Node.js** `>= 18.x`
- **npm** `>= 9.x`

### Cài đặt & Chạy chạy cục bộ (Development):
```bash
# 1. Cài đặt các phụ thuộc
npm install

# 2. Chạy môi trường phát triển (Tự động gộp câu hỏi từ questions/ -> src/data/questions_bundle.json)
npm run dev
```

### Đóng gói sản phẩm (Production Build):
```bash
npm run build
```
Thư mục sau khi build nằm tại `dist/`, sẵn sàng để deploy lên GitHub Pages, Vercel hoặc Netlify.

---

## 👨‍💻 8. Quy Trình Phân Chia Dải ID Khi Soạn Đề (Git Workflow)

Để tránh trùng lặp file và xung đột Git khi nhiều thành viên cùng đóng góp câu hỏi:

- **Thành viên A (Huy):** Từ `q001` đến `q100`
- **Thành viên B (Nam):** Từ `q101` đến `q200`
- **Thành viên C (Linh):** Từ `q201` đến `q300`
- **Thành viên D (Phương):** Từ `q301` đến `q400`

### Các bước đóng góp:
1. Tạo branch mới từ `main` (`git checkout -b feat/add-questions-nam`).
2. Thêm file JSON vào thư mục `questions/` theo đúng dải ID được cấp.
3. Chạy `npm run dev` để kiểm tra trực quan câu hỏi trên trình duyệt.
4. Commit và tạo Pull Request (PR) về nhánh `main`.
�nh viên A (Huy):** Từ `q001` đến `q100`
* **Thành viên B (Nam):** Từ `q101` đến `q200`
* **Thành viên C (Linh):** Từ `q201` đến `q300`
* **Thành viên D (Phương):** Từ `q301` đến `q400`

### Quy trình đóng góp:
1. Tạo một nhánh mới từ `main` (ví dụ: `feat/add-questions-huy`).
2. Soạn các file JSON trong dải ID được giao (ví dụ: `questions/q005.json`).
3. Nếu có ảnh, lưu vào `images/` theo đúng định dạng.
4. Chạy lệnh validate JSON cục bộ trước khi commit (đảm bảo không bị lỗi cú pháp dấu phẩy, dấu ngoặc kép).
5. Tạo Pull Request (PR) về nhánh `main`. Nhờ ít nhất một thành viên khác review trước khi merge.

---

## 8. Hướng Dẫn Kỹ Thuật Cho Phía Frontend

### Đọc dữ liệu từ `questions/`
Để tránh việc phải khai báo danh sách file thủ công, lập trình viên Frontend nên thiết lập một script tự động quét thư mục `questions/` trong quá trình build để gom tất cả các file JSON lại thành một mảng dữ liệu thống nhất (hoặc sử dụng tính năng import động của bundler như Vite, Webpack).

### Render Toán học và Code
* **Công thức Toán:** Sử dụng thư viện **KaTeX** để tăng tốc độ render các ký tự toán dạng `$...$` (inline) và `$$...$$` (block) sang HTML.
* **Trình soạn thảo Code:** Sử dụng thư viện **Monaco Editor** (giống VS Code) hoặc **CodeMirror** cho các câu hỏi `essay_code` để hỗ trợ auto-complete và tô màu mã nguồn dựa trên trường `code_language`.
* **Trình duyệt Markdown:** Dùng thư viện `marked` hoặc `react-markdown` để chuyển đổi nội dung câu hỏi và phần giải thích sang HTML hiển thị đầy đủ định dạng.

---

## �� 9. Triển Khai Tự Động Lên GitHub Pages (GitHub Actions)

Dự án đã được cấu hçnh sẵn file GitHub Actions Workflow tại [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## 🚀 Hướng dắn kích hoat 1 lần duy nh�t trên GitHub:

1. Truy cập repository của bạn trê���]X��΋���]X����K�RU�QU�SKPRS�P��\��^[W���ܘ[X������
��][��ʈO�xn�X�
�Y�\ʈ
8n��Y[�H�ꛈ��ZJK�ˈ8n�ZH8n�ۈ
��Z[[�\�[Y[�
���H
���\��J���^xn�ۈ8n��\�H���HH��[���[��
���]X�X�[ۜ�
�����8n�ۈ
��]�J����8n��8n�ZH1$Zxn�H��Kxn��H�H�n�[�\���H0ꛈ�[�XZ[��]X�X�[ۜ��e tự động biên dịch và phát hành giao diện bài thi tại đường pdẫn:'�ZH
��΋��RU�QU�SKPRS�P��\˙�]X��[��^[W���ܘ[K�
��