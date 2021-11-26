local vector2 = require("vector2")

local Nodes = {}
local Verticies = {}

function create_vertex(node1, node2)
  local length = node1.position:distance(node2.position) 
  return {
    start = node1,
    finish = node2,
    length = length,
  }
end

function create_node(x, y, is_locked)
  return {
    is_locked = is_locked,
    position = vector2:new(x, y),
    prev_position = vector2:new(x, y)
  }
end

function add_point(x, y, is_locked)
  local new_line_head = create_node(x, y, is_locked)

  for n = 1, #Nodes do
    local node = Nodes[n]
    if node.position:distance(new_line_head.position) < 25 then 
      new_line_head = node
    end
  end

  local current_line_head = nil
  local vertex = nil

  if #Nodes ~= 0 then
    current_line_head = Nodes[#Nodes]
    vertex = create_vertex(current_line_head, new_line_head) 
  end

  table.insert(Nodes, new_line_head)

  if vertex ~= nil then
    table.insert(Verticies, vertex)
  end
end

function clear()
  Nodes = {}
  Verticies = {}
end

function get_line()
  return {
    Nodes=Nodes,
    Verticies=Verticies,
  }
end

function simulate(dt)
  for p = 1, #Nodes do
    local node = Nodes[p]
    if not node.is_locked then
      local current_pos = node.position  
      node.position = node.position:add(node.position:sub(node.prev_position))
      node.position.y = node.position.y + node.position.y * 9.8 * dt * dt
      node.prev_position = current_pos
    end
  end

  for i = 0, 100 do 
    for v = 1, #Verticies do
      local vertex = Verticies[v]
      local center = vertex.start.position:add(vertex.finish.position):scale(0.5)
      local direction = vertex.finish.position:sub(vertex.start.position):normalize()

      if not vertex.finish.is_locked then
        local movement = direction:scale(vertex.length / 2)
        vertex.finish.position = center:add(movement)
      end

      if not vertex.start.is_locked then
        local movement = direction:scale(vertex.length / 2)
        vertex.start.position = center:sub(movement)
      end
    end
  end
end

return {
  add_point = add_point,
  clear = clear,
  simulate = simulate,
  get_line = get_line,
}
