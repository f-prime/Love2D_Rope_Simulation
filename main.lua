local rope = require("rope")

function love.load()
  love.window.setTitle("Rope Simulation") 
  love.graphics.setPointSize(10)
  mouse_is_down = false
  next_point_is_locked = false
  simulating = false
end

function love.update(dt)
  if not simulating then
    if love.mouse.isDown(1) and not mouse_is_down then
      local mouse_x = love.mouse.getX()
      local mouse_y = love.mouse.getY()
      mouse_is_down = true
      rope.add_point(mouse_x, mouse_y, next_point_is_locked)
    elseif not love.mouse.isDown(1) then
      mouse_is_down = false
    end
  else
    rope.simulate(dt)
  end
end

function love.keypressed(key)
  if key == "return" then
    simulating = not simulating 
  elseif key == "lctrl" then
    next_point_is_locked = not next_point_is_locked
  elseif key == "delete" then
    rope.clear()
  end
end

function love.draw()
  local line = rope.get_line()

  for v = 1, #line.Verticies do
    local vertex = line.Verticies[v]
    love.graphics.line(vertex.start.position.x, vertex.start.position.y, vertex.finish.position.x, vertex.finish.position.y)
  end

  for n = 1, #line.Nodes do
    local node = line.Nodes[n]
    if node.is_locked then
      love.graphics.setColor(1, 0, 0, 1)
    end
    love.graphics.points(node.position.x, node.position.y)
    love.graphics.setColor(1, 1, 1, 1)
  end

end
