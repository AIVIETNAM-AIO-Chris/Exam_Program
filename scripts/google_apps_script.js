function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Thời gian nộp", "Tên thé sinh", "S� liệu bài thi", "Điểm trắc nghiệm", "Chi tiết bài lám (JSON)", "Diểm tự luận", "Ghi chú"]);
    }
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([ 
      data.timestamp || new Date(), 
      data.student_name || "Nảc danh", 
      data.exam_title || "Bài thi", 
      data.score_choice || "N/A", 
      JSON.stringify(data.details, null, 2), 
      "", 
      ""
    ]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}