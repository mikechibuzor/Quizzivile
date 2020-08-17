//contains methods that handles the fetching of data
class HttpRequest {
  constructor(method, url) {
    this.method = method;
    this.url = url;
  }
  fetchApi(url) {
    return fetch(url).then((response) => response.json());
  }
  async fetchData_RendersData() {
    try {
      const responseData = await this.fetchApi(this.url);
      return responseData;
    } catch (error) {
      console.log(error);
      return;
    }
  }
}
class AppUI {
  //this method helps to randomize the options
  static randOptions() {
    let randomOptions = [];
    while (randomOptions.length < 4) {
      let r = Math.floor(Math.random() * 4);
      randomOptions = [...randomOptions, r];
      randomOptions = new Set(randomOptions); //removes duplicate element if there is
      randomOptions = Array.from(randomOptions); // converts back into an array object we can work with
    }
    return randomOptions;
  }
  //responsible for creating the display content on the DOM for a particular question object
  static displayQuestionContent(questionText, options, index, answer) {
    let optionss = [...options, answer]; //this is joining the wrong options and the answer together in one array to fit my design
    const content = document.querySelector(".content");
    const template = document.getElementById("template");
    const templateBody = document.importNode(template.content, true);
    templateBody.getElementById("questText").textContent = questionText;
    const inputs = templateBody.querySelectorAll("input");
    const labels = templateBody.querySelectorAll("label");

    let randomizeOptions = AppUI.randOptions();

    for (let i = 0; i < inputs.length; i++) {
      const inputId = Math.random();
      inputs[i].setAttribute("name", `option${index}`);
      inputs[i].className = "opt";
      labels[i].setAttribute("for", `option${inputId}`);
      labels[i].textContent = `${optionss[randomizeOptions[i]]}`;
      inputs[i].id = `option${inputId}`;
    }
    content.appendChild(templateBody);
  }
  //loops through all the question data and helps renders them to the DOM
  static displayQuestionContentHandler(arrayOfQuestions) {
    arrayOfQuestions.forEach((question, index) => {
      this.displayQuestionContent(
        question.question,
        question.incorrect_answers,
        index,
        question.correct_answer
      );
    });
  }
  //attached as an event listener to the next and previous button; gets the  next or previous question to be displayed
  static contentToAppear(parent, content) {
    parent.classList.add("innactive");
    parent.classList.remove("active");
    content.classList.add("active");
    content.classList.remove("innactive");
  }
}
class Submit {
  //handles the submit. this function fires when the submit button is clicked or when the time runs out
  static submitHandler(cat, numQ, diff, time) {
    clearInterval(clearInt);
    const options = document.querySelectorAll(".divOptions"); //gets the div element housing the options
    options.forEach((option, index) => {
      const optionTabs = option.querySelectorAll("input"); //inside that div get all of the four options particular to a question
      optionTabs.forEach((optionTab) => {
        if (optionTab.checked) {
          //gets the user selected options and concantenates it to the global player selection array
          playerSelections = [
            ...playerSelections,
            optionTab.nextElementSibling.textContent,
          ];
          if (
            optionTab.nextElementSibling.textContent === arrOfAnswers[index] // if the option the user selected is corrected add one to the score
          ) {
            score++;
          }
        }
      });
    });
    playerSelections = [...playerSelections, "No Selection"]; //this is for when the user skips a question
    Submit.displaySubmitInfo(cat, numQ, diff, time);
  }
  //helps get all of the answers from the fetched question data
  static getAllAnswers(d) {
    d.results.forEach((question) => {
      // self explanatory enough
      arrOfAnswers = [...arrOfAnswers, question.correct_answer];
    });
  }
  static displaySubmitInfo(cat, numQ, diff, time) {
    document.querySelector(".container").classList.add("hide"); //hides the UI of the question app
    const lastPage = document.querySelector(".lastPage");
    const questionAnswers = document.querySelector(".questionAnswers");
    const playerAnswerss = document.querySelector(".playerAnswers");
    lastPage.classList.remove("hide");

    lastPage.querySelector(
      ".dispScore h3"
    ).textContent = `Your Score: ${score}`;
    const pEl = lastPage.querySelectorAll(".moreInfo p");
    pEl[0].textContent = `Category: ${cat}`;
    pEl[1].textContent = `Number of Questions: ${numQ}`;
    pEl[2].textContent = `Difficulty: ${diff}`;
    pEl[3].textContent = `Time Elapsed: ${time}`;

    //for all of my answers
    arrOfAnswers.forEach((answer, index) => {
      const p = document.createElement("p");
      p.textContent = `${index + 1}. ${answer}`;
      questionAnswers.append(p);
    });

    //for all of the player selection, display it in this format 1. (player answer) \n 2. (player answer) ...
    playerSelections.pop();
    playerSelections.forEach((answer, index) => {
      let p = document.createElement("p");
      p.textContent = `${index + 1}. ${answer}`;
      // p = `${index + 1}. ${answer}`;
      // console.log(playerSelections);
      playerAnswerss.append(p);
    });
  }
}
//from the name, this class tells you it helps to validate the user selections
class validateUserSelections {
  //so how this works is pretty straight forward, the function get three arguments and using the condition in the if block statement, validates the input
  static validateSelections(category, numOfQuest, difficulty) {
    if (
      category &&
      Number(numOfQuest) > 0 &&
      Number(numOfQuest) < 51 &&
      difficulty
    ) {
      return true;
    } else {
      if (numOfQuest === "") {
        alert("Please select a number between 1 - 50");
      } else if (Number(numOfQuest) < 0) {
        alert("Amount cannot be a negative number");
      }
      return false;
    }
  }
}
/*
This class does two things:
    -Handles and displays the timer on the DOM
    -Submits the quiz when the time is up
*/
class Time {
  static timer(n) {
    const dispTime = document.querySelector("#countDown");
    let time = n * 60;
    clearInt = setInterval(function () {
      let minutes = Math.floor(time / 60);
      let seconds = time % 60;
      dispTime.innerHTML = `${minutes}:${seconds}`;
      time -= 1;
      if (time < 0) {
        clearInterval(clearInt);
        if (timeAutoSubmit) {
          Time.endOfTimeSubmit();
        }
      }
    }, 1000);
  }

