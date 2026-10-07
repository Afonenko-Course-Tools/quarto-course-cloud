-- Единый словарь пакета: допустимые значения не повторяются в фильтрах.
local root = pandoc.path.directory(debug.getinfo(1, "S").source:sub(2))
local file = assert(io.open(pandoc.path.join({root, "contract.json"}), "r"),
  "Не удалось прочитать contract.json расширения")
local contract = pandoc.json.decode(file:read("*a"))
file:close()
function contract.set(values)
  local result = {}
  for _, value in ipairs(values) do result[value] = true end
  return result
end
-- Локальный контекст guard; это не сериализованный отчёт и не часть контракта.
function contract.format(code, message, context)
  context = context or {}
  local parts = {code and (code .. ": " .. message) or message}
  if context.source and context.source ~= "" then parts[#parts + 1] = "источник=" .. context.source end
  if context.id and context.id ~= "" then parts[#parts + 1] = "объект=" .. context.id end
  if context.field then parts[#parts + 1] = "поле=" .. context.field end
  for _, related in ipairs(context.related or {}) do
    local values = {}
    if related.source then values[#values + 1] = "источник=" .. related.source end
    if related.id and related.id ~= "" then values[#values + 1] = "объект=" .. related.id end
    if related.field then values[#values + 1] = "поле=" .. related.field end
    if #values > 0 then parts[#parts + 1] = "связано: " .. table.concat(values, ", ") end
  end
  if context.hint then parts[#parts + 1] = "подсказка=" .. context.hint end
  return table.concat(parts, "; ")
end
return contract
