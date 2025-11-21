
// Math.js is loaded from CDN and available on the window object
const math = (window as any).math;

/**
 * Solves a quadratic equation ax^2 + bx + c = 0.
 * @returns An array of strings representing the roots.
 */
export function solveQuadratic(a: number, b: number, c: number): string[] {
    if (a === 0) {
        if (b === 0) {
            return c === 0 ? ["Infinite solutions"] : ["No solution"];
        }
        return [`x = ${-c / b}`];
    }

    const discriminant = b * b - 4 * a * c;
    
    if (discriminant > 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        return [`x₁ = ${x1}`, `x₂ = ${x2}`];
    } else if (discriminant === 0) {
        const x = -b / (2 * a);
        return [`x = ${x}`];
    } else {
        const realPart = -b / (2 * a);
        const imagPart = Math.sqrt(-discriminant) / (2 * a);
        // Using math.js complex number for formatting
        const root1 = math.complex(realPart, imagPart);
        const root2 = math.complex(realPart, -imagPart);
        return [
            `x₁ = ${math.format(root1, { notation: 'fixed', precision: 4 })}`,
            `x₂ = ${math.format(root2, { notation: 'fixed', precision: 4 })}`
        ];
    }
}

/**
 * Placeholder for solving higher-degree polynomials.
 * Real-world implementation requires complex numerical methods like
 * Durand-Kerner or Jenkins-Traub, which are too extensive for this context.
 * @param coeffs Coefficients of the polynomial, from the highest degree to the constant term.
 * @returns An array of strings with a message.
 */
export function solvePolynomial(coeffs: number[]): string[] {
    const degree = coeffs.length - 1;
    if (degree > 5) {
        return ["Solver supports up to degree 5."];
    }
    if (degree <= 1) {
       return solveQuadratic(0, coeffs[0] || 0, coeffs[1] || 0);
    }
    if (degree === 2) {
       return solveQuadratic(coeffs[0], coeffs[1], coeffs[2]);
    }

    // Placeholder message for cubic and higher
    return [
        `Solving polynomials of degree ${degree} requires advanced numerical methods.`,
        "This feature is a placeholder."
    ];
}
