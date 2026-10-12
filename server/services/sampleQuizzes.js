/**
 * Curated offline demonstration quizzes.
 * Used strictly when:
 * 1. The user explicitly selects "Sample Demo Mode" because API credentials are not yet configured.
 * 2. As an explicit test fallback when testing UI without external API calls.
 * 
 * NEVER misrepresented as live AI output.
 */

export const SAMPLE_QUIZZES = {
  'react-hooks': {
    concept: 'React Hooks',
    subject: 'Web Development',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'sample_rh_1',
        question: 'Which of the following describes the fundamental rule regarding where React Hooks can be called?',
        options: [
          'Hooks can be called inside any JavaScript function, loops, or nested conditions.',
          'Hooks must only be called at the top level of React function components or custom Hooks.',
          'Hooks must be declared inside the component render method within class components.',
          'Hooks can only be called inside asynchronous event handler callbacks.'
        ],
        correctAnswer: 'Hooks must only be called at the top level of React function components or custom Hooks.',
        explanation: 'React relies on the call order of Hooks to preserve state across multiple renders. Calling hooks conditionally or inside loops breaks this internal call-order indexing.',
        difficulty: 'Beginner',
        subtopic: 'Rules of Hooks'
      },
      {
        id: 'sample_rh_2',
        question: 'What is the primary difference between useEffect and useLayoutEffect in React?',
        options: [
          'useEffect runs synchronously before DOM mutations, while useLayoutEffect is asynchronous.',
          'useLayoutEffect fires synchronously after all DOM mutations but before the browser paints.',
          'useLayoutEffect can only be used on the server, whereas useEffect runs on the client.',
          'useEffect receives props as arguments, whereas useLayoutEffect requires a dependency array.'
        ],
        correctAnswer: 'useLayoutEffect fires synchronously after all DOM mutations but before the browser paints.',
        explanation: 'useLayoutEffect executes synchronously after DOM mutations and before visual painting, preventing layout thrashing or flicker when measuring DOM elements.',
        difficulty: 'Intermediate',
        subtopic: 'Effect Lifecycle'
      },
      {
        id: 'sample_rh_3',
        question: 'What happens when you omit the dependency array in a useEffect hook call: `useEffect(() => { ... })`?',
        options: [
          'The effect executes only once after the initial mount.',
          'The effect executes after every single render of the component.',
          'React throws a compilation error because a dependency array is strictly mandatory.',
          'The effect is queued and executed only when parent state changes.'
        ],
        correctAnswer: 'The effect executes after every single render of the component.',
        explanation: 'Passing no dependency array means React does not compare previous and next values, causing the effect to run on initial mount and after every subsequent re-render.',
        difficulty: 'Beginner',
        subtopic: 'Dependency Management'
      },
      {
        id: 'sample_rh_4',
        question: 'In what scenario should useCallback be preferred over a regular inline function declaration in React?',
        options: [
          'For every inline callback function to improve general execution speed.',
          'When passing a callback to an optimized child component that relies on reference equality (e.g. React.memo).',
          'Only when the callback returns a JSX element.',
          'When the callback performs an asynchronous network fetch.'
        ],
        correctAnswer: 'When passing a callback to an optimized child component that relies on reference equality (e.g. React.memo).',
        explanation: 'useCallback memoizes the function reference. It is primarily valuable when passing callbacks to memoized child components or using them as dependencies in other hooks.',
        difficulty: 'Intermediate',
        subtopic: 'Performance Optimization'
      },
      {
        id: 'sample_rh_5',
        question: 'What issue arises when an effect captures stale state values due to an incomplete dependency array?',
        options: [
          'A memory leak that crashes the V8 engine immediately.',
          'A stale closure where the effect references outdated variables from an earlier render scope.',
          'A React fiber tree corruption causing unrecoverable page reloads.',
          'The component unmounts and remounts continuously in an infinite loop.'
        ],
        correctAnswer: 'A stale closure where the effect references outdated variables from an earlier render scope.',
        explanation: 'If a variable is used inside an effect but omitted from its dependencies, the effect closure retains the variable value from the render when it was created, leading to stale closures.',
        difficulty: 'Advanced',
        subtopic: 'Stale Closures'
      }
    ]
  },
  'javascript-closures': {
    concept: 'JavaScript Closures',
    subject: 'Programming Languages',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'sample_jc_1',
        question: 'What is a closure in JavaScript?',
        options: [
          'A method to terminate an infinite loop or break out of switch blocks.',
          'The combination of a function bundled together with references to its surrounding lexical environment.',
          'A syntax keyword used to make object properties private and immutable.',
          'A built-in event listener triggered when the DOM tree finishes loading.'
        ],
        correctAnswer: 'The combination of a function bundled together with references to its surrounding lexical environment.',
        explanation: 'A closure gives an inner function access to an outer function’s scope even after the outer function has completed execution.',
        difficulty: 'Beginner',
        subtopic: 'Lexical Scoping'
      },
      {
        id: 'sample_jc_2',
        question: 'In the classic loop `for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }`, what is logged and why?',
        options: [
          '0, 1, 2 because setTimeout captures each iteration value synchronously.',
          '3, 3, 3 because `var` is function-scoped and all callbacks close over the same mutated variable `i`.',
          'undefined, undefined, undefined because `i` is destroyed when the loop terminates.',
          '0, 0, 0 because the first value is cached by the event queue.'
        ],
        correctAnswer: '3, 3, 3 because `var` is function-scoped and all callbacks close over the same mutated variable `i`.',
        explanation: 'Because `var` lacks block scope, all asynchronous callbacks reference the identical lexical variable `i`, which equals 3 by the time the timers fire.',
        difficulty: 'Intermediate',
        subtopic: 'Var vs Let Scoping'
      },
      {
        id: 'sample_jc_3',
        question: 'How does replacing `var` with `let` in a for-loop fix closure capture bugs?',
        options: [
          'It forces setTimeout to execute synchronously without entering the task queue.',
          '`let` creates a new lexical binding for each loop iteration, giving each closure its own distinct variable instance.',
          '`let` promotes the variable to global scope so all functions share an immutable reference.',
          '`let` automatically wraps the loop body in a Web Worker thread.'
        ],
        correctAnswer: '`let` creates a new lexical binding for each loop iteration, giving each closure its own distinct variable instance.',
        explanation: 'ES6 `let` is block-scoped and re-bound on every iteration of a for loop, creating a fresh binding for each loop cycle that inner functions close over.',
        difficulty: 'Intermediate',
        subtopic: 'Block Scoping'
      },
      {
        id: 'sample_jc_4',
        question: 'What is a common real-world application of closures in JavaScript prior to native private class fields (#)?',
        options: [
          'Creating private variables and encapsulated module methods.',
          'Directly manipulating GPU hardware acceleration buffers.',
          'Converting asynchronous Promises into synchronous blocking calls.',
          'Bypassing browser Cross-Origin Resource Sharing (CORS) policies.'
        ],
        correctAnswer: 'Creating private variables and encapsulated module methods.',
        explanation: 'Closures allow developers to emulate private methods and state encapsulation (the Module Pattern) by exposing public functions that access closed-over private state.',
        difficulty: 'Intermediate',
        subtopic: 'Encapsulation & Module Pattern'
      },
      {
        id: 'sample_jc_5',
        question: 'What risk can inadvertent closure retention cause in long-lived single page applications?',
        options: [
          'Stack overflow errors due to recursive call stack limits.',
          'Memory leaks because references held in closures prevent garbage collection of large captured scopes.',
          'Immediate disconnection of the WebSocket channel.',
          'Syntax errors caused by lexical token overflow.'
        ],
        correctAnswer: 'Memory leaks because references held in closures prevent garbage collection of large captured scopes.',
        explanation: 'If a closure retains a reference to an outer scope (or DOM element) and that closure is kept alive (e.g. in a global event listener), the garbage collector cannot reclaim memory.',
        difficulty: 'Advanced',
        subtopic: 'Memory & Garbage Collection'
      }
    ]
  },
  'data-structures': {
    concept: 'Data Structures and Algorithms',
    subject: 'Computer Science',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'sample_dsa_1',
        question: 'What is the average and worst-case time complexity of searching for an element in a balanced Binary Search Tree (such as an AVL tree)?',
        options: [
          'Average: O(1), Worst-case: O(n)',
          'Average: O(log n), Worst-case: O(log n)',
          'Average: O(log n), Worst-case: O(n)',
          'Average: O(n), Worst-case: O(n log n)'
        ],
        correctAnswer: 'Average: O(log n), Worst-case: O(log n)',
        explanation: 'In a balanced binary search tree, the height is strictly maintained at O(log n), guaranteeing search, insertion, and deletion run in O(log n) time even in the worst case.',
        difficulty: 'Intermediate',
        subtopic: 'Balanced BST Complexity'
      },
      {
        id: 'sample_dsa_2',
        question: 'Which collision resolution technique in hash tables stores collided elements in linked lists located at the corresponding bucket index?',
        options: [
          'Linear Probing',
          'Quadratic Probing',
          'Separate Chaining',
          'Double Hashing'
        ],
        correctAnswer: 'Separate Chaining',
        explanation: 'Separate Chaining creates a linked list (or dynamic array/tree) at each bucket index to store multiple key-value pairs that hash to the same bucket.',
        difficulty: 'Beginner',
        subtopic: 'Hash Tables'
      },
      {
        id: 'sample_dsa_3',
        question: 'Which sorting algorithm has a guaranteed worst-case time complexity of O(n log n) and is NOT in-place in its standard implementation?',
        options: [
          'Quick Sort',
          'Heap Sort',
          'Merge Sort',
          'Bubble Sort'
        ],
        correctAnswer: 'Merge Sort',
        explanation: 'Merge Sort guarantees O(n log n) in all cases (best, average, worst) using divide-and-conquer, requiring O(n) auxiliary space to merge sub-arrays.',
        difficulty: 'Intermediate',
        subtopic: 'Sorting Algorithms'
      },
      {
        id: 'sample_dsa_4',
        question: 'When implementing Dijkstra’s shortest path algorithm, which data structure provides the optimal time complexity of O((V + E) log V)?',
        options: [
          'Stack',
          'Min-Priority Queue (Binary/Fibonacci Heap)',
          'Circular Queue',
          'Disjoint Set Union (DSU)'
        ],
        correctAnswer: 'Min-Priority Queue (Binary/Fibonacci Heap)',
        explanation: 'A min-priority queue allows extracting the minimum distance vertex in logarithmic time, enabling Dijkstra to achieve O((V + E) log V) efficiency.',
        difficulty: 'Advanced',
        subtopic: 'Graph Algorithms'
      },
      {
        id: 'sample_dsa_5',
        question: 'What is the primary advantage of a Trie (Prefix Tree) over a Hash Map for dictionary and auto-complete lookups?',
        options: [
          'Tries require less memory than Hash Maps for all input types.',
          'Tries allow finding all words with a shared prefix in O(k) time where k is the prefix length, without scanning the whole dataset.',
          'Tries have O(1) space complexity regardless of word count.',
          'Tries support multi-threading without locks.'
        ],
        correctAnswer: 'Tries allow finding all words with a shared prefix in O(k) time where k is the prefix length, without scanning the whole dataset.',
        explanation: 'Tries store keys as paths of characters. Prefix matching only traverses down to the node of the prefix length, making auto-completion extremely efficient.',
        difficulty: 'Advanced',
        subtopic: 'Trie Data Structure'
      }
    ]
  }
};

/**
 * Helper to match or adapt a sample quiz when offline demonstration is requested.
 */
export function getSampleQuiz(concept = 'React Hooks', difficulty = 'Intermediate', questionCount = 5) {
  const normalized = concept.toLowerCase();
  let selected = SAMPLE_QUIZZES['react-hooks'];

  if (normalized.includes('closure') || normalized.includes('javascript') || normalized.includes('js')) {
    selected = SAMPLE_QUIZZES['javascript-closures'];
  } else if (normalized.includes('structure') || normalized.includes('algorithm') || normalized.includes('tree') || normalized.includes('graph')) {
    selected = SAMPLE_QUIZZES['data-structures'];
  }

  // Slice questions to requested count or loop if needed
  const questions = selected.questions.slice(0, Math.min(questionCount, selected.questions.length));

  return {
    concept: selected.concept,
    subject: selected.subject,
    difficulty: difficulty || selected.difficulty,
    questionCount: questions.length,
    isSample: true,
    provider: 'sample-fallback',
    questions: questions.map((q) => ({
      ...q,
      difficulty: difficulty || q.difficulty
    }))
  };
}
