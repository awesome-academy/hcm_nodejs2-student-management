$(document).ready(function () {
  const scoreboard = $("#content").data("scoreboard");
  const modal = $("#scoreModal");

  clearError = () => {
    const errorLists = $(".error-list");
    for (let errorList of errorLists) {
      errorList.innerHTML = "";
    }
  };

  modal.on("show.bs.modal", function (event) {
    clearError();
    const button = $(event.relatedTarget);
    const title = button.data("bs-title");
    const score = button.data("value");
    const factor = button.data("score-factor");
    const studentScore = button.data("student-score");
    const studentName = button.data("student-name");
    const scoreId = button.attr("id");
    const nameLabel = modal.find("#student-name");
    const modalTitle = modal.find("#modalTitle");
    const scoreInput = modal.find("#score-input");
    modalTitle.text(title);
    scoreInput.val(score);
    nameLabel.text(studentName);
    if (scoreId) {
      modal.data("route", `/scores/${scoreId}/update`);
    } else modal.data("route", "/scores");
    modal.data("student-score", studentScore);
    modal.data("factor", factor);
  });

  $("#submitBtn").on("click", function () {
    clearError();
    let body;
    const route = modal.data("route");
    const score = $("#score-input").val();
    if (route === "/scores") {
      const student_score = modal.data("student-score");
      const factor = +modal.data("factor");
      body = { student_score, factor, score };
    } else {
      body = { score };
    }
    let currentURL = window.location.href;
    const urlObject = new URL(currentURL);
    if (urlObject.searchParams.has("source")) {
      urlObject.searchParams.delete("source");
    }
    fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.redirected) {
          if (route === "/scores") {
            urlObject.searchParams.append("source", "create");
          } else {
            urlObject.searchParams.append("source", "update");
          }
          window.location.href = urlObject.toString();
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        } else {
          return null;
        }
      })
      .then((data) => {
        if (data !== null && data.errors) {
          for (let error in data.errors) {
            const errorList = document.getElementById("error-score");
            for (let msg of data.errors[error]) {
              let li = document.createElement("li");
              li.className = "text-danger";
              li.textContent = msg;
              errorList.appendChild(li);
            }
          }
        }
      });
  });

  function exportTableToExcel(scoreboard, filename = "data.xlsx") {
    if (scoreboard === "") return;
    const workbook = XLSX.utils.book_new();

    // Add class information sheet
    const infoSheetData = [
      ["Class Name", scoreboard.class_school.name],
      ["Grade", scoreboard.class_school.grade.name],
      ["School Year", scoreboard.class_school.school_year],
      ["Semester", scoreboard.semester.name],
      ["Subject", scoreboard.subject.name],
      ["Number of Students", scoreboard.student_scores.length],
    ];
    const infoSheet = XLSX.utils.aoa_to_sheet(infoSheetData);
    XLSX.utils.book_append_sheet(workbook, infoSheet, "Class Info");

    // Create a new worksheet for scores
    const headers = [
      "Name",
      "Test Scores",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Midterm",
      "Final",
      "Average",
    ];
    const data = scoreboard.student_scores.map((studentScore) => {
      const row = [studentScore.student.name];
      const testScores = studentScore.scores.filter(
        (score) => score.factor === 1
      );
      for (let i = 0; i < 10; i++) {
        row.push(testScores[i] ? testScores[i].score : "");
      }
      const midtermScore = studentScore.scores.find(
        (score) => score.factor === 2
      );
      row.push(midtermScore ? midtermScore.score : "");
      const finalScore = studentScore.scores.find(
        (score) => score.factor === 3
      );
      row.push(finalScore ? finalScore.score : "");
      const average = calculateAverage(studentScore);
      row.push(average !== null ? average : "");
      return row;
    });
    data.unshift(headers); // Add headers to the data

    const scoreSheet = XLSX.utils.aoa_to_sheet(data);

    // Define the merged cell range for "Test Scores"
    scoreSheet["!merges"] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 10 } }, // Merge cells B1 to K1
    ];

    // Apply styles to headers
    const headerStyle = {
      font: { bold: true },
    };

    const centerAlignment = { alignment: { horizontal: "center" } };

    // Apply header styles
    headers.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!scoreSheet[cellAddress]) scoreSheet[cellAddress] = {};
      scoreSheet[cellAddress].s = headerStyle;
    });

    // Apply styles to data cells
    for (let r = 1; r < data.length; r++) {
      for (let c = 0; c < data[r].length; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r: r, c: c });
        if (!scoreSheet[cellAddress]) scoreSheet[cellAddress] = {};
        scoreSheet[cellAddress].s = centerAlignment;
      }
    }
    // Set column widths
    infoSheet["!cols"] = [{ wch: 15 }, { wch: 10 }];
    scoreSheet["!cols"] = [
      { wch: 20 }, // Set the width of the first column to be larger
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
    ];
    
    // Append the styled sheet to the workbook
    XLSX.utils.book_append_sheet(workbook, scoreSheet, "Scores");

    // Write the workbook to file
    XLSX.writeFile(workbook, filename, { bookType: "xlsx", type: "buffer" });
  }

  // Calculate the average score
  function calculateAverage(studentScore) {
    const testScores = studentScore.scores.filter(
      (score) => score.factor === 1
    );
    const midtermScore = studentScore.scores.find(
      (score) => score.factor === 2
    );
    const finalScore = studentScore.scores.find((score) => score.factor === 3);
    if (finalScore) {
      let sum = testScores.reduce((acc, curr) => acc + +curr.score, 0);
      if (midtermScore) {
        sum += midtermScore.score * 2;
      }
      sum += finalScore.score * 3;
      const numberOfScores = testScores.length + (midtermScore ? 2 : 0) + 3;
      return +(sum / numberOfScores).toFixed(2);
    }
    return null;
  }

  $("#export-btn").on("click", function () {
    exportTableToExcel(scoreboard, "scoreboard.xlsx");
  });

  if (scoreboard != "") {
    const tableBody = $("#scoreboard");
    const testTitle = tableBody.data("test-title");
    const midtermTitle = tableBody.data("midterm-title");
    const finalTitle = tableBody.data("final-title");
    let modalTarget = undefined;
    let startMonth, endMonth, year;
    switch (scoreboard.semester.name) {
      case 1:
        startMonth = 9;
        endMonth = 12;
        year = +scoreboard.semester.school_year.split("-")[0];
        break;
      case 2:
        startMonth = 1;
        endMonth = 5;
        year = +scoreboard.semester.school_year.split("-")[1];
        break;
    }
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    if (
      currentYear < year ||
      (currentYear === year && currentMonth < startMonth)
    ) {
      modalTarget = "#scoreModal";
      $("#note").removeClass("d-none");
    } else if (currentYear === year && currentMonth <= endMonth && schedule) {
      modalTarget = "#scoreModal";
      $("#note").removeClass("d-none");
    }
    scoreboard.student_scores.forEach((studentScore) => {
      const $row = $("<tr>");
      $row.append(`<td>${studentScore.student.name}</td>`);
      const testScores = studentScore.scores.filter(
        (score) => score.factor === 1
      );
      for (let i = 0; i < 10; i++) {
        if (i >= testScores.length) {
          $row.append(`<td
                            class="score-cell"
                            data-score-factor="1"
                            data-bs-toggle="modal"
                            data-bs-target=${modalTarget}
                            data-student-name='${studentScore.student.name}'
                            data-student-score='${studentScore.id}'
                            data-bs-title='${testTitle}'>
                        </td>`);
        } else {
          $row.append(
            `<td
                id="${testScores[i].id}"
                class="score-cell"
                data-bs-toggle="modal"
                data-value=${testScores[i].score}
                data-bs-target=${modalTarget}
                data-student-name='${studentScore.student.name}'
                data-bs-title='${testTitle}'>
                ${testScores[i].score}
            </td>`
          );
        }
      }
      const midtermScore = studentScore.scores.find(
        (score) => score.factor === 2
      );
      if (midtermScore)
        $row.append(`<td 
                        id="${midtermScore.id}"
                        data-bs-toggle="modal"
                        data-value=${midtermScore.score}
                        data-student-name='${studentScore.student.name}'
                        data-bs-target=${modalTarget}
                        data-bs-title='${midtermTitle}'>
                        ${midtermScore.score}
                    </td>`);
      else
        $row.append(`<td 
                            data-score-factor="2"
                            data-bs-toggle="modal"
                            data-student-name='${studentScore.student.name}'
                            data-student-score='${studentScore.id}'
                            data-bs-target=${modalTarget}
                            data-bs-title='${midtermTitle}'>
                        </td>`);
      const finalScore = studentScore.scores.find(
        (score) => score.factor === 3
      );
      if (finalScore) {
        $row.append(`<td
                        id="${finalScore.id}"
                        data-bs-toggle="modal"
                        data-student-name='${studentScore.student.name}'
                        data-value=${finalScore.score}
                        data-bs-target=${modalTarget}
                        data-bs-title='${finalTitle}'>
                        ${finalScore.score}
                    </td>`);
        let average;
        if (midtermScore) {
          let sum = testScores.reduce(
            (accumulator, currentValue) => accumulator + +currentValue.score,
            0
          );
          sum += midtermScore.score * 2 + finalScore.score * 3;
          number = testScores.length + 5;
          average = +(sum / number).toFixed(2);
        } else {
          let sum = testScores.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0
          );
          sum += finalScore.score * 3;
          number = testScores.length + 3;
          average = (sum / number).toFixed(2);
        }
        $row.append(`<td>${average}</td>`);
      } else {
        $row.append(`<td
                        data-score-factor="3"
                        data-bs-toggle="modal"
                        data-student-name='${studentScore.student.name}'
                        data-student-score='${studentScore.id}'
                        data-bs-target=${modalTarget}
                        data-bs-title='${finalTitle}'>
                    </td>`);
        $row.append(`<td></td>`);
      }
      $("#scoreboard").append($row);
    });
  }
  if ($("#content").data("success-msg").length > 0) {
    const toast = $("#toast-success");
    new bootstrap.Toast(toast.get(0)).show();
  }
});
