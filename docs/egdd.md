# Case By Case

# Overview

## Elevator Pitch

In Case By Case, players take the role of a software attorney tasked with determining whether a function is guilty of incorrect behavior. Each round presents a case stating what the function claims to do with a collection of unit tests that act as courtroom evidence. Players must select which tests meaningfully demonstrate the function’s correctness or expose its flaws.

## Influences

The American Judicial System

- Medium: Trial Recordings, Court TV, "True Crime" Court Case Explanations
- Explanation: Case By Case is set in a court room and the regular rules of this domain apply. Trials, juries, evidence, the defence and prosecution

Jackbox Games

- Medium: Game
- Explanation: The visual style and game flow of Jackbox games inspires my thinking about Case by Case. The player will have to pick between test cases on the screen and we need to make this fun and visually appealing. funky music, cool animations, and a fun court house design inspired by Jackbox.TV.

## Core Gameplay Mechanics

- The Player is introduced to a judge referred to as ‘The Honorable Judge Compiler’
- The courtroom jury is represented by different programming languages observing the case
- The player enters a new trial
- A function appears on the screen with a short description of its intended behavior
- Several unit tests appear as evidence cards
- The player selects tests that best support a verdict
- The court reveals the correct outcome and explains which test cases expose the bug or which test cases were redundant
- The next case begins
- As the game progresses, players must begin constructing their own test cases using provided inputs instead of simply selecting from a list
- in earlier levels, the test cases will show if they are passing/failing but as the complexity increases, the player will have to figure this out themselves
- After completing all cases, the game displays a victory message

# Learning Aspects

## Learning Domains

Computer Science / Software Engineering

- Unit testing and test design
- Code coverage and redundancy
- Edge case detection and reasoning
- Debugging
- Reading and interpreting function behavior
- Reading and interpreting test behavior

Logic

- Identifying what is and isn't proven by available information
- Evidence evaluation and selection

## Target Audiences

- Novice programmers with some programming knowledge
- Novice programmers that have a basic understanding of Python
- Students who are in introductory programming or software engineering courses
- Students who are beginning to understand how to write and evaluate unit tests

## Target Contexts

- This game is designed to be assigned as supplementary practice in a programming or software engineering course.
- It can be played individually outside of class as a learning activity.
- Because it relies on visual feedback and explanations, it may be best suited for personal devices rather than in-class lecture settings.

## Learning Objectives

- By the end of the lesson, players will be able to evaluate the quality of unit tests by identifying which tests meaningfully verify a function’s behavior.
- By the end of the lesson, players will be able to identify redundant unit tests that provide no additional information about program correctness.
- By the end of the lesson, players will be able to recognize missing edge cases that reduce confidence in a test suite.
- By the end of the lesson, players will be able to use test results to determine whether or not a function behaves according to what it claims to be able to do.

## Prerequisite Knowledge

Prior to the game, players need to have a basic understanding of:

- programming concepts such as variables, functions, return values, conditional statements and loops.
- basic programming syntax
- ability to read and trace through a short function and predict its output
- familiarity with at least 1 programming language at a beginner level
- unit tests and verifying program behavior
- the ability to read a unit test and identify what it is asserting
- the awareness that tests can pass or fail based on function behavior

## Assessment Measures

A short pre-test and matching post-test should be designed to assess student learning.

### Q1: Given a function and a set of unit tests added in the order shown, identify which tests provide new behavioral coverage not already covered by a prior test in the list.

(Multiple choice)

```python
def absolute_value(n):
  if n < 0:
    return -n
  return n
```

- A. absolute_value(5) -> expected: 5
- B. absolute_value(-3) -> expected: 3
- C. absolute_value(10) -> expected: 10
- D. absolute_value(-7) -> expected: 7
- E. absolute_value(0) -> expected: 0

Answer: A, B, E

Grading logic:

- A is the first test of the positive branch (n >= 0, returns n) — new coverage
- B is the first test of the negative branch (n < 0, returns -n) — new coverage
- C tests the same positive branch already covered by A — no new coverage
- D tests the same negative branch already covered by B — no new coverage
- E is the first test of the zero edge case — new coverage

### Q2: Identify all pairs of tests that are redundant (i.e., they execute the same logical branch and provide no additional coverage).

(Multiple choice)

```python
def classify_score(score):
  if score >= 90:
    return "A"
  elif score >= 80:
    return "B"
  elif score >= 70:
    return "C"
  else:
    return "F"
```

