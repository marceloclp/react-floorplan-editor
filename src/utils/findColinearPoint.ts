import Point from '../types/Point';

/**
 * Place point C inside the vector AB.
 */
export default function findColinearPoint(A: Point, B: Point, C: Point): Point {
  const ABx = B.x - A.x;
  const ABy = B.y - A.y;
  const ABmag = Math.sqrt(ABx * ABx + ABy * ABy);

  const ACx = C.x - A.x;
  const ACy = C.y - A.y;

  const numerator = ABx * ACx + ABy * ACy;
  const denominator = ABmag * ABmag;

  let D: Point;
  if (numerator <= 0) {
    D = A;
  } else if (numerator >= denominator) {
    D = B;
  } else {
    const Dx = A.x + (numerator / denominator) * ABx;
    const Dy = A.y + (numerator / denominator) * ABy;
    D = { x: Dx, y: Dy };
  }

  return D;
}
