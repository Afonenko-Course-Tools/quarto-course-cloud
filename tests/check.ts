import {
  renderNative,
  selectedDocument,
  verifyInstalled,
} from "./native-render.ts";
import { copy } from "stdlib/fs";
import { dirname, fromFileUrl, join, resolve } from "stdlib/path";

const repo = dirname(dirname(fromFileUrl(import.meta.url)));
if (Deno.args.length !== 1) {
  throw new Error(
    "Запуск: quarto run tests/check.ts ПУТЬ_К_РЕПОЗИТОРИЮ_COURSE_CORE",
  );
}
const core = resolve(Deno.args[0]);
const root = await Deno.makeTempDir({ prefix: "cloud-example-" });
const quarto = Deno.env.get("QUARTO") || "quarto";
function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
let renderedRoot = root;
async function run(
  args: string[],
  expectedError?: string,
  profile: "student" | "full" = "student",
) {
  if (args[0] === "render") {
    const result = await renderNative(root, profile);
    renderedRoot = result.stage;
    assert(
      expectedError
        ? !result.ok && result.text.includes(expectedError)
        : result.ok,
      result.text,
    );
    return result.text;
  }
  const result = await new Deno.Command(quarto, {
    args,
    cwd: root,
    stdout: "piped",
    stderr: "piped",
  }).output();
  const output = new TextDecoder().decode(result.stdout) +
    new TextDecoder().decode(result.stderr);
  assert(
    expectedError
      ? !result.success && output.includes(expectedError)
      : result.success,
    output,
  );
}
async function exists(path: string) {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return false;
    throw error;
  }
}

