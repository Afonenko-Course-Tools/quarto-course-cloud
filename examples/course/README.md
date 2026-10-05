# Пример Cloud

Нужны Quarto 1.10.18/1.11.5, CUE 0.17.1 и согласованное ядро курса.

```sh
quarto add ../../../quarto-course
quarto add ../..
quarto run render.ts student
quarto run render.ts full
```

Пример ожидает соседний checkout `quarto-course`. При установке из GitHub
укажите каталог владельца в путях Core hooks. После изменения расширений
повторите `quarto add`. Исходники и кеши Quarto остаются в каталоге примера;
выходы изолированы в `_book/student` и `_book/full`. `render.ts` вызывает
native render, проверяет его код завершения и затем явно вызывает Core
`_extensions/course-core/entrypoints/check.ts` для текущего профиля.

Core проверяет текущий AST и явно подключённый Cloud до student projection.
Обычный `quarto render` проверяет текущие документы. Явный Core check после
успешного render собирает полную модель, проверяет CUE и наличие внешнего
`check.sh`, затем записывает `_generated/course-spec/course.json` с данными
Cloud. Виртуальные машины не создаются, команды действий не выполняются.
