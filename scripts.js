function loadMealPlan() {
    const savedPlan = localStorage.getItem('mealPlan');
    const lastUpdate = localStorage.getItem('lastUpdate');

    if (savedPlan && lastUpdate) {
        const lastUpdateDate = new Date(lastUpdate);
        const currentDate = new Date();

        // Проверяем, прошло ли 7 дней
        const daysSinceUpdate = Math.floor((currentDate - lastUpdateDate) / (1000 * 60 * 60 * 24));
        if (daysSinceUpdate < 7) {
            return JSON.parse(savedPlan);  // Возвращаем сохраненный план
        }
    }

    // Если данных нет или прошло больше недели, возвращаем план для второй недели
    return getSecondWeekMealPlan();
}

function getSecondWeekMealPlan() {
    // Возвращаем план питания на вторую неделю
    return days.map(day => ({
        day: day.name + ' (вторая неделя)',  // Добавляем суффикс для второй недели
        meals: day.meals // Используем те же блюда, что и на первую неделю, но для второй
    }));
}

function showDay(day) {
    const mealPlan = loadMealPlan(); // Загружаем заранее заданный план (вторая неделя, если прошло больше недели)
    const dayData = mealPlan.find(d => d.day.includes(capitalizeFirstLetter(day)));

    if (!dayData) {
        alert("День не найден!");
        return;
    }

    const mealPlanDiv = document.getElementById('meal-plan');
    mealPlanDiv.innerHTML = `
        <h2>План питания на ${capitalizeFirstLetter(day)}</h2>
        ${dayData.meals.map((meal, index) => `
            <div class="meal-item">
                <h3>${meal.type}:</h3> <!-- Тип еды выводим здесь -->
                <p>${meal.name}</p>
                <div class="button-container">
                    <button class="info-button" onclick="showDetails(${index}, '${day}')">
                        <img src="interface/button-info.png" alt="Информация" class="info-icon">
                    </button>
                </div>
            </div>
        `).join('')}
    `;
}

function showDetails(mealIndex, day) {
    const mealPlan = loadMealPlan();
    const dayData = mealPlan.find(d => d.day.includes(capitalizeFirstLetter(day)));
    const meal = dayData ? dayData.meals[mealIndex] : null;

    if (meal) {
        const mealPlanDiv = document.getElementById('meal-plan');
        let ingredientsList = meal.ingredients.map(ingredient => 
            `${ingredient.name}: ${ingredient.quantity}`).join('<br>');

        mealPlanDiv.innerHTML = `
            <h2>${meal.name}</h2>
            <p><strong>Ингредиенты:</strong><br>${ingredientsList}</p>
            <p><strong>Способ приготовления:</strong> ${meal.recipe}</p>
            <p><strong>КБЖУ:</strong> Калории: ${meal.calories}, Белки: ${meal.proteins} г, Жиры: ${meal.fats} г, Углеводы: ${meal.carbs} г</p>
            <button class="close-button" onclick="closeDetails('${day}')">
                <img src="interface/close.png" alt="Закрыть" class="close-icon">
            </button>
        `;
    }
}

function closeDetails(day) {
    if (day) {
        showDay(day); // Восстанавливаем план питания на день
    } else {
        alert('Ошибка: день недели не передан!');
    }
}

function getMealPlan(day) {
    const mealPlan = loadMealPlan();
    const dayName = capitalizeFirstLetter(day).replace(/ \(.*/, ''); // Убираем "(вторая неделя)"
    return mealPlan.find(d => d.day.includes(dayName))?.meals || null;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Запрет выделения текста и контекстного меню
document.addEventListener('DOMContentLoaded', () => {
    // Отключаем выделение текста
    document.addEventListener('selectstart', (event) => {
        const target = event.target;
        if (target.classList.contains('info-button') || target.classList.contains('close-button')) {
            event.preventDefault();
        }
    });

    // Отключаем контекстное меню для кнопок
    document.querySelectorAll('.info-button, .close-button').forEach(button => {
        button.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    });

    // Загружаем план питания
    const savedPlan = loadMealPlan();
    if (!savedPlan) {
        // Если нет сохраненного плана, использовать дефолтный план для второй недели
        loadMealPlan();
    }
    showDay('Понедельник');
});
