# Ngân Hàng Câu Hỏi (Quiz Bank) - Tài Liệu Phát Triển

Chào mừng bạn đến với dự án **Exam Program**. Tài liệu này hướng dẫn chi tiết cách tổ chức thư mục, định dạng dữ liệu câu hỏi và các quy tắc đóng góp dành cho các lập trình viên và thành viên soạn đề trong đội ngũ phát triển.

---

## 1. Cấu Trúc Thư Mục Dự Án

Để giảm thiểu xung đột mã nguồn (merge conflicts) và giúp việc quản lý, đánh giá (review Pull Request) dễ dàng hơn, dự án được tổ chức như sau:

```text
exam-program/
│
├── questions/                    # Thư mục chứa các file câu hỏi
│   ├── q001.json                 # Mỗi câu hỏi là một file JSON riêng biệt
│   ├── q002.json
│   └── ...
│
├── images/                       # Thư mục lưu trữ toàn bộ hình ảnh
│   ├── q001.png                  # Ảnh minh họa cho câu q001
│   ├── q002_1.png                # Ảnh minh họa 1 cho câu q002 (nếu câu có nhiều ảnh)
│   ├── q002_2.png                # Ảnh minh họa 2 cho câu q002
│   ├── q003_A.png                # Ảnh minh họa cho đáp án A của câu q003
│   └── ...
│
├── examples/                     # Thư mục chứa các tệp tin mẫu
│   └── example_question.json     # Tệp tin mẫu chứa đủ 4 loại câu hỏi để tham khảo
│
├── src/                          # Mã nguồn của ứng dụng Frontend (React, Vue, etc.)
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── utils/
│
├── exam_config.json              # File cấu hình chung của bài thi (Thời gian, xáo trộn...)
├── package.json
└── README.md
```

### Quy tắc lưu trữ chính:
* **Mỗi câu hỏi một file JSON:** Đặt trong thư mục `questions/` với tên file trùng với `id` câu hỏi (ví dụ: `q001.json`).
* **Không nhúng ảnh dạng Base64:** Tất cả hình ảnh phải được lưu dưới dạng file vật lý trong thư mục `images/` và tham chiếu bằng đường dẫn tương đối (ví dụ: `"images/q001.png"`).

---

## 2. Cấu Hình Bài Thi (`exam_config.json`)

File `exam_config.json` nằm ở thư mục gốc, dùng để cấu hình các thông số chung cho phiên kiểm tra:

```json
{
    "exam_title": "Kiểm tra Đại số tuyến tính",
    "timer_minutes": 60,
    "shuffle_questions": true,
    "shuffle_options": true,
    "show_result_after_submit": true
}
```

* **`timer_minutes`**: Thời gian làm bài cố định (mặc định là 60 phút). Khi bắt đầu làm bài, đồng hồ đếm ngược sẽ chạy và tự động nộp bài khi hết giờ.
* **`shuffle_questions` / `shuffle_options`**: Bật/tắt tính năng trộn câu hỏi và trộn đáp án để tránh gian lận.

---

## 3. Các Loại Câu Hỏi Hỗ Trợ (Question Types)

Hệ thống hỗ trợ 4 dạng câu hỏi chính, được định nghĩa qua trường `type`:

1. **`single_choice`**: Trắc nghiệm chọn một đáp án đúng duy nhất.
2. **`multiple_choice`**: Trắc nghiệm chọn nhiều đáp án đúng.
3. **`essay_text`**: Tự luận nhập văn bản tự do hỗ trợ định dạng Markdown. Thích hợp cho các câu trả lời lý thuyết, chứng minh hoặc cho phép upload ảnh bài làm.
4. **`essay_code`**: Tự luận viết code. Tích hợp trình soạn thảo code (như Monaco Editor) có tính năng làm nổi bật cú pháp (syntax highlighting).

---

## 4. Chi Tiết Định Dạng File Câu Hỏi (JSON Schema)

Mỗi file JSON trong thư mục `questions/` biểu diễn một câu hỏi với các trường dữ liệu sau:

| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `String` | **Có** | ID duy nhất của câu hỏi (khớp với tên file, ví dụ: `"q001"`) |
| `type` | `String` | **Có** | Một trong bốn giá trị: `"single_choice"`, `"multiple_choice"`, `"essay_text"`, `"essay_code"` |
| `difficulty` | `String` | **Có** | Độ khó: `"Easy"`, `"Medium"`, `"Hard"` |
| `author` | `String` | **Có** | Tên lập trình viên / người soạn đề để tiện theo dõi |
| `question` | `String` | **Có** | Nội dung câu hỏi (hỗ trợ Markdown và công thức toán LaTeX) |
| `images` | `Array<String>` | Không | Danh sách đường dẫn ảnh minh họa (ví dụ: `["images/q001.png"]`) |
| `options` | `Array<Object>` | *Bán bắt buộc* | Bắt buộc với loại trắc nghiệm. Mỗi phần tử là object chứa `{ "text": "..." }` hoặc `{ "image": "..." }` |
| `answer` | *Nhiều kiểu* | **Có** | Kết quả/đáp án tham chiếu. Chi tiết xem ở phần dưới. |
| `explanation` | `String` | Không | Lời giải chi tiết giải thích cho đáp án (hỗ trợ Markdown và LaTeX) |
| `tags` | `Array<String>` | Không | Thẻ phân loại chủ đề (ví dụ: `["Matrix", "Determinant"]`) |
| `allow_image_upload`| `Boolean` | Không | Chỉ dành cho `essay_text`. Bật `true` để cho phép thí sinh tải ảnh chụp bài làm lên. |
| `code_language` | `String` | *Bán bắt buộc* | Bắt buộc với `essay_code`. Chỉ định ngôn ngữ lập trình (ví dụ: `"python"`, `"cpp"`, `"javascript"`) |
| `starter_code` | `String` | Không | Chỉ dành cho `essay_code`. Đoạn code mẫu ban đầu cung cấp sẵn cho thí sinh. |

