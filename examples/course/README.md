# Пример Cloud

Нужны Quarto 1.10.18/1.11.5, CUE 0.17.1 и согласованное ядро курса.

```sh
quarto add ../../../quarto-course
quarto add ../..
quarto render --profile student
quarto render --profile full
```

Пример ожидает соседний checkout `quarto-course`. При установке из GitHub
укажите каталог владельца в путях Core hooks. После изменения расширений
повторите `quarto add`. Исходники и кеши Quarto остаются в каталоге примера;
выходы изолированы в `_book/student` и `_book/full`. `render.ts` вызывает ту же
native команду и проверяет её код завершения.

Core проверяет текущий AST и явно подключённый Cloud до student projection.
Полная сборка проверяет CUE всей модели и наличие внешнего `check.sh`.
Результат `_generated/course-spec/course.json` описывает Cloud; виртуальные
машины не создаются, команды действий не выполняются.
