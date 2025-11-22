
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../types';
import { COLORS, CONFIG } from './voxelConstants';

// Helper to prevent overlapping voxels
function setBlock(map: Map<string, VoxelData>, x: number, y: number, z: number, color: number) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rz = Math.round(z);
    const key = `${rx},${ry},${rz}`;
    map.set(key, { x: rx, y: ry, z: rz, color });
}

function fillRect(map: Map<string, VoxelData>, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, color: number) {
    const startX = Math.min(x1, x2);
    const endX = Math.max(x1, x2);
    const startY = Math.min(y1, y2);
    const endY = Math.max(y1, y2);
    const startZ = Math.min(z1, z2);
    const endZ = Math.max(z1, z2);

    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
            for (let z = startZ; z <= endZ; z++) {
                setBlock(map, x, y, z, color);
            }
        }
    }
}

function generateSphere(map: Map<string, VoxelData>, cx: number, cy: number, cz: number, r: number, col: number, sy = 1) {
    const r2 = r * r;
    const xMin = Math.floor(cx - r);
    const xMax = Math.ceil(cx + r);
    const yMin = Math.floor(cy - r * sy);
    const yMax = Math.ceil(cy + r * sy);
    const zMin = Math.floor(cz - r);
    const zMax = Math.ceil(cz + r);

    for (let x = xMin; x <= xMax; x++) {
        for (let y = yMin; y <= yMax; y++) {
            for (let z = zMin; z <= zMax; z++) {
                const dx = x - cx;
                const dy = (y - cy) / sy;
                const dz = z - cz;
                if (dx * dx + dy * dy + dz * dz <= r2) {
                    setBlock(map, x, y, z, col);
                }
            }
        }
    }
}

// --- Specific PPG Builders ---

function buildCharacter(map: Map<string, VoxelData>, cx: number, cy: number, cz: number, type: 'Blossom' | 'Bubbles' | 'Buttercup') {
    // Colors
    let dressColor = COLORS.BLOSSOM_PINK;
    let hairColor = COLORS.BLOSSOM_ORANGE;
    let eyeColor = COLORS.BLOSSOM_PINK;
    
    if (type === 'Bubbles') {
        dressColor = COLORS.BUBBLES_BLUE;
        hairColor = COLORS.BUBBLES_YELLOW;
        eyeColor = COLORS.BUBBLES_BLUE;
    } else if (type === 'Buttercup') {
        dressColor = COLORS.BUTTERCUP_GREEN;
        hairColor = COLORS.BUTTERCUP_HAIR;
        eyeColor = COLORS.BUTTERCUP_GREEN;
    }

    // --- LEGS & FEET ---
    // Left
    fillRect(map, cx - 1, cy, cz, cx - 1, cy + 1, cz, COLORS.WHITE); // Tights
    setBlock(map, cx - 1, cy, cz, COLORS.BLACK); // Shoe
    // Right
    fillRect(map, cx + 1, cy, cz, cx + 1, cy + 1, cz, COLORS.WHITE); // Tights
    setBlock(map, cx + 1, cy, cz, COLORS.BLACK); // Shoe

    // --- BODY ---
    // Dress Body
    fillRect(map, cx - 1, cy + 2, cz - 1, cx + 1, cy + 3, cz + 1, dressColor);
    // Black Belt
    fillRect(map, cx - 1, cy + 3, cz - 1.1, cx + 1, cy + 3, cz + 1.1, COLORS.BLACK);
    // Upper Body
    fillRect(map, cx - 1, cy + 4, cz - 1, cx + 1, cy + 4, cz + 1, dressColor);
    
    // Arms (Small stubs)
    setBlock(map, cx - 2, cy + 3, cz, COLORS.SKIN);
    setBlock(map, cx + 2, cy + 3, cz, COLORS.SKIN);

    // --- HEAD ---
    const neckY = cy + 5;
    // Face base (Skin) - 7 wide, 6 high approx
    fillRect(map, cx - 3, neckY, cz - 2, cx + 3, neckY + 5, cz + 2, COLORS.SKIN);
    
    // Cheek rounding
    setBlock(map, cx - 3, neckY, cz + 2, COLORS.SKIN); // Cheek fill
    setBlock(map, cx + 3, neckY, cz + 2, COLORS.SKIN);

    // --- EYES ---
    const eyeYBase = neckY + 1;
    const eyeZ = cz + 2;

    const drawEye = (ex: number) => {
        fillRect(map, ex - 1, eyeYBase, eyeZ + 1, ex + 1, eyeYBase + 3, eyeZ + 1, COLORS.WHITE);
        fillRect(map, ex - 0.5, eyeYBase, eyeZ + 1.1, ex + 0.5, eyeYBase + 2, eyeZ + 1.1, eyeColor);
        fillRect(map, ex, eyeYBase + 1, eyeZ + 1.2, ex, eyeYBase + 2, eyeZ + 1.2, COLORS.BLACK);
        setBlock(map, ex + 0.5, eyeYBase + 2, eyeZ + 1.3, COLORS.WHITE);
    };

    drawEye(cx - 1.5);
    drawEye(cx + 1.5);

    // --- HAIR ---
    const topY = neckY + 6;
    // Back
    fillRect(map, cx - 3, neckY, cz - 3, cx + 3, topY, cz - 2, hairColor);
    // Top
    fillRect(map, cx - 3, topY, cz - 3, cx + 3, topY + 1, cz + 2, hairColor);

    if (type === 'Blossom') {
        setBlock(map, cx, topY, cz + 2, hairColor); 
        setBlock(map, cx - 1, topY, cz + 2, hairColor);
        setBlock(map, cx + 1, topY, cz + 2, hairColor);
        
        // Big Red Bow
        const bowY = topY + 2;
        setBlock(map, cx, bowY, cz, COLORS.BLOSSOM_RED);
        fillRect(map, cx - 3, bowY, cz, cx - 1, bowY + 1, cz + 1, COLORS.BLOSSOM_RED);
        fillRect(map, cx + 1, bowY, cz, cx + 3, bowY + 1, cz + 1, COLORS.BLOSSOM_RED);
        // Long Hair in back
        fillRect(map, cx - 2, cy + 2, cz - 3, cx + 2, neckY, cz - 2, hairColor);
        
    } else if (type === 'Bubbles') {
        const pigtailY = topY;
        const pigtailX = 4;
        generateSphere(map, cx - pigtailX, pigtailY, cz, 1.5, hairColor);
        generateSphere(map, cx + pigtailX, pigtailY, cz, 1.5, hairColor);
        setBlock(map, cx - 2, topY, cz + 2, hairColor);
        setBlock(map, cx + 2, topY, cz + 2, hairColor);

    } else if (type === 'Buttercup') {
        setBlock(map, cx - 4, neckY + 1, cz - 1, hairColor);
        setBlock(map, cx + 4, neckY + 1, cz - 1, hairColor);
        setBlock(map, cx, topY, cz + 2, hairColor);
        setBlock(map, cx + 2, topY, cz + 2, hairColor);
        setBlock(map, cx - 2, topY, cz + 2, hairColor);
    }
}