---

## 5. Ví Dụ Định Dạng Cho Từng Loại Câu Hỏi

Dưới đây là cấu trúc JSON chi tiết tương ứng với từng loại câu hỏi để các thành viên copy-paste khi tạo câu hỏi mới. Để xem file mẫu tổng hợp, bạn hãy mở file [example_question.json](file:///d:/CODE-learning/AI%20VIET%20NAM/PROJECTS/Exam_Program/examples/example_question.json).

### 5.1 Trắc nghiệm chọn một đáp án (`single_choice`)
*Trường `answer` lưu index của đáp án đúng (bắt đầu từ `0`).*

```json
{
    "id": "q001",
    "type": "single_choice",
    "difficulty": "Easy",
    "author": "huy",
    "question": "Cho ma trận $$A=\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$$. Tính định thức của A.",
    "images": [],
    "options": [
        { "text": "$$2$$" },
        { "text": "$$-2$$" },
        { "text": "$$10$$" },
        { "text": "$$0$$" }
    ],
    "answer": 1,
    "explanation": "$$\\det(A) = 1 \\times 4 - 2 \\times 3 = -2$$",
    "tags": ["Linear Algebra", "Matrix", "Determinant"]
}
```

---

### 5.2 Trắc nghiệm chọn nhiều đáp án (`multiple_choice`)
*Trường `answer` lưu một mảng các index đáp án đúng.*

```json
{
    "id": "q002",
    "type": "multiple_choice",
    "difficulty": "Medium",
    "author": "nam",
    "question": "Chọn **tất cả** các ma trận là ma trận đối xứng.",
    "images": [],
    "options": [
        { "text": "$$\\begin{bmatrix}1&2\\\\2&3\\end{bmatrix}$$" },
        { "text": "$$\\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}$$" },
        { "text": "$$\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$$" },
        { "text": "$$\\begin{bmatrix}5&7\\\\7&9\\end{bmatrix}$$" }
    ],
    "answer": [0, 1, 3],
    "explanation": "Ma trận đối xứng thỏa $$A = A^T$$. Các lựa chọn A, B, D đều đối xứng.",
    "tags": ["Linear Algebra", "Matrix", "Symmetric Matrix"]
}
```

---

### 5.3 Tự luận nhập văn bản & Tải ảnh (`essay_text`)
*Hỗ trợ nhập bài làm dạng text/markdown. Nếu cần làm bài ra giấy rồi chụp ảnh nộp, hãy đặt `allow_image_upload` thành `true`.*

```json
{
    "id": "q003",
    "type": "essay_text",
    "difficulty": "Hard",
    "author": "linh",
    "question": "Chứng minh rằng nếu $$A$$ là ma trận vuông cấp $$n$$ và $$\\det(A) \\neq 0$$ thì $$A$$ khả nghịch.",
    "images": [],
    "answer": "Vì det(A) ≠ 0 nên hệ phương trình Ax = 0 chỉ có nghiệm tầm thường...",
    "allow_image_upload": true,
    "explanation": "Sử dụng định lý cơ bản về ma trận khả nghịch...",
    "tags": ["Linear Algebra", "Matrix", "Determinant", "Inverse"]
}
```

---

### 5.4 Tự luận viết mã nguồn (`essay_code`)
*Thí sinh viết code trực tiếp trên hệ thống. Sử dụng `starter_code` để định nghĩa sẵn khung hàm (function signature).*

```json
{
    "id": "q004",
    "type": "essay_code",
    "difficulty": "Medium",
    "author": "phuong",
    "question": "Viết hàm Python nhận vào ma trận vuông và trả về định thức của ma trận đó.",
    "images": [],
    "code_language": "python",
    "starter_code": "def determinant(matrix: list[list[float]]) -> float:\n    # Viết mã nguồn của bạn ở đây\n    pass",
    "answer": "def determinant(matrix):\n    # Code mẫu đáp án tham khảo...",
    "explanation": "Sử dụng khai triển Laplace hoặc khử Gauss...",
    "tags": ["Linear Algebra", "Matrix", "Programming"]
}
```

---

## 6. Quy Ước Đặt Tên File Hình Ảnh

Khi câu hỏi hoặc đáp án có sử dụng hình ảnh, bạn cần tuân thủ quy tắc đặt tên file trong thư mục `images/` như sau để tránh xung đột và dễ dàng liên kết:

* **Ảnh minh họa câu hỏi:** `{question_id}.png` (Ví dụ: `q001.png`)
* **Nhiều ảnh minh họa câu hỏi:** `{question_id}_{số thứ tự}.png` (Ví dụ: `q001_1.png`, `q001_2.png`)
* **Ảnh minh họa cho các option:** `{question_id}_{label_chữ_cái}.png` (Ví dụ: `q003_A.png`, `q003_B.png`)
* **Ảnh minh họa cho phần lời giải:** `{question_id}_explain.png` (Ví dụ: `q001_explain.png`)

---

## 7. Quy Trình Phân Chia Dải ID và Đóng Góp (Contribution Workflow)

Để tránh trùng lặp ID khi nhiều thành viên cùng push code lên Git, mỗi người soạn câu hỏi sẽ được chỉ định một dải ID cố định.

### Phân chia dải ID:
* **Thành viên A (Huy):** Từ `q001` đến `q100`
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