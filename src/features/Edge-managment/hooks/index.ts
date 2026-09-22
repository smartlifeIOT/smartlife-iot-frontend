// Barrel file — every hook module gets exported from here.
// When you send me the next resource (devices, dashboards, rules, etc.),
// I'll add a `use<Resource>.ts` file next to this one and re-export it below.

export * from "./useEdge";

// Example of how future hooks will be added:
// export * from "./useDevice";
// export * from "./useDashboard";
// export * from "./useRule";
