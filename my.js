document.addEventListener('DOMContentLoaded', function () {
    const openBtn = document.getElementById('open-popup-btn');
    const closeBtn = document.getElementById('close-popup-btn');
    const popupOverlay = document.getElementById('popup-overlay');
    const form = document.getElementById('feedback-form');
    const statusDiv = document.getElementById('form-status');

    // Эндпоинт для отправки (замените на свой ключ formcarry.com)
    const FORM_ENDPOINT = 'https://formcarry.com/s/ваш_уникальный_ключ';

    // Поля формы для LocalStorage
    const fields = ['fullname', 'email', 'phone', 'organization', 'message'];

    // 1. Восстановление данных из LocalStorage при загрузке
    fields.forEach(fieldId => {
        const savedValue = localStorage.getItem('feedback_' + fieldId);
        if (savedValue !== null) {
            document.getElementById(fieldId).value = savedValue;
        }
    });
    const savedCheckbox = localStorage.getItem('feedback_agreement');
    if (savedCheckbox === 'true') {
        document.getElementById('agreement').checked = true;
    }

    // 2. Автосохранение в LocalStorage при вводе
    form.addEventListener('input', function () {
        fields.forEach(fieldId => {
            const val = document.getElementById(fieldId).value;
            localStorage.setItem('feedback_' + fieldId, val);
        });
    });

    document.getElementById('agreement').addEventListener('change', function () {
        localStorage.setItem('feedback_agreement', this.checked);
    });

    // Функция открытия попапа
    function openPopup(pushHistory = true) {
        popupOverlay.classList.add('active');
        if (pushHistory) {
            history.pushState({ popupOpen: true }, '', '#feedback');
        }
    }

    // Функция закрытия попапа
    function closePopup(popHistory = true) {
        popupOverlay.classList.remove('active');
        statusDiv.textContent = '';
        if (popHistory && window.location.hash === '#feedback') {
            history.back();
        }
    }

    // Обработчик клика по кнопке открытия
    openBtn.addEventListener('click', function () {
        openPopup(true);
    });

    // Обработчик клика по крестику
    closeBtn.addEventListener('click', function () {
        // Возвращаемся назад в истории, что вызовет popstate и закроет окно
        if (window.location.hash === '#feedback') {
            history.back();
        } else {
            closePopup(false);
        }
    });

    // 3. Поддержка History API и кнопки «Назад»
    window.addEventListener('popstate', function (event) {
        if (window.location.hash === '#feedback') {
            openPopup(false);
        } else {
            closePopup(false);
        }
    });

    // Если страница изначально открыта с хешем #feedback
    if (window.location.hash === '#feedback') {
        openPopup(false);
    }

    // 4. Отправка формы через fetch без перезагрузки
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        statusDiv.textContent = 'Отправка...';
        statusDiv.className = 'form-status';

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => { data[key] = value; });

        fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                statusDiv.textContent = 'Сообщение успешно отправлено!';
                statusDiv.classList.add('success');
                
                // Очистка LocalStorage и формы после успешной отправки
                fields.forEach(fieldId => {
                    localStorage.removeItem('feedback_' + fieldId);
                    document.getElementById(fieldId).value = '';
                });
                localStorage.removeItem('feedback_agreement');
                document.getElementById('agreement').checked = false;

                setTimeout(() => {
                    closePopup(true);
                }, 2000);
            } else {
                throw new Error('Ошибка сервера');
            }
        })
        .catch(error => {
            statusDiv.textContent = 'Ошибка при отправке. Попробуйте позже.';
            statusDiv.classList.add('error');
        });
    });
});
