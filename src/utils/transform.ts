const transform = ({ x = 0, y = 0, scale = 1 } = {}) => {
  return `translate(${x} ${y}) scale(${scale})`;
};

export default transform;