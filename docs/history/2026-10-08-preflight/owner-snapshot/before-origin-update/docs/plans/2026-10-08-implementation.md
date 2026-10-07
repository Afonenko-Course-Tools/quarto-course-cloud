# Cloud: план владельца

Статус: следующий этап, реализация не начата. Выполнять пункт 11 и затем
пункты 12–13/17–18 [линейного плана](../../../quarto-course/docs/plans/2026-10-08-course-tools-implementation.md).
[Целевой контракт Core](../../../quarto-course/spec/authoring-model-next.md)
задаёт поля банка/работ/назначений. Quarto 1.11.5 / CUE 0.17.1;
широкую Windows CI matrix не добавлять.

## Изменения, документация и проверки

Обновить `_extensions/course-cloud/{native,validate,actions,steps,contract}.lua`, `_extensions/course-cloud/validate-paths.ts`, filter только для уже известного context; сверить `_extensions/course-cloud/spec/cloud.cue`, `contract.json`, `tools/sync-contract.ts`. Несколько `.task-items` собираются в одно назначение с stage/workmode/requirement; activation остаётся явным bank/Core маршрутом, ordinary render не приобретает mandatory bank поля. CUE semantic predicates не дублировать в Lua/TS. Native wrapper получает known source/exercise/work/step/vm/field, сохраняет CUE stderr/cause; path guards получают CLOUD.ACTION_SOURCE_INVALID. CLOUD001…CLOUD007 и CORE.ADAPTER_INVALID сохраняются; IO refusal не описывать как доказанное нарушение учебного правила. Дополнительный formatter/registry ради нескольких строк не нужен.

Обновить `README.md`, создать `docs/diagnostics.md`, owner plan, `tests/{check,native-model,native-ordinary}.ts`, `examples/course` README/configs/QMD. Проверки: `quarto run tools/sync-contract.ts --check`, `quarto run tests/check.ts /home/tolya/course-tools/quarto-course`, аналогично `native-model`, `native-ordinary`, затем `CORE=/home/tolya/course-tools/quarto-course bash tools/check-demo.sh`. Проверить undeclared VM/missing field/action path escape/missing source/native CUE refusal. HTML и CUE проверка не заявляют реальное VM исполнение.

## Завершение

Оформить актуальный индекс спецификаций, README и собственный справочник
диагностик; примеры показывают правильную русскую авторскую разметку.
Старые plans/probes сохранить в Git до удаления из активной ветки.

Сверить свежие required checks и owner PR, слить в main и проверить merged SHA.
Выпустить новую версию с точными уже выпущенными зависимостями; готовую группу
демо, если она есть, выпускать отдельным проверенным asset. Старые Releases
не заменять. Финальная очистка веток только после общего маршрута:
main + служебная gh-pages, если используется, + heads OPEN automatic PR.
Здесь сохранить commit/PR/tag/SHA, фактические проверки и ссылки на готовые assets.
