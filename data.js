// Sample campus (student-created). Distances are in metres.
const locations = ["Library", "Science Block", "Student Centre", "Engineering", "Hostel A", "Cafeteria"];

const routes = [
  { id: 1,  from: "Library",        to: "Science Block",  label: "Main corridor",        distanceM: 350, hasSteps: false, slope: "flat",   lift: false, covered: true,  status: "open",   note: "" },
  { id: 2,  from: "Library",        to: "Science Block",  label: "Garden shortcut",      distanceM: 220, hasSteps: true,  slope: "steep",  lift: false, covered: false, status: "open",   note: "" },
  { id: 3,  from: "Library",        to: "Student Centre", label: "Courtyard path",       distanceM: 400, hasSteps: false, slope: "gentle", lift: false, covered: false, status: "open",   note: "" },
  { id: 4,  from: "Library",        to: "Student Centre", label: "Via Arts Block lift",  distanceM: 480, hasSteps: false, slope: "flat",   lift: true,  covered: true,  status: "open",   note: "" },
  { id: 5,  from: "Science Block",  to: "Engineering",    label: "Stair link",           distanceM: 300, hasSteps: true,  slope: "steep",  lift: false, covered: false, status: "open",   note: "" },
  { id: 6,  from: "Science Block",  to: "Engineering",    label: "Ramp walkway",         distanceM: 380, hasSteps: false, slope: "gentle", lift: false, covered: true,  status: "closed", note: "Resurfacing work" },
  { id: 7,  from: "Student Centre", to: "Cafeteria",      label: "Covered arcade",       distanceM: 150, hasSteps: false, slope: "flat",   lift: false, covered: true,  status: "open",   note: "" },
  { id: 8,  from: "Hostel A",       to: "Library",        label: "Hostel road",          distanceM: 600, hasSteps: false, slope: "gentle", lift: false, covered: false, status: "open",   note: "" },
  { id: 9,  from: "Hostel A",       to: "Library",        label: "Back stairs shortcut", distanceM: 380, hasSteps: true,  slope: "steep",  lift: false, covered: false, status: "open",   note: "" },
  { id: 10, from: "Student Centre", to: "Engineering",    label: "Central avenue",       distanceM: 520, hasSteps: false, slope: "flat",   lift: false, covered: true,  status: "open",   note: "" }
];