- A. classify_score(95) -> expected: "A"
- B. classify_score(85) -> expected: "B"
- C. classify_score(92) -> expected: "A"
- D. classify_score(72) -> expected: "C"
- E. classify_score(78) -> expected: "C"

Answer: A, C, D, E

Grading logic:

- A and C both enter the score >= 90 branch → therefore, A and C are redundant with each other.
- D and E both enter the score >= 70 branch → therefore, D and E are redundant with each other.
- B is not redundant; it uniquely covers the score >= 80 branch.

### Q3: Identify an edge case that is not covered by an existing test suite.

(Multiple choice / free response)

```python
def safe_divide(a, b):
  if b == 0:
    return None
  return a / b
```

The following tests exist for this function:

- A. safe_divide(10, 2) -> expected: 5.0
- B. safe_divide(9, 3) -> expected: 3.0
- C. safe_divide(0, 5) -> expected: 0.0

Free response: Describe one edge case that is not covered by the existing tests. Explain why it is worth testing.

Rubric:

| Score          | Criteria                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| Full Credit    | Identifies b = 0 as uncovered and explains that it triggers a special-case branch                             |
| Partial Credit | Identifies b = 0 without explanation, or identifies another minor valid edge case with reasonable explanation |
| No Credit      | Identifies a case already covered by existing tests, or provides no justification                             |

Multiple choice: Which of the following is an edge case not currently being tested?

- A. safe_divide(100, 4)
- B. safe_divide(7, 0)
- C. safe_divide(0, 3)
- D. safe_divide(6, 2)

Answer: B

### Q4: Determine whether a set of tests provides sufficient coverage for the correctness of a function.

```python
def is_palindrome(s):
  return s == s[::-1]
```

A student submits the following test suite and claims it is sufficient to be confident in the function's correctness:

- A. is_palindrome("racecar") -> expected: True
- B. is_palindrome("hello") -> expected: False

Is this test suite sufficient? Select your answer and explain your reasoning.

1. Yes - the tests cover both True and False outcomes
2. No - the suite is missing edge cases that could reveal unexpected behavior
3. Yes - the function is simple enough that two tests are always enough
4. No - the tests are redundant and cover the same branch

Grading logic:

- Option 1 is the most common wrong answer (students conflate output coverage with behavioral coverage)
- Option 2 is correct (missing edge cases include empty string "", single character "a", mixed case "Racecar", spaces "race car", and numeric strings)
- Option 3 is incorrect (function simplicity does not determine how many tests are sufficient)
- Option 4 is incorrect (the two tests are not redundant; they cover different outcomes)

# Gameplay Objectives

- Present strong evidence: select the most informative unit tests to demonstrate program behavior.
- Identify bugs: use test cases to determine whether the function behaves correctly.
- Deliver the correct verdict: decide whether the function is guilty of incorrect behavior.
- Progress through cases: successfully evaluate several cases to advance through the game.

# Procedures/Actions

Players interact with the game using simple mouse or touch inputs.

Actions include:

- Clicking on evidence cards to select unit tests
- Reviewing code and the function’s intended behavior
- Selecting a limited number of tests to present as courtroom evidence
- Declaring a verdict (Guilty or Not Guilty)
- Reviewing the judge’s explanation of the case outcome

# Rules

Players can not submit all test case options from the evidence pool

- Players must determine which tests are worth inclusion
- Evidence slots are finite

Verdicts are guilty/not guilty

- A guilty verdict is a failure, discouraging guessing

Time is a finite resource

- Players must present their case within a time frame

# Objects/Entities

- Judge Compiler: the judge who evaluates the evidence and delivers the verdict explanation
- The Jury: represented by different programming languages observing the trial.
- The Defendant: the function being tested in the current case
- Evidence cards: unit tests that can be presented as evidence
- Case files: descriptions of the function’s intended behavior
- Verdict panel: where the player declares the final judgement

## Core Gameplay Mechanics (Detailed)

Core Game Loop: **The Case**

- **Introduction**: The court room scene is drawn. The defendant function is in the bottom corner, with Judge Compiler and the Semicolon Bailiffs visible watching over the case
- **Case file presentation**: The function appears on screen along with a plain language description of its behavior and the evidence cards which show the test input, expected output, and actual output.
    - the player reads the function and description.
    - the player reads the set of unit tests.
