---
type: index
component: cloud
status: current
---

# Спецификации Cloud

`current` описывает контракт данного Git ref; `accepted-next` — согласованное
будущее изменение, ещё не заявленное реализованным. `historical` сохраняет
provenance и не задаёт активных требований. `type` различает contract/schema/API,
vocabulary, architecture, reference и plan; `component` указывает владельца.

| Документ | type | component | status |
| --- | --- | --- | --- |
| [Контракт Cloud](contract.md) | contract | cloud | current |
| [Словарь адаптера](../_extensions/course-cloud/contract.json) | vocabulary | cloud | current |
| [VM/action и CUE constraints](../_extensions/course-cloud/spec/cloud.cue) | contract/schema | cloud | current |
| [Диагностика](../docs/diagnostics.md) | reference | cloud | current |
| [Целевой authoring contract Core](../../quarto-course/spec/authoring-model-next.md) | contract | core | accepted-next |
| [План владельца](../docs/plans/2026-10-08-implementation.md) | plan | cloud | accepted-next |
| [Карта сохранённой истории](../docs/history-index.md) | history-index | cloud | current |

Cloud владеет extensions.cloud, VM/action/step декларациями и их CUE predicates. Core владеет банком, работами и assignments. Исполнение VM и экспорт _produced.yaml остаются вне реализованной поставки.

Версия пакета определяется только
[`_extension.yml`](../_extensions/course-cloud/_extension.yml) **того же Git ref**.
Последний проверенный опубликованный tool tag — `v2.1.1`; его descriptor
содержит `2.1.1`. `main` до нового выпуска — **unreleased**, даже если
число в descriptor пока совпадает с предыдущим выпуском. Документация выпуска
читается из того же immutable tag, рабочий план не заменяет контракт этого tag.

Новая модель банка/assignments и минимум Quarto 1.11.5 / CUE 0.17.1 принимаются
по `accepted-next` одновременно с кодом, fixtures, README и выпуском владельца.
Этот индекс сам по себе не включает новый синтаксис. Существующие машинные
дескрипторы/workflow baseline пока сохраняются до соответствующего runtime шага.