  static endOfTimeSubmit() {
    const content = document.querySelector(".content").children;
    const submit = content[content.length - 1].querySelector(".submit");
    submit.click();
  }
}
//globally declared variables that, well, we get to use in the submit methods
let clearInt;
let arrOfAnswers = [];
let playerSelections = [];
let score = 0;
let timeAutoSubmit = true;

document.querySelector("#startButton").addEventListener("click", () => {
  const preloader = document.querySelector(".preloader");

  //code below gets the user's selections
  let category = document.querySelector("#category").value;
  const numberOfQuestions = document.querySelector("#number").value;
  const difficulty = document.querySelector("#difficulty").value;

  category = category.split("=");
  if (
    validateUserSelections.validateSelections(
      category,
      numberOfQuestions,
      difficulty
    )
  ) {
    preloader.style.display = "flex";
    document.querySelector(".firstPage").classList.add("hide");
    document.querySelector(".container").classList.remove("hide");

    const url = `https://opentdb.com/api.php?amount=${numberOfQuestions}&category=${category[0]}&difficulty=${difficulty}&type=multiple`;
    const HttpRe = new HttpRequest("GET", url);
    const dataFetched = HttpRe.fetchData_RendersData();

    dataFetched.then((data) => {
      AppUI.displayQuestionContentHandler(data.results);
      Submit.getAllAnswers(data);
      preloader.style.display = "none";
      //the logic here uses a nested ternary operator to ascertain what the time will be using the value of the difficulty
      const timeDeterminer =
        difficulty.value === "easy"
          ? numberOfQuestions * 0.16
          : difficulty.value === "medium"
          ? numberOfQuestions * 0.133
          : numberOfQuestions * 0.33;
      Time.timer(Math.ceil(timeDeterminer.toFixed(2)));
      const content = document.querySelector(".content").children;
      content[0].querySelector(".previous").style.opacity = 0;
      content[0].querySelector(".previous").style.pointerEvents = "none";
      const submit = content[content.length - 1].querySelector(".Next");
      submit.classList.remove("Next");
      submit.classList.add("submit");
      submit.addEventListener("click", (e) => {
        Submit.submitHandler(category[1], numberOfQuestions, difficulty);
        timeAutoSubmit = false; // this here blocks the timer method inthe Time class from re-submitting
      });
      submit.textContent = "Submit";

      //adding the active element to the first div in the content element so it initially displays over every other divs
      content[0].classList.add("active");
      content[0].classList.remove("innactive");

      //The code below allows the next div in the content element to appear over every other divs
      document.querySelectorAll(".Next").forEach((next) => {
        next.addEventListener("click", (e) => {
          const parent = e.target.parentElement.parentElement;
          const content = parent.nextElementSibling;
          AppUI.contentToAppear(parent, content);
        });
      });

      //the code belows allows the previous div in the content element to appear over every other divs
      document.querySelectorAll(".previous").forEach((previous) => {
        previous.addEventListener("click", (e) => {
          const parent = e.target.parentElement.parentElement;
          const content = parent.previousElementSibling;
          AppUI.contentToAppear(parent, content);
        });
      });

      //Re-test?
      document
        .querySelector(".re-test")
        .addEventListener("click", () => location.reload());
    });
  }
});
//What can i say here, the function name has said it all
const animateFirstPage = () => {
  document.querySelector(".firstPage").classList.toggle("move");
};
const intervalTime = 10000;
setInterval(animateFirstPage, intervalTime);
