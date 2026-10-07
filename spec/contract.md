---
type: contract
component: cloud
status: current
---

# Контракт Cloud

Адаптер явно подключается `course.adapters: [cloud]` и фильтром после Core.
Установка пакета сама по себе не активирует target. Core владеет общей моделью;
Cloud добавляет `extensions.cloud` и свои constraints.

[contract.json](../_extensions/course-cloud/contract.json) — единственный источник
имени адаптера, vocabulary классов/атрибутов/фаз и пути схемы.
[CUE cloud.cue](../_extensions/course-cloud/spec/cloud.cue) задаёт semantic predicates
VM/step/action и уникальности; generated vocabulary создаёт
[tools/sync-contract.ts](../tools/sync-contract.ts), вручную её не изменяют.

Задание с `target="cloud"` имеет ведущий заголовок и непосредственные шаги
`.cloud-step` с уникальным `key`. Действия `.cloud-action` задают language,
`phase`, `vm` и ровно один источник: inline code либо файл текущего проекта.
Фазы `check`, `solution`, `pre-step`, `post-step` принадлежат шагу; `prepare`
принадлежит странице работы. Для каждой VM шага требуется check; пары VM/phase,
ключи шагов и prepare для одной VM уникальны. Используемые VM объявляются
в `cloud.virtual-machines` работы с `template`.

Path guards сохраняют containment и реальные IO cause. `CLOUD001`…`CLOUD007`
и `CORE.ADAPTER_INVALID` сохраняют свою identity; диагностическая оболочка не
дублирует predicates CUE. Учебные назначения и audience projection принадлежат
[Core](../../quarto-course/spec/index.md).

Сборка проверяет описание и создаёт HTML. Команды действий/VM не запускаются,
экспорт `_produced.yaml` в этой поставке не реализован: `export_implemented:false`
в контракте адаптера. Native document fragments и полная текущая модель проверяются
на своих границах; DocumentResult без успешного завершения writer/hooks не
подтверждает успешность всего native процесса. Подключение и примеры —
[README](../README.md), известные IDs — [диагностика](../docs/diagnostics.md).
