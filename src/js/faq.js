const openCloseAnswer = (questionName) => {
    if (questionName) {
        let answer = document.querySelector(`#answer-${questionName}`);
        let openedIcon = document.querySelector(`#icon-opened-${questionName}`);
        let closedIcon = document.querySelector(`#icon-closed-${questionName}`);
        if (answer.classList.contains('hidden')) {
            answer.classList.remove('hidden');
            answer.classList.remove('close-answer');
            openedIcon.classList.remove('hidden');
            closedIcon.classList.toggle('hidden');
            answer.classList.toggle('open-answer');
        } else {
            openedIcon.classList.toggle('hidden');
            closedIcon.classList.remove('hidden');
            answer.classList.remove('open-answer');
            answer.classList.toggle('close-answer');
            answer.classList.toggle('hidden');
        }
    }
}

const faqQuestions = document.querySelectorAll('[data-question]');
faqQuestions.forEach(question => {
    question.addEventListener('click', () => openCloseAnswer(question.dataset['question']));
});