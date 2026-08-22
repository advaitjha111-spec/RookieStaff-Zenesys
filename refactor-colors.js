const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'frontend/src/components/CommandCenter.jsx',
  'frontend/src/components/IngestionPipeline.jsx',
  'frontend/src/components/VerificationWorkspace.jsx'
];

filesToProcess.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Backgrounds
  content = content.replace(/bg-white\/5/g, 'bg-slate-900/5 dark:bg-white/5');
  content = content.replace(/bg-white\/10/g, 'bg-slate-900/10 dark:bg-white/10');
  content = content.replace(/bg-\[\#11131A\]/g, 'bg-white dark:bg-[#11131A]');
  content = content.replace(/bg-\[\#0B0F17\]/g, 'bg-slate-50 dark:bg-[#0B0F17]');
  content = content.replace(/bg-\[\#1E1E1E\]/g, 'bg-slate-100 dark:bg-[#1E1E1E]');
  content = content.replace(/bg-\[\#141414\]/g, 'bg-white dark:bg-[#141414]');
  content = content.replace(/bg-\[\#0D0D0D\]/g, 'bg-slate-50 dark:bg-[#0D0D0D]');
  content = content.replace(/bg-\[\#222\]/g, 'bg-slate-200 dark:bg-[#222]');

  // Borders
  content = content.replace(/border-white\/10/g, 'border-slate-900/10 dark:border-white/10');
  content = content.replace(/border-white\/20/g, 'border-slate-900/20 dark:border-white/20');
  content = content.replace(/border-\[\#232733\]/g, 'border-slate-200 dark:border-[#232733]');
  content = content.replace(/border-\[\#333\]/g, 'border-slate-300 dark:border-[#333]');
  content = content.replace(/border-\[\#2B2B2B\]/g, 'border-slate-300 dark:border-[#2B2B2B]');
  content = content.replace(/border-\[\#262626\]/g, 'border-slate-300 dark:border-[#262626]');
  content = content.replace(/border-\[\#2B3040\]/g, 'border-slate-300 dark:border-[#2B3040]');
  
  // Text
  content = content.replace(/text-white\/40/g, 'text-slate-400 dark:text-white/40');
  content = content.replace(/text-white\/50/g, 'text-slate-400 dark:text-white/50');
  content = content.replace(/text-white\/60/g, 'text-slate-500 dark:text-white/60');
  content = content.replace(/text-white\/80/g, 'text-slate-700 dark:text-white/80');
  
  // Need to be careful with standalone text-white so we don't replace within text-white/50 etc
  // We can use a regex with negative lookahead
  content = content.replace(/text-white(?!\/)/g, 'text-slate-900 dark:text-white');
  
  content = content.replace(/text-gray-400/g, 'text-slate-500 dark:text-gray-400');
  content = content.replace(/text-gray-200/g, 'text-slate-800 dark:text-gray-200');
  content = content.replace(/text-\[\#777\]/g, 'text-slate-500 dark:text-[#777]');
  content = content.replace(/text-\[\#888\]/g, 'text-slate-600 dark:text-[#888]');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed ${file}`);
});
