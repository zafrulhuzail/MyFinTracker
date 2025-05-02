# TypeScript Guide for MyFinTracker

This guide provides a basic introduction to TypeScript concepts used in the MyFinTracker application. It's designed for developers with JavaScript experience who are new to TypeScript.

## Table of Contents

1. [What is TypeScript?](#what-is-typescript)
2. [Basic Types](#basic-types)
3. [Interfaces and Types](#interfaces-and-types)
4. [Function Types](#function-types)
5. [React with TypeScript](#react-with-typescript)
6. [Common TypeScript Patterns in MyFinTracker](#common-typescript-patterns-in-myfintracker)
7. [Useful Resources](#useful-resources)

## What is TypeScript?

TypeScript is a superset of JavaScript that adds static typing. This means:

- You can specify types for variables, function parameters, and return values
- The TypeScript compiler checks these types at compile time (before the code runs)
- JavaScript code is valid TypeScript code, but TypeScript adds type annotations

Benefits of TypeScript:
- Catches type-related errors before runtime
- Provides better autocompletion and documentation in editors
- Makes refactoring safer and easier
- Improves code readability and maintenance

## Basic Types

Here are the basic types used in TypeScript:

```typescript
// Primitive types
let isDone: boolean = false;
let decimal: number = 6;
let color: string = "blue";

// Arrays
let list: number[] = [1, 2, 3];
let names: Array<string> = ["John", "Jane", "Bob"];

// Tuples (fixed-length arrays with specific types)
let person: [string, number] = ["John", 25];

// Enum (named constants)
enum ClaimStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Completed = "completed"
}
let status: ClaimStatus = ClaimStatus.Pending;

// Any (avoid when possible)
let notSure: any = 4;
notSure = "maybe a string";

// Void (no return value)
function logMessage(message: string): void {
  console.log(message);
}

// Null and Undefined
let u: undefined = undefined;
let n: null = null;

// Never (function that never returns)
function throwError(message: string): never {
  throw new Error(message);
}

// Object
let obj: object = { key: "value" };
```

## Interfaces and Types

TypeScript allows you to define custom types using interfaces and type aliases:

### Interfaces

Used to define the shape of objects:

```typescript
// Interface for a user
interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: Date;
}

// Using the interface
const user: User = {
  id: 1,
  username: "student1",
  email: "student1@example.com",
  fullName: "John Student",
  role: "student",
  createdAt: new Date()
};

// Interface with optional properties (note the ?)
interface Claim {
  id: number;
  userId: number;
  claimType: string;
  amount: number;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: number; // Optional property
  reviewNotes?: string; // Optional property
}
```

### Type Aliases

Similar to interfaces but can represent more complex types:

```typescript
// Type alias for a claim status
type StatusType = "pending" | "approved" | "rejected" | "completed";

// Using the type
const claimStatus: StatusType = "approved";

// Type for a function
type CalculateTotal = (amounts: number[]) => number;

// Using the function type
const calculateTotal: CalculateTotal = (amounts) => {
  return amounts.reduce((sum, amount) => sum + amount, 0);
};
```

### Extending Interfaces

Interfaces can extend other interfaces:

```typescript
interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserEntity extends BaseEntity {
  username: string;
  email: string;
  password: string;
}
```

## Function Types

Types can be applied to function parameters and return values:

```typescript
// Function with typed parameters and return value
function addClaim(userId: number, claimType: string, amount: number): Claim {
  return {
    id: Math.floor(Math.random() * 1000),
    userId,
    claimType,
    amount,
    description: "",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Arrow function with types
const formatAmount = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

// Function that accepts a callback
function processClaimAmount(
  amount: number, 
  formatter: (amount: number) => string
): string {
  return formatter(amount);
}

// Using the function
const formattedAmount = processClaimAmount(123.45, formatAmount);
```

## React with TypeScript

### Typing Component Props

```typescript
// Props interface for a component
interface ClaimCardProps {
  claim: Claim;
  onClick: () => void;
}

// Function component with typed props
const ClaimCard: React.FC<ClaimCardProps> = ({ claim, onClick }) => {
  return (
    <div onClick={onClick}>
      <h3>{claim.claimType}</h3>
      <p>${claim.amount.toFixed(2)}</p>
      <span>{claim.status}</span>
    </div>
  );
};
```

### Typing Component State

```typescript
// Using useState with types
import { useState } from 'react';

const ClaimForm: React.FC = () => {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  // ...component code
};
```

### Event Handling

```typescript
// Typing form events
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // Submit logic
};

const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setAmount(Number(event.target.value));
};

// In JSX
<form onSubmit={handleSubmit}>
  <input 
    type="number" 
    value={amount} 
    onChange={handleInputChange} 
  />
</form>
```

## Common TypeScript Patterns in MyFinTracker

### Schema Definitions

In the `shared/schema.ts` file, we define database tables using Drizzle and generate TypeScript types:

```typescript
// Define tables with Drizzle
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username").notNull().unique(),
  password: varchar("password").notNull(),
  email: varchar("email").notNull(),
  // ...other fields
});

// Generate TypeScript types
export type User = typeof users.$inferSelect; // type for SELECT results
export type InsertUser = typeof users.$inferInsert; // type for INSERT operations

// Create Zod validation schema
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
```

### API Request/Response Types

```typescript
// Types for API requests and responses
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

// Using these types with fetch
async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });
  
  return response.json();
}
```

### React Query with TypeScript

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Query with type parameter
const { data: claims, isLoading } = useQuery<Claim[]>({
  queryKey: ['/api/claims'],
  queryFn: () => fetch('/api/claims').then(res => res.json())
});

// Mutation with type parameters
const createClaimMutation = useMutation<Claim, Error, InsertClaim>({
  mutationFn: async (newClaim) => {
    const res = await fetch('/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClaim)
    });
    return res.json();
  },
  onSuccess: () => {
    // Invalidate queries to refetch data
    queryClient.invalidateQueries({ queryKey: ['/api/claims'] });
  }
});
```

## Useful Resources

1. [TypeScript Documentation](https://www.typescriptlang.org/docs/)
2. [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
3. [React TypeScript Cheatsheet](https://github.com/typescript-cheatsheets/react)
4. [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
5. [React + TypeScript Templates](https://create-react-app.dev/docs/adding-typescript/)

Remember, TypeScript is meant to help you catch errors early and make your code more robust. The initial learning curve is worth the long-term benefits in code quality and maintainability.