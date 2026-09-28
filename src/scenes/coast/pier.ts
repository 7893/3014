// The end edge faces the visible water, keeping a centered sitter's feet in view.
export const pier = { left: .725, right: .795, top: .797, slope: .021,
  seatX: .760, seatY: .8075, drop: .012 };
export const pierAnchor = `const vec2 pierSeat=vec2(${pier.seatX},${pier.seatY});`;
