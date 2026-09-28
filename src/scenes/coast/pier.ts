// The end edge faces the visible water, keeping a centered sitter's feet in view.
export const pier = { left: .757, right: .791, top: .763, slope: .030,
  seatX: .774, seatY: .778, drop: .012 };
export const pierAnchor = `const vec2 pierSeat=vec2(${pier.seatX},${pier.seatY});`;
