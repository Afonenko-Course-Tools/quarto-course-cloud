# Результаты Cloud — 7 октября 2026

План: `docs/plans/diagnostics-refactoring-plan.md`; база: `2915cee`.
Локальное исполнение CL1 → CL2; итоговое независимое ревью и выпуск ведёт координатор.

Pre-flight: CL1 задаёт контекст, который CL2 объясняет в справочнике. Общая модель
и экспортный API Core не меняются. Для проверки используется согласованный
кандидат Core `eb7743e` из соседнего изолированного checkout.

Ruling: `actions.lua` и `steps.lua` не меняются — нужный контекст доступен в
существующих извлечённых данных; добавление технических полей в payload
потребовало бы изменения закрытых CUE-структур. Цена ошибки: расширение
контекста потребуется в следующем изменении, текущее описание остаётся полным.

Ruling: недоступность/отсутствие файла остаётся внешней IO-причиной — `realPath`
прерывался до прежнего guard; только прежние semantic path/nonfile guards
получают `CLOUD.ACTION_SOURCE_INVALID`. Цена ошибки: автор видит исходный
`NotFound` и русский контекст вместо semantic ID для недоступного файла.

Ruling: ошибки CUE не разбираются для назначения ID; обёртка добавляет доступный
контекст всего кандидата, исходный CUE определяет нарушенное поле. Цена ошибки:
при нескольких шагах связанных объектов больше, чем только нарушенный шаг.

RED: `tests/check.ts` на Quarto 1.10.18 отклонил шаг без `key` исходным CUE,
но проверка сообщения упала из-за отсутствия `источник=tasks/index.qmd`.
RED: `tests/native-model.ts` показал `CLOUD001_check`, но отсутствие контекста
в реальной Lua-обёртке. Повтор с исходным `validate-paths.ts` показал отсутствие
нового ID/контекста у path guard. Логи: `/tmp/cloud-red.log`,
`/tmp/cloud-model-red.log`, `/tmp/cloud-paths-red.log`.

GREEN (узкая проверка): `tests/native-model.ts` на Quarto 1.10.18 проверил
существующие CUE IDs, исправленные кандидаты, optional context, исходный
отказ внешнего исполняемого файла (exit 37, stdout/stderr), semantic path guards,
внешний `NotFound` и прежний вызов проверки пути без контекста.
Полная матрица и итоговые результаты дополняются после проверки.

Ruling: локальная обёртка CUE завершается через встроенный `assert(false, …)` —
Quarto переопределяет глобальный `error()` для журнала. Начальный полный прогон
показал печать отказа скрытой неверной фазы при успешной native-команде;
`tests/check.ts` это обнаружил. Цена ошибки: повторное ослабление guard приведёт
к успешной сборке неверного кандидата, что теперь проверяется интеграционным тестом.
Лог этого обнаружения: `/tmp/cloud-check-green.log` (прогон НЕ зелёный).

Ruling: недоступная относительная ссылка на общий spec в скопированном плане
не блокирует работу — согласованные требования взяты из `evidence/cloud-brief.md`,
предоставленного координатором. Цена ошибки: дополнительное уточнение при
финальном общем ревью; runtime/API и исходные CUE-предикаты сохранены.

CL1: complete — Quarto 1.10.18 и 1.11.5, CUE v0.17.1: `sync-contract.ts --check`,
`tests/native-model.ts CORE`, `tests/native-ordinary.ts CORE`, `tests/check.ts CORE`
завершились с кодом 0. CORE — соседний согласованный checkout `quarto-course`.
Проверены исходные CUE IDs, contextual отказ скрытой неверной фазы, обязательный
key шага, локальная/междокументная undeclared VM, выход symlink за корень,
внешний missing file, исправленные inputs, optional role/difficulty и отсутствие
активации установленного Cloud без `course.adapters`.
Логи: `/tmp/cloud-matrix-1.10.18/` и `/tmp/cloud-matrix-1.11.5/`.
`git diff --check` и Deno fmt --check для пяти изменённых TS-файлов — код 0.
Исходные `spec/cloud.cue`, `contract.json`, фильтр активации, predicates действий
и виртуальных машин не менялись. Общего runtime или повторного CUE-валидатора нет.

CL2: complete — русские README, собственные пояснения демонстрационных TS и
`docs/diagnostics.md` готовы. Веб-книга уже имела `lang: ru` и ссылки на source;
QMD, source refs, версии и финальные dependency pins оставлены координатору.
`CORE=… bash tools/check-demo.sh` завершился кодом 0 на Quarto 1.10.18 и 1.11.5.
Полная web-команда с `--fail-if-warnings` успешна. В отдельном исходном JSON-pass
выбранного `collectExport` Quarto печатает `Unable to resolve crossref @sec-tasks`
(по четыре предупреждения на версию); policy не менялась, этот pass завершился
успешно. HTML/CUE/export не подтверждают запуск VM или команды действия.

Final review: авторская проверка всего diff; независимое ревью выполняет
координатор. Проверены undeclared VM, missing step key, path outside, missing
source, внешнее падение CUE с кодом/stdout/stderr. Необязательные metadata и
activation сохранены; новые counterexample QMD в демонстрацию не добавлялись.
Отложенных minor-изменений нет. Локальный remote CI, push, PR, merge, release,
Pages publishing и реальная облачная инфраструктура не запускались.

## Scoped fix round 1 — third review M1

База исправления: `c6f8f1a`. Third review подтвердил неверный provenance: при
`assessment.id: vm-lab` и заголовке `{#sec-service}` Cloud выдавал ID заголовка
за ID работы. Core уже устанавливает проверенный `course-assessment-id` до
вызова adapter validation. Контекст теперь использует его первым, затем
явный `assessment.id`, затем прежний fallback на первый Header.

RED → GREEN на обеих версиях Quarto: новый `tests/native-context.ts` проходит
реальную installed/native цепочку. RED сохранял `CLOUD005_declaredVm`, но
выдавал `связано: объект=sec-service, поле=cloud.virtual-machines` вместо
`vm-lab`. GREEN проверяет VM-отказ, отказ source.file prepare, документ без
отдельного заголовка и успешный исправленный input. Регрессия подключена к
штатному `tests/check.ts`, поэтому не выпадает из последующих проверок CI.

Затронутые `native-model`, `native-ordinary`, `check` — exit 0 на Quarto
1.10.18 и 1.11.5. Deno fmt --check и git diff --check — exit 0. Полная матрица
vocabulary/demo не повторялась: CUE, словарь, action/VM/membership/activation
predicates, аргументы CUE, transport fields и demo не менялись. Логи RED/GREEN
и затронутых suites: `evidence/cloud/fix-round1/` вне репозитория расширения.

Ruling: полученный от Core проверенный ID приоритетен — исходная работа может
иметь другой Header ID или не иметь Header в native AST. Fallback сохраняется
для маршрута без этого метаполя. Цена ошибки: недостоверный/отсутствующий ID в
сообщении; это теперь ловит реальная native-регрессия. Новые ID, pins, versions,
source refs и remote-действия не добавлялись. M1 исправлен; финальное scoped
re-review остаётся координатору.
