local directory = assert(os.getenv('CLOUD_EXTENSION'))
package.path = directory .. '/?.lua;' .. package.path
local bridge = dofile(directory .. '/observability/bridge.lua')
local mode = os.getenv('COURSE_PERF_MODE')
local fn = function() return 'native', 7 end
local base = {FUNCTIONAL='kept'}
local identity = bridge.create_metrics('course-cloud')
assert(identity.wrap_sync({id='test',kind='command'}, fn) == fn)
assert(identity.child_env(base) == base)
if mode ~= 'off' then
  assert(#__course_performance_failures_v1 > 0, 'missing-agent diagnostic')
end
local linked, active, captured = true, nil, nil
if mode == 'trace' then
  __course_performance_agent_v1 = {abiVersion=1, metrics={
    wrap_sync=function(spec, native)
      captured=spec
      return function(...)
        active=linked and 'actual-command-parent' or nil
        local ok,result=pcall(native,...)
        active=nil
        if not ok then error(result,0) end
        return result
      end
    end,
    child_env=function(env)
      local copy={}
      for key,value in pairs(env) do copy[key]=value end
      copy.COURSE_PERF_PARENT_SPAN_ID=active
      return copy
    end,
  }}
end
-- Native domain parsing is independent of the tested process boundary.
package.loaded['./native'] = {
  read=function() return {source='probe.qmd', exercises={{id='probe', payload={steps={{key='one',actions={{vm='vm',source={file='/probe.txt'}}}}}}}}} end,
  vet=function() end,
}
package.loaded['./contract']={format=function(_, message) return message end}
quarto={project={directory=assert(os.getenv('CLOUD_TEST_ROOT'))},doc={input_file='probe.qmd'}}
local validate=dofile(directory .. '/validate.lua').validate
local doc={meta={},blocks={}}
function doc:walk(_) return self end
local function child()
  validate(doc)
  local file=assert(io.open(os.getenv('CLOUD_PROBE_OUTPUT'),'r'))
  local value=pandoc.json.decode(file:read('*a'));file:close()
  assert(value.functional=='kept-functional-value', 'functional environment')
  assert(value.path==os.getenv('PATH'), 'full PATH environment')
  assert(value.cwd==os.getenv('CLOUD_TEST_ROOT'), 'native inherited cwd')
  assert(value.args[1]=='run' and value.args[2]==directory .. '/validate-paths.ts', 'native argv')
  return value
end
local first=child()
if mode=='trace' then
  assert(first.parent=='actual-command-parent','linked actual child parent')
  assert(captured.id=='course-cloud.validate-paths' and captured.kind=='command')
  assert(captured.attributes.extension_id=='course-cloud','extension context')
  assert(captured.document_id=='probe.qmd','public document input')
  linked=false
  assert(child().parent==nil,'unlinked actual child inherited ghost parent')
  quarto.doc.input_file=nil
  child()
  assert(captured.document_id==nil,'unknown document must remain unlinked')
else
  assert(first.parent=='ghost-parent','off native environment')
end
assert(os.getenv('COURSE_PERF_PARENT_SPAN_ID')=='ghost-parent','scoped environment restored')
return {}
