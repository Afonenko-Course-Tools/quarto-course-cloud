---
type: authoring-guide
component: cloud
status: accepted-next
updated: 2026-10-08
---

# Новый банк и описание Cloud

Это подготовка согласованного следующего выпуска, а не обещание опубликованной версии. [Целевой контракт Core](../../quarto-course/spec/authoring-model-next.md) задаёт общую модель; [план владельца](plans/2026-10-08-implementation.md) фиксирует порядок внедрения и свежие проверки. Существующие публичные API владельца сохраняются. После реализации и проверки эти правила переносятся в действующий контракт и README. Минимум следующего выпуска — Quarto 1.11.5, CUE 0.17.1.

Cloud не потребляет Body-пакет. Он читает текущую локальную Course-модель и добавляет `extensions.cloud`. VM, `.cloud-step` и `.cloud-action` сохраняют собственный контракт; общие задания и назначения остаются у Core.

В native `_metadata.yml` области задач объявляется `exercise-bank: true` и `exercise-statement-visibility: open|restricted`. Каждая каноническая задача имеет собственные difficulty/time. `target="cloud"` не включает банк; установка пакета не активирует адаптер. Для Cloud сохраняются `course.adapters: [cloud]` и фильтр после Core. Обычный Quarto вне банка не получает обязательных difficulty/time.

Несколько `.task-items` образуют один упорядоченный состав работы. Stage списка необязателен и не выводится из заголовка; requirement/work-mode задаются на конкретной ссылке. Kind `lab|seminar|practical|test` описывает работу, а не VM execution или форму выдачи. В test/practical назначаются только restricted условия; открытые разборы идут в `.assessment-preview` вне состава.

Cloud CUE использует локальные `exercise.id`/`assessment.items`; qualified Body assignments сюда не переносятся. Не дублируются Core predicates для stage, публичного решения или времени. VM объявляются на странице работы; prepare относится к работе, остальные фазы — к native `.cloud-step`. Это специальные шаги Cloud, они сохраняются при удалении старого общего Course блока `.step`.

Student убирает restricted условия и закрытые решения до записи проекции; full позволяет читать полную декларацию. Открытое обычное условие не делает авторское решение публичным: для этого нужна каноническая demonstration с решением. Native source modal и копирование сырых QMD с закрытыми телами в student output не включаются; внешняя ссылка GitHub может остаться.

HTML/CUE подтверждают структуру текущей модели и пути файлов, а не запуск виртуальных машин или действий. `examples/course` сохраняет две VM, два Cloud шага и native явную проверку Core после успешного render; нового компилятора `_produced.yaml` или общего runtime нет.

Сейчас release pins ещё указывают на последние опубликованные теги. Новые install/demo/source refs появятся только после решения о версиях и успешных releases; новый URL до этого не выдумывается. Готовый asset должен содержать точный producer commit и фактические зависимости в `BUILD.json`. Эта подготовка не подтверждает render, CI или выпуск.
