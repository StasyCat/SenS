//Type ID Title Text
function doGet(request) {
	var sheet = SpreadsheetApp.openById("1A96ZTc-dW-HrLy8KiN3Dqg4M9OHlcZERkjhQxqnd0tE").getSheetByName("Sheet1");
	if (request.parameters.type == "GetTitle") {
		return ContentService.createTextOutput(
				request.parameters.prefix + '(' + JSON.stringify(
					sheet.getRange(3, 2, Number(sheet.getRange("B2").getValue())).getValues()
				) + ')')
			.setMimeType(ContentService.MimeType.JAVASCRIPT);

	} else if (request.parameters.type == "AddTitle") {
		var id = Number(sheet.getRange("B2").getValue()) + 1;
		sheet.getRange("B2").setValue(id);
		sheet.getRange(id + 2, 2).setValue(request.parameters.Title);
		sheet.getRange(2, id + 2).setValue(1);
		sheet.getRange(3, id + 2).setValue(request.parameters.Text);
		return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.JAVASCRIPT);

	} else if (request.parameters.type == "AddRank") {
		var id = Number(request.parameters.ID) + 1;
		var count = Number(sheet.getRange(2, id + 2).getValue()) + 1;
		sheet.getRange(2, id + 2).setValue(count);
		sheet.getRange(count + 2, id + 2).setValue(request.parameters.Text);
		return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.JAVASCRIPT);

	} else { //ID:0-Infinity
		return ContentService.createTextOutput(
				request.parameters.prefix + '(' + JSON.stringify(
					sheet.getRange(3, Number(request.parameters.ID) + 3, Number(sheet.getRange(2, Number(request.parameters.ID) + 3).getValue())).getValues()
				) + ')')
			.setMimeType(ContentService.MimeType.JAVASCRIPT);
	}
}