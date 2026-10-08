---
type: implementation-report
component: quarto-course-cloud
status: completed
updated: 2026-10-08
---

# Cloud: внедрение 8 октября 2026

Это отчёт проверенных операций. Нормативные правила принадлежат
[текущим спецификациям](../../spec/index.md) того же ref; контракт выпуска
читается по точному immutable тегу.

Выпущен [v3.0.0](https://github.com/Afonenko-Course-Tools/quarto-course-cloud/releases/tag/v3.0.0), source SHA
`552612450b093b0cff2e33187a1cb5b9234c050a`, immutable Release ID `406379295`.
[PR #9](https://github.com/Afonenko-Course-Tools/quarto-course-cloud/pull/9)
прошёл проверки и слит с сохранением истории; дерево merged main равно tested PR head.
[Main CI](https://github.com/Afonenko-Course-Tools/quarto-course-cloud/actions/runs/37722463288)
завершился SUCCESS на указанном source SHA до публикации.

Core `v4.0.0`, Cloud `v3.0.0`; Quarto 1.11.5 / CUE 0.17.1.
Штатный remote-tag `quarto add` прошёл: все **10** установленных
пути и bytes совпали с upstream `_extensions` этого Git object, без overlay
и лишних файлов. Draft assets были скачаны и сверены до immutable публикации.

Frozen check/demo/model/ordinary matrix прошла: full/student, VM/platform guards, native membership и CLOUD005. Ready проверена через установленный current native loader; shell syntax и исключение private projects подтверждены.

Готовые группы выпущены в отдельном immutable
[demo-20261008](https://github.com/Afonenko-Course-Tools/quarto-course-cloud/releases/tag/demo-20261008)
на том же producer SHA; `BUILD.sourceDirty:false`. Native build, HTML, resources,
sourceLinks и actual outputs прошли; полный ready map совпал с downloaded archive.

| Группа | Asset | Файлов | Archive SHA-256 |
| --- | --- | ---: | --- |
| cloud | `cloud.tar.gz` | 22 | `fcce34efff234b1a8a476a7127a9cc608f5cd02f35e16e6072b48449b0f77eac` |

Native sourceRef — собственный tool tag, catalog source — demo tag; оба
указывают на тот же source SHA. Старые immutable tags/assets сохранены.

Cloud проверяет модель VM/действий; исполнение VM/команд в реальной среде не заявляется.

Нативный Windows прогон не заявляется. Узкие path/CUE-TEMP исправления Core 4.0.0
подтверждены fixtures; чужие warning streams сохраняются с фактическим exit.
Подробные receipts и общий результат — [центральный отчёт Core](https://github.com/Afonenko-Course-Tools/quarto-course/blob/main/docs/releases/2026-10-08-implementation.md).

Первый сохранённый owner history checkpoint: `2f8882ece4d126497956b66adfa73661b1d01941`.
Шаг 17 выполнен; actual before/after receipt: `3 LOCAL / 1 REMOTE; main, all tags/Releases, serving gh-pages и API-confirmed OPEN bot heads сохранены`.
Более поздний docs/history main не переименовывает опубликованный source SHA.

Восстановление финальных снимков: [SOURCE-MAP](https://github.com/Afonenko-Course-Tools/quarto-course-cloud/blob/2f8882ece4d126497956b66adfa73661b1d01941/docs/history/2026-10-08-completion/SOURCE-MAP.json). После проверки exact Git blobs только этот новый датированный snapshot-каталог удаляется из active docs; архивный commit остаётся reachable. Последние планы и cleanup receipts: [Git checkpoint](https://github.com/Afonenko-Course-Tools/quarto-course-cloud/blob/3c3774020191f66925b8567bbe8675aed42c01c9/docs/history/2026-10-08-completion/final-journals/2026-10-08-implementation.md); [общая квитанция](https://github.com/Afonenko-Course-Tools/quarto-course/blob/35ab45a60d3859c4aa584499e4a49c5b8b6f14bf/docs/history/2026-10-08-completion/final-cleanup/03-verified-cleanup.json).
