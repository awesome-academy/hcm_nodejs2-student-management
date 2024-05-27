$(document).ready(function () {
  const scoreboard = $("#content").data("scoreboard");
  const conduct = $("#content").data("conduct");
  const averageTitle = $("#content").data("average-title");
  const conductTitle = $("#content").data("conduct-title");
  const overallTitle = $("#content").data("overall-title");
  const conductExcellent = $("#content").data("conduct-excellent");
  const conductGood = $("#content").data("conduct-good");
  const conductAverage = $("#content").data("conduct-average");
  const conductWeak = $("#content").data("conduct-weak");
  const overallExcellent = $("#content").data("overall-excellent");
  const overallGood = $("#content").data("overall-good");
  const overallAverage = $("#content").data("overall-average");
  const overallWeak = $("#content").data("overall-weak");

  $("#btn-search").on("click", function () {
    const semester = $("#semester").val();
    const classId = $("#_class").val();
    window.location.href = `/scores?semester=${semester}&sclass=${classId}`;
  });

  function generateExcel() {
    // Get the table element
    const table = document.querySelector("#score-table");
    // Convert the table to a worksheet
    const ws = XLSX.utils.table_to_sheet(table);

    const rowCount = table.rows.length;

    // Apply right alignment to the first cell of the last three rows
    for (let i = rowCount - 3; i < rowCount; i++) {
      const cellAddress = `A${i + 1}:M${i + 1}`;
      if (!ws[cellAddress]) {
        ws[cellAddress] = {};
      }
      ws[cellAddress].s = {
        alignment: {
          horizontal: "right",
        },
      };
    }

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scoreboard");

    // Write the workbook to a file
    XLSX.writeFile(wb, "scoreboard.xlsx");
  }

  // Attach the event handler to the export button
  $("#export-btn").on("click", function () {
    generateExcel();
  });

  const urlParams = new URLSearchParams(window.location.search);
  const semester = urlParams.get("semester");
  const classId = urlParams.get("sclass");
  if (semester) {
    $("#semester").val(semester);
  } else {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    if (currentMonth >= 0 && currentMonth <= 4) $("#semester").val("2");
    else $("#semester").val("1");
  }
  if (classId) {
    $("#_class").val(classId);
  } else {
    const classes = $("#content").data("classes");
    $("#_class").val(classes[0].id);
  }

  if (scoreboard != "") {
    let overallSum = 0;
    let overallSubjectNumber = 0;
    let scoreLevel = 0;
    let overallLevel;
    scoreboard.forEach((studentScore) => {
      const $row = $("<tr>");
      $row.append(`<td>${studentScore.class_score.subject.name}</td>`);
      const testScores = studentScore.scores.filter(
        (score) => score.factor === 1
      );
      for (let i = 0; i < 10; i++) {
        if (i >= testScores.length) {
          $row.append(`<td class="score-cell"></td>`);
        } else {
          $row.append(`<td class="score-cell">${testScores[i].score}</td>`);
        }
      }
      const midtermScore = studentScore.scores.find(
        (score) => score.factor === 2
      );
      if (midtermScore) $row.append(`<td>${midtermScore.score}</td>`);
      else $row.append(`<td></td>`);
      const finalScore = studentScore.scores.find(
        (score) => score.factor === 3
      );
      if (finalScore) {
        $row.append(`<td>${finalScore.score}</td>`);
        let average;
        let sum;
        if (midtermScore) {
          sum = testScores.reduce(
            (accumulator, currentValue) => accumulator + +currentValue.score,
            0
          );
          sum += midtermScore.score * 2 + finalScore.score * 3;
          number = testScores.length + 5;
          average = +(sum / number).toFixed(2);
        } else {
          sum = testScores.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0
          );
          sum += finalScore.score * 3;
          number = testScores.length + 3;
          average = +(sum / number).toFixed(2);
        }
        if (average >= 6.5) {
          scoreLevel = Math.max(1, scoreLevel);
        } else if (average >= 5.0 && average < 6.5) {
          scoreLevel = Math.max(2, scoreLevel);
        } else if (average >= 3.5 && average < 5.0) {
          scoreLevel = Math.max(3, scoreLevel);
        } else scoreLevel = Math.max(4, scoreLevel);
        overallSubjectNumber++;
        overallSum += average;
        $row.append(`<td>${average}</td>`);
      } else {
        $row.append(`<td></td>`);
        $row.append(`<td></td>`);
      }
      $("#scoreboard").append($row);
    });
    const $averageRow = $("<tr>");
    $averageRow.append(
      `<td colspan="13" class="average-cell">${averageTitle}:</td>`
    );
    if (overallSubjectNumber === scoreboard.length) {
      const average = +(overallSum / overallSubjectNumber).toFixed(2);
      if (average >= 8) {
        scoreLevel = Math.max(1, scoreLevel);
      } else if (average >= 6.5 && average < 8) {
        scoreLevel = Math.max(2, scoreLevel);
      } else if (average >= 5 && average < 6.5) {
        scoreLevel = Math.max(3, scoreLevel);
      } else scoreLevel = Math.max(4, scoreLevel);
      $averageRow.append(`<td>${average}</td>`);
    } else $averageRow.append(`<td></td>`);
    const $conductRow = $("<tr>");
    $conductRow.append(
      `<td colspan="13" class="average-cell">${conductTitle}:</td>`
    );
    switch (conduct.type) {
      case 1:
        $conductRow.append(`<td>${conductExcellent}</td>`);
        break;
      case 2:
        $conductRow.append(`<td>${conductGood}</td>`);
        break;
      case 3:
        $conductRow.append(`<td>${conductAverage}</td>`);
        break;
      default:
        $conductRow.append(`<td>${conductWeak}</td>`);
        break;
    }
    const $overallRow = $("<tr>");
    $overallRow.append(
      `<td colspan="13" class="average-cell">${overallTitle}:</td>`
    );
    if (scoreLevel !== 0) {
      overallLevel = Math.max(scoreLevel, conduct.type);
      let overallResult;
      switch (overallLevel) {
        case 1:
          overallResult = overallExcellent;
          break;
        case 2:
          overallResult = overallGood;
          break;
        case 3:
          overallResult = overallAverage;
          break;
        default:
          overallResult = overallWeak;
          break;
      }
      $overallRow.append(`<td>${overallResult}</td>`);
    } else $overallRow.append(`<td></td>`);
    $("#scoreboard").append($averageRow);
    $("#scoreboard").append($conductRow);
    $("#scoreboard").append($overallRow);
  }
});
