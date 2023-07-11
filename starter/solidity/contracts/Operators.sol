// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

contract Operators {
    uint256 public a = 5;
    uint256 public b = 2;

    // Arithmetic Operators:

    uint256 public sum = a + b;
    int256 public difference = int(a) - int(b);
    int256 public difference2 = int(b) - int(a);

    uint256 public product = a * b;
    uint256 public quotient = a / b;

    uint256 public pow = a ** b;

    uint256 public mod = a % b;

    // Comparision Operators

    bool public isLargeOrEqual = a >= b;
    bool public isLarger = a > b;
    bool public isLowerOrEqual = a <= b;
    bool public isLower = a < b;
    bool public isEqual = a == b;
    bool public isNotEqual = a != b;

    // Logical Operators

    bool public expression1 = true;
    bool public expression2 = true;

    bool public and = expression1 && expression2;
    bool public or = expression1 || expression2;
    bool public not = !expression1;
    
}