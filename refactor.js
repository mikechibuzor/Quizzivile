class HttpRequest {
    constructor(method, url){
        this.method = method;
        this.url = url;  
    }
    fetchApi(url){
       return fetch(url)
        .then(response => response.json());
    }
    async fetchData_RendersData(){
        try{
            const responseData = await this.fetchApi(this.url);
            return responseData;
        }
        catch (error){
            console.log(error);
        }
    }
}
class App{
    constructor(questions){
        this.questionsList = questions;
        this.score = 0;
        this.answers = questions.answers;
    }
    increaseScore(){
        return this.score++;
    }
}
class AppUI{
    static randOptions(){
        let randomOptions = [];
        while(randomOptions.length < 4){
            let r = Math.floor(Math.random() * 4);
            randomOptions = [...randomOptions, r];
            randomOptions = new Set(randomOptions);
            randomOptions = Array.from(randomOptions);
        }
        return randomOptions;
    }
    static displayQuestionContent(questionText, options, index, answer){
        let optionss = [...options, answer ];
        const content = document.querySelector('.content');
        const template = document.getElementById('template');
        const templateBody = document.importNode(template.content, true);
        templateBody.getElementById('questText').textContent = questionText;
        const inputs = templateBody.querySelectorAll('input');
        const labels = templateBody.querySelectorAll('label');

        let randomizeOptions =  AppUI.randOptions();

        for(let i = 0; i < inputs.length; i++){
            const inputId = Math.random();
            inputs[i].setAttribute('name', `option${index}`);
            inputs[i].className = 'opt';
            labels[i].setAttribute('for', `option${inputId}`);
            labels[i].textContent = `${optionss[randomizeOptions[i]]}`
            inputs[i].id = `option${inputId}`;   
        }
        content.appendChild(templateBody);
    }
    static displayQuestionContentHandler(arrayOfQuestions){
        arrayOfQuestions.forEach( (question, index) =>{
            this.displayQuestionContent(question.question, question.incorrect_answers, index, question.correct_answer);
        });   
    }
    static contentToAppear(parent, content){
        parent.classList.add('innactive');
        parent.classList.remove('active');
        content.classList.add("active");
        content.classList.remove('innactive');
       }
    static submitHandler(){
        const options = document.querySelectorAll('.options');
        options.forEach( (option, index) =>{
           const optionTabs = option.querySelectorAll('input');
           optionTabs.forEach( optionTab =>{
               if(optionTab.checked){
                    if(optionTab.nextElementSibling.textContent === arrOfAnswers[index]){
                        score++;
                    }
               }
           })
        });
        console.log(score, arrOfAnswers);
    }
    static getAllAnswers(d){
        d.results.forEach( question=> {
            arrOfAnswers = [...arrOfAnswers, question.correct_answer];
        } );
    }
}
class validateUserSelections{
    static validateSelections(category, numOfQuest, difficulty){
        if(category && numOfQuest && difficulty){
            return true;
        }
        else{
            alert('Please leave nothing blank');
            return false;
        }
    }
}
class Time{
    static timer(n){
        const dispTime = document.querySelector("#countDown");
        let time = n * 60;
        let t = setInterval(function(){
        let minutes = Math.floor(time/60);
        let seconds = time % 60;
        dispTime.innerHTML = `${minutes}:${seconds}`;
        time-= 1; 
        if(time < 0){
            clearInterval(t);
            if(timeAutoSubmit){
                Time.endOfTimeSubmit();
            }
        }
        }, 1000);
    }

    static endOfTimeSubmit(){
        const content = document.querySelector('.content').children;
        const submit = content[content.length - 1].querySelector('.submit');
        submit.click();
    }
}
let arrOfAnswers = [];
let score = 0;
let timeAutoSubmit = true;

document.querySelector('#startButton').addEventListener('click', ()=>{
    document.querySelector('.firstPage').style.display = 'none';
    document.querySelector('.container').classList.remove('hide');
    const category = document.querySelector('#category').value;
    const numberOfQuestions = document.querySelector('#number').value;
    const difficulty = document.querySelector('#difficulty').value;

    if(validateUserSelections.validateSelections(category, numberOfQuestions, difficulty)){
        const url = `https://opentdb.com/api.php?amount=${numberOfQuestions}&category=${category}&difficulty=${difficulty}&type=multiple`;
        const HttpRe = new HttpRequest('GET', url);
        const dataFetched = HttpRe.fetchData_RendersData();
        console.log(dataFetched);
        dataFetched.then(data => {
            AppUI.displayQuestionContentHandler(data.results);
            AppUI.getAllAnswers(data);
            Time.timer(.9);
            const content = document.querySelector('.content').children;
            content[0].querySelector('.previous').style.opacity = 0;
            content[0].querySelector('.previous').style.pointerEvents = 'none';
            const submit = content[content.length - 1].querySelector('.Next');
            submit.classList.remove('Next');
            submit.classList.add('submit');
            submit.addEventListener('click',e =>{
                AppUI.submitHandler();
                timeAutoSubmit = false;

            });
            submit.textContent = 'Submit';

            //adding the active element to the first div in the content element so it initially displays over every other divs
            content[0].classList.add('active');
            content[0].classList.remove('innactive');
            
            //The code below allows the next div in the content element to appear over every other divs
            document.querySelectorAll('.Next').forEach( next =>{
                next.addEventListener('click', (e)=>{
                    const parent = e.target.parentElement.parentElement;
                    const content = parent.nextElementSibling;
                    AppUI.contentToAppear(parent, content);
                });
            })

            //the code belows allows the previous div in the content element to appear over every other divs
            document.querySelectorAll('.previous').forEach( previous =>{
                previous.addEventListener('click', (e)=>{
                    const parent = e.target.parentElement.parentElement;
                    const content = parent.previousElementSibling;
                    AppUI.contentToAppear(parent, content);
                });
            });

            
        });
    } 
});

const animateFirstPage = ()=>{
   document.querySelector('.firstPage').classList.toggle('move');
}
setInterval(animateFirstPage, 10000 * 6);
