---
type: plan
component: cloud
status: in-progress
---

# Cloud: план владельца

Статус: текущие runtime и авторские документы подготовлены на рабочей ветке;
финальные совместные проверки, merge/CI и выпуск остаются отдельными gates. Выполнять пункт 11 и затем
пункты 12–13/17–18 [линейного плана](../../../quarto-course/docs/plans/2026-10-08-course-tools-implementation.md).
[Текущие контракты Core](../../../quarto-course/spec/index.md)
задают поля банка/работ/назначений. Quarto 1.11.5 / CUE 0.17.1;
широкую Windows CI matrix не добавлять.

## Изменения, документация и проверки

Обновить `_extensions/course-cloud/{native,validate,actions,steps,contract}.lua`, `_extensions/course-cloud/validate-paths.ts`, filter только для уже известного context; сверить `_extensions/course-cloud/spec/cloud.cue`, `contract.json`, `tools/sync-contract.ts`. Несколько `.task-items` собираются в одно назначение с stage/workmode/requirement; activation остаётся явным bank/Core маршрутом, ordinary render не приобретает mandatory bank поля. CUE semantic predicates не дублировать в Lua/TS. Native wrapper получает known source/exercise/work/step/vm/field, сохраняет CUE stderr/cause; path guards получают CLOUD.ACTION_SOURCE_INVALID. CLOUD001…CLOUD007 и CORE.ADAPTER_INVALID сохраняются; IO refusal не описывать как доказанное нарушение учебного правила. Дополнительный formatter/registry ради нескольких строк не нужен.

Обновить `README.md`, уточнить существующий `docs/diagnostics.md`, owner plan, `tests/{check,native-model,native-ordinary}.ts`, `examples/course` README/configs/QMD. Проверки: `quarto run tools/sync-contract.ts --check`, `quarto run tests/check.ts /home/tolya/course-tools/quarto-course`, аналогично `native-model`, `native-ordinary`, затем `CORE=/home/tolya/course-tools/quarto-course bash tools/check-demo.sh`. Проверить undeclared VM/missing field/action path escape/missing source/native CUE refusal. HTML и CUE проверка не заявляют реальное VM исполнение.

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


## Подготовка шагов 1–2 — 8 октября 2026

Общий старт: 02:36 Europe/Minsk; deadline: 11:36 (9 часов). Root назначил
документальной задаче reasoning ultra; модель исполнителя не менялась.

- Рабочая ветка: `feat/authoring-model-20261008`, создана в исходном checkout
  перед сохранением материалов; пользовательский `main` не сбрасывался.
- Preservation commit: `18f2b0819524d38f155bd4aae18009f6d9579bb1`. Dirty/untracked планы сохранены до
  включения свежего `origin/main` `0b40976eba946e626b5f70794dad2ddbc4b300ad`. Этот upstream соответствует
  опубликованному `v2.1.1` и является предком текущего рабочего дерева.
- [Карта истории, source provenance и восстановление](../history-index.md).
  Полные snapshot/source-state/SHA256 карты сохранены в Git commit
  `3a7bfb8311cb64bc3d7996bab4297af401e195cf`, затем убраны из active tree после координации.
  Исходники root остались без изменений; локальные и upstream owner планы
  сохранены отдельно с provenance refs.
- Один исходный worktree; существующие local heads не имеют уникальных
  коммитов относительно свежего origin/main. Ветки, теги и Releases сохранены.
- Ignored native `_book/full` оставлен на месте; substantive `BUILD.json` сохранён (sourceDirty:true), HTML/assets не считаются авторскими материалами.
- CI и demo installation: Core `v3.0.2`, Cloud `v2.1.1`.
- README выделяет [текущий индекс](../../spec/index.md) и контракт; `main`
  явно unreleased. Типы/владельцы/status отделяют current и accepted-next.

OPEN PR: нет по свежему gh pr list; новые PR на этом этапе не создавались.
Tool Release `v2.1.1` подтверждён свежим `gh release list`, draft/prerelease
false. Демонстрации `demo-20261007-ru1` подтверждены тем же read-only запросом.

Фактическая проверка подготовки: свежий `git fetch origin --prune --tags`,
`gh pr list`, `gh release list`; SHA256 и bytes каждого сохранённого snapshot;
`git diff --check`/`git diff --cached --check`; ancestry `origin/main` и
отсутствие unresolved merge markers; локальные ссылки README/index/контрактов.
Runtime tests и CI здесь не запускались: код импортирован из опубликованного
upstream и не изменён исполнителем. Старые evidence/CI не принимаются за новые
проверки. Свежая runtime матрица принадлежит последующему пункту владельца.

Ruling: свежий upstream уже содержит диагностику 7 октября; дальнейший шаг
проверяет и дополняет реальный код, а не повторяет старый unchecked план.
Конфликтующие owner планы сохранены в обеих версиях; active historical текст
берётся из свежего upstream, а нынешний маршрут — только этот plan/accepted-next.
Цена ошибки — лишняя история, без потери исходных документов.