try {
  await copy(join(repo, "examples/course"), root, { overwrite: true });
  // A clean checkout has no installed payload/cache; local copies must match it.
  for (const name of ["_extensions", "_generated", "_book", ".quarto"]) {
    try {
      await Deno.remove(join(root, name), { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
  }
  await run(["add", core, "--no-prompt"]);
  await Deno.mkdir(join(root, "_extensions/Afonenko-Course-Tools"), {
    recursive: true,
  });
  await Deno.rename(
    join(root, "_extensions/course-core"),
    join(root, "_extensions/Afonenko-Course-Tools/course-core"),
  );
  await run(["add", repo, "--no-prompt"]);
  await verifyInstalled(root, repo, "cloud");
  const render = ["render", "--fail-if-warnings"];
  await run(render);
  const modelPath = () =>
    join(renderedRoot, "_generated/course-spec/course.json");
  const model = JSON.parse(await Deno.readTextFile(modelPath()));
  assert(
    await exists(join(renderedRoot, "_book/student/index.html")),
    "Книга Cloud не собрана",
  );
  assert(
    !("schema" in model.course),
    "Модель не должна содержать переключатель версии course.schema",
  );
  assert(model.registeredTargets.includes("cloud"), "Контракт Cloud не найден");
  assert(
    model.exercises.length === 1 && model.assessments.length === 1,
    "Модель Cloud неполна",
  );
  assert(
    model.exercises[0].purpose === "independent-study" &&
      model.exercises[0].difficulty === "introductory" &&
      model.exercises[0].sourceTopic.id === "sec-service-topic",
    "Потеряны назначение, сложность или авторская тема Cloud",
  );
  const steps = model.exercises[0].extensions.cloud.steps;
  assert(steps.length === 2, "Модель должна содержать оба шага Cloud");
  assert(
    steps[0].actions[0].source.file === "/projects/service/check.sh",
    "Потерян путь к внешнему файлу проверки",
  );
  assert(
    Object.keys(model.assessments[0].extensions.cloud["virtual-machines"])
      .length === 2,
    "Модель должна содержать обе виртуальные машины",
  );

  await run(render, undefined, "full");
  assert(
    await exists(join(renderedRoot, "_book/full/index.html")),
    "Полная книга Cloud не собрана",
  );
  assert(
    JSON.parse(await Deno.readTextFile(modelPath())).exercises.length === 1,
    "Полная модель Cloud неполна",
  );

  await selectedDocument(root, "labs/01.qmd", "full");
  await run(render, undefined, "student");
  assert(
    await exists(join(root, "_book/full/index.html")),
    "Student render удалил выход full",
  );
  const currentStudent = await Deno.readTextFile(modelPath());
  assert(
    JSON.parse(currentStudent).course.view === "student",
    "Current Course сохранил full context",
  );
  // Retained local full sidecars are not the current native run inventory.
  assert(
    await exists(join(root, "_generated/course-spec/adapters/cloud/full")),
    "Не сохранён локальный full sidecar",
  );

  const configPath = join(root, "_quarto.yml");
  const config = await Deno.readTextFile(configPath);
  await Deno.writeTextFile(
    configPath,
    config.replace(
      "  - course-core\n  - course-cloud",
      "  - course-cloud\n  - course-core",
    ),
  );
  await Deno.mkdir(join(root, "_generated/course-spec"), { recursive: true });
  await Deno.writeTextFile(
    join(root, "_generated/course-spec/course.json"),
    JSON.stringify(model),
  );
  await run(render, "course-core должен предшествовать");
  assert(
    !await exists(modelPath()),
    "Ранний отказ порядка фильтров оставил устаревшую модель",
  );
  await Deno.writeTextFile(configPath, config);
  console.log(
    "ПРОЙДЕНО: неверный порядок фильтров отклонён до извлечения закрытых данных",
  );
  const taskPath = join(root, "tasks/index.qmd");
  const labPath = join(root, "labs/01.qmd");
  const task = await Deno.readTextFile(taskPath);
  const lab = await Deno.readTextFile(labPath);
  const secret = "ЗАКРЫТОЕ-ОБЛАЧНОЕ-ДЕЙСТВИЕ";
  const hidden = task.replace(
    /::::\s*$/,
    `::: {.content-visible when-profile="full"}

### Закрытый шаг {.cloud-step key="private"}

\`\`\`{.sh .cloud-action phase="check" vm="client"}
${secret}
\`\`\`

:::
::::
`,
  );
  await Deno.writeTextFile(
    configPath,
    config.replace("  validate: true", "  validate: true\n  view: student"),
  );
  await Deno.writeTextFile(taskPath, hidden);
  await run(render);
  const publicModel = await Deno.readTextFile(modelPath());
  const publicHtml = await Deno.readTextFile(
    join(renderedRoot, "_book/student/tasks/index.html"),
  );
  assert(
    !publicModel.includes(secret) && !publicHtml.includes(secret),
    "Закрытое действие попало в студенческую модель или HTML",
  );
  await Deno.writeTextFile(configPath, config);
  await Deno.writeTextFile(taskPath, task);
  console.log("ПРОЙДЕНО: скрытый вложенный блок удалён до извлечения Cloud");
  await Deno.symlink("/etc/passwd", join(root, "projects/service/escape.sh"));
  await Deno.writeTextFile(
    labPath,
    lab.replace(
      "::: {.task-items}",
      ':::: {.content-visible when-profile="full"}\n\n::: {.task-items}',
    ) + "\n::::\n",
  );
  await run(render);
  for await (
    const file of Deno.readDir(
      join(root, "_generated/course-spec/adapters/cloud/student"),
    )
  ) {
    const fragment = JSON.parse(
      await Deno.readTextFile(
        join(root, "_generated/course-spec/adapters/cloud/student", file.name),
      ),
    );
    if (fragment.source === "labs/01.qmd") {
      assert(
        !fragment.assessment,
        "Скрытая Cloud assessment оставила private adapter metadata в student sidecar",
      );
    }
  }
  await Deno.writeTextFile(labPath, lab);
  const hiddenLocal = `## Закрытая тема {#sec-hidden-topic}

::::: {.content-visible when-profile="full"}

:::: {#exr-hidden target="cloud" course-role="control" difficulty="introductory"}
## Закрытая проверка

### Проверка {.cloud-step key="hidden"}

\`\`\`{.sh .cloud-action phase="check" vm="undeclared"}
echo ready
\`\`\`
::::
:::::

`;
  const hiddenMissingMachines = `---
assessment:
  kind: lab
---

# Закрытая лабораторная {#sec-lab-01}

${hiddenLocal}
::: {.content-visible when-profile="full"}

::: {.task-items}
1. @exr-hidden
:::
:::
`;
  const cases = [
    {
      name: "шаг без обязательного key",
      task: task.replace(' key="configure"', ""),
      lab,
      error: "key",
      context: [
        "источник=tasks/index.qmd",
        "объект=exr-service",
        "поле=extensions.cloud",
        "cue",
      ],
    },
    {
      name: "скрытая локальная VM без cloud.virtual-machines",
      task,
      lab: hiddenMissingMachines,
      error: "CLOUD005_declaredVm",
      context: [
        "источник=labs/01.qmd",
        "объект=exr-hidden",
        "undeclared",
        "hidden",
      ],
    },
    {
      name: "скрытая локальная необъявленная VM",
      task,
      lab: lab.replace(
        "::: {.task-items}",
        hiddenLocal + "::: {.task-items}",
      ).replace("1. @exr-service", "1. @exr-service\n2. @exr-hidden"),
      error: "CLOUD005_declaredVm",
      context: [
        "источник=labs/01.qmd",
        "объект=exr-hidden",
        "undeclared",
        "hidden",
      ],
    },
    {
      name: "скрытая неверная фаза",
      task: task.replace(
        /::::\s*$/,
        `::: {.content-visible when-profile="full"}

### Закрытая проверка {.cloud-step key="hidden"}

\`\`\`{.sh .cloud-action phase="invalid" vm="host"}
PRIVATE-INVALID
\`\`\`

:::
::::
`,
      ),
      lab,
      error: "phase",
      context: [
        "источник=tasks/index.qmd",
        "объект=exr-service",
        "поле=extensions.cloud",
        "hidden",
      ],
    },
    {
      name: "скрытый внешний symlink",
      task: task.replace(
        /::::\s*$/,
        `::: {.content-visible when-profile="full"}

### Закрытая проверка {.cloud-step key="hidden"}

\`\`\`{.sh .cloud-action phase="check" vm="client" file="/projects/service/escape.sh"}
\`\`\`

:::
::::
`,
      ),
      lab,
      error: "CLOUD.ACTION_SOURCE_INVALID",
      context: [
        "источник=tasks/index.qmd",
        "объект=exr-service",
        "поле=source.file",
        "hidden",
        "client",
        "/projects/service/escape.sh",
      ],
    },
    {
      name: "отсутствие проверки",
      task: task.replace('phase="check"', 'phase="solution"'),
      lab,
      error: "CLOUD001_check",
      context: [
        "источник=tasks/index.qmd",
        "объект=exr-service",
        "configure",
        "host",
      ],
    },
    {
      name: "повтор ключа шага",
      task: task.replace('key="client"', 'key="configure"'),
      lab,
      error: "CLOUD004_uniqueSteps",
      context: ["источник=tasks/index.qmd", "объект=exr-service"],
    },
    {
      name: "необъявленная машина",
      task,
      lab: lab.replace("    client:\n      template: ubuntu-client\n", ""),
      error: "CLOUD005_declaredVm",
      context: ["sec-lab-01", "exr-service", "client"],
    },
    {
      name: "отсутствие внешнего файла",
      task: task.replace(
        "/projects/service/check.sh",
        "/projects/service/missing.sh",
      ),
      lab,
      error: "ExternalToolFailure",
      context: [
        "источник=tasks/index.qmd",
        "объект=exr-service",
        "поле=source.file",
        "missing.sh",
        "NotFound",
      ],
    },
  ];
  for (const item of cases) {
    assert(
      item.task !== task || item.lab !== lab,
      `Тест не изменил исходные данные: ${item.name}`,
    );
    await Deno.writeTextFile(taskPath, item.task);
    await Deno.writeTextFile(labPath, item.lab);
    // Ошибка сборки должна удалить и модель предыдущей успешной сборки.
    await Deno.mkdir(join(root, "_generated/course-spec"), { recursive: true });
    await Deno.writeTextFile(
      join(root, "_generated/course-spec/course.json"),
      JSON.stringify(model),
    );
    const failure = await run(render, item.error);
    for (const context of item.context) {
      assert(
        failure?.includes(context),
        `Потерян контекст ${context}: ${failure}`,
      );
    }
    assert(
      !await exists(modelPath()),
      `Сохранена устаревшая модель: ${item.name}`,
    );
    console.log(`ПРОЙДЕНО, ошибка отклонена: ${item.name}`);
  }
  // An unknown cross-document member cannot be assigned a local VM requirement.
  await Deno.writeTextFile(taskPath, task);
  await Deno.writeTextFile(
    labPath,
    lab.replace(
      /cloud:\n  virtual-machines:\n(?:    [^\n]+\n      template: [^\n]+\n)+/,
      "",
    ),
  );
  await selectedDocument(root, "labs/01.qmd", "student");
  console.log(
    "ПРОЙДЕНО: неизвестный междокументный member без VM остаётся deferred локально",
  );
  await Deno.writeTextFile(
    configPath,
    config.replace("adapters: [cloud]", "adapters: []"),
  );
  await Deno.writeTextFile(
    taskPath,
    task.replace('target="cloud"', 'target="manual"'),
  );
  await Deno.writeTextFile(labPath, lab);
  await run(render);
  const inactive = JSON.parse(await Deno.readTextFile(modelPath()));
  assert(
    JSON.stringify(inactive.registeredTargets) === '["manual"]' &&
      !inactive.exercises[0].extensions.cloud,
    "Установленный Cloud активировался без конфигурации",
  );
  console.log(
    "ПРОЙДЕНО Cloud: установка, интеграция с ядром, проверка CUE, две машины, внешний файл и отклонение неверной разметки",
  );
} finally {
  await Deno.remove(root, { recursive: true });
}
