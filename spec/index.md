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
| [Авторская модель Core](../../quarto-course/spec/index.md) | specification/index | course-core | current |
| [Результат реализации](../docs/releases/2026-10-08-implementation.md) | implementation-report | cloud | historical |
| [Карта сохранённой истории](../docs/history-index.md) | history-index | cloud | current |

Cloud владеет extensions.cloud, VM/action/step декларациями и их CUE predicates. Core владеет банком, работами и assignments. Исполнение VM и экспорт _produced.yaml остаются вне реализованной поставки.

Версия пакета определяется [descriptor](../_extensions/course-cloud/_extension.yml) того же Git ref.
Quarto 1.11.5 и CUE 0.17.1 согласованы с текущими правилами Core.
Изменения main после выпущенного тега — **unreleased**.
Документация установленного выпуска читается из того же immutable tag, что и код.

## Кандидат 3.0.1

Авторская модель, CUE predicates и legacy Core 4.0.0 fixtures сохраняются.
Фасад ABI 1 наблюдает только command-операцию `course-cloud.validate-paths`.
Он добавляет `attributes.extension_id` и необязательный документ из публичного
`quarto.doc.input_file` при вызове; неизвестный документ остаётся без привязки.
Окружение передаётся scoped Pandoc API без глобальной мутации. Нового общего
runtime и полного семантического покрытия нет; VM/actions не исполняются.
Итоговые native/CI проверки и выпуск принимаются отдельно.
