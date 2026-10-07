> Исторический план/исследование. Актуальный маршрут от 8 октября 2026: [план владельца](2026-10-08-implementation.md).
> Исходный текст сохранён без правок; его старые статусы и конфликтующие правила не действуют.
> Нужные материалы сохранить в Git до удаления из активной ветки.

# План рефакторинга диагностики Cloud — 7 октября 2026

Для исполнения: subagent-driven-development либо executing-plans по выбранному
способу. **Цель:** понятные русские обёртки вокруг существующих правил Cloud
с контекстом упражнения/шага/VM и сохранением CUE identity.
**Архитектура:** Core adapter activation → validate.lua/native CUE → projection
и adapter facts → cross-document CUE. Реальное VM исполнение не добавляется.
**Средства:** существующие Lua/Deno/CUE; **основание:** [общий план](../../../specs/course-change-plan.md#исследование-и-план-рефакторинга-7-октября-2026).
База main `2915cee`, подтверждена через GitHub.

CLOUD001_check…CLOUD007_uniquePrepare и CORE.ADAPTER_INVALID сохраняются;
нет нового registry/report или дублирующего CUE validator. Internal контрпримеры
не публикуются, инструментальный CI не получает новой политики предупреждений.
При ревью проверить: undeclared VM, шаг без нужного поля, action path outside,
missing source file, внешний отказ CUE. Проверки привязаны к задаче CL1.

## CL1 Минимальный контекст существующих проверок

Изменить: `_extensions/course-cloud/native.lua`, `validate.lua`, `validate-paths.ts`,
`actions.lua`, `steps.lua`, `contract.lua`; filter только если нужен известный context.
`native.vet(value,definition)` получает optional context как третий аргумент;
context — input source, exercise/work/step/vm/field. Там, где контекста нет,
обёртка не выдумывает source ranges и не выполняет дополнительный source pass.
Новый `CLOUD.ACTION_SOURCE_INVALID` назначается прежним неименованным path guards;
нынешний CLOUD005_declaredVm не переименовывается.

- [ ] Дополнить tests/check.ts/native-model.ts текущими IDs и доступным
  контекстом; исправленный input проходит. Ordinary render сохраняет необязательные
  role/difficulty и нынешнюю область активации адаптера.
- [ ] Перевести только собственные пояснения, сохранить CUE stderr/cause;
  IO/tool failure не описывать как доказанное нарушение учебного правила.
- [ ] Выполнить `quarto run tests/check.ts /home/tolya/course-tools/quarto-course`,
  native-model и native-ordinary с тем же Core аргументом на обеих версиях.
- [ ] Проверка изменений и коммит, CUE predicates/контракт действия и VM остаются прежними.

## CL2 Русская документация и корректная группа

Создать: `docs/diagnostics.md`; изменить: README и `examples/course` README/QMD
с английскими пояснениями. Web book уже русский; нужные самостоятельные
проекты получают native lang ru, source/repo/code-links по назначению.

- [ ] Таблица текущих CLOUD IDs и новых path IDs, контекст и исправление,
  без ошибочных QMD. Описать экспорт/HTML отдельно от подтверждения реальной VM.
- [ ] Перевести свои объяснения, сохранить API/VM/action identifiers и чужие
  сообщения. Не добавлять библиотеку/общий formatter ради нескольких строк.
- [ ] Выполнить `CORE=/home/tolya/course-tools/quarto-course bash tools/check-demo.sh`,
  штатный native/CI набор, проверка изменений и PR. Ready release следует общему плану групп;
  не заявлять тестирование облачной инфраструктуры по успешному HTML.
