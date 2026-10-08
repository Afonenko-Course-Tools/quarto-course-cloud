# Демонстрационный курс Cloud

Авторская разметка текущего Git ref для `v3.0.0`.
Общая модель принадлежит Core `v4.0.0`; минимум — Quarto 1.11.5 и CUE 0.17.1.
[План владельца](../../docs/plans/2026-10-08-implementation.md) фиксирует
фактические проверки и дальнейший выпуск.

Для локального кандидата из корня репозитория Cloud:

```sh
CORE=/absolute/path/to/quarto-course bash tools/check-demo.sh
```

Установка закреплённых выпусков из каталога этой группы:

```sh
quarto add Afonenko-Course-Tools/quarto-course@v4.0.0 --no-prompt
quarto add Afonenko-Course-Tools/quarto-course-cloud@v3.0.0 --no-prompt
quarto run build.ts
```

Native source-ссылки ведут к tool tag `v3.0.0` того же producer commit.
Готовая группа выпускается в отдельном immutable Release `demo-20261008`.
`BUILD.json` фиксирует точный commit,
зависимости, профиль и `sourceDirty: false` для готового asset. Tool tag и demo tag
должны указывать на одну clean ревизию. HTML использует внешнее native действие
GitHub source, без source modal и копирования закрытых QMD в student output.

## Описание машин и проверка модели

В `tasks/_metadata.yml` явно включён банк с default open; упражнение имеет
собственные difficulty/time. Страница лабораторной находится вне банковской
области и назначает упражнение для пары, задавая `theory-time: 10` отдельно.
Время задачи не делится на размер пары.

Книга содержит две VM, два native `.cloud-step` и внешний файл проверки
`projects/service/check.sh`. `build.ts` сначала выполняет native full render,
затем проверяет его успешное завершение, вызывает текущий Core `check.ts . full`
и выбирает источник работы `sec-lab-01`. Student/full outputs разделены.

Код действий виден как учебный материал; сборка проверяет структуру и пути,
не создаёт VM и не исполняет действия. `_produced.yaml` и обмен с облачной
платформой не входят в эту поставку. Специальные `.cloud-step` сохраняются:
это контракт Cloud, а не удалённый общий Course блок `.step`.
[Справочник диагностики](../../docs/diagnostics.md).
