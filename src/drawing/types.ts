export type Brush = ReturnType<typeof import("./brush.ts").createBrush>;
export type Random = () => number;
export type Points = readonly (readonly number[])[];
export type Curve = (t: number) => number;
