// Every course taken at the University of Alberta, from the unofficial transcript (issued Oct 2026).
// Course names only, by term. No grades. Shown quietly at the bottom of /about#term.
// Add a term when it finishes; the current term lives in term.ts.
type Course = [code: string, name: string];

export const SCHOLARSHIP = 'President’s International Distinction Scholarship, awarded 2023 and renewed every year since';

export const COURSEWORK: { term: string; courses: Course[] }[] = [
  { term: 'Summer 2026', courses: [['ENGG 404', 'Engineering Safety and Risk Management: Leadership']] },
  { term: 'Spring 2026', courses: [['HIST 115', 'Technology and History']] },
  { term: 'Winter 2026', courses: [
    ['CH E 243', 'Engineering Thermodynamics'],
    ['ECE 315', 'Computer Interfacing'],
    ['ECE 447', 'Data Analysis and Machine Learning'],
    ['ECE 487', 'Data Communications Networks'],
    ['ENG M 401', 'Financial Management for Engineers'],
  ] },
  { term: 'Fall 2025', courses: [
    ['ACCTG 200', 'Introduction to Accounting'],
    ['ECE 311', 'Computer Organization and Architecture'],
    ['ECE 321', 'Software Requirements Engineering'],
    ['ECE 325', 'Object-Oriented Software Design'],
    ['MEC E 250', 'Engineering Mechanics II'],
    ['STAT 235', 'Introductory Statistics for Engineering'],
  ] },
  { term: 'Winter 2025', courses: [
    ['CMPUT 272', 'Formal Systems and Logic'],
    ['CMPUT 275', 'Introduction to Tangible Computing II'],
    ['ECE 212', 'Introduction to Microprocessors'],
    ['ECE 240', 'Continuous-Time Signals and Systems'],
    ['ECON 101', 'Introduction to Microeconomics'],
    ['PHYS 230', 'Electricity and Magnetism'],
  ] },
  { term: 'Fall 2024', courses: [
    ['CMPUT 274', 'Introduction to Tangible Computing I'],
    ['ECE 202', 'Electrical Circuits I'],
    ['ECE 210', 'Introduction to Digital Logic Design'],
    ['ENGG 299', 'Orientation to Co-op Education'],
    ['MATH 201', 'Differential Equations'],
    ['MATH 209', 'Calculus for Engineering III'],
  ] },
  { term: 'Winter 2024', courses: [
    ['CHEM 105', 'Introductory University Chemistry II'],
    ['EN PH 131', 'Mechanics'],
    ['ENGG 160', 'Introduction to Engineering Design, Communication and Profession'],
    ['ENGL 199', 'English for Engineering Students'],
    ['MATH 101', 'Calculus for Engineering II'],
    ['MATH 102', 'Applied Linear Algebra'],
  ] },
  { term: 'Fall 2023', courses: [
    ['CHEM 103', 'Introductory University Chemistry I'],
    ['ENCMP 100', 'Computer Programming for Engineers'],
    ['ENGG 100', 'Success in Engineering'],
    ['ENGG 130', 'Engineering Mechanics'],
    ['MATH 100', 'Calculus for Engineering I'],
    ['PHYS 130', 'Wave Motion, Optics and Sound'],
  ] },
];