// Custom Builder for Pamelita based on photo
export function buildPamelita(map: Map<string, VoxelData>, cx: number, cy: number, cz: number) {
    const hairColor = COLORS.PAM_HAIR;
    const sweaterColor = COLORS.PAM_SWEATER;

    // --- LEGS ---
    fillRect(map, cx - 1, cy, cz, cx - 1, cy + 2, cz, COLORS.BLACK); // Black Pants/Leggings
    fillRect(map, cx + 1, cy, cz, cx + 1, cy + 2, cz, COLORS.BLACK); 

    // --- BODY (White Sweater) ---
    fillRect(map, cx - 1.5, cy + 2, cz - 1, cx + 1.5, cy + 4, cz + 1, sweaterColor);
    
    // Sweater Texture (Knitted look bumps)
    setBlock(map, cx - 0.5, cy + 3, cz + 1.1, COLORS.WHITE);
    setBlock(map, cx + 0.5, cy + 2.5, cz + 1.1, COLORS.WHITE);

    // Arms (Sweater sleeves)
    setBlock(map, cx - 2, cy + 3, cz, sweaterColor);
    setBlock(map, cx + 2, cy + 3, cz, sweaterColor);
    // Hands
    setBlock(map, cx - 2.5, cy + 2.5, cz + 0.5, COLORS.SKIN);
    setBlock(map, cx + 2.5, cy + 2.5, cz + 0.5, COLORS.SKIN);

    // --- HEAD ---
    const neckY = cy + 4.5;
    // Face
    fillRect(map, cx - 3, neckY, cz - 2, cx + 3, neckY + 5, cz + 2, COLORS.SKIN);
    setBlock(map, cx - 3, neckY, cz + 2, COLORS.SKIN); 
    setBlock(map, cx + 3, neckY, cz + 2, COLORS.SKIN);

    // --- EYES ---
    const eyeYBase = neckY + 1;
    const eyeZ = cz + 2;
    const drawEye = (ex: number) => {
        fillRect(map, ex - 1, eyeYBase, eyeZ + 1, ex + 1, eyeYBase + 3, eyeZ + 1, COLORS.WHITE);
        // Brown eyes for Pam
        fillRect(map, ex - 0.5, eyeYBase, eyeZ + 1.1, ex + 0.5, eyeYBase + 2, eyeZ + 1.1, COLORS.DARK); 
        fillRect(map, ex, eyeYBase + 1, eyeZ + 1.2, ex, eyeYBase + 2, eyeZ + 1.2, COLORS.BLACK);
        setBlock(map, ex + 0.5, eyeYBase + 2, eyeZ + 1.3, COLORS.WHITE);
    };
    drawEye(cx - 1.5);
    drawEye(cx + 1.5);

    // --- KISSY LIPS ---
    // Small pouty lips in pink/red
    setBlock(map, cx, eyeYBase - 0.5, eyeZ + 1.1, COLORS.PAM_LIPS);

    // --- HAIR (Long, Dark, Straight) ---
    const topY = neckY + 6;
    // Full coverage back
    fillRect(map, cx - 3, neckY, cz - 3, cx + 3, topY, cz - 2, hairColor);
    // Top
    fillRect(map, cx - 3, topY, cz - 3, cx + 3, topY + 1, cz + 2, hairColor);
    
    // Long straight hair down back
    fillRect(map, cx - 3, cy + 2, cz - 3.5, cx + 3, neckY, cz - 2, hairColor);

    // Bangs / Framing face
    setBlock(map, cx - 3, neckY + 4, cz + 2, hairColor);
    setBlock(map, cx - 3, neckY + 3, cz + 2, hairColor);
    setBlock(map, cx - 3, neckY + 2, cz + 2, hairColor);
    
    setBlock(map, cx + 3, neckY + 4, cz + 2, hairColor);
    setBlock(map, cx + 3, neckY + 3, cz + 2, hairColor);
    setBlock(map, cx + 3, neckY + 2, cz + 2, hairColor);
}

