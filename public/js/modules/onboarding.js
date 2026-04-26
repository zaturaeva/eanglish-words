import api from '../api.js';
import router from '../router.js';

export function renderOnboarding() {
    var selectedLevel = 'A1';
    var selectedTarget = 'Общий курс';
    var selectedGoal = 20;
    var testWords = ['hello', 'world', 'apple', 'cat', 'dog', 'book', 'water', 'house', 'car', 'school'];
    var testIndex = 0;

    var container = document.getElementById('screen-container');
    container.innerHTML = '<div class="onboarding"><h2>Давайте познакомимся!</h2>' +
        '<div id="step-1" class="onboarding-step active">' +
            '<h3>Знаете ли вы эти слова?</h3>' +
            '<div id="test-word" style="font-size:2rem;margin:20px 0;">' + testWords[0] + '</div>' +
            '<div class="onboarding-options">' +
                '<button id="btn-know">Знаю</button>' +
                '<button id="btn-dont-know">Не знаю</button>' +
            '</div>' +
            '<p id="test-progress">1 / ' + testWords.length + '</p>' +
        '</div>' +
        '<div id="step-2" class="onboarding-step" style="display:none;">' +
            '<h3>Ваша цель</h3>' +
            '<div class="onboarding-options" id="target-options">' +
                '<button data-target="Путешествия">Путешествия</button>' +
                '<button data-target="Работа">Работа</button>' +
                '<button data-target="Общий курс" class="selected">Общий курс</button>' +
            '</div>' +
        '</div>' +
        '<div id="step-3" class="onboarding-step" style="display:none;">' +
            '<h3>Сколько минут в день?</h3>' +
            '<div class="onboarding-options" id="goal-options">' +
                '<button data-goal="5">5 мин</button>' +
                '<button data-goal="15">15 мин</button>' +
                '<button data-goal="20" class="selected">20 мин</button>' +
                '<button data-goal="30">30 мин</button>' +
            '</div>' +
            '<button class="btn btn-primary" id="btn-finish" style="margin-top:20px;">Готово!</button>' +
        '</div>' +
    '</div>';

    document.getElementById('btn-know').addEventListener('click', function() {
        testIndex++;
        if (testIndex < testWords.length) {
            document.getElementById('test-word').textContent = testWords[testIndex];
            document.getElementById('test-progress').textContent = (testIndex + 1) + ' / ' + testWords.length;
            if (testIndex >= 7) selectedLevel = 'B1';
            else if (testIndex >= 4) selectedLevel = 'A2';
        } else {
            goToStep(2);
        }
    });

    document.getElementById('btn-dont-know').addEventListener('click', function() {
        testIndex++;
        if (testIndex < testWords.length) {
            document.getElementById('test-word').textContent = testWords[testIndex];
            document.getElementById('test-progress').textContent = (testIndex + 1) + ' / ' + testWords.length;
        } else {
            goToStep(2);
        }
    });

    document.querySelectorAll('#target-options button').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#target-options button').forEach(function(b) { b.classList.remove('selected'); });
            btn.classList.add('selected');
            selectedTarget = btn.dataset.target;
            goToStep(3);
        });
    });

    document.querySelectorAll('#goal-options button').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#goal-options button').forEach(function(b) { b.classList.remove('selected'); });
            btn.classList.add('selected');
            selectedGoal = parseInt(btn.dataset.goal);
        });
    });

    document.getElementById('btn-finish').addEventListener('click', async function() {
        try {
            await api.post('/onboarding/complete', {
                level: selectedLevel,
                target: selectedTarget,
                daily_goal: selectedGoal
            });
            router.navigate('dashboard');
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    });

    function goToStep(step) {
        document.getElementById('step-1').style.display = 'none';
        document.getElementById('step-2').style.display = 'none';
        document.getElementById('step-3').style.display = 'none';
        document.getElementById('step-' + step).style.display = 'block';
    }
}