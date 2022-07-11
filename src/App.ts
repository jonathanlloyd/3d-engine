/**
 * Represents a 3 dimensional vector
 */
class Vec3 {
  /*
   * Create a new Vec3
   * @param {string} id - unique id for this vector
   * @param {number} x - the x position of the vector
   * @param {number} y - the y position of the vector
   * @param {number} x - the x position of the vector
   */
  constructor(
    public id: string,
    public x: number,
    public y: number,
    public z: number,
  ) {}
}

/**
 * Represents a 2 dimensional vector
 */
class Vec2 {
  /*
   * Create a new Vec2
   * @param {number} x - the x position of the vector
   * @param {number} y - the y position of the vector
   */
  constructor(public x: number, public y: number) {}
}

class Matrix3x3 {
  constructor(private values: number[][]) {}

  multiply(v: Vec3): Vec3 {
    const x =
      this.values[0][0] * v.x +
      this.values[1][0] * v.y +
      this.values[2][0] * v.z;
    const y =
      this.values[0][1] * v.x +
      this.values[1][1] * v.y +
      this.values[2][1] * v.z;
    const z =
      this.values[0][2] * v.x +
      this.values[1][2] * v.y +
      this.values[2][2] * v.z;
    return new Vec3(v.id, x, y, z);
  }
}

class Matrix3x2 {
  constructor(private values: number[][]) {}

  multiply(v: Vec3): Vec2 {
    return new Vec2(0, 0);
  }
}

/**
 * Represents a connection between two vertices in a 3D model
 */
class Edge {
  /*
   * Create a new Edge
   * @param {string} idA - id for the vertex that starts the edge
   * @param {string} idB - id for the vertex that ends the edge
   */
  constructor(public idA: string, public idB: string) {}
}

/**
 * Represents a 3D model that can be rendered
 */
class Model {
  public vertices: Vec3[] = [];
  public edges: Edge[] = [];

  addVertex(args: {x: number; y: number; z: number}): Vec3 {
    const vId = 'vert-' + this.vertices.length;
    const v = new Vec3(vId, args.x, args.y, args.z);
    this.vertices.push(v);
    return v;
  }

  addEdge(a: Vec3, b: Vec3) {
    this.edges.push(new Edge(a.id, b.id));
  }

  map(f: (v: Vec3) => Vec3): Model {
    const model = new Model();
    model.vertices = this.vertices.map(f);
    model.edges = [...this.edges];
    return model;
  }
}

class State {
  constructor(
    public model: Model = new Model(),
    public cameraAngleX: number = 0,
    public cameraAngleY: number = 0,
  ) {}
}

class Context {
  constructor(
    readonly canvas: CanvasRenderingContext2D,
    readonly width: number = 800,
    readonly height: number = 600,
    public mouseX: number = 0,
    public mouseY: number = 0,
  ) {}
}

const vertexRadius = 3;
const scaleFactor = 100;
const fudgeFactor = 0.2;

const render = (ctx: Context, model: Model) => {
  // Loop through the vertices in the model and store their 2D projections
  const projectedVertices: Map<string, Vec2> = new Map();
  for (let vertex of model.vertices) {
    const perspectiveScale = 1 + vertex.z * fudgeFactor;
    projectedVertices.set(
      vertex.id,
      new Vec2(vertex.x / perspectiveScale, vertex.y / perspectiveScale),
    );
  }

  // Erase the previous frame
  ctx.canvas.fillStyle = 'black';
  ctx.canvas.beginPath();
  ctx.canvas.rect(0, 0, ctx.width, ctx.height);
  ctx.canvas.fill();

  // Render each vertex
  const transformX = (x: number): number => {
    return x * scaleFactor + ctx.width / 2;
  };
  const transformY = (y: number): number => {
    return y * scaleFactor + ctx.height / 2;
  };
  ctx.canvas.fillStyle = 'white';
  for (let [_, vertex] of projectedVertices) {
    ctx.canvas.beginPath();
    ctx.canvas.ellipse(
      transformX(vertex.x),
      transformY(vertex.y),
      vertexRadius,
      vertexRadius,
      0,
      0,
      2 * Math.PI,
    );
    ctx.canvas.fill();
  }

  // Render the edges between each vertex
  ctx.canvas.strokeStyle = 'white';
  for (let edge of model.edges) {
    const vertexA = projectedVertices.get(edge.idA);
    const vertexB = projectedVertices.get(edge.idB);
    if (!vertexA || !vertexB) {
      continue;
    }
    ctx.canvas.beginPath();
    ctx.canvas.moveTo(transformX(vertexA.x), transformY(vertexA.y));
    ctx.canvas.lineTo(transformX(vertexB.x), transformY(vertexB.y));
    ctx.canvas.stroke();
  }
};

