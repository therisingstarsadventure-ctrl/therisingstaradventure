const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\shash\\.gemini\\antigravity\\brain\\dd562d34-5f73-4ebe-ae63-4c7ab0d290a3\\scratch\\india_complete.svg', 'utf8');

function getAbsoluteBounds(pathData) {
  // Parse SVG path coordinates
  // Matches letters followed by space/number/comma sequences
  const commands = pathData.match(/([a-df-z])([^a-df-z]*)/gi);
  
  let currentX = 0;
  let currentY = 0;
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  function updateBounds(x, y) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  
  commands.forEach(cmdStr => {
    const cmd = cmdStr[0];
    const args = cmdStr.substring(1).trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));
    
    if (cmd === 'M' || cmd === 'm') {
      for (let i = 0; i < args.length; i += 2) {
        if (cmd === 'M') {
          currentX = args[i];
          currentY = args[i+1];
        } else {
          currentX += args[i];
          currentY += args[i+1];
        }
        updateBounds(currentX, currentY);
      }
    } else if (cmd === 'L' || cmd === 'l') {
      for (let i = 0; i < args.length; i += 2) {
        if (cmd === 'L') {
          currentX = args[i];
          currentY = args[i+1];
        } else {
          currentX += args[i];
          currentY += args[i+1];
        }
        updateBounds(currentX, currentY);
      }
    } else if (cmd === 'H' || cmd === 'h') {
      args.forEach(val => {
        if (cmd === 'H') {
          currentX = val;
        } else {
          currentX += val;
        }
        updateBounds(currentX, currentY);
      });
    } else if (cmd === 'V' || cmd === 'v') {
      args.forEach(val => {
        if (cmd === 'V') {
          currentY = val;
        } else {
          currentY += val;
        }
        updateBounds(currentX, currentY);
      });
    } else if (cmd === 'C' || cmd === 'c') {
      for (let i = 0; i < args.length; i += 6) {
        // Control points are not technically part of the path bounds, but let's check endpoints
        // and control points to get a good bounds approximation.
        if (cmd === 'C') {
          currentX = args[i+4];
          currentY = args[i+5];
        } else {
          currentX += args[i+4];
          currentY += args[i+5];
        }
        updateBounds(currentX, currentY);
      }
    } else if (cmd === 'S' || cmd === 's') {
      for (let i = 0; i < args.length; i += 4) {
        if (cmd === 'S') {
          currentX = args[i+2];
          currentY = args[i+3];
        } else {
          currentX += args[i+2];
          currentY += args[i+3];
        }
        updateBounds(currentX, currentY);
      }
    } else if (cmd === 'Q' || cmd === 'q') {
      for (let i = 0; i < args.length; i += 4) {
        if (cmd === 'Q') {
          currentX = args[i+2];
          currentY = args[i+3];
        } else {
          currentX += args[i+2];
          currentY += args[i+3];
        }
        updateBounds(currentX, currentY);
      }
    } else if (cmd === 'T' || cmd === 't') {
      for (let i = 0; i < args.length; i += 2) {
        if (cmd === 'T') {
          currentX = args[i];
          currentY = args[i+1];
        } else {
          currentX += args[i];
          currentY += args[i+1];
        }
        updateBounds(currentX, currentY);
      }
    } else if (cmd === 'Z' || cmd === 'z') {
      // close path, no coordinates
    }
  });
  
  return {
    minX: Math.round(minX),
    maxX: Math.round(maxX),
    minY: Math.round(minY),
    maxY: Math.round(maxY),
    centerX: Math.round((minX + maxX) / 2),
    centerY: Math.round((minY + maxY) / 2)
  };
}

const targets = ['mh', 'mp', 'hp', 'jk', 'ut'];
targets.forEach(id => {
  const match = new RegExp(`id="${id}"[^>]*d="([^"]+)"`).exec(content);
  if (match) {
    console.log(`State: ${id}`);
    console.log(getAbsoluteBounds(match[1]));
  } else {
    console.log(`State ${id} not found`);
  }
});
