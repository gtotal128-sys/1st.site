// utils.js - Centralized math and color helper functions for the entire application

/**
 * Clamps a value between a minimum and maximum limit.
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum boundary.
 * @param {number} max - The maximum boundary.
 * @returns {number}
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linearly interpolates between two numbers.
 * @param {number} start - The start value.
 * @param {number} end - The end value.
 * @param {number} t - The interpolation factor (0.0 to 1.0).
 * @returns {number}
 */
export function lerp(start, end, t) {
    return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Re-maps a number from one range to another.
 * Example: mapRange(5, 0, 10, 0, 100) returns 50.
 * @param {number} value - The incoming value to be converted.
 * @param {number} inMin - Lower bound of the value's current range.
 * @param {number} inMax - Upper bound of the value's current range.
 * @param {number} outMin - Lower bound of the value's target range.
 * @param {number} outMax - Upper bound of the value's target range.
 * @returns {number}
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return lerp(outMin, outMax, (value - inMin) / (inMax - inMin));
}

/**
 * Linearly interpolates between two RGB color arrays.
 * @param {number[]} color1 - Starting color [r, g, b] (0-255).
 * @param {number[]} color2 - Ending color [r, g, b] (0-255).
 * @param {number} t - The interpolation factor (0.0 to 1.0).
 * @returns {number[]} The interpolated color [r, g, b].
 */
export function lerpColor(color1, color2, t) {
    return [
        Math.round(lerp(color1[0], color2[0], t)),
        Math.round(lerp(color1[1], color2[1], t)),
        Math.round(lerp(color1[2], color2[2], t))
    ];
}

/**
 * Converts an [r, g, b] array to a standard CSS rgb() string.
 * @param {number[]} color - The color array [r, g, b].
 * @returns {string} e.g., "rgb(255, 100, 50)"
 */
export function rgbToString(color) {
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

/**
 * Converts an [r, g, b] array to a CSS rgba() string with a specified alpha.
 * @param {number[]} color - The color array [r, g, b].
 * @param {number} alpha - The opacity (0.0 to 1.0).
 * @returns {string} e.g., "rgba(255, 100, 50, 0.5)"
 */
export function rgbaToString(color, alpha) {
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${clamp(alpha, 0, 1)})`;
}