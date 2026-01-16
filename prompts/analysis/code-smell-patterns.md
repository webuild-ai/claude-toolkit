# Code Smell Patterns

Common code smells to detect during refactoring analysis.

## Bloaters
- Long Method (>50 lines)
- Large Class (>500 lines or >20 methods)
- Long Parameter List (>5 parameters)
- Data Clumps (same variables grouped repeatedly)
- Primitive Obsession (overuse of primitives vs objects)

## Object-Orientation Abusers
- Switch Statements (should use polymorphism)
- Temporary Field (field only used sometimes)
- Refused Bequest (subclass doesn't use parent methods)
- Alternative Classes with Different Interfaces

## Change Preventers
- Divergent Change (one class changed for multiple reasons)
- Shotgun Surgery (one change affects many classes)
- Parallel Inheritance Hierarchies

## Dispensables
- Comments (explaining bad code)
- Duplicate Code
- Lazy Class (doesn't do enough)
- Data Class (only fields and getters/setters)
- Dead Code (unused)
- Speculative Generality (premature abstraction)

## Couplers
- Feature Envy (method uses more of another class)
- Inappropriate Intimacy (classes too dependent)
- Message Chains (a.b().c().d())
- Middle Man (class delegates everything)

## Detection Strategies
- Use complexity metrics (cyclomatic complexity)
- Check code coverage for untested code
- Look for copy-paste patterns
- Analyze method/class size
- Check coupling metrics