Ruling: после координации сохранённые historical snapshots и старые owner
plans/probes убраны из active tree; восстановимые SHA/paths указаны в карте истории.
Root и пользовательские worktrees не удалялись. Текущие spec/docs и план 8 октября
сохранены; transferred decisions закреплены в current/accepted-next контрактах.

Блокирующих расхождений для подготовки нет. Baseline ещё содержит Quarto 1.10.x
в workflows и descriptor; удалить одновременно с runtime/README/examples на пункте владельца.
Следующий шаг ждёт новый текущий Core contract/Body; новые поля не заявлены
поддерживаемыми данным preflight. Merge в shared main, push, CI, release и
публикация не выполнялись.

Проверка Git snapshot blobs выявила, что ignore `**/_book/` исключал архивную
копию BUILD.json. До cleanup файл сохранён в neutral path
`ignored-snapshot/cloud-full-BUILD.json`; все 21 bytes/SHA256 проверены через
`git show` из исправленного preservation commit. Исходный ignored файл сохранён.


## Подготовка документации пункта 11 — 8 октября 2026

Документационный исполнитель работает по принятым Core решениям; модель не
менялась. Добавлена [сохранённая подготовка авторства](https://github.com/Afonenko-Course-Tools/quarto-course-cloud/blob/24984818a5565bf9324b4b39f0d307246a73a072/docs/authoring-next.md) `accepted-next`,
ссылки из README и индекса. Существующие current API/контракты не объявлены
мигрированными до проверки runtime. Примеры на этой ветке предназначены для
следующей модели; native ordinary Quarto сохранён вне bank opt-in.

- Свежая проверка: `git diff --check`; 32 локальных Markdown-ссылок
  README/spec/docs/плана/README примеров существуют; 4 авторских YAML
  файлов успешно прочитаны. Проверка исключает generated/dependency деревья.
- Активные примеры не содержат старых kinds exam/handout, solution `for`,
  fixture sentinel/literal текста и Quarto 1.10.x. Русский lang сохраняется,
  публичные native проекты задают `fail-if-warnings: true`.
- Машинные descriptors/workflows и runtime/tests не изменялись этим исполнителем.
  Старые выпущенные dependency/demo/source pins сохранены как baseline;
  **новые release pins ожидают решения о версиях и фактических Releases**.

- Статически сверены банковские области: `examples/course` — 1 задач / 1 работ. Для каждой задачи собственные difficulty/time и эффективная open/restricted policy; ID состава существуют, не повторяются, test/practical назначают только restricted. Это проверка разметки, не native AST/render.

Full dependent suites/CI/render против меняющегося Core здесь не запускались.
Следующий runtime исполнитель выполняет команды выше, проверяет текущие
student/full outputs и выбранный экспорт, после чего документальная подготовка
переносится в current README/контракт. Merge/push/release/публикация не выполнены.


## Текущие контракты и release-pinned примеры — 8 октября 2026

Документальный commit: `d5538492b04fab26672a76a676fe95afa3d96177`.
Принята версия `v3.0.0`; descriptor подготовлен отдельным runtime
исполнителем. На момент этой записи новые Releases ещё не опубликованы;
merge/main, финальный CI, готовая release-сборка и публикация выполняются root
по линейному плану. Эта запись не подтверждает общий финальный integration gate.

- Правила подготовки перенесены в действующие README/spec/тематические docs.
  `current` описывает код того же ref; документация выпуска читается из того же
  immutable tag. В README/examples нет временных заявлений о доступности Release.
- `docs/authoring-next.md` удалён только после проверки точного Git blob
  `a1c456f31cb9e29dbe3ff7a7666f1f1ed40f769b` на commit
  `24984818a5565bf9324b4b39f0d307246a73a072`; восстановление записано в карте истории.
- Install/source/BUILD pins задают Core `v4.0.0`, Publisher `v5.0.0`, QRC `v3.0.0`
  и свою новую версию там, где эти зависимости используются. Native source-ссылки
  ведут на tool tag производителя; планируемый demo tag — `demo-20261008`,
  из того же clean producer SHA с `BUILD.sourceDirty: false`. Download не получает
  собственного demo Release. Механизм provenance/build runtime не менялся.
- Свежая статическая проверка: 5 YAML/front matter без повторных
  ключей, 28 существующих локальных Markdown-ссылок, 1 native
  source-конфигураций. У всех public base `_quarto.yml` — `lang: ru` и
  `fail-if-warnings: true`. Активные авторские документы не содержат Quarto 1.10,
  старой requirements карты/kinds, solution for и переходных contract ссылок.
- examples/course: 1 задач, 1 работ, 1 назначений
  Это проверка авторской разметки и ссылок, не native AST/render.
- `git diff --check` и staged whitespace — PASS. `deno fmt --check`
  существующих build/build-info scripts — PASS там, где они есть. Публичные
  API, runtime/tests/.github/CI этим документальным исполнителем не изменены.

Команды проверки и полные результаты: `/tmp/consumer-docs-final-20261008/verify.py`,
`bank-check.py`, `verify.log`, `bank-check.log`, `checks.json`, `bank-checks.json`.
Широкие native suites и release demo builds здесь не запускались параллельно:
их свежие результаты записывает отдельный integration исполнитель и root.
