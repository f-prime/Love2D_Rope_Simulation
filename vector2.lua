local Vector2 = {
  x = 0,
  y = 0,
}

function Vector2:new(x, y)
  local o = {}
  setmetatable(o, self)
  self.__index = self
  o.x = x
  o.y = y
  return o
end

function Vector2:mag()
  return math.sqrt(self.x ^ 2 + self.y ^ 2)
end

function Vector2:normalize()
  local mag = self:mag()
  return Vector2:new(self.x / mag, self.y / mag)
end

function Vector2:direction(v2)
  return (v2.y - self.y) / (v2.x - self.x) 
end

function Vector2:distance(v2)
  return math.sqrt((v2.x - self.x) ^ 2 + (v2.y - self.y) ^ 2)
end

function Vector2:dot(v2)
  return self.x * v2.x + self.y * v2.y 
end

function Vector2:rotate(theta)
  local length = self:mag()
  local unit_vector = self:normalize()
  local ux = unit_vector.x
  local uy = unit_vector.y
  local radians = theta * math.pi / 180 

  local x = ux * math.cos(radians) + uy * math.sin(radians)
  local y = ux * -math.sin(radians) + uy * math.cos(radians)

  return Vector2:new(x, y) * length
end

function Vector2:__add(v2)
  return Vector2:new(self.x + v2.x, self.y + v2.y)
end

function Vector2:__sub(v2)
  return Vector2:new(self.x - v2.x, self.y - v2.y)
end

function Vector2:__mul(scalar)
  return Vector2:new(self.x * scalar, self.y * scalar)
end

function Vector2:__div(scalar)
  return Vector2:new(self.x / scalar, self.y / scalar)
end

function Vector2:__tostring()
  return "(" .. self.x .. ", " .. self.y .. ")"
end

return Vector2