const setup = (ctx: Context, state: State) => {
  const model = state.model;

  for (let rowNum = -2; rowNum < 3; rowNum++) {
    const xDelta = 0;
    const yDelta = rowNum;
    const zDelta = 0;

    const bottomFrontLeft = model.addVertex({
      x: -0.5 + xDelta,
      y: 0.5 + yDelta,
      z: 0.5 + zDelta,
    });
    const bottomFrontRight = model.addVertex({
      x: 0.5 + xDelta,
      y: 0.5 + yDelta,
      z: 0.5 + zDelta,
    });
    const bottomBackLeft = model.addVertex({
      x: -0.5 + xDelta,
      y: 0.5 + yDelta,
      z: -0.5 + zDelta,
    });
    const bottomBackRight = model.addVertex({
      x: 0.5 + xDelta,
      y: 0.5 + yDelta,
      z: -0.5 + zDelta,
    });

    const topFrontLeft = model.addVertex({
      x: -0.5 + xDelta,
      y: -0.5 + yDelta,
      z: 0.5 + zDelta,
    });
    const topFrontRight = model.addVertex({
      x: 0.5 + xDelta,
      y: -0.5 + yDelta,
      z: 0.5 + zDelta,
    });
    const topBackLeft = model.addVertex({
      x: -0.5 + xDelta,
      y: -0.5 + yDelta,
      z: -0.5 + zDelta,
    });
    const topBackRight = model.addVertex({
      x: 0.5 + xDelta,
      y: -0.5 + yDelta,
      z: -0.5 + zDelta,
    });

    model.addEdge(bottomFrontLeft, bottomFrontRight);
    model.addEdge(bottomFrontRight, bottomBackRight);
    model.addEdge(bottomBackRight, bottomBackLeft);
    model.addEdge(bottomBackLeft, bottomFrontLeft);

    model.addEdge(topFrontLeft, topFrontRight);
    model.addEdge(topFrontRight, topBackRight);
    model.addEdge(topBackRight, topBackLeft);
    model.addEdge(topBackLeft, topFrontLeft);

    model.addEdge(bottomFrontLeft, topFrontLeft);
    model.addEdge(bottomFrontRight, topFrontRight);
    model.addEdge(bottomBackLeft, topBackLeft);
    model.addEdge(bottomBackRight, topBackRight);
  }

  for (let rowNum = -2; rowNum < 3; rowNum++) {
    const xDelta = rowNum;
    const yDelta = 0;
    const zDelta = 0;

    const bottomFrontLeft = model.addVertex({
      x: -0.5 + xDelta,
      y: 0.5 + yDelta,
      z: 0.5 + zDelta,
    });
    const bottomFrontRight = model.addVertex({
      x: 0.5 + xDelta,
      y: 0.5 + yDelta,
      z: 0.5 + zDelta,
    });
    const bottomBackLeft = model.addVertex({
      x: -0.5 + xDelta,
      y: 0.5 + yDelta,
      z: -0.5 + zDelta,
    });
    const bottomBackRight = model.addVertex({
      x: 0.5 + xDelta,
      y: 0.5 + yDelta,
      z: -0.5 + zDelta,
    });

    const topFrontLeft = model.addVertex({
      x: -0.5 + xDelta,
      y: -0.5 + yDelta,
      z: 0.5 + zDelta,
    });
    const topFrontRight = model.addVertex({
      x: 0.5 + xDelta,
      y: -0.5 + yDelta,
      z: 0.5 + zDelta,
    });
    const topBackLeft = model.addVertex({
      x: -0.5 + xDelta,
      y: -0.5 + yDelta,
      z: -0.5 + zDelta,
    });
    const topBackRight = model.addVertex({
      x: 0.5 + xDelta,
      y: -0.5 + yDelta,
      z: -0.5 + zDelta,
    });

    model.addEdge(bottomFrontLeft, bottomFrontRight);
    model.addEdge(bottomFrontRight, bottomBackRight);
    model.addEdge(bottomBackRight, bottomBackLeft);
    model.addEdge(bottomBackLeft, bottomFrontLeft);

    model.addEdge(topFrontLeft, topFrontRight);
    model.addEdge(topFrontRight, topBackRight);
    model.addEdge(topBackRight, topBackLeft);
    model.addEdge(topBackLeft, topFrontLeft);

    model.addEdge(bottomFrontLeft, topFrontLeft);
    model.addEdge(bottomFrontRight, topFrontRight);
    model.addEdge(bottomBackLeft, topBackLeft);
    model.addEdge(bottomBackRight, topBackRight);
  }
};

const draw = (ctx: Context, state: State) => {
  state.cameraAngleX = -((ctx.mouseY - ctx.height / 2) / ctx.height) * Math.PI;
  state.cameraAngleY = ((ctx.mouseX - ctx.width/2)  / ctx.width) * Math.PI;

  // Rotate model
  let sin = Math.sin(state.cameraAngleX);
  let cos = Math.cos(state.cameraAngleX);
  const rotXMat = new Matrix3x3([
    [1, 0, 0],
    [0, cos, -sin],
    [0, sin, cos],
  ]);
  sin = Math.sin(state.cameraAngleY);
  cos = Math.cos(state.cameraAngleY);
  const rotYMat = new Matrix3x3([
    [cos, 0, sin],
    [0, 1, 0],
    [-sin, 0, cos],
  ]);

  const transformedModel = state.model
    .map(v => rotXMat.multiply(v))
    .map(v => rotYMat.multiply(v));

  render(ctx, transformedModel);
};

window.onload = () => {
  const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
    document.getElementById('stage')
  );
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const canvasCtx = canvas.getContext('2d');
  if (!canvasCtx) {
    throw new Error('Failed to acquire canvas context');
  }

  const state = new State();
  const ctx = new Context(canvasCtx, canvas.width, canvas.height);

  const canvasRect = canvas.getBoundingClientRect();
  window.onmousemove = e => {
    ctx.mouseX = e.clientX - canvasRect.left;
    ctx.mouseY = e.clientY - canvasRect.top;
  };

  setup(ctx, state);

  const loop = () => {
    draw(ctx, state);
    window.requestAnimationFrame(loop);
  };
  loop();
};
