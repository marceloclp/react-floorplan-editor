const createDOMPoint = (x: number, y: number) => {
  const pt = document
    .createElementNS('http://www.w3.org/2000/svg', 'svg')
    .createSVGPoint();
  pt.x = x;
  pt.y = y;
  return pt;
};

export default createDOMPoint;
