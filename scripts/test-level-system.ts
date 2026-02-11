import { calculateLevelProgress } from '../utils/level-system';

const testCases = [
  { exp: 0, expectedLevel: 1, expectedProgress: 0 },
  { exp: 500, expectedLevel: 1, expectedProgress: 50 },
  { exp: 1000, expectedLevel: 1, expectedProgress: 100 },
  { exp: 2500, expectedLevel: 3, expectedProgress: 21.43 }, // (2500 - 2200) / (3600 - 2200) = 300/1400 = 21.428...
  { exp: 3600, expectedLevel: 3, expectedProgress: 100 },
];

console.log('--- Level Calculation Test Results ---');
let passed = true;

testCases.forEach((tc, idx) => {
  const result = calculateLevelProgress(tc.exp);
  const progressMatch = Math.abs(result.progressPercent - tc.expectedProgress) < 0.05;
  const levelMatch = result.level === tc.expectedLevel;
  
  if (progressMatch && levelMatch) {
    console.log(`[PASS] EXP ${tc.exp}: Level ${result.level}, Progress ${result.progressPercent}%`);
  } else {
    passed = false;
    console.error(`[FAIL] EXP ${tc.exp}: Expected Level ${tc.expectedLevel}, Progress ${tc.expectedProgress}%. Got Level ${result.level}, Progress ${result.progressPercent}%`);
  }
});

if (passed) {
  console.log('\nAll test cases passed!');
} else {
  console.error('\nSome test cases failed.');
  process.exit(1);
}