- **Evidence selection**: The player selects a limited number of tests from the pool to submit as evidence, filling up all available evidence slots
- **Jury deliberation**: brief time for the jury to deliberate over the evidence: programming language silhouettes talking to each other behind a wall or curtain, building suspense for the verdict
- **The Verdict**: Judge Compiler reads the verdict, the function is either guilty or innocent based on the decision made by the jury. A case specific explanation is shown detailing which tests were meaningful, which were redundant, and what edge cases were missed. The verdict will come with a count of how many jurors went with guilty / not guilty, showing how convincing your selected evidence was
- **Case closed**
- Player navigates to the next case

The Verdict
IF the function is correct or well written:

- but the evidence was poor: we may get a false imprisonment and the player is penalized (disbarred, ‘fined’, etc)
- and the evidence is solid: the function is innocent (yay)

IF the function is poorly written and full of bugs or errors:

- and the evidence is poor: the function may be declared innocent because edge cases or bugs were missed by the tests, this function is then out on the streets to one day reoffend and crash someones server
- and the evidence is solid: the function is found guilty and put in jail (yay)

## Feedback

Judge Compiler’s Ruling

- Verdict: the ground truth about the level, was the function guilty or not guilty
- Evidence quality: for each card the player selected, Judge Compiler identifies whether it provided unique coverage, was redundant, or was misleading and explains specifically why
- Missed evidence: were there unselected meaningful evidence cards?
  Any notable evidence flaws: redundant, missing edge case, misleading test

Visual feedback

- Evidence cards snap into place with a satisfying visual response, confirming the select action
- In early levels, the test cases will show their result (pass/fail) but as complexity increases, the player will have to figure this out themselves

Cumulative summary

- After a ‘day’ of cases have been evaluated, the game is over and the player receives a final cumulative feedback screen, showing how they performed throughout the game
- It will show patterns of mistakes, which cases went well/poorly, overall score?
- Could show the guilty functions behind bars and not guilty functions at home and happy

# Story and Gameplay

## Presentation of Rules

Case 0 (Tutorial):

- Unscored pretrial hearing.
- The case file appears and the player reads the function and description; when ready, they click "View Evidence."
- A single evidence card appears and Judge Compiler prompts the player.
- Two more evidence cards appear, and the evidence limit becomes clear. The player must pick one or the other to add into evidence, while the unselected card is grayed out.
- The player selects "Closing Arguments," the evidence is laid out, and the jury deliberates.
- Judge Compiler delivers the verdict, and the player now knows how to play.

## Presentation of Content

Each of the first few cases introduces a different way evidence can be flawed:

- Case 1: redundant tests appear in the pool.
- Case 2: a passing test is misleading.
- Case 3: a key edge case is missing.

Judge Compiler should explicitly point these out so the player knows what to look for when levels get trickier.

## Story (Brief)

You are a young and upcoming software attorney. Build your career and esteem by putting guilty functions behind bars, and clearing the name of the innocent.

Functions are on trial, and players present test-case evidence to evaluate each function.

"ALL RISE FOR THE HONORABLE JUDGE COMPILER."

The gavel slams and Judge Compiler adjusts his posture. The honorable judge compiler has many trials to attend to and YOU must provide evidence to prove the GUILT or INNOCENCE of the on-trial functions.

# Assets Needed

## Aesthetics

The aesthetic should resemble a playful digital courtroom with programming-themed characters. The atmosphere should feel engaging and lighthearted to encourage experimentation and learning.

## Graphical

- Characters:
    - Judge Compiler: a cartoonish judge themed around compilers.
    - Officers: cartoonish semicolon-themed bailiffs.
    - Jury members represented as programming languages (Python, JavaScript, etc.).

- Interface elements:
    - Evidence cards representing unit tests.
    - Code display panel.
    - Verdict selection buttons.

- Environment:
    - Stylized courtroom background with programming-themed visuals.

## Audio

- Intro music: https://freesound.org/people/Rootsmessenger/sounds/762073/
- Mouse clicking sound: https://freesound.org/people/inkedflorist/sounds/710039/
- Dragging case statements sound: https://freesound.org/people/Garuda1982/sounds/564632/
- Gavel sound when pressing ‘guilty’ or ‘not guilty’ button: https://freesound.org/people/TurtleLG/sounds/80448/
- Code being sent to jail (guilty) sound: https://freesound.org/people/jacobmathiassen/sounds/254869/
- Judge explaining verdict sound: https://freesound.org/people/so0rec/sounds/542590/
- End game celebration sound: https://freesound.org/people/imagefilm.berlin/sounds/746442/