function buildHeart(map: Map<string, VoxelData>, cx: number, cy: number, cz: number, scale: number) {
    for (let y = 15; y > -15; y--) {
        for (let x = -15; x < 15; x++) {
            const px = x * 0.1;
            const py = y * 0.1;
            const val = Math.pow(px*px + py*py - 1, 3) - px*px * Math.pow(py, 3);
            
            if (val <= 0) {
                setBlock(map, cx + x * scale, cy + y * scale, cz, COLORS.HEART_RED);
                setBlock(map, cx + x * scale, cy + y * scale, cz - 1, COLORS.HEART_PINK);
            }
        }
    }
}

function buildLetters(map: Map<string, VoxelData>, startX: number, y: number, z: number, text: string, color: number) {
    let cx = startX;
    const add = (dx: number, dy: number) => setBlock(map, cx + dx, y + dy, z, color);

    for (const char of text) {
        switch (char) {
            case 'T':
                add(0,4); add(1,4); add(2,4);
                add(1,3); add(1,2); add(1,1); add(1,0);
                cx += 4;
                break;
            case 'E':
                add(0,0); add(0,1); add(0,2); add(0,3); add(0,4);
                add(1,4); add(2,4);
                add(1,2); add(2,2);
                add(1,0); add(2,0);
                cx += 4;
                break;
            case 'A':
                add(0,0); add(0,1); add(0,2); add(0,3);
                add(1,4);
                add(2,0); add(2,1); add(2,2); add(2,3);
                add(1,2);
                cx += 4;
                break;
            case 'M':
                add(0,0); add(0,1); add(0,2); add(0,3); add(0,4);
                add(4,0); add(4,1); add(4,2); add(4,3); add(4,4);
                add(1,3); add(2,2); add(3,3);
                cx += 6; 
                break;
            case 'O':
                add(0,0); add(0,1); add(0,2); add(0,3); add(0,4);
                add(2,0); add(2,1); add(2,2); add(2,3); add(2,4);
                add(1,0); add(1,4);
                cx += 4;
                break;
            case 'P':
                add(0,0); add(0,1); add(0,2); add(0,3); add(0,4);
                add(1,4); add(2,4);
                add(2,3);
                add(1,2); add(2,2);
                cx += 4;
                break;
            case 'L':
                add(0,0); add(0,1); add(0,2); add(0,3); add(0,4);
                add(1,0); add(2,0);
                cx += 4;
                break;
            case 'I':
                add(0,0); add(1,0); add(2,0);
                add(1,1); add(1,2); add(1,3);
                add(0,4); add(1,4); add(2,4);
                cx += 4;
                break;
            case ' ':
                cx += 4;
                break;
        }
    }
}

export const Generators = {
    LoveScene: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        
        // 1. Big Heart Background
        buildHeart(map, 0, 14, -6, 0.9);

        // 2. Text
        buildLetters(map, -13, -2, 2, "TE AMO", COLORS.WHITE);
        buildLetters(map, -17, -8, 2, "PAMELITA", COLORS.WHITE);

        // 3. The Girls
        // Blossom is back in the center!
        buildCharacter(map, 0, 6, 6, 'Blossom');
        
        // Bubbles (Left)
        buildCharacter(map, -11, 6, 6, 'Bubbles');
        
        // Buttercup (Right)
        buildCharacter(map, 11, 6, 6, 'Buttercup');

        return Array.from(map.values());
    },
    
    CuteRabbit: (): VoxelData[] => {
         const map = new Map<string, VoxelData>();
         const RX = 0, BY = -5, RZ = 0;
         generateSphere(map, RX, BY + 2, RZ, 3, COLORS.WHITE, 0.9); // Body
         generateSphere(map, RX, BY + 6, RZ, 2.5, COLORS.WHITE); // Head
         setBlock(map, RX - 1, BY + 9, RZ, COLORS.WHITE); setBlock(map, RX - 1, BY + 10, RZ, COLORS.WHITE);
         setBlock(map, RX + 1, BY + 9, RZ, COLORS.WHITE); setBlock(map, RX + 1, BY + 10, RZ, COLORS.WHITE);
         generateSphere(map, RX, BY + 3, RZ + 2, 1.5, COLORS.HEART_RED);
         return Array.from(map.values());
    }
};
