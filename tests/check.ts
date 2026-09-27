import { copy } from "stdlib/fs";
import { dirname, fromFileUrl, join, resolve } from "stdlib/path";

const repo = dirname(dirname(fromFileUrl(import.meta.url)));
if (Deno.args.length !== 1) throw new Error("Запуск: quarto run tests/check.ts ПУТЬ_К_РЕПОЗИТОРИЮ_COURSE_CORE");
const core = resolve(Deno.args[0]);
const root = await Deno.makeTempDir({ prefix: "cloud-example-" });
const quarto = Deno.env.get("QUARTO") || "quarto";
function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
async function run(args: string[], expectedError?: string) {
  const result = await new Deno.Command(quarto, {
    args, cwd: root, stdout: "piped", stderr: "piped",
  }).output();
  const output = new TextDecoder().decode(result.stdout) + new TextDecoder().decode(result.stderr);
  assert(expectedError ? !result.success && output.includes(expectedError) : result.success, output);
}
async function exists(path: string) {
  try { await Deno.stat(path); return true; }
  catch (error) { if (error instanceof Deno.errors.NotFound) return false; throw error; }
}

try {
  await copy(join(repo, "examples/course"), root, { overwrite: true });
  await run(["add", core, "--no-prompt"]);
  await run(["add", repo, "--no-prompt"]);
  const render = ["render", "--fail-if-warnings"];
  await run(render);
  const modelPath = join(root, "_generated/course-spec/course.json");
  const model = JSON.parse(await Deno.readTextFile(modelPath));
  assert(await exists(join(root, "_book/index.html")), "Книга Cloud не собрана");
  assert(!("schema" in model.course), "Модель не должна содержать переключатель версии course.schema");
  assert(model.registeredTargets.includes("cloud"), "Контракт Cloud не найден");
  assert(model.exercises.length === 1 && model.assessments.length === 1, "Модель Cloud неполна");
  const steps = model.exercises[0].extensions.cloud.steps;
  assert(steps.length === 2, "Модель должна содержать оба шага Cloud");
  assert(steps[0].actions[0].source.file === "/projects/service/check.sh", "Потерян путь к внешнему файлу проверки");
  assert(Object.keys(model.assessments[0].extensions.cloud["virtual-machines"]).length === 2, "Модель должна содержать обе виртуальные машины");

  const configPath = join(root, "_quarto.yml");
  const config = await Deno.readTextFile(configPath);
  await Deno.writeTextFile(configPath, config.replace("  - course-core\n  - course-cloud", "  - course-cloud\n  - course-core"));
  await run(render, "course-core должен предшествовать");
  await Deno.writeTextFile(configPath, config);
  console.log("ПРОЙДЕНО: неверный порядок фильтров отклонён до извлечения закрытых данных");
  const taskPath = join(root, "tasks/index.qmd");
  const labPath = join(root, "labs/01.qmd");
  const task = await Deno.readTextFile(taskPath);
  const lab = await Deno.readTextFile(labPath);
  const secret = "ЗАКРЫТОЕ-ОБЛАЧНОЕ-ДЕЙСТВИЕ";
  const hidden = task.replace(/::::\s*$/, `::: {.when-full}

### Закрытый шаг {.cloud-step key="private"}

\`\`\`{.sh .cloud-action phase="solution" vm="client"}
${secret}
\`\`\`

:::
::::
`);
  await Deno.writeTextFile(configPath, config.replace("  validate: true", "  validate: true\n  view: student"));
  await Deno.writeTextFile(taskPath, hidden);
  await run(render);
  const publicModel = await Deno.readTextFile(modelPath);
  const publicHtml = await Deno.readTextFile(join(root, "_book/tasks/index.html"));
  assert(!publicModel.includes(secret) && !publicHtml.includes(secret), "Закрытое действие попало в студенческую модель или HTML");
  await Deno.writeTextFile(configPath, config);
  await Deno.writeTextFile(taskPath, task);
  console.log("ПРОЙДЕНО: скрытый вложенный блок удалён до извлечения Cloud");
  const cases = [
    { name: "отсутствие проверки", task: task.replace('phase="check"', 'phase="solution"'), lab, error: "CLOUD001" },
    { name: "повтор ключа шага", task: task.replace('key="client"', 'key="configure"'), lab, error: "CLOUD004" },
    { name: "необъявленная машина", task, lab: lab.replace("    client:\n      template: ubuntu-client\n", ""), error: "CLOUD005" },
    { name: "отсутствие внешнего файла", task: task.replace("/projects/service/check.sh", "/projects/service/missing.sh"), lab, error: "missing.sh" },
  ];
  for (const item of cases) {
    assert(item.task !== task || item.lab !== lab, `Тест не изменил исходные данные: ${item.name}`);
    await Deno.writeTextFile(taskPath, item.task);
    await Deno.writeTextFile(labPath, item.lab);
    // Ошибка сборки должна удалить и модель предыдущей успешной сборки.
    await Deno.writeTextFile(modelPath, JSON.stringify(model));
    await run(render, item.error);
    assert(!await exists(modelPath), `Сохранена устаревшая модель: ${item.name}`);
    console.log(`ПРОЙДЕНО, ошибка отклонена: ${item.name}`);
  }
  console.log("ПРОЙДЕНО Cloud: установка, интеграция с ядром, проверка CUE, две машины, внешний файл и отклонение неверной разметки");
} finally {
  await Deno.remove(root, { recursive: true });
}
