function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 1. Tạo cột tiêu đề nếu bảng tính mới chưa có dòng nào
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời gian nộp",
        "Tên thí sinh",
        "Tên bài thi",
        "ID Câu hỏi",
        "Loại tự luận",
        "Đề bài câu hỏi",
        "Bài làm của thí sinh (Code / Text)",
        "Đính kèm ảnh",
        "Đáp án mẫu tham khảo",
        "Điểm tự luận (Host chấm thủ công)",
        "Ghi chú của Host"
      ]);

      // Định dạng dòng tiêu đề (Bôi đậm)
      sheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#f3f3f3");
    }
    
    var data = JSON.parse(e.postData.contents);
    var timestamp = data.timestamp || new Date();
    var studentName = data.student_name || "Nặc danh";
    var examTitle = data.exam_title || "Bài thi";
    var essays = data.essay_responses || [];

    // 2. Ghi mỗi câu tự luận thành 1 hàng riêng biệt trên Google Sheets để Host dễ đọc & chấm điểm
    if (essays.length > 0) {
      essays.forEach(function(item) {
        sheet.appendRow([ 
          timestamp, 
          studentName, 
          examTitle, 
          item.question_id || "N/A",
          item.question_type || "Tự luận",
          item.question_title || "",
          item.student_answer || "(Bỏ trống)",
          item.has_attached_image || "Không",
          item.reference_answer || "",
          "", // Ô để Host nhập điểm thủ công (Ví dụ: 8.5)
          ""  // Ô để Host ghi nhận xét
        ]);
      });
    } else {
      // Nếu bài thi không có câu tự luận nào
      sheet.appendRow([ 
        timestamp, 
        studentName, 
        examTitle, 
        "Không có câu tự luận",
        "-",
        "-",
        "-",
        "-",
        "-",
        data.choice_score || "N/A",
        "Bài thi 100% trắc nghiệm"
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: essays.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}