// Object to store the inputs and outputs
const qaSession = {
  question: "",
  answer: "",
  context: "", // Optional context
  evaluationType: "General", // This should be set to one of the EvaluationType enum values
  score: "",
  justification: "",
  questionImprovement: "",
  answerImprovement: "",
};

document.getElementById("sendPrompt").addEventListener("click", function () {
  qaSession.question = document.getElementById("promptInput").value;

  // Show spinner for response loading
  document.getElementById("loadingSpinnerResponse").style.display = "block";

  // Call the API to get the response
  fetch("http://localhost:8000/get_response", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question: qaSession.question }),
  })
    .then((response) => response.json())
    .then((data) => {
      qaSession.answer = data.answer; // Assuming the API returns an object with an 'answer' property
      document.getElementById("responseOutput").innerText = qaSession.answer;

      // Automatically trigger evaluation after receiving the response
      triggerEvaluation();
    })
    .catch((error) => {
      console.error("Error:", error);
    })
    .finally(() => {
      document.getElementById("loadingSpinnerResponse").style.display = "none";
    });
});

function triggerEvaluation() {
  // Show spinner for evaluation loading
  document.getElementById("loadingSpinnerEvaluation").style.display = "block";

  // Call the API to evaluate the response
  fetch("http://localhost:8000/evaluate_endpoint", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: qaSession.question,
      answer: qaSession.answer,
      context: qaSession.context, // Optional context
      evaluation_type: qaSession.evaluationType, // This should match the EvaluationType enum
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      qaSession.score = data.score;
      qaSession.justification = data.justification;
      document.getElementById("evaluationScore").innerText =
        "Score: " + qaSession.score;
      document.getElementById("evaluationJustification").innerText =
        "Justification: " + qaSession.justification;

      // Automatically trigger improvement suggestions after evaluation
      triggerImprovementSuggestions();
    })
    .catch((error) => {
      console.error("Error:", error);
    })
    .finally(() => {
      document.getElementById("loadingSpinnerEvaluation").style.display =
        "none";
    });
}

function triggerImprovementSuggestions() {
  // Show spinner for improvement suggestions loading
  document.getElementById("loadingSpinnerImprovement").style.display = "block";

  // Call the API to get improvement suggestions
  fetch("http://localhost:8000/improvement_suggestions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: qaSession.question,
      answer: qaSession.answer,
      context: qaSession.context, // Optional context
      score: qaSession.score,
      justification: qaSession.justification,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      qaSession.questionImprovement = data.question_improvement;
      qaSession.answerImprovement = data.answer_improvement;
      document.getElementById("questionImprovement").innerText =
        qaSession.questionImprovement;
      document.getElementById("answerImprovement").innerText =
        qaSession.answerImprovement;
    })
    .catch((error) => {
      console.error("Error:", error);
    })
    .finally(() => {
      document.getElementById("loadingSpinnerImprovement").style.display =
        "none";
    });
}
