local native = require("./native")
local contract = require("./contract")
local M = {}
function M.validate(doc)
  if doc.meta.cloud and doc.meta.cloud["virtual-machines"] then
    for _, vm in pairs(doc.meta.cloud["virtual-machines"]) do
      for key, _ in pairs(vm) do assert(key == "template", "cloud.virtual-machines: неизвестное поле " .. key) end
    end
  end
  local value = native.read(doc)
  local work = doc.meta["course-assessment-id"] and pandoc.utils.stringify(doc.meta["course-assessment-id"])
  if not work or work == "" then
    work = doc.meta.assessment and doc.meta.assessment.id and pandoc.utils.stringify(doc.meta.assessment.id)
  end
  if not work or work == "" then
    for _, block in ipairs(doc.blocks) do
      if block.t == "Header" and block.identifier ~= "" then work = block.identifier; break end
    end
  end
  local function exerciseContext(exercise)
    local related = pandoc.List()
    for _, step in ipairs(exercise.payload.steps) do
      related:insert({id = step.key, field = "steps.key"})
      for _, action in ipairs(step.actions) do related:insert({id = action.vm, field = "vm"}) end
    end
    return {source = value.source, id = exercise.id, field = "extensions.cloud", related = related,
      hint = "Проверьте поля шага и действия; исходное правило указано в выводе CUE"}
  end
  for _, exercise in ipairs(value.exercises) do
    native.vet(exercise.payload, "#CloudExercise", exerciseContext(exercise))
  end
  if value.assessment then native.vet(value.assessment, "#CloudAssessment",
    {source = value.source, id = work, field = "cloud", hint = "Проверьте virtual-machines и prepare"}) end
  if doc.meta.assessment then
    local machines = value.assessment and value.assessment["virtual-machines"] or {}
    local members = {}
    doc:walk({Div = function(div)
      if div.classes:includes("task-items") then
        div:walk({Cite = function(cite)
          for _, reference in ipairs(cite.citations) do members[reference.id] = true end
        end})
      end
    end})
    for _, exercise in ipairs(value.exercises) do
      if members[exercise.id] then
        for _, step in ipairs(exercise.payload.steps) do
          for _, action in ipairs(step.actions) do
            assert(machines[action.vm], contract.format("CLOUD005_declaredVm",
              "Машина действия не объявлена в работе: " .. action.vm,
              {source = value.source, id = exercise.id, field = "vm",
                related = {{id = work, field = "cloud.virtual-machines"}, {id = step.key, field = "steps.key"}, {id = action.vm, field = "vm"}},
                hint = "Объявите машину на странице работы или исправьте vm действия"}))
          end
        end
      end
    end
  end
  local outside = 0
  doc:walk({traverse = "topdown", Div = function(div)
    if div.attributes.target == "cloud" then return div, false end
  end, CodeBlock = function(block)
    if block.classes:includes("cloud-action") then outside = outside + 1 end
  end, Header = function(header)
    assert(not header.classes:includes("cloud-step"), "cloud-step вне задания")
  end})
  assert(outside == #(value.assessment and value.assessment.prepare or {}), "cloud-action: неподдерживаемое размещение prepare")
  -- Hidden source-file declarations remain domain inputs before projection.
  local files, contexts = pandoc.List(), pandoc.List()
  local function source(action, id, step)
    if action.source.file then
      files:insert(action.source.file)
      contexts:insert({source = value.source, id = id, field = "source.file",
        related = {{id = step, field = "steps.key"}, {id = action.vm, field = "vm"}},
        hint = "Укажите существующий файл внутри корня курса"})
    end
  end
  for _, exercise in ipairs(value.exercises) do
    for _, step in ipairs(exercise.payload.steps) do for _, action in ipairs(step.actions) do source(action, exercise.id, step.key) end end
  end
  for _, action in ipairs(value.assessment and value.assessment.prepare or {}) do source(action, work) end
  if #files > 0 then
    local directory = pandoc.path.directory(debug.getinfo(1, "S").source:sub(2))
    local args = {"run", directory .. "/validate-paths.ts", quarto.project.directory, "--contexts=" .. pandoc.json.encode(contexts)}
    for _, file in ipairs(files) do args[#args + 1] = file end
    pandoc.pipe(os.getenv("QUARTO") or "quarto", args, "")
  end
end
return M
